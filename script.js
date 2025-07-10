document.addEventListener('DOMContentLoaded', function () {
    const MAX_FRACTION_PRECISION = 12;
    const MAX_INPUT_LENGTH = 50;

    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Complement terminology
    const complementBase = document.getElementById('complement-base');
    const r1Label = document.getElementById('r-1-label');
    const rLabel = document.getElementById('r-label');

    function updateComplementLabels() {
        const base = parseInt(complementBase.value);
        r1Label.textContent = `(${base - 1})'s Complement`;
        rLabel.textContent = `${base}'s Complement`;
    }

    complementBase.addEventListener('change', updateComplementLabels);
    updateComplementLabels();

    document.getElementById('convert-btn').addEventListener('click', convertNumber);

    function convertNumber() {
        const input = document.getElementById('input-value').value.trim().toUpperCase();
        const fromBase = parseInt(document.getElementById('from-base').value);
        const toBase = parseInt(document.getElementById('to-base').value);
        const resultElement = document.getElementById('conversion-result');
        const originalElement = document.getElementById('original-value');

        resultElement.className = '';
        originalElement.className = '';

        if (!input) {
            return showError(resultElement, 'Please enter a number');
        }

        if (input.split('.').length > 2) {
            return showError(resultElement, 'Invalid number format – multiple decimal points');
        }

        try {
            let [integerPart = '0', fractionalPart = ''] = input.split('.');
            
            if (integerPart.length > MAX_INPUT_LENGTH || fractionalPart.length > MAX_INPUT_LENGTH) {
                throw new Error(`Number too long (max ${MAX_INPUT_LENGTH} digits per part)`);
            }

            const validChars = getValidChars(fromBase);

            if (!validateNumberParts(integerPart, fractionalPart, validChars)) {
                throw new Error(`Invalid characters for base ${fromBase}.`);
            }

            const decimalValue = convertToDecimal(integerPart, fractionalPart, fromBase);
            const result = convertFromDecimal(decimalValue, toBase);

            resultElement.textContent = result;
            resultElement.classList.add('success');
            originalElement.textContent = `Base ${fromBase}: ${input} → Base ${toBase}: ${result}`;
        } catch (error) {
            showError(resultElement, error.message);
        }
    }

    document.getElementById('calculate-complement-btn').addEventListener('click', calculateComplement);

    function calculateComplement() {
        const input = document.getElementById('complement-input').value.trim().toUpperCase();
        const base = parseInt(complementBase.value);
        const type = document.querySelector('input[name="complement-type"]:checked').value;
        const resultElement = document.getElementById('complement-result');
        const explanationElement = document.getElementById('complement-explanation');

        resultElement.className = '';
        explanationElement.className = '';

        if (!input) {
            return showError(resultElement, 'Please enter a number');
        }

        if (input.split('.').length > 2) {
            return showError(resultElement, 'Invalid number format – multiple decimal points');
        }

        try {
            let [integerPart = '0', fractionalPart = ''] = input.split('.');
            
            if (integerPart.length > MAX_INPUT_LENGTH || fractionalPart.length > MAX_INPUT_LENGTH) {
                throw new Error(`Number too long (max ${MAX_INPUT_LENGTH} digits per part)`);
            }

            const validChars = getValidChars(base);

            if (!validateNumberParts(integerPart, fractionalPart, validChars)) {
                throw new Error(`Invalid characters for base ${base}.`);
            }

            let result, explanation;
            if (type === 'r-1') {
                [result, explanation] = calculateR1Complement(integerPart, fractionalPart, base);
            } else {
                [result, explanation] = calculateRComplement(integerPart, fractionalPart, base);
            }

            resultElement.textContent = result;
            resultElement.classList.add('success');
            explanationElement.textContent = explanation;
        } catch (error) {
            showError(resultElement, error.message);
        }
    }

    // Helper Functions

    function getValidChars(base) {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);
        return new RegExp(`^[${chars}]+$`, 'i');
    }

    function validateNumberParts(integerPart, fractionalPart, validChars) {
        return validChars.test(integerPart) &&
               (!fractionalPart || validChars.test(fractionalPart));
    }

    function convertToDecimal(integerPart, fractionalPart, base) {
        let decimalValue = parseInt(integerPart, base) || 0;
        for (let i = 0; i < fractionalPart.length; i++) {
            const digit = parseInt(fractionalPart[i], base);
            decimalValue += digit / Math.pow(base, i + 1);
        }
        return decimalValue;
    }

    function convertFromDecimal(decimalValue, base) {
        let intValue = Math.floor(decimalValue);
        let intResult = intValue.toString(base).toUpperCase();

        let fracValue = decimalValue - intValue;
        let fracResult = '';
        let precision = MAX_FRACTION_PRECISION;

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

        let fracResult = '';
        if (fractionalPart) {
            fracResult = '.' + fractionalPart
                .split('')
                .map(d => complementDigit(d))
                .join('')
                .padEnd(fractionalPart.length, '0');
        }

        const result = intResult + fracResult;
        const explanation = `(${base - 1})'s complement: Subtract each digit from ${base - 1}`;

        return [result, explanation];
    }

    function calculateRComplement(integerPart, fractionalPart, base) {
        const isZeroInt = parseInt(integerPart, base) === 0;
        const integerDigits = isZeroInt ? 0 : integerPart.length;
        const fractionalDigits = fractionalPart.length;
        const totalDigits = integerDigits + fractionalDigits;

        if (/^0*$/.test(integerPart) && /^0*$/.test(fractionalPart)) {
            return ['0', `${base}'s complement of 0 is 0`];
        }

        const baseBig = BigInt(base);
        const fullString = (integerPart + fractionalPart).replace(/^0+/, '') || '0';

        let value = BigInt(0);
        for (let i = 0; i < fullString.length; i++) {
            const digit = parseInt(fullString[i], base);
            value = value * baseBig + BigInt(digit);
        }

        const power = baseBig ** BigInt(totalDigits);
        let complement = power - value;

        let complementStr = complement.toString(base).toUpperCase().padStart(totalDigits, '0');

        const intResult = complementStr.substring(0, integerDigits) || '0';
        const fracResult = fractionalDigits ? complementStr.substring(integerDigits).padEnd(fractionalDigits, '0') : '';

        const result = fracResult ? `${intResult}.${fracResult}` : intResult;
        const explanation = `${base}'s complement: ${base}^${totalDigits} - original number = ${result}`;

        return [result, explanation];
    }

    function showError(element, message) {
        element.textContent = message;
        element.classList.add('error');
    }

    // Trigger on Enter key
    document.getElementById('input-value').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') convertNumber();
    });

    document.getElementById('complement-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') calculateComplement();
    });
});
