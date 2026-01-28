// ============================================
// CONTACT FORM HANDLER - GOOGLE SHEETS INTEGRATION
// ============================================

// IMPORTANT: Replace this URL with your Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyS-Be4r6bRkt6xbzv_7iJvVDdQSQvMyJBTojr8Pl6GqpN5bNMmSQPsR7aikWu1dO4qZg/exec';

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
});

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Clear previous messages
    clearFormMessages();
    
    // Validate all fields
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        businessType: formData.get('businessType'),
        companyName: formData.get('companyName') || 'Not provided',
        timeline: formData.get('timeline') || 'Not specified',
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'yes' ? 'Yes' : 'No',
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Submit to Google Apps Script
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Note: With 'no-cors' mode, we can't read the response
        // We assume success if no error is thrown
        showSuccessMessage();
        e.target.reset();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showErrorMessage('Failed to send message. Please try again or email us directly.');
    } finally {
        setLoadingState(false);
    }
}

// Validate entire form
function validateForm() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const businessType = document.getElementById('businessType');
    const message = document.getElementById('message');
    
    let isValid = true;
    
    if (!validateField(name)) isValid = false;
    if (!validateField(email)) isValid = false;
    if (!validateField(phone)) isValid = false;
    if (!validateField(businessType)) isValid = false;
    if (!validateField(message)) isValid = false;
    
    return isValid;
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(field.id + 'Error');
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        if (!validateEmail(value)) {
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        if (!validatePhone(value)) {
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Message minimum length
    if (field.id === 'message' && value && value.length < 10) {
        errorMessage = 'Please provide more details (at least 10 characters)';
    }
    
    // Display error or clear it
    if (errorMessage) {
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
        field.style.borderColor = '#dc2626';
        return false;
    } else {
        if (errorElement) {
            errorElement.textContent = '';
        }
        field.style.borderColor = '';
        return true;
    }
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Phone validation
function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Set loading state
function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
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
function showSuccessMessage() {
    const formMessage = document.getElementById('formMessage');
    formMessage.className = 'form-message success';
    formMessage.textContent = '✓ Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.';
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Hide message after 10 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 10000);
}

// Show error message
function showErrorMessage(message) {
    const formMessage = document.getElementById('formMessage');
    formMessage.className = 'form-message error';
    formMessage.textContent = '✗ ' + message;
    
    // Scroll to message
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clear form messages
function clearFormMessages() {
    const formMessage = document.getElementById('formMessage');
    formMessage.className = 'form-message';
    formMessage.textContent = '';
    formMessage.style.display = 'none';
    
    // Clear all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.textContent = '');
    
    // Reset input border colors
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => input.style.borderColor = '');
}
