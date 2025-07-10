# Advanced Number System Calculator

A comprehensive calculator for number system conversions and complement calculations with full support for fractional numbers in all bases.

## Features

- **Number System Conversion**:
  - Convert between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16)
  - Supports both integer and fractional numbers
  - Real-time input validation

- **Complement Calculations**:
  - (r-1)'s complement (diminished radix complement)
  - r's complement (radix complement)
  - Full support for fractional numbers
  - Dynamic terminology based on selected base

## Supported Operations

### Conversion Examples:
- Binary to Decimal: `1010.11` → `10.75`
- Decimal to Hex: `25.639` → `19.A3D70A3D70`
- Octal to Binary: `755.4` → `111101101.1`

### Complement Examples:
1. **Fractional Numbers**:
   - 10's complement of `0.3267` → `0.6733`
     ```
     10^4 × 0.0001 - 0.3267 = 1.0000 - 0.3267 = 0.6733
     ```
   - 2's complement of `0.1011` → `0.0101`
     ```
     2^4 × 0.0001 - 0.1011 = 1.0000 - 0.1011 = 0.0101
     ```

2. **Integer Numbers**:
   - 10's complement of `3267` → `6733`
     ```
     (9's complement: 9999-3267=6732) + 1 = 6733
     ```
   - 2's complement of `1101` → `0011`
     ```
     (1's complement: 0010) + 1 = 0011
     ```

## How to Use

1. **Conversion**:
   - Enter a number in any base
   - Select source and target bases
   - Click "Convert" or press Enter

2. **Complement Calculation**:
   - Enter a number (integer or fractional)
   - Select base
   - Choose complement type
   - Click "Calculate Complement" or press Enter

## Technical Details

### Fractional Complement Algorithm:
For a fractional number `0.d₁d₂...dₙ` in base `r`:

Where `n` = number of fractional digits

### Integer Complement Algorithm:
For an integer `N` with `m` digits:


## Files

- `index.html` - Main interface
- `styles.css` - All styling
- `script.js` - Complete calculation logic
