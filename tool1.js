document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for Tool #1
    const fileInput = document.getElementById('csvFileInput1');
    const fileNameDisplay = document.getElementById('fileNameDisplay1');
    const processBtn = document.getElementById('processBtn1');
    const downloadBtn = document.getElementById('downloadBtn1');
    const processingIndicator = document.getElementById('processingIndicator1');
    const resultsSection = document.getElementById('results1');
    const duplicatesRemovedCount = document.querySelector('#duplicatesRemoved span');
    const remainingRowsCount = document.querySelector('#remainingRows span');
    
    // Process CSV button click
    if (processBtn) {
        processBtn.addEventListener('click', function() {
            const file = fileInput.files[0];
            if (file) {
                processBtn.disabled = true;
                processingIndicator.classList.remove('hide');
                resultsSection.classList.add('hide');
                
                // Read and process the file
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const csvContent = e.target.result;
                    originalCsv = csvContent;
                    
                    // Process after a short delay to allow the UI to update
                    setTimeout(function() {
                        processedCsv = removeDuplicateRows(csvContent);
                        
                        // Update the UI
                        processingIndicator.classList.add('hide');
                        resultsSection.classList.remove('hide');
                        downloadBtn.disabled = false;
                    }, 500);
                };
                
                reader.readAsText(file);
            }
        });
    }
    
    // Download button click
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (processedCsv) {
                const blob = new Blob([processedCsv], { type: 'text/csv' });
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
        });
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
        
        // Update statistics
        duplicatesRemovedCount.textContent = totalLines - uniqueCount;
        remainingRowsCount.textContent = uniqueCount;
        
        // Combine header and unique data lines
        return [header, ...resultLines].join('\n');
    }
    
    // Reset results section
    function resetResults() {
        if (resultsSection) {
            resultsSection.classList.add('hide');
        }
        if (processingIndicator) {
            processingIndicator.classList.add('hide');
        }
        if (duplicatesRemovedCount) {
            duplicatesRemovedCount.textContent = '0';
        }
        if (remainingRowsCount) {
            remainingRowsCount.textContent = '0';
        }
        originalCsv = null;
        processedCsv = null;
    }
});
