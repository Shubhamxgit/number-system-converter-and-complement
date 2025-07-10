const MAX_FRACTION_PRECISION = 12;
const MAX_INPUT_LENGTH = 50;

document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
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
    if (input.split('.').length > 2) return showError(resultElement, 'Invalid format: multiple decimal points');

    try {
      let [intPart = '0', fracPart = ''] = input.split('.');
      if (intPart.length > MAX_INPUT_LENGTH || fracPart.length > MAX_INPUT_LENGTH)
        throw new Error('Input too long');

      const validChars = getValidChars(fromBase);
      if (!validateParts(intPart, fracPart, validChars))
        throw new Error(`Invalid character(s) for base ${fromBase}`);

      const decimalValue = toDecimal(intPart, fracPart, fromBase);
      const result = fromDecimal(decimalValue, toBase);

      resultElement.textContent = result;
      resultElement.classList.add('success');
      originalElement.textContent = `Base ${fromBase}: ${input} → Base ${toBase}: ${result}`;
    } catch (err) {
      showError(resultElement, err.message);
    }
  }

  function calculateComplement() {
    const input = document.getElementById('complement-input').value.trim().toUpperCase();
    const base = parseInt(complementBase.value);
    const type = document.querySelector('input[name="complement-type"]:checked').value;
    const resultElement = document.getElementById('complement-result');

    resultElement.className = '';

    if (!input) return showError(resultElement, 'Please enter a number');
    if (input.split('.').length > 2) return showError(resultElement, 'Invalid format: multiple decimal points');

    try {
      let [intPart = '0', fracPart = ''] = input.split('.');
      if (intPart.length > MAX_INPUT_LENGTH || fracPart.length > MAX_INPUT_LENGTH)
        throw new Error('Input too long');

      const validChars = getValidChars(base);
      if (!validateParts(intPart, fracPart, validChars))
        throw new Error(`Invalid characters for base ${base}`);

      let result;
      if (type === 'r-1') {
        result = r1Complement(intPart, fracPart, base);
      } else {
        result = rComplement(intPart, fracPart, base);
      }

      resultElement.textContent = result;
      resultElement.classList.add('success');
    } catch (err) {
      showError(resultElement, err.message);
    }
  }

  function toDecimal(intPart, fracPart, base) {
    let value = parseInt(intPart, base) || 0;
    for (let i = 0; i < fracPart.length; i++) {
      const digit = parseInt(fracPart[i], base);
      value += digit / Math.pow(base, i + 1);
    }
    return value;
  }

  function fromDecimal(decimal, base) {
    let intPart = Math.floor(decimal);
    let frac = decimal - intPart;
    let intStr = intPart.toString(base).toUpperCase();
    let fracStr = '';

    if (frac > 0) {
      fracStr = '.';
      let precision = MAX_FRACTION_PRECISION;
      while (frac > 0 && precision-- > 0) {
        frac *= base;
        const digit = Math.floor(frac);
        fracStr += digit.toString(base).toUpperCase();
        frac -= digit;
      }
    }

    return intStr + fracStr;
  }

  function r1Complement(intPart, fracPart, base) {
    const complementDigit = d => (base - 1 - parseInt(d, base)).toString(base).toUpperCase();
    const intComp = intPart.split('').map(complementDigit).join('') || '0';
    const fracComp = fracPart ? '.' + fracPart.split('').map(complementDigit).join('') : '';
    return intComp + fracComp;
  }

  function rComplement(intPart, fracPart, base) {
    const baseBig = BigInt(base);
    const fullStr = intPart + fracPart;
    const totalDigits = fullStr.length;

    let value = BigInt(0);
    for (const d of fullStr) {
      value = value * baseBig + BigInt(parseInt(d, base));
    }

    const power = baseBig ** BigInt(totalDigits);
    const complement = power - value;
    let compStr = complement.toString(base).toUpperCase().padStart(totalDigits, '0');

    const intRes = intPart === '0' ? '0' : compStr.slice(0, intPart.length);
    const fracRes = fracPart ? compStr.slice(intPart.length).padEnd(fracPart.length, '0') : '';
    return fracRes ? `${intRes || '0'}.${fracRes}` : intRes;
  }

  function getValidChars(base) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);
    return new RegExp(`^[${chars}]+$`, 'i');
  }

  function validateParts(intPart, fracPart, regex) {
    return regex.test(intPart) && (!fracPart || regex.test(fracPart));
  }

  function showError(element, message) {
    element.textContent = message;
    element.classList.add('error');
  }

  document.getElementById('input-value').addEventListener('keypress', e => {
    if (e.key === 'Enter') convertNumber();
  });

  document.getElementById('complement-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') calculateComplement();
  });
});
