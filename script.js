// DOM elements
const inputValue = document.getElementById('input-value');
const fromBase = document.getElementById('from-base');
const toBase = document.getElementById('to-base');
const convertBtn = document.getElementById('convert-btn');
const conversionResult = document.getElementById('conversion-result');
const originalValue = document.getElementById('original-value');
const clearConversionBtn = document.getElementById('clear-conversion');
const copyConversionBtn = document.getElementById('copy-conversion');
        
const complementInput = document.getElementById('complement-input');
const complementBase = document.getElementById('complement-base');
const calculateComplementBtn = document.getElementById('calculate-complement-btn');
const complementResult = document.getElementById('complement-result');
const complementExplanation = document.getElementById('complement-explanation');
const clearComplementBtn = document.getElementById('clear-complement');
const copyComplementBtn = document.getElementById('copy-complement');
const r1Label = document.getElementById('r-1-label');
const rLabel = document.getElementById('r-label');

// Update complement labels based on base
function updateComplementLabels() {
    const base = parseInt(complementBase.value);
    r1Label.textContent = `(${base-1})'s Complement`;
    rLabel.textContent = `${base}'s Complement`;
}

// Convert number between bases
function convertNumber() {
    const input = inputValue.value.trim();
    const from = parseInt(fromBase.value);
    const to = parseInt(toBase.value);
    
    // Clear previous results
    conversionResult.className = 'result-content';
    originalValue.className = 'result-content';
    
    if (!input) {
        showError(conversionResult, 'Please enter a number');
        return;
    }
    
    try {
        // Validate input based on base
        const validChars = {
            2: /^[01.]+$/,
            8: /^[0-7.]+$/,
            10: /^[0-9.]+$/,
            16: /^[0-9A-Fa-f.]+$/
        }[from];
        
        if (!validChars.test(input)) {
            throw new Error(`Invalid character for base-${from} number`);
        }
        
        // Convert to decimal first
        let decimalValue;
        if (from === 10) {
            decimalValue = parseFloat(input);
            if (isNaN(decimalValue)) throw new Error('Invalid decimal number');
        } else {
            // Convert to decimal
            if (input.includes('.')) {
                const parts = input.split('.');
                const integerPart = parseInt(parts[0], from);
                let fractionalPart = 0;
                
                if (parts[1]) {
                    for (let i = 0; i < parts[1].length; i++) {
                        fractionalPart += parseInt(parts[1][i], from) / Math.pow(from, i+1);
                    }
                }
                
                decimalValue = integerPart + fractionalPart;
            } else {
                decimalValue = parseInt(input, from);
            }
            
            if (isNaN(decimalValue)) throw new Error(`Invalid base-${from} number`);
        }
        
        // Convert from decimal to target base
        let result;
        if (to === 10) {
            result = decimalValue.toString();
        } else if (to === 2 || to === 8 || to === 16) {
            if (Number.isInteger(decimalValue)) {
                result = decimalValue.toString(to).toUpperCase();
            } else {
                // Handle fractional numbers for non-decimal bases
                const integerPart = Math.floor(decimalValue);
                const fractionalPart = decimalValue - integerPart;
                
                let integerStr = integerPart.toString(to).toUpperCase();
                let fractionalStr = '';
                
                if (fractionalPart > 0) {
                    fractionalStr = '.';
                    let currentFraction = fractionalPart;
                    let precision = 12; // Max digits after point
                    
                    while (precision-- > 0 && currentFraction > 0) {
                        currentFraction *= to;
                        const digit = Math.floor(currentFraction);
                        fractionalStr += digit.toString(to).toUpperCase();
                        currentFraction -= digit;
                    }
                }
                
                result = integerStr + fractionalStr;
            }
        } else {
            throw new Error('Unsupported target base');
        }
        
        // Display results
        conversionResult.textContent = result;
        conversionResult.classList.add('success');
        originalValue.textContent = `Base ${from}: ${input} → Base ${to}: ${result}`;
        
    } catch (error) {
        showError(conversionResult, error.message);
    }
}

// Calculate complement
function calculateComplement() {
    const input = complementInput.value.trim();
    const base = parseInt(complementBase.value);
    const complementType = document.querySelector('input[name="complement-type"]:checked').value;
    
    // Clear previous results
    complementResult.className = 'result-content';
    complementExplanation.className = 'explanation';
    
    if (!input) {
        showError(complementResult, 'Please enter a number');
        return;
    }
    
    try {
        // Validate input based on base
        const validChars = {
            2: /^[01]+$/,
            8: /^[0-7]+$/,
            10: /^[0-9]+$/,
            16: /^[0-9A-Fa-f]+$/
        }[base];
        
        if (!validChars.test(input)) {
            throw new Error(`Invalid character for base-${base} number`);
        }
        
        if (input.includes('.')) {
            throw new Error(`Fractional numbers not supported for ${base-1}'s and ${base}'s complement calculations`);
        }
        
        let result, explanation;
        
        if (complementType === 'r-1') {
            // Calculate (r-1)'s complement (diminished radix complement)
            const digits = input.split('');
            const complementedDigits = digits.map(d => {
                const digitValue = parseInt(d, base);
                const complementedValue = (base - 1) - digitValue;
                return complementedValue.toString(base).toUpperCase();
            });
            
            result = complementedDigits.join('');
            explanation = `(${base-1})'s complement (diminished radix complement) is calculated by subtracting each digit from ${base-1} (the highest digit in base-${base}).`;
        } else {
            // Calculate r's complement (radix complement)
            // First calculate (r-1)'s complement
            const digits = input.split('');
            const complementedDigits = digits.map(d => {
                const digitValue = parseInt(d, base);
                const complementedValue = (base - 1) - digitValue;
                return complementedValue.toString(base).toUpperCase();
            });
            
            // Then add 1 to get r's complement
            let carry = 1;
            let resultDigits = [];
            
            for (let i = complementedDigits.length - 1; i >= 0; i--) {
                let digitValue = parseInt(complementedDigits[i], base) + carry;
                carry = Math.floor(digitValue / base);
                digitValue = digitValue % base;
                resultDigits.unshift(digitValue.toString(base).toUpperCase());
            }
            
            if (carry > 0) {
                resultDigits.unshift(carry.toString(base).toUpperCase());
            }
            
            result = resultDigits.join('');
            explanation = `${base}'s complement (radix complement) is calculated by first finding the (${base-1})'s complement and then adding 1 to the result.`;
        }
        
        // Display results
        complementResult.textContent = result;
        complementResult.classList.add('success');
        complementExplanation.textContent = explanation;
        
    } catch (error) {
        showError(complementResult, error.message);
    }
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.className = 'result-content error';
}

// Clear conversion section
function clearConversion() {
    inputValue.value = '';
    conversionResult.textContent = '-';
    originalValue.textContent = '-';
    conversionResult.className = 'result-content';
    originalValue.className = 'result-content';
}

// Clear complement section
function clearComplement() {
    complementInput.value = '';
    complementResult.textContent = '-';
    complementExplanation.textContent = 'Complements are used in digital systems and computer arithmetic for simplifying subtraction operations.';
    complementResult.className = 'result-content';
    complementExplanation.className = 'explanation';
}

// Copy result to clipboard
function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        alert(successMessage);
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    updateComplementLabels();
});

// Conversion events
convertBtn.addEventListener('click', convertNumber);
clearConversionBtn.addEventListener('click', clearConversion);
copyConversionBtn.addEventListener('click', () => {
    if (conversionResult.textContent !== '-' && !conversionResult.classList.contains('error')) {
        copyToClipboard(conversionResult.textContent, 'Conversion result copied to clipboard!');
    }
});

// Complement events
calculateComplementBtn.addEventListener('click', calculateComplement);
clearComplementBtn.addEventListener('click', clearComplement);
copyComplementBtn.addEventListener('click', () => {
    if (complementResult.textContent !== '-' && !complementResult.classList.contains('error')) {
        copyToClipboard(complementResult.textContent, 'Complement result copied to clipboard!');
    }
});

// Update complement labels when base changes
complementBase.addEventListener('change', updateComplementLabels);

// Allow Enter key to trigger actions
inputValue.addEventListener('keypress', e => {
    if (e.key === 'Enter') convertNumber();
});

complementInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') calculateComplement();
});