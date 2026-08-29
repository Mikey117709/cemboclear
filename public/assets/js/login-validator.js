


const LoginValidator = {
    validate(identifier, password) {
        const errors = [];
        const cleanId = (identifier || '').trim();
        const cleanPw = (password || '').trim();

        if (!cleanId) {
            errors.push('Email or Phone Number is required.');
        } else {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);
            const digits = cleanId.replace(/\D/g, '');
            const isPhone = digits.length >= 9 && digits.length <= 13;

            if (!isEmail && !isPhone) {
                errors.push('Please enter a valid email address or phone number.');
            }
        }

        if (!cleanPw) {
            errors.push('Password is required.');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginValidator;
}
