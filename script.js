document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
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
            const validChars = {
                2: /^[01]+$/,
                8: /^[0-7]+$/,
                10: /^[0-9]+$/,
                16: /^[0-9A-Fa-f]+$/
            }[fromBase];
            
            if (!validChars.test(integerPart)) {
                throw new Error(`Invalid integer part for base ${fromBase}`);
            }
            
            if (fractionalPart && !validChars.test(fractionalPart)) {
                throw new Error(`Invalid fractional part for base ${fromBase}`);
            }
            
            // Convert to decimal first
            let decimalValue = parseInt(integerPart, fromBase);
            if (fractionalPart) {
                for (let i = 0; i < fractionalPart.length; i++) {
                    const digit = parseInt(fractionalPart[i], fromBase);
                    decimalValue += digit / Math.pow(fromBase, i + 1);
                }
            }
            
            // Convert to target base
            let result;
            if (toBase === 10) {
                result = decimalValue.toString();
            } else {
                // Handle integer part
                let intValue = Math.floor(decimalValue);
                let intResult = intValue.toString(toBase).toUpperCase();
                
                // Handle fractional part
                let fracValue = decimalValue - intValue;
                let fracResult = '';
                
                if (fracValue > 0) {
                    fracResult = '.';
                    let precision = 10;
                    
                    while (fracValue > 0 && precision-- > 0) {
                        fracValue *= toBase;
                        const digit = Math.floor(fracValue);
                        fracResult += digit.toString(toBase).toUpperCase();
                        fracValue -= digit;
                    }
                }
                
                result = intResult + fracResult;
            }
            
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
            // Handle fractional numbers
            const [integerPart, fractionalPart = ''] = input.split('.');
            const validChars = {
                2: /^[01]+$/,
                8: /^[0-7]+$/,
                10: /^[0-9]+$/,
                16: /^[0-9A-Fa-f]+$/
            }[base];
            
            if (!validChars.test(integerPart)) {
                throw new Error(`Invalid integer part for base ${base}`);
            }
            
            if (fractionalPart && !validChars.test(fractionalPart)) {
                throw new Error(`Invalid fractional part for base ${base}`);
            }
            
            const maxDigit = base - 1;
            let result, explanation;
            
            if (type === 'r-1') {
                // (r-1)'s complement
                let intComplement = integerPart.split('').map(d => {
                    return (maxDigit - parseInt(d, base)).toString(base).toUpperCase();
                }).join('');
                
                let fracComplement = fractionalPart ? '.' + fractionalPart.split('').map(d => {
                    return (maxDigit - parseInt(d, base)).toString(base).toUpperCase();
                }).join('') : '';
                
                result = intComplement + fracComplement;
                explanation = `(${maxDigit})'s complement is calculated by subtracting each digit from ${maxDigit}`;
            } else {
                // r's complement
                // First calculate (r-1)'s complement
                let intComplement = integerPart.split('').map(d => {
                    return (maxDigit - parseInt(d, base)).toString(base).toUpperCase();
                }).join('');
                
                let fracComplement = fractionalPart ? '.' + fractionalPart.split('').map(d => {
                    return (maxDigit - parseInt(d, base)).toString(base).toUpperCase();
                }).join('') : '';
                
                // Then add 1 to the least significant digit
                if (fractionalPart) {
                    // Add to fractional part
                    const lastDigit = parseInt(fracComplement.slice(-1), base) + 1;
                    if (lastDigit >= base) {
                        fracComplement = fracComplement.slice(0, -1) + '0';
                        intComplement = (parseInt(intComplement, base) + 1).toString(base).toUpperCase();
                    } else {
                        fracComplement = fracComplement.slice(0, -1) + lastDigit.toString(base).toUpperCase();
                    }
                } else {
                    // Add to integer part
                    intComplement = (parseInt(intComplement, base) + 1).toString(base).toUpperCase();
                }
                
                result = intComplement + fracComplement;
                explanation = `${base}'s complement is calculated by first finding the (${maxDigit})'s complement and then adding 1`;
            }
            
            resultElement.textContent = result;
            resultElement.classList.add('success');
            explanationElement.textContent = explanation;
        } catch (error) {
            showError(resultElement, error.message);
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