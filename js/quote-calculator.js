// ============================================
// QUOTE CALCULATOR - REAL-TIME PRICING & GOOGLE SHEETS
// ============================================

// IMPORTANT: Replace this URL with your Google Apps Script Web App URL for Quote submissions
const QUOTE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnyVGEApUL-yyAXgVEF6DKXR_2nFYpRaJXK-lL76Vkafw51TnuPBoDpaYG3GpxRl6w/exec';

// Base pricing
const BASE_PRICE = 10000; // ₹10,000 base website cost

// Pricing state
let currentQuote = {
    base: BASE_PRICE,
    actions: 0,
    timeline: 0,
    domain: 0,
    emails: 0,
    logo: 0,
    media: 0,
    total: BASE_PRICE
};

document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    initializeFormSubmission();
});

// Initialize the real-time calculator
function initializeCalculator() {
    const form = document.getElementById('quoteForm');
    if (!form) return;

    // Listen to checkbox changes (visitor actions)
    const actionCheckboxes = document.querySelectorAll('input[name="actions"]');
    actionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateQuote);
    });

    // Listen to select dropdown changes
    const selectElements = form.querySelectorAll('select[data-pricing]');
    selectElements.forEach(select => {
        select.addEventListener('change', calculateQuote);
    });

    // Initial calculation
    calculateQuote();
}

// Calculate the quote based on selections
function calculateQuote() {
    // Reset calculated values
    currentQuote.actions = 0;
    currentQuote.timeline = 0;
    currentQuote.domain = 0;
    currentQuote.emails = 0;
    currentQuote.logo = 0;
    currentQuote.media = 0;

    // Calculate action costs (checkboxes)
    const actionCheckboxes = document.querySelectorAll('input[name="actions"]:checked');
    actionCheckboxes.forEach(checkbox => {
        currentQuote.actions += parseInt(checkbox.dataset.cost) || 0;
    });

    // Calculate timeline cost
    const timeline = document.getElementById('timeline');
    if (timeline && timeline.selectedOptions[0]) {
        currentQuote.timeline = parseInt(timeline.selectedOptions[0].dataset.cost) || 0;
    }

    // Calculate domain cost
    const domainStatus = document.getElementById('domainStatus');
    if (domainStatus && domainStatus.selectedOptions[0]) {
        currentQuote.domain = parseInt(domainStatus.selectedOptions[0].dataset.cost) || 0;
    }

    // Calculate email cost
    const emails = document.getElementById('emails');
    if (emails && emails.selectedOptions[0]) {
        currentQuote.emails = parseInt(emails.selectedOptions[0].dataset.cost) || 0;
    }

    // Calculate logo cost
    const logoStatus = document.getElementById('logoStatus');
    if (logoStatus && logoStatus.selectedOptions[0]) {
        currentQuote.logo = parseInt(logoStatus.selectedOptions[0].dataset.cost) || 0;
    }

    // Calculate media cost
    const media = document.getElementById('media');
    if (media && media.selectedOptions[0]) {
        currentQuote.media = parseInt(media.selectedOptions[0].dataset.cost) || 0;
    }

    // Calculate total
    currentQuote.total = currentQuote.base + 
                        currentQuote.actions + 
                        currentQuote.timeline + 
                        currentQuote.domain + 
                        currentQuote.emails + 
                        currentQuote.logo + 
                        currentQuote.media;

    // Update the UI
    updateQuoteDisplay();
}

// Update the quote display
function updateQuoteDisplay() {
    const amountElement = document.getElementById('quoteAmount');
    const breakdownElement = document.getElementById('quoteBreakdown');

    // Animate the amount change
    if (amountElement) {
        amountElement.style.transform = 'scale(1.1)';
        amountElement.textContent = currentQuote.total.toLocaleString('en-IN');
        
        setTimeout(() => {
            amountElement.style.transform = 'scale(1)';
        }, 200);
    }

    // Update breakdown
    if (breakdownElement) {
        let breakdownHTML = '<h4>Cost Breakdown</h4>';
        
        breakdownHTML += `<div class="breakdown-item">
            <span>Base Website</span>
            <span>₹${currentQuote.base.toLocaleString('en-IN')}</span>
        </div>`;

        if (currentQuote.actions > 0) {
            breakdownHTML += `<div class="breakdown-item">
                <span>Features & Actions</span>
                <span>₹${currentQuote.actions.toLocaleString('en-IN')}</span>
            </div>`;
        }

        if (currentQuote.timeline > 0) {
            breakdownHTML += `<div class="breakdown-item">
                <span>Rush Delivery</span>
                <span>₹${currentQuote.timeline.toLocaleString('en-IN')}</span>
            </div>`;
        }

        if (currentQuote.domain > 0) {
            breakdownHTML += `<div class="breakdown-item">
                <span>Domain Registration</span>
                <span>₹${currentQuote.domain.toLocaleString('en-IN')}</span>
            </div>`;
        }

        if (currentQuote.emails > 0) {
            breakdownHTML += `<div class="breakdown-item">
                <span>Professional Emails</span>
                <span>₹${currentQuote.emails.toLocaleString('en-IN')}</span>
            </div>`;
        }

        if (currentQuote.logo > 0) {
            breakdownHTML += `<div class="breakdown-item">
                <span>Logo Design</span>
                <span>₹${currentQuote.logo.toLocaleString('en-IN')}</span>
            </div>`;
        }

        if (currentQuote.media > 0) {
            breakdownHTML += `<div class="breakdown-item">
                <span>Stock Photos/Videos</span>
                <span>₹${currentQuote.media.toLocaleString('en-IN')}</span>
            </div>`;
        }

        breakdownHTML += `<div class="breakdown-item">
            <span><strong>Total Estimate</strong></span>
            <span><strong>₹${currentQuote.total.toLocaleString('en-IN')}</strong></span>
        </div>`;

        breakdownElement.innerHTML = breakdownHTML;
    }
}

// Initialize form submission
function initializeFormSubmission() {
    const form = document.getElementById('quoteForm');
    if (!form) return;

    form.addEventListener('submit', handleQuoteSubmit);
}

// Handle quote form submission
async function handleQuoteSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!e.target.checkValidity()) {
        e.target.reportValidity();
        return;
    }

    // Collect form data
    const formData = new FormData(e.target);
    
    // Get selected actions
    const selectedActions = [];
    const actionCheckboxes = document.querySelectorAll('input[name="actions"]:checked');
    actionCheckboxes.forEach(checkbox => {
        selectedActions.push(checkbox.value);
    });

    // Prepare data for submission
    const data = {
        timestamp: new Date().toISOString(),
        name: formData.get('name'),
        mobile: formData.get('mobile'),
        companyName: formData.get('companyName'),
        targetAudience: formData.get('targetAudience'),
        visitorActions: selectedActions.join(', '),
        timeline: formData.get('timeline'),
        budget: formData.get('budget'),
        domains: formData.get('domains') || 'Not specified',
        domainStatus: formData.get('domainStatus'),
        emails: formData.get('emails'),
        references: formData.get('references') || 'None provided',
        logoStatus: formData.get('logoStatus'),
        media: formData.get('media'),
        calculatedQuote: currentQuote.total,
        breakdown: JSON.stringify(currentQuote)
    };

    // Show loading state
    setQuoteLoadingState(true);

    try {
        // Submit to Google Apps Script
        const response = await fetch(QUOTE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // Show success message
        showQuoteSuccessMessage();
        
        // Scroll to top to see the quote
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error('Error submitting quote:', error);
        showQuoteErrorMessage('Failed to submit quote request. Please try again or contact us directly.');
    } finally {
        setQuoteLoadingState(false);
    }
}

// Set loading state for quote form
function setQuoteLoadingState(isLoading) {
    const submitBtn = document.getElementById('quoteSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    if (isLoading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

// Show success message
function showQuoteSuccessMessage() {
    const formMessage = document.getElementById('quoteFormMessage');
    formMessage.className = 'form-message success';
    formMessage.innerHTML = `
        <strong>✓ Quote Request Received!</strong><br>
        Your estimated quote is ₹${currentQuote.total.toLocaleString('en-IN')}. 
        We'll send you a detailed proposal within 24 hours and contact you to discuss your project.
    `;

    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide after 15 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 15000);
}

// Show error message
function showQuoteErrorMessage(message) {
    const formMessage = document.getElementById('quoteFormMessage');
    formMessage.className = 'form-message error';
    formMessage.textContent = '✗ ' + message;

    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add smooth transition to amount changes
document.addEventListener('DOMContentLoaded', function() {
    const amountElement = document.getElementById('quoteAmount');
    if (amountElement) {
        amountElement.style.transition = 'transform 0.2s ease';
    }
});
