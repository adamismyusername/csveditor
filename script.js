document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const toolButtons = document.querySelectorAll('.tool-button');
    const tool1Modal = document.getElementById('tool1Modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const fileInput = document.getElementById('csvFileInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const processingIndicator = document.getElementById('processingIndicator');
    const resultsSection = document.getElementById('results');
    const duplicatesRemovedCount = document.querySelector('#duplicatesRemoved span');
    const remainingRowsCount = document.querySelector('#remainingRows span');
    
    // Variables to store CSV data
    let originalCsv = null;
    let processedCsv = null;
    
    // Event Listeners
    toolButtons.forEach(button => {
        if (!button.classList.contains('disabled')) {
            button.addEventListener('click', () => {
                const toolId = button.getAttribute('data-tool');
                if (toolId === '1') {
                    tool1Modal.style.display = 'block';
                }
                // Future tools will be added here
            });
        }
    });
    
    // Close modal when clicking the X
    closeModalBtn.addEventListener('click', () => {
        tool1Modal.style.display = 'none';
        resetToolState();
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === tool1Modal) {
            tool1Modal.style.display = 'none';
            resetToolState();
        }
    });
    
    // Handle file input change
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            processBtn.disabled = false;
            // Reset previous results
            resetResults();
        } else {
            fileNameDisplay.textContent = 'No file selected';
            processBtn.disabled = true;
        }
    });
    
    // Process CSV button click
    processBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (file) {
            processBtn.disabled = true;
            processingIndicator.classList.remove('hide');
            resultsSection.classList.add('hide');
            
            // Read and process the file
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const csvContent = e.target.result;
                originalCsv = csvContent;
                
                // Process after a short delay to allow the UI to update
                setTimeout(() => {
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
    
    // Download button click
    downloadBtn.addEventListener('click', () => {
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
    
    // Reset the tool state
    function resetToolState() {
        fileInput.value = '';
        fileNameDisplay.textContent = 'No file selected';
        processBtn.disabled = true;
        downloadBtn.disabled = true;
        resetResults();
    }
    
    // Reset results section
    function resetResults() {
        resultsSection.classList.add('hide');
        processingIndicator.classList.add('hide');
        duplicatesRemovedCount.textContent = '0';
        remainingRowsCount.textContent = '0';
        originalCsv = null;
        processedCsv = null;
    }
});
