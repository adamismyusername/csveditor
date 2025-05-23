document.addEventListener('DOMContentLoaded', function() {
    // This will attach an event listener to the document
    // to handle Tool #2 processing after modal is loaded
    document.addEventListener('click', function(event) {
        // Process CSV button click
        if (event.target && event.target.id === 'processBtn2') {
            processTool2();
        }
        
        // Download button click
        if (event.target && event.target.id === 'downloadBtn2') {
            downloadTool2();
        }
    });
});

// Variables to store CSV data for Tool #2
let tool2OriginalCsv = null;
let tool2ProcessedCsv = null;

// List of spokespeople names to remove (can be extended easily)
const spokespeopleNames = [
    'Sean Hannity',
    'Hannity',
    'Ben Stein',
    'Dennis Quaid',
    'Chuck Norris',
    'Mike Lindell'
];

// Process function for Tool #2
function processTool2() {
    const fileInput = document.getElementById('csvFileInput2');
    const processingIndicator = document.getElementById('processingIndicator2');
    const resultsSection = document.getElementById('results2');
    const processBtn = document.getElementById('processBtn2');
    const downloadBtn = document.getElementById('downloadBtn2');
    const namesRemovedCount = document.querySelector('#namesRemoved span');
    const rowsProcessedCount = document.querySelector('#rowsProcessed span');
    
    const file = fileInput.files[0];
    if (file) {
        processBtn.disabled = true;
        processingIndicator.classList.remove('hide');
        resultsSection.classList.add('hide');
        
        // Read and process the file
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const csvContent = e.target.result;
            tool2OriginalCsv = csvContent;
            
            // Process after a short delay to allow the UI to update
            setTimeout(function() {
                const result = removeSpokespeopleNames(csvContent, spokespeopleNames);
                tool2ProcessedCsv = result.csv;
                
                // Update the UI with statistics
                namesRemovedCount.textContent = result.namesRemoved;
                rowsProcessedCount.textContent = result.rowsProcessed;
                
                // Update the UI
                processingIndicator.classList.add('hide');
                resultsSection.classList.remove('hide');
                downloadBtn.disabled = false;
            }, 500);
        };
        
        reader.readAsText(file);
    }
}

// Download function for Tool #2
function downloadTool2() {
    const fileInput = document.getElementById('csvFileInput2');
    
    if (tool2ProcessedCsv && fileInput.files[0]) {
        const blob = new Blob([tool2ProcessedCsv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Get original filename and add '_noSpokespeople' before the extension
        const originalFileName = fileInput.files[0].name;
        const lastDotIndex = originalFileName.lastIndexOf('.');
        let newFileName;
        
        if (lastDotIndex !== -1) {
            const nameWithoutExt = originalFileName.substring(0, lastDotIndex);
            const extension = originalFileName.substring(lastDotIndex);
            newFileName = `${nameWithoutExt}_noSpokespeople${extension}`;
        } else {
            newFileName = `${originalFileName}_noSpokespeople.csv`;
        }
        
        a.href = url;
        a.download = newFileName;
        a.click();
        
        window.URL.revokeObjectURL(url);
    }
}

// Function to remove spokesperson names from Campaign Name column
function removeSpokespeopleNames(csvContent, spokespeopleList) {
    // Split the content into lines
    const lines = csvContent.split(/\r?\n/);
    
    // Get the header (first line)
    const header = lines[0];
    
    // Find the index of the Campaign Name column
    const headers = parseCSVLine(header);
    const campaignNameIndex = headers.findIndex(h => 
        h.trim().toLowerCase() === 'campaign name');
    
    if (campaignNameIndex === -1) {
        // If Campaign Name column is not found, return the original CSV
        return {
            csv: csvContent,
            namesRemoved: 0,
            rowsProcessed: lines.length - 1
        };
    }
    
    // Process the rest of the lines
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');
    const resultLines = [];
    let namesRemoved = 0;
    
    // Process each line
    for (const line of dataLines) {
        const fields = parseCSVLine(line);
        
        if (fields.length > campaignNameIndex) {
            const campaignName = fields[campaignNameIndex];
            let newCampaignName = campaignName;
            let nameRemoved = false;
            
            // Only remove names if they are NOT at the beginning
            for (const name of spokespeopleList) {
                // Check if the name is not at the beginning
                const nameIndex = campaignName.indexOf(name);
                
                if (nameIndex > 0) {
                    // Remove the name and any surrounding punctuation/spaces
                    const beforeName = campaignName.substring(0, nameIndex).trim();
                    let afterName = campaignName.substring(nameIndex + name.length).trim();
                    
                    // Remove punctuation before the name if present
                    let cleanedBeforeName = beforeName;
                    if (beforeName.endsWith('-') || 
                        beforeName.endsWith('(') || 
                        beforeName.endsWith('[') ||
                        beforeName.endsWith(' ')) {
                        cleanedBeforeName = beforeName.replace(/[-\(\[\s]+$/, '');
                    }
                    
                    // Remove punctuation after the name if present
                    if (afterName.startsWith(')') || 
                        afterName.startsWith(']') || 
                        afterName.startsWith('-') ||
                        afterName.startsWith(' ')) {
                        afterName = afterName.replace(/^[\)\]\-\s]+/, '');
                    }
                    
                    // Combine the parts
                    if (afterName) {
                        newCampaignName = cleanedBeforeName + ' ' + afterName;
                    } else {
                        newCampaignName = cleanedBeforeName;
                    }
                    
                    nameRemoved = true;
                    break; // Only remove the first matching name
                }
            }
            
            if (nameRemoved) {
                namesRemoved++;
                fields[campaignNameIndex] = newCampaignName;
            }
        }
        
        // Convert the fields back to a CSV line
        resultLines.push(fields.map(field => {
            // If the field contains commas, quotes, or newlines, wrap in quotes
            if (field.includes(',') || field.includes('"') || field.includes('\n')) {
                return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
        }).join(','));
    }
    
    // Combine header and processed data lines
    return {
        csv: [header, ...resultLines].join('\n'),
        namesRemoved: namesRemoved,
        rowsProcessed: dataLines.length
    };
}

// Function to parse a CSV line respecting quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    // Add the last field
    result.push(current);
    
    return result;
}