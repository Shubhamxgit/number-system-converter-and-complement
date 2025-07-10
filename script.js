document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
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
        r1Label.textContent = `(${base-1})'s Complement`;
        rLabel.textContent = `${base}'s Complement`;
    }
    
    complementBase.addEventListener('change', updateComplementLabels);
    updateComplementLabels();

    // Conversion function
    document.getElementById('convert-btn').addEventListener('click', convertNumber);
    
    function convertNumber() {
        const input = document.getElementById('input-value').value.trim();
        const fromBase = parseInt(document.getElementById('from-base').value);
        const toBase = parseInt(document.getElementById('to-base').value);
        const resultElement = document.getElementById('conversion-result');
        const originalElement = document.getElementById('original-value');
        
        resultElement.className = '';
        originalElement.className = '';
        
        if (!input) {
            showError(resultElement, 'Please enter a number');
            return;
        }
        
        try {
            // Handle fractional numbers
            const [integerPart, fractionalPart = ''] = input.split('.');
            const validChars = getValidChars(fromBase);
            
            if (!validateNumberParts(integerPart, fractionalPart, fromBase, validChars)) {
                throw new Error(`Invalid characters for base ${fromBase}`);
            }
            
            // Convert to decimal first
            let decimalValue = convertToDecimal(integerPart, fractionalPart, fromBase);
            
            // Convert to target base
            let result = convertFromDecimal(decimalValue, toBase);
            
            resultElement.textContent = result;
            resultElement.classList.add('success');
            originalElement.textContent = `Base ${fromBase}: ${input} → Base ${toBase}: ${result}`;
        } catch (error) {
            showError(resultElement, error.message);
        }
    }

    // Complement calculation
    document.getElementById('calculate-complement-btn').addEventListener('click', calculateComplement);
    
    function calculateComplement() {
        const input = document.getElementById('complement-input').value.trim();
        const base = parseInt(complementBase.value);
        const type = document.querySelector('input[name="complement-type"]:checked').value;
        const resultElement = document.getElementById('complement-result');
        const explanationElement = document.getElementById('complement-explanation');
        
        resultElement.className = '';
        explanationElement.className = '';
        
        if (!input) {
            showError(resultElement, 'Please enter a number');
            return;
        }
        
        try {
            // Parse integer and fractional parts
            let [integerPart = '0', fractionalPart = ''] = input.split('.');
            const validChars = getValidChars(base);
            
            // Validate input
            if (!validateNumberParts(integerPart, fractionalPart, base, validChars)) {
                throw new Error(`Invalid characters for base ${base}`);
            }

            // Calculate complement
            let result, explanation;
            if (type === 'r-1') {
                [result, explanation] = calculateR1Complement(integerPart, fractionalPart, base);
            } else {
                [result, explanation] = calculateRComplement(integerPart, fractionalPart, base);
            }
            
            // Display results
            resultElement.textContent = result;
            resultElement.classList.add('success');
            explanationElement.textContent = explanation;
        } catch (error) {
            showError(resultElement, error.message);
        }
    }

    // Helper functions
    function getValidChars(base) {
        return {
            2: /^[01]+$/,
            8: /^[0-7]+$/,
            10: /^[0-9]+$/,
            16: /^[0-9A-Fa-f]+$/
        }[base];
    }

    function validateNumberParts(integerPart, fractionalPart, base, validChars) {
        return (!integerPart || validChars.test(integerPart)) && 
               (!fractionalPart || validChars.test(fractionalPart));
    }

    function convertToDecimal(integerPart, fractionalPart, base) {
        let decimalValue = parseInt(integerPart, base);
        if (fractionalPart) {
            for (let i = 0; i < fractionalPart.length; i++) {
                const digit = parseInt(fractionalPart[i], base);
                decimalValue += digit / Math.pow(base, i + 1);
            }
        }
        return decimalValue;
    }

    function convertFromDecimal(decimalValue, base) {
        if (base === 10) return decimalValue.toString();
        
        // Handle integer part
        let intValue = Math.floor(decimalValue);
        let intResult = intValue.toString(base).toUpperCase();
        
        // Handle fractional part
        let fracValue = decimalValue - intValue;
        let fracResult = '';
        
        if (fracValue > 0) {
            fracResult = '.';
            let precision = 12; // Max fractional digits
            
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
        // Calculate (r-1)'s complement for both parts
        const complementDigit = d => (base - 1 - parseInt(d, base)).toString(base).toUpperCase();
        
        const intResult = integerPart.split('').map(complementDigit).join('').padStart(integerPart.length, '0');
        const fracResult = fractionalPart ? '.' + fractionalPart.split('').map(complementDigit).join('') : '';
        
        return [
            intResult + fracResult,
            `(${base-1})'s complement: Subtract each digit from ${base-1}`
        ];
    }

    function calculateRComplement(integerPart, fractionalPart, base) {
        if (fractionalPart) {
            // Handle fractional numbers: r^n - number
            const n = fractionalPart.length;
            const number = parseFloat(`0.${fractionalPart}`);
            const complement = Math.pow(base, n) - number;
            const result = '0.' + complement.toString(base)
                .toUpperCase()
                .padStart(n, '0')
                .slice(0, n);
            
            return [
                result,
                `${base}'s complement: ${base}^${n} - 0.${fractionalPart} = ${result}`
            ];
        } else {
            // Handle integers: (r-1)'s complement + 1
            const r1Complement = integerPart.split('')
                .map(d => (base - 1 - parseInt(d, base)).toString(base))
                .join('');
            
            const result = (parseInt(r1Complement, base) + 1)
                .toString(base)
                .toUpperCase()
                .padStart(integerPart.length, '0');
            
            return [
                result,
                `${base}'s complement: (${base-1})'s complement + 1 = ${result}`
            ];
        }
    }

    function showError(element, message) {
        element.textContent = message;
        element.classList.add('error');
    }

    // Allow Enter key to trigger actions
    document.getElementById('input-value').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') convertNumber();
    });

    document.getElementById('complement-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateComplement();
    });
});
