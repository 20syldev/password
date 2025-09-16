document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-visibility');
    const strengthText = document.getElementById('strength-text');
    const strengthLevel = document.getElementById('strength-level');
    const strengthFill = document.getElementById('strength-fill');

    // Elements for criteria
    const lengthCheck = document.getElementById('length-check');
    const lowercaseCheck = document.getElementById('lowercase-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');

    // SVG icons
    const crossIcon = `<circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    `;

    const checkIcon = `<circle cx="12" cy="12" r="10" stroke="#16a34a" stroke-width="2"/>
        <polyline points="9,12 12,15 23,4" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;

    // Toggle password visibility
    toggleBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        const eyeIcon = document.getElementById('eye-icon');
        if (type === 'text') eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A16.69 16.69 0 0 1 4.73 5.27M1 1L23 23M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 19.42 16.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
        else eyeIcon.innerHTML = `<path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
    });

    // Analyze password strength
    function analyzePassword(password) {
        const criteria = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        // Count character types present
        const typeCount = [criteria.lowercase, criteria.uppercase, criteria.number, criteria.special].filter(Boolean).length;

        let strength = '';

        if (password.length === 0) {
            strength = 'empty';
        } else if (password.length < 8 || typeCount <= 1) {
            // Weak: < 8 characters OR contains only letters OR only numbers
            strength = 'faible';
        } else if (password.length >= 16 && typeCount === 4) {
            // Very strong: ≥ 16 characters AND all 4 character types
            strength = 'tres-fort';
        } else if (password.length >= 12 && typeCount >= 3) {
            // Strong: ≥ 12 characters AND at least 3 character types
            strength = 'fort';
        } else if (password.length >= 8 && typeCount >= 2) {
            // Medium: ≥ 8 characters AND at least 2 character types
            strength = 'moyen';
        } else {
            strength = 'faible';
        }

        return { criteria, strength };
    }

    // Update UI based on analysis
    function updateUI(analysis) {
        const { criteria, strength } = analysis;
        const password = passwordInput.value;

        // Reset classes
        strengthLevel.className = 'strength-level';
        strengthFill.className = 'strength-fill';

        // Update length requirement based on current strength goal
        let requiredLength = 8;
        if (password.length >= 8) {
            requiredLength = 12; // To reach "Strong"
        }
        if (password.length >= 12) {
            requiredLength = 16; // To reach "Very strong"
        }

        // Update length criteria text
        const lengthSpan = lengthCheck.querySelector('span');
        lengthSpan.textContent = `Au moins ${requiredLength} caractères`;

        // Calculate progress percentage
        let progressWidth = 0;
        const typeCount = [criteria.lowercase, criteria.uppercase, criteria.number, criteria.special].filter(Boolean).length;

        if (password.length === 0) {
            progressWidth = 0;
        } else {
            // Base progress on length and character types
            let lengthProgress = Math.min(password.length / 16, 1) * 60; // 60% for length
            let typeProgress = (typeCount / 4) * 40; // 40% for character types
            progressWidth = Math.min(lengthProgress + typeProgress, 100);
        }

        // Update strength text and styling
        switch (strength) {
            case 'empty':
                strengthText.textContent = 'Saisissez un mot de passe';
                progressWidth = 0;
                break;
            case 'faible':
                strengthText.textContent = 'Faible';
                strengthLevel.classList.add('faible');
                strengthFill.classList.add('faible');
                progressWidth = Math.max(progressWidth, 15); // Minimum 15% for weak
                break;
            case 'moyen':
                strengthText.textContent = 'Moyen';
                strengthLevel.classList.add('moyen');
                strengthFill.classList.add('moyen');
                progressWidth = Math.max(progressWidth, 35); // Minimum 35% for medium
                break;
            case 'fort':
                strengthText.textContent = 'Fort';
                strengthLevel.classList.add('fort');
                strengthFill.classList.add('fort');
                progressWidth = Math.max(progressWidth, 70); // Minimum 70% for strong
                break;
            case 'tres-fort':
                strengthText.textContent = 'Très fort';
                strengthLevel.classList.add('tres-fort');
                strengthFill.classList.add('tres-fort');
                progressWidth = 100;
                break;
        }

        // Apply the calculated width
        strengthFill.style.width = progressWidth + '%';

        // Update criteria indicators with dynamic length check
        const dynamicLengthCheck = password.length >= requiredLength;
        updateCriteriaUI(lengthCheck, dynamicLengthCheck);
        updateCriteriaUI(lowercaseCheck, criteria.lowercase);
        updateCriteriaUI(uppercaseCheck, criteria.uppercase);
        updateCriteriaUI(numberCheck, criteria.number);
        updateCriteriaUI(specialCheck, criteria.special);
    }

    // Update individual criteria UI
    function updateCriteriaUI(element, isValid) {
        const icon = element.querySelector('.check-icon');

        if (isValid) {
            element.classList.add('valid');
            icon.innerHTML = checkIcon;
        } else {
            element.classList.remove('valid');
            icon.innerHTML = crossIcon;
        }
    }

    // Real-time password analysis
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const analysis = analyzePassword(password);
        updateUI(analysis);
    });

    // Initialize with empty state
    updateUI({
        criteria: {
            length: false,
            lowercase: false,
            uppercase: false,
            number: false,
            special: false
        }, strength: 'empty'
    });
});