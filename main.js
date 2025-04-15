document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for tool selection
    const toolButtons = document.querySelectorAll('.tool-button.active');
    const modals = document.querySelectorAll('.modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Clear any existing event listeners by cloning and replacing elements
    // This prevents conflicts with tool-specific JS files
    toolButtons.forEach(function(button) {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add click event listener to the new button
        newButton.addEventListener('click', function() {
            const toolId = this.getAttribute('data-tool');
            const targetModalId = 'tool' + toolId + 'Modal';
            const targetModal = document.getElementById(targetModalId);
            
            if (targetModal) {
                // Hide all modals first
                modals.forEach(function(modal) {
                    modal.style.display = 'none';
                });
                
                // Show the target modal
                targetModal.style.display = 'block';
            }
        });
    });
    
    // Close modal when clicking the X
    closeModalBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        modals.forEach(function(modal) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Initialize the file input handlers for each tool
    initializeFileInputs();
});

// Initialize file input handlers
function initializeFileInputs() {
    // For each tool, initialize the file input handler
    for (let i = 1; i <= 3; i++) {
        const fileInput = document.getElementById('csvFileInput' + i);
        const fileNameDisplay = document.getElementById('fileNameDisplay' + i);
        const processBtn = document.getElementById('processBtn' + i);
        
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
}
