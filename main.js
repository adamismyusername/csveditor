document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for tool selection
    const toolButtons = document.querySelectorAll('.tool-button.active');
    const modals = document.querySelectorAll('.modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Tool selection event listeners
    toolButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const toolId = this.getAttribute('data-tool');
            const targetModal = document.getElementById(`tool${toolId}Modal`);
            
            if (targetModal) {
                targetModal.style.display = 'block';
            }
        });
    });
    
    // Close modal when clicking the X
    closeModalBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
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
});
