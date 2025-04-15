document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for Tool #3
    const fileInput = document.getElementById('csvFileInput3');
    const fileNameDisplay = document.getElementById('fileNameDisplay3');
    const processBtn = document.getElementById('processBtn3');
    const downloadBtn = document.getElementById('downloadBtn3');
    const processingIndicator = document.getElementById('processingIndicator3');
    const resultsSection = document.getElementById('results3');
    const sponsorshipsNormalizedCount = document.querySelector('#sponsorshipsNormalized span');
    const newslettersNormalizedCount = document.querySelector('#newslettersNormalized span');
    const rowsProcessedCount = document.querySelector('#rowsProcessed3 span');
    
    // Lists of terms to normalize
    const sponsorshipTerms = [
        'Sponsorship',
        'sponsorship',
        'Sponsor',
        'sponsor',
        'Spon',
        'spon',
        'Spons',
        'spons'
    ];
    
    const newsletterTerms = [
        'Newsletter',
        'newsletter'
    ];
    
    // Variables to store CSV data
    let originalCsv = null;
    let processedCsv = null;
    
    // Handle file input change
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
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
    }
    
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
                        const result = normalizeText(csvContent, sponsorshipTerms, newsletterTerms);
                        processedCsv = result.csv;
                        
                        // Update the UI with statistics
                        sponsorshipsNormalizedCount.textContent = result.sponsorshipsNormalized;
                        newslettersNormalizedCount.textContent = result.newslettersNormalized;
                        rowsProcessedCount.textContent = result.rowsProcessed;
                        
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
                
                // Get original filename and add '_normalized' before the extension
                const originalFileName = fileInput.files[0].name;
                const lastDotIndex = originalFileName.lastIndexOf('.');
                let newFileName;
                
                if (lastDotIndex !== -1) {
                    const nameWithoutExt = originalFileName.substring(0, lastDotIndex);
                    const extension = originalFileName.substring(lastDotIndex);
                    newFileName = `${nameWithoutExt}_normalized${extension}`;
                } else {
                    newFileName = `${originalFileName}_normalized.csv`;
                }
                
                a.href = url;
                a.download = newFileName;
                a.click();
                
                window.URL.revokeObjectURL(url);
            }
        });
    }
    
    // Function to normalize text in the Campaign Name column
    function normalizeText(csvContent, sponsorshipTerms, newsletterTerms) {
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
                sponsorshipsNormalized: 0,
                newslettersNormalized: 0,
                rowsProcessed: lines.length - 1
            };
        }
        
        // Process the rest of the lines
        const dataLines = lines.slice(1).filter(line => line.trim() !== '');
        const resultLines = [];
        let sponsorshipsNormalized = 0;
        let newslettersNormalized = 0;
        
        // Process each line
        for (const line of dataLines) {
            const fields = parseCSVLine(line);
            
            if (fields.length > campaignNameIndex) {
                const campaignName = fields[campaignNameIndex];
                let newCampaignName = campaignName;
                let normalized = false;
                
                // Create a pattern to match sponsorship terms
                const sponsorshipPattern = createPatternFromTerms(sponsorshipTerms);
                
                // Create a pattern to match newsletter terms
                const newsletterPattern = createPatternFromTerms(newsletterTerms);
                
                // Check for sponsorship terms
                const sponsorshipMatch = newCampaignName.match(sponsorshipPattern);
                if (sponsorshipMatch) {
                    // Get parts before and after the match
                    const beforeMatch = newCampaignName.substring(0, sponsorshipMatch.index).trim();
                    let afterMatch = newCampaignName.substring(sponsorshipMatch.index + sponsorshipMatch[0].length).trim();
                    
                    // Remove any surrounding punctuation
                    const cleanedBeforeMatch = beforeMatch.replace(/[-|\[\]\(\)\s]+$/, '');
                    
                    // Remove punctuation after the match if present
                    if (afterMatch.startsWith(')') || 
                        afterMatch.startsWith(']') || 
                        afterMatch.startsWith('-') ||
                        afterMatch.startsWith('|') ||
                        afterMatch.startsWith(' ')) {
                        afterMatch = afterMatch.replace(/^[-|\[\]\(\)\s]+/, '');
                    }
                    
                    // Combine the parts with normalized sponsorship
                    if (afterMatch) {
                        newCampaignName = `${cleanedBeforeMatch} (Sponsorship) ${afterMatch}`;
                    } else {
                        newCampaignName = `${cleanedBeforeMatch} (Sponsorship)`;
                    }
                    
                    sponsorshipsNormalized++;
                    normalized = true;
                }
                
                // Check for newsletter terms if no sponsorship was found
                if (!normalized) {
                    const newsletterMatch = newCampaignName.match(newsletterPattern);
                    if (newsletterMatch) {
                        // Get parts before and after the match
                        const beforeMatch = newCampaignName.substring(0, newsletterMatch.index).trim();
                        let afterMatch = newCampaignName.substring(newsletterMatch.index + newsletterMatch[0].length).trim();
                        
                        // Remove any surrounding punctuation
                        const cleanedBeforeMatch = beforeMatch.replace(/[-|\[\]\(\)\s]+$/, '');
                        
                        // Remove punctuation after the match if present
                        if (afterMatch.startsWith(')') || 
                            afterMatch.startsWith(']') || 
                            afterMatch.startsWith('-') ||
                            afterMatch.startsWith('|') ||
                            afterMatch.startsWith(' ')) {
                            afterMatch = afterMatch.replace(/^[-|\[\]\(\)\s]+/, '');
                        }
                        
                        // Combine the parts with normalized newsletter
                        if (afterMatch) {
                            newCampaignName = `${cleanedBeforeMatch} (Newsletter) ${afterMatch}`;
                        } else {
                            newCampaignName = `${cleanedBeforeMatch} (Newsletter)`;
                        }
                        
                        newslettersNormalized++;
                        normalized = true;
                    }
                }
                
                if (normalized) {
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
            sponsorshipsNormalized: sponsorshipsNormalized,
            newslettersNormalized: newslettersNormalized,
            rowsProcessed: dataLines.length
        };
    }
    
    // Create a pattern to match any of the given terms with surrounding characters
    function createPatternFromTerms(terms) {
        const escapedTerms = terms.map(term => term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        const pattern = new RegExp(`(^|[\\s\\-\\[\\]\\(\\)|])(?:${escapedTerms.join('|')})([\\s\\-\\[\\]\\(\\)|]|$)`, 'i');
        return pattern;
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
    
    // Reset results section
    function resetResults() {
        if (resultsSection) {
            resultsSection.classList.add('hide');
        }
        if (processingIndicator) {
            processingIndicator.classList.add('hide');
        }
        if (sponsorshipsNormalizedCount) {
            sponsorshipsNormalizedCount.textContent = '0';
        }
        if (newslettersNormalizedCount) {
            newslettersNormalizedCount.textContent = '0';
        }
        if (rowsProcessedCount) {
            rowsProcessedCount.textContent = '0';
        }
        originalCsv = null;
        processedCsv = null;
    }
});
