document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for tool selection
    const toolButtons = document.querySelectorAll('.tool-button.active');
    const modalContainer = document.getElementById('modalContainer');
    
    // Tool selection event listeners
    toolButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const toolId = this.getAttribute('data-tool');
            loadModalContent(toolId);
        });
    });
    
    // Function to load modal content dynamically
    function loadModalContent(toolId) {
        fetch(`modals/tool${toolId}-modal.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load modal for tool ${toolId}`);
                }
                return response.text();
            })
            .then(html => {
                // Insert the modal HTML into the container
                modalContainer.innerHTML = html;
                
                // Show the modal
                const modal = document.getElementById(`tool${toolId}Modal`);
                if (modal) {
                    modal.style.display = 'block';
                    
                    // Add event listeners for the modal
                    setupModalEventListeners(modal);
                    
                    // Initialize file input handler
                    initializeFileInput(toolId);
                }
            })
            .catch(error => {
                console.error('Error loading modal:', error);
            });
    }
    
    // Setup event listeners for the modal
    function setupModalEventListeners(modal) {
        // Close modal when clicking the X
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                modalContainer.innerHTML = '';  // Clear the modal content
            });
        }
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                modalContainer.innerHTML = '';  // Clear the modal content
            }
        });
    }
    
    // Initialize file input handler
    function initializeFileInput(toolId) {
        const fileInput = document.getElementById(`csvFileInput${toolId}`);
        const fileNameDisplay = document.getElementById(`fileNameDisplay${toolId}`);
        const processBtn = document.getElementById(`processBtn${toolId}`);
        
        if (fileInput && fileNameDisplay && processBtn) {
            fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    fileNameDisplay.textContent = file.name;
                    processBtn.disabled = false;
                } else {
                    fileNameDisplay.textContent = 'No file selected';
                    processBtn.disabled = true;
                }
            });
        }
    }
});