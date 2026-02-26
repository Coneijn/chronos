// src/utils/numberSystems.js

// 1. ROMANOS (Clásico)
export const toRoman = (num) => {
  const map = { X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let result = '';
  Object.keys(map).forEach((key) => {
    while (num >= map[key]) {
      result += key;
      num -= map[key];
    }
  });
  return result;
};

// 2. BINARIO (Hacker)
export const toBinary = (num) => num.toString(2).padStart(4, '0'); // Rellena con ceros: 0101

// 3. HEXADECIMAL (Ingeniero)
export const toHex = (num) => '0x' + num.toString(16).toUpperCase();

// 4. MAYA (Lógica de desglose)
// Devuelve cuántas barras (5) y cuántos puntos (1) necesitamos
export const getMayaComponents = (num) => {
  const bars = Math.floor(num / 5);
  const dots = num % 5;
  return { bars, dots };
};