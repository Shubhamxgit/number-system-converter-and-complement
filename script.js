document.addEventListener('DOMContentLoaded', function () {
  const MAX_FRACTION_PRECISION = 12;
  const MAX_INPUT_LENGTH = 50;

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(`${this.dataset.tab}-tab`).classList.add('active');
    });
  });

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
  document.getElementById('calculate-complement-btn').addEventListener('click', calculateComplement);

  function convertNumber() {
    const input = document.getElementById('input-value').value.trim().toUpperCase();
    const fromBase = parseInt(document.getElementById('from-base').value);
    const toBase = parseInt(document.getElementById('to-base').value);
    const resultElement = document.getElementById('conversion-result');
    const originalElement = document.getElementById('original-value');
    resultElement.className = '';
    originalElement.className = '';

    if (!input) return showError(resultElement, 'Please enter a number');
    if (input.includes('-')) return showError(resultElement, 'Negative numbers are not supported');
    if (input.split('.').length > 2) return showError(resultElement, 'Invalid number format – multiple decimal points');

    try {
      let [integerPart = '0', fractionalPart = ''] = input.split('.');
      if (integerPart.length > MAX_INPUT_LENGTH || fractionalPart.length > MAX_INPUT_LENGTH)
        throw new Error(`Number too long (max ${MAX_INPUT_LENGTH} digits per part)`);

      const validChars = getValidChars(fromBase);
      if (!validateNumberParts(integerPart, fractionalPart, validChars)) {
        const maxChar = String.fromCharCode(65 + fromBase - 11);
        throw new Error(`Invalid characters for base ${fromBase}. Allowed: 0-${Math.min(9, fromBase - 1)}${fromBase > 10 ? ', A-' + maxChar : ''}`);
      }

      const decimalValue = convertToDecimal(integerPart, fractionalPart, fromBase);
      const result = convertFromDecimal(decimalValue, toBase, fractionalPart.length);

      resultElement.textContent = result;
      resultElement.classList.add('success');
      originalElement.textContent = `Base ${fromBase}: ${input} → Base ${toBase}: ${result}`;
    } catch (error) {
      showError(resultElement, error.message);
    }
  }

  function calculateComplement() {
    const input = document.getElementById('complement-input').value.trim().toUpperCase();
    const base = parseInt(complementBase.value);
    const type = document.querySelector('input[name="complement-type"]:checked').value;
    const resultElement = document.getElementById('complement-result');
    const explanationElement = document.getElementById('complement-explanation');
    resultElement.className = '';
    explanationElement.className = '';

    if (!input) return showError(resultElement, 'Please enter a number');
    if (input.includes('-')) return showError(resultElement, 'Negative numbers are not supported');
    if (input.split('.').length > 2) return showError(resultElement, 'Invalid number format – multiple decimal points');

    try {
      let [integerPart = '0', fractionalPart = ''] = input.split('.');
      if (integerPart.length > MAX_INPUT_LENGTH || fractionalPart.length > MAX_INPUT_LENGTH)
        throw new Error(`Number too long (max ${MAX_INPUT_LENGTH} digits per part)`);

      const validChars = getValidChars(base);
      if (!validateNumberParts(integerPart, fractionalPart, validChars)) {
        const maxChar = String.fromCharCode(65 + base - 11);
        throw new Error(`Invalid characters for base ${base}. Allowed: 0-${Math.min(9, base - 1)}${base > 10 ? ', A-' + maxChar : ''}`);
      }

      const [result, explanation] = type === 'r-1'
        ? calculateR1Complement(integerPart, fractionalPart, base)
        : calculateRComplement(integerPart, fractionalPart, base);

      resultElement.textContent = result;
      resultElement.classList.add('success');
      explanationElement.textContent = explanation;
    } catch (error) {
      showError(resultElement, error.message);
    }
  }

  // Utility functions

  function getValidChars(base) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);
    return new RegExp(`^[${chars}]+$`, 'i');
  }

  function validateNumberParts(intPart, fracPart, validRegex) {
    return validRegex.test(intPart) && (!fracPart || validRegex.test(fracPart));
  }

  function convertToDecimal(intPart, fracPart, base) {
    let value = parseInt(intPart, base) || 0;
    for (let i = 0; i < fracPart.length; i++) {
      const digit = parseInt(fracPart[i], base);
      if (isNaN(digit)) throw new Error(`Invalid digit "${fracPart[i]}" for base ${base}`);
      value += digit / Math.pow(base, i + 1);
    }
    return value;
  }

  function convertFromDecimal(decimalValue, base, originalFracLength = 0) {
    const intValue = Math.floor(decimalValue);
    const intResult = intValue.toString(base).toUpperCase();
    let fracValue = decimalValue - intValue;
    let fracResult = '';
    let precision = MAX_FRACTION_PRECISION;

    if (fracValue > 0 || originalFracLength > 0) {
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

  function calculateR1Complement(intPart, fracPart, base) {
    const complement = d => (base - 1 - parseInt(d, base)).toString(base).toUpperCase();
    const intRes = intPart.split('').map(complement).join('');
    const fracRes = fracPart ? fracPart.split('').map(complement).join('') : '';
    return [
      (intRes || '0') + (fracRes ? '.' + fracRes : ''),
      `(${base - 1})'s complement: Subtract each digit from ${base - 1}`
    ];
  }

  function calculateRComplement(intPart, fracPart, base) {
    const isZero = /^0*$/.test(intPart) && /^0*$/.test(fracPart);
    if (isZero) return ['0', `${base}'s complement of 0 is 0`];

    const digits = (intPart + fracPart).replace(/^0+/, '') || '0';
    const baseBig = BigInt(base);
    let value = BigInt(0);
    for (const ch of digits) {
      const digit = parseInt(ch, base);
      value = value * baseBig + BigInt(digit);
    }

    const totalDigits = intPart.length + fracPart.length;
    const power = baseBig ** BigInt(totalDigits);
    let complement = power - value;
    let compStr = complement.toString(base).toUpperCase().padStart(totalDigits, '0');

    const intRes = compStr.substring(0, intPart.length) || '0';
    const fracRes = fracPart.length ? compStr.substring(intPart.length).padEnd(fracPart.length, '0') : '';
    return [
      fracRes ? `${intRes}.${fracRes}` : intRes,
      `${base}'s complement: ${base}^${totalDigits} - original number = result`
    ];
  }

  function showError(element, msg) {
    element.textContent = msg;
    element.classList.add('error');
  }

  // Enter key support
  document.getElementById('input-value').addEventListener('keypress', e => {
    if (e.key === 'Enter') convertNumber();
  });
  document.getElementById('complement-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') calculateComplement();
  });
});
