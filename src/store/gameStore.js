import { create } from 'zustand';
import { COLORS, SHAPES, COLOR_NAMES, SHAPE_NAMES } from '@/utils/gameConstants';
import { sfx } from '@/utils/SoundManager'; // Importamos el motor de audio

export const useGameStore = create((set, get) => ({
  // === ESTADO INICIAL ===
  score: 0,
  level: 1,
  targetNumber: 0,
  options: [],
  currentNotation: 'arabic',
  instruction: "CARGANDO...",
  objectsData: [],
  roundVersion: 0,       // Control de versiones para regenerar físicas
  shakeTrigger: 0,       // Disparador del terremoto

  // === ACCIONES ===

  startNewRound: () => {
    const { level, roundVersion } = get();
    
    // 1. DIFICULTAD LOGARÍTMICA (Anti-Saturación)
    // Nivel 1: ~3 objetos. Nivel 100: Tope de 15 objetos.
    const maxVisualChaos = Math.min(15, Math.floor(3 + Math.log2(level) * 2.5));
    const totalObjects = Math.max(3, maxVisualChaos + (Math.random() > 0.5 ? 1 : -1));

    // 2. REGLAS Y FILTROS (Mecánica de Profundidad)
    let ruleType = 'all'; 
    if (level >= 6) {
        ruleType = Math.random() > 0.5 ? 'color' : 'shape';
    }

    let filterValue = null;
    let instructionText = "CUENTA TODO";

    if (ruleType === 'color') {
        const colorKeys = Object.keys(COLORS);
        const randomColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        filterValue = COLORS[randomColorKey]; 
        instructionText = `SOLO ${COLOR_NAMES[filterValue]}`;
    } else if (ruleType === 'shape') {
        filterValue = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        instructionText = `SOLO ${SHAPE_NAMES[filterValue]}`;
    }

    // 3. TARGET VS DISTRACTORES
    let targetCount, distractorCount;
    if (level < 6) {
        targetCount = totalObjects;
        distractorCount = 0;
    } else {
        // A mayor nivel, más distractores (hasta 60%)
        const distractorRatio = Math.min(0.6, (level - 4) * 0.05); 
        distractorCount = Math.floor(totalObjects * distractorRatio);
        targetCount = Math.max(1, totalObjects - distractorCount);
    }

    // 4. GENERAR OBJETOS
    const newObjects = [];

    // A) Correctos
    for (let i = 0; i < targetCount; i++) {
        newObjects.push({
            color: ruleType === 'color' ? filterValue : getRandomColor(),
            shape: ruleType === 'shape' ? filterValue : getRandomShape(),
        });
    }

    // B) Distractores
    for (let i = 0; i < distractorCount; i++) {
        let badColor = getRandomColor();
        let badShape = getRandomShape();
        if (ruleType === 'color') while (badColor === filterValue) badColor = getRandomColor();
        else if (ruleType === 'shape') while (badShape === filterValue) badShape = getRandomShape();
        newObjects.push({ color: badColor, shape: badShape });
    }

    // C) Barajar
    const shuffledObjects = newObjects.sort(() => Math.random() - 0.5);

    // 5. BOTONES DE RESPUESTA
    const optionSet = new Set([targetCount]);
    while(optionSet.size < 3) {
      const offset = Math.floor(Math.random() * 5) - 2; 
      const candidate = targetCount + offset;
      if (candidate > 0 && candidate !== targetCount) optionSet.add(candidate);
    }
    const shuffledOptions = Array.from(optionSet).sort(() => Math.random() - 0.5);

    // 6. NOTACIÓN (Progresión Visual)
    let notation = 'arabic';
    if (level >= 3 && level < 5) notation = 'tally';
    else if (level >= 5 && level < 7) notation = Math.random() > 0.5 ? 'roman' : 'maya';
    else if (level >= 7 && level < 10) notation = Math.random() > 0.5 ? 'binary' : 'hex';
    else if (level >= 10) {
        const chaos = ['cistercian', 'binary', 'hex', 'maya', 'roman', 'tally'];
        notation = chaos[Math.floor(Math.random() * chaos.length)];
    }

    // 7. ACTUALIZAR ESTADO
    set({ 
      targetNumber: targetCount, 
      options: shuffledOptions,
      currentNotation: notation,
      objectsData: shuffledObjects,
      instruction: instructionText,
      roundVersion: roundVersion + 1 
    });
  },

  submitAnswer: (answer) => {
    const { targetNumber, score, level } = get();
    
    // Inicializar audio por si el usuario no ha tocado el botón de música aún
    sfx.initialize(); 

    if (answer === targetNumber) {
      // CORRECTO
      sfx.playSuccess(); // Sonido Triunfal
      set({ 
        score: score + 100, 
        level: level + 1 
      });
      get().startNewRound(); 
    } else {
      // INCORRECTO
      sfx.playError(); // Sonido Glitch
      console.log("¡Activando Shake!");
      set({ 
        score: Math.max(0, score - 50),
        shakeTrigger: Date.now() // Activa el temblor del suelo
      });
    }
  }
}));

// Helpers
function getRandomColor() {
    const keys = Object.values(COLORS);
    return keys[Math.floor(Math.random() * keys.length)];
}
function getRandomShape() {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}