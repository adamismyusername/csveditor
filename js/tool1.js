document.addEventListener('DOMContentLoaded', function() {
    // This will attach an event listener to the document
    // to handle Tool #1 processing after modal is loaded
    document.addEventListener('click', function(event) {
        // Process CSV button click
        if (event.target && event.target.id === 'processBtn1') {
            processTool1();
        }
        
        // Download button click
        if (event.target && event.target.id === 'downloadBtn1') {
            downloadTool1();
        }
    });
});

// Variables to store CSV data for Tool #1
let tool1OriginalCsv = null;
let tool1ProcessedCsv = null;

// Process function for Tool #1
function processTool1() {
    const fileInput = document.getElementById('csvFileInput1');
    const processingIndicator = document.getElementById('processingIndicator1');
    const resultsSection = document.getElementById('results1');
    const processBtn = document.getElementById('processBtn1');
    const downloadBtn = document.getElementById('downloadBtn1');
    const duplicatesRemovedCount = document.querySelector('#duplicatesRemoved span');
    const remainingRowsCount = document.querySelector('#remainingRows span');
    
    const file = fileInput.files[0];
    if (file) {
        processBtn.disabled = true;
        processingIndicator.classList.remove('hide');
        resultsSection.classList.add('hide');
        
        // Read and process the file
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const csvContent = e.target.result;
            tool1OriginalCsv = csvContent;
            
            // Process after a short delay to allow the UI to update
            setTimeout(function() {
                const result = removeDuplicateRows(csvContent);
                tool1ProcessedCsv = result.csv;
                
                // Update statistics
                duplicatesRemovedCount.textContent = result.duplicatesRemoved;
                remainingRowsCount.textContent = result.uniqueCount;
                
                // Update the UI
                processingIndicator.classList.add('hide');
                resultsSection.classList.remove('hide');
                downloadBtn.disabled = false;
            }, 500);
        };
        
        reader.readAsText(file);
    }
}

// Download function for Tool #1
function downloadTool1() {
    const fileInput = document.getElementById('csvFileInput1');
    
    if (tool1ProcessedCsv && fileInput.files[0]) {
        const blob = new Blob([tool1ProcessedCsv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Get original filename and add '_processed' before the extension
        const originalFileName = fileInput.files[0].name;
        const lastDotIndex = originalFileName.lastIndexOf('.');
        let newFileName;
        
        if (lastDotIndex !== -1) {
            const nameWithoutExt = originalFileName.substring(0, lastDotIndex);
            const extension = originalFileName.substring(lastDotIndex);
            newFileName = `${nameWithoutExt}_processed${extension}`;
        } else {
            newFileName = `${originalFileName}_processed.csv`;
        }
        
        a.href = url;
        a.download = newFileName;
        a.click();
        
        window.URL.revokeObjectURL(url);
    }
}

// Function to remove duplicate rows from CSV
function removeDuplicateRows(csvContent) {
    // Split the content into lines
    const lines = csvContent.split(/\r?\n/);
    
    // Get the header (first line)
    const header = lines[0];
    
    // Process the rest of the lines
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');
    
    // Use a Set to track unique lines
    const uniqueLines = new Set();
    const resultLines = [];
    
    // Track counts for reporting
    let totalLines = dataLines.length;
    let uniqueCount = 0;
    
    // Add unique lines to the result
    for (const line of dataLines) {
        if (!uniqueLines.has(line)) {
            uniqueLines.add(line);
            resultLines.push(line);
            uniqueCount++;
        }
    }
    
    // Combine header and unique data lines
    return {
        csv: [header, ...resultLines].join('\n'),
        duplicatesRemoved: totalLines - uniqueCount,
        uniqueCount: uniqueCount
    };
}