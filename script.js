document.addEventListener('DOMContentLoaded', function () {
    const DEFAULT_PRECISION = 12;
    const MAX_FRACTION_LENGTH = 50;

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Complement label updates
    const complementBase = document.getElementById('complement-base');
    const r1Label = document.getElementById('r-1-label');
    const rLabel = document.getElementById('r-label');

    complementBase.addEventListener('change', updateComplementLabels);
    updateComplementLabels();

    function updateComplementLabels() {
        const base = parseInt(complementBase.value);
        r1Label.textContent = `(${base - 1})'s Complement`;
        rLabel.textContent = `${base}'s Complement`;
    }

    // Convert Base Button
    document.getElementById('convert-btn').addEventListener('click', convertNumber);

    function convertNumber() {
        const input = document.getElementById('input-value').value.trim();
        const fromBase = parseInt(document.getElementById('from-base').value);
        const toBase = parseInt(document.getElementById('to-base').value);
        const precisionInput = document.getElementById('precision')?.value;
        const precision = parseInt(precisionInput) || DEFAULT_PRECISION;

        const resultElement = document.getElementById('conversion-result');
        const originalElement = document.getElementById('original-value');

        resultElement.className = '';
        originalElement.className = '';

        if (!input) return showError(resultElement, 'Please enter a number');
        if (input.split('.').length > 2) return showError(resultElement, 'Invalid number format – multiple decimal points');

        const isNegative = input.startsWith('-');
        const inputClean = isNegative ? input.slice(1) : input;

        try {
            let [integerPart = '0', fractionalPart = ''] = inputClean.split('.');
            const validChars = getValidChars(fromBase);

            if (!validateNumberParts(integerPart, fractionalPart, validChars)) {
                throw new Error(`Invalid characters for base ${fromBase}`);
            }

            if (fractionalPart.length > MAX_FRACTION_LENGTH) {
                throw new Error(`Fractional part too long (max ${MAX_FRACTION_LENGTH} digits)`);
            }

            const decimalValue = convertToDecimal(integerPart, fractionalPart, fromBase);
            const result = convertFromDecimal(decimalValue, toBase, precision);

            resultElement.textContent = (isNegative ? '-' : '') + result;
            resultElement.classList.add('success');
            originalElement.textContent = `Base ${fromBase}: ${input} → Base ${toBase}: ${(isNegative ? '-' : '') + result}`;
        } catch (error) {
            showError(resultElement, error.message);
        }
    }

    // Complement Button
    document.getElementById('calculate-complement-btn').addEventListener('click', calculateComplement);

    function calculateComplement() {
        const input = document.getElementById('complement-input').value.trim();
        const base = parseInt(complementBase.value);
        const type = document.querySelector('input[name="complement-type"]:checked').value;

        const resultElement = document.getElementById('complement-result');
        const explanationElement = document.getElementById('complement-explanation');

        resultElement.className = '';
        explanationElement.className = '';

        if (!input) return showError(resultElement, 'Please enter a number');
        if (input.split('.').length > 2) return showError(resultElement, 'Invalid number format – multiple decimal points');
        if (input.startsWith('-')) return showError(resultElement, 'Complement not defined for negative numbers');

        let [integerPart = '0', fractionalPart = ''] = input.split('.');
        const validChars = getValidChars(base);

        if (!validateNumberParts(integerPart, fractionalPart, validChars)) {
            return showError(resultElement, `Invalid characters for base ${base}`);
        }

        if (fractionalPart.length > MAX_FRACTION_LENGTH) {
            return showError(resultElement, `Fractional part too long (max ${MAX_FRACTION_LENGTH} digits)`);
        }

        let result, explanation;
        if (type === 'r-1') {
            [result, explanation] = calculateR1Complement(integerPart, fractionalPart, base);
        } else {
            [result, explanation] = calculateRComplement(integerPart, fractionalPart, base);
        }

        if (parseFloat(result) === 0) result = '0';
        resultElement.textContent = result;
        resultElement.classList.add('success');
        explanationElement.textContent = explanation;
    }

    // Core Helper Functions

    function getValidChars(base) {
        return {
            2: /^[01]+$/,
            8: /^[0-7]+$/,
            10: /^[0-9]+$/,
            16: /^[0-9A-Fa-f]+$/
        }[base] || new RegExp(`^[0-${Math.min(base - 1, 9)}A-${String.fromCharCode(55 + base - 10)}]+$`, 'i');
    }

    function validateNumberParts(integerPart, fractionalPart, validChars) {
        return (!integerPart || validChars.test(integerPart)) && (!fractionalPart || validChars.test(fractionalPart));
    }

    function convertToDecimal(integerPart, fractionalPart, base) {
        let decimalValue = parseInt(integerPart, base) || 0;
        for (let i = 0; i < fractionalPart.length; i++) {
            const digit = parseInt(fractionalPart[i], base);
            decimalValue += digit / Math.pow(base, i + 1);
        }
        return decimalValue;
    }

    function convertFromDecimal(decimalValue, base, precision = DEFAULT_PRECISION) {
        if (base === 10) return decimalValue.toString();

        let intValue = Math.floor(decimalValue);
        let intResult = intValue.toString(base).toUpperCase();

        let fracValue = decimalValue - intValue;
        let fracResult = '';

        if (fracValue > 0) {
            fracResult = '.';
            while (fracValue > 0 && precision-- > 0) {
                fracValue *= base;
                const digit = Math.floor(fracValue);
                fracResult += digit.toString(base).toUpperCase();
                fracValue -= digit;
            }
        }

        return intResult + fracResult;
    }

    function calculateR1Complement(integerPart, fractionalPart, base) {
        const complementDigit = d => (base - 1 - parseInt(d, base)).toString(base).toUpperCase();
        const intResult = integerPart.split('').map(complementDigit).join('').padStart(integerPart.length, '0');
        const fracResult = fractionalPart ? '.' + fractionalPart.split('').map(complementDigit).join('') : '';
        return [
            intResult + fracResult,
            `(${base - 1})'s complement: Subtract each digit from ${base - 1}`
        ];
    }

    function calculateRComplement(integerPart, fractionalPart, base) {
        const totalDigits = integerPart.length;
        const fracDigits = fractionalPart.length;
        const decimalValue = convertToDecimal(integerPart, fractionalPart, base);
        const power = Math.pow(base, totalDigits + fracDigits);
        const complement = power - decimalValue;

        let rawResult = convertFromDecimal(complement, base, totalDigits + fracDigits);
        let [intRes = '0', fracRes = ''] = rawResult.split('.');

        const paddedInt = intRes.padStart(totalDigits, '0');
        const paddedFrac = fracRes.padEnd(fracDigits, '0');
        const result = fracDigits ? `${paddedInt}.${paddedFrac}` : paddedInt;

        return [
            result,
            `${base}'s complement: ${base}^(${totalDigits + fracDigits}) - original number = ${result}`
        ];
    }

    function showError(element, message) {
        element.textContent = message;
        element.classList.add('error');
    }

    // Trigger Enter key actions
    document.getElementById('input-value').addEventListener('keypress', e => {
        if (e.key === 'Enter') convertNumber();
    });

    document.getElementById('complement-input').addEventListener('keypress', e => {
        if (e.key === 'Enter') calculateComplement();
    });
});
