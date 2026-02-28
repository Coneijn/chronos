// src/utils/gameConstants.js

// 1. DEFINICIÓN DE TEMAS (Skins)
export const THEMES = {
  default: {
    id: 'default',
    name: 'Clásico',
    price: 500,
    colors: { red: '#ef476f', blue: '#118ab2', green: '#06d6a0', yellow: '#ffd166', purple: '#9d4edd', orange: '#f78c6b' }
  },
  neon: {
    id: 'neon',
    name: 'Cyber Neón',
    price: 500, // Costo en monedas
    colors: { red: '#ff0055', blue: '#00ffff', green: '#39ff14', yellow: '#ccff00', purple: '#bc13fe', orange: '#ff6600' }
  },
  pastel: {
    id: 'pastel',
    name: 'Sueño Pastel',
    price: 500,
colors: { 
      red: '#ff7eb3',    // Rosa/Sandía vibrante (imposible de confundir con el naranja)
      blue: '#70d6ff',   // Azul cielo nítido (se aleja del verde)
      green: '#5cf09e',  // Menta luminoso (mucho contraste con el azul)
      yellow: '#ffe566', // Amarillo sol saturado (evita que parezca blanco con la luz)
      purple: '#c084fc', // Lila intenso (destaca hermoso contra el suelo oscuro)
      orange: '#ffaa5e'  // Melocotón/Damasco vibrante
    }  },
    dinos: {
    id: 'dinos',
    name: 'Mundo Dino',
    price: 1500, // Más caro porque son modelos 3D
    isModel: true, // <--- Esta bandera es la clave
    colors: { 
      red: '#ef4444', 
      blue: '#3b82f6', 
      green: '#22c55e', 
      yellow: '#eab308', 
      purple: '#a855f7', 
      orange: '#f97316' 
    }
  }
};

export const COLOR_KEYS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
export const SHAPES = ['box', 'sphere', 'cone'];

// 2. NOMBRES SEMÁNTICOS (Para la UI)
// Ahora mapeamos por la "llave" del color, no por el código hexadecimal
export const COLOR_NAMES = {
  'red': 'ROJOS',
  'blue': 'AZULES',
  'green': 'VERDES',
  'yellow': 'AMARILLOS',
  'purple': 'MORADOS',
  'orange': 'NARANJAS'
};

export const SHAPE_NAMES = {
  'box': 'CUBOS',
  'sphere': 'ESFERAS',
  'cone': 'CONOS'
};