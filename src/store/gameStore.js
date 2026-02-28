import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 1. NUEVO: Importamos persist
import { COLORS, SHAPES, COLOR_NAMES, SHAPE_NAMES } from '@/utils/gameConstants';
import { sfx } from '@/utils/SoundManager';

// 2. NUEVO: Envolvemos todo en persist()
export const useGameStore = create(
  persist(
    (set, get) => ({
  score: 0,
  highScore: 0,
  level: 1,
  targetNumber: 0,
  options: [],
  currentNotation: 'arabic',
  instruction: "CARGANDO...",
  objectsData: [],
  roundVersion: 0,       
  shakeTrigger: 0,       
  lightIntensity: 1,     
  
  strikes: 0, 
  // NUEVO: El estado inicial ahora es 'idle' (pantalla de inicio)
  // Posibles estados: 'idle', 'playing', 'paused', 'gameover'
  status: 'idle',     

  // === ACCIONES ===

  // NUEVO: Funciones de flujo de juego
  startGame: () => {
    set({ score: 0, level: 1, strikes: 0, status: 'playing' });
    if (sfx.updateTempo) sfx.updateTempo(1);
    get().startNewRound();
  },

  pauseGame: () => {
    if (get().status === 'playing') set({ status: 'paused' });
  },

  resumeGame: () => {
    if (get().status === 'paused') set({ status: 'playing' });
  },

  resetGame: () => {
    get().startGame(); // Reiniciar es esencialmente volver a empezar
  },

  startNewRound: () => {
    const { level, roundVersion } = get();
    
    // 1. DIFICULTAD LOGARÍTMICA
    const maxVisualChaos = Math.min(15, Math.floor(3 + Math.log2(level) * 2.5));
    const totalObjects = Math.max(3, maxVisualChaos + (Math.random() > 0.5 ? 1 : -1));

    // 2. REGLAS Y FILTROS
    let ruleType = 'all'; 
    if (level >= 10) {
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
    if (level < 10) {
        targetCount = totalObjects;
        distractorCount = 0;
    } else {
        const distractorRatio = Math.min(0.6, (level - 4) * 0.05); 
        distractorCount = Math.floor(totalObjects * distractorRatio);
        targetCount = Math.max(1, totalObjects - distractorCount);
    }

    // 4. GENERAR OBJETOS
    const newObjects = [];
    for (let i = 0; i < targetCount; i++) {
        newObjects.push({
            color: ruleType === 'color' ? filterValue : getRandomColor(),
            shape: ruleType === 'shape' ? filterValue : getRandomShape(),
        });
    }
    for (let i = 0; i < distractorCount; i++) {
        let badColor = getRandomColor();
        let badShape = getRandomShape();
        if (ruleType === 'color') while (badColor === filterValue) badColor = getRandomColor();
        else if (ruleType === 'shape') while (badShape === filterValue) badShape = getRandomShape();
        newObjects.push({ color: badColor, shape: badShape });
    }
    const shuffledObjects = newObjects.sort(() => Math.random() - 0.5);

    // 5. BOTONES DE RESPUESTA
    const optionSet = new Set([targetCount]);
    while(optionSet.size < 3) {
      const offset = Math.floor(Math.random() * 5) - 2; 
      const candidate = targetCount + offset;
      if (candidate > 0 && candidate !== targetCount) optionSet.add(candidate);
    }
    const shuffledOptions = Array.from(optionSet).sort(() => Math.random() - 0.5);

    // 6. NOTACIÓN
    let notation = 'arabic';
    if (level >= 5 && level < 10) notation = 'tally';
    else if (level >= 10 && level < 15) notation = Math.random() > 0.5 ? 'roman' : 'maya';
    else if (level >= 15 && level < 20) notation = Math.random() > 0.5 ? 'binary' : 'hex';
    else if (level >= 20) {
        const chaos = ['binary', 'hex', 'maya', 'roman', 'tally', 'arabic', 'cistercian'];
        notation = chaos[Math.floor(Math.random() * chaos.length)];
    }

    // 7. ACTUALIZAR ESTADO
    set({ 
      targetNumber: targetCount, 
      options: shuffledOptions,
      currentNotation: notation,
      objectsData: shuffledObjects,
      instruction: instructionText,
      roundVersion: roundVersion + 1,
      lightIntensity: 1, 
    });
  },

  decreaseLight: (deltaTime, currentLevel) => {
    const { lightIntensity, status } = get();
    
    // NUEVO: Frenar el contador de luz si no estamos activamente jugando (ej: en pausa)
    if (lightIntensity <= 0 || status !== 'playing') return;
    
    const duration = Math.max(3, 20 - (currentLevel - 1));
    const reduction = deltaTime / duration;
    const nextIntensity = Math.max(0, lightIntensity - reduction);

    set({ lightIntensity: nextIntensity });
  },

 submitAnswer: (answer) => {
        const { targetNumber, score, level, strikes, status, highScore } = get();
        
        if (status !== 'playing') return; 

        sfx.initialize();

        if (answer === targetNumber) {
          // CORRECTO
          sfx.playSuccess();
          const nextLevel = level + 1; 
          set({ score: score + 100, level: nextLevel });
          if(sfx.updateTempo) sfx.updateTempo(nextLevel); 
          get().startNewRound(); 
        } else {
          // INCORRECTO
          const newStrikes = strikes + 1;
          const isGameOver = newStrikes >= 3;

          // 4. NUEVO: Evaluamos si hay un nuevo récord al perder
          let newHighScore = highScore;

          if (isGameOver) {
            if (sfx.playGameOver) sfx.playGameOver();
            if (sfx.toggleBGM) sfx.toggleBGM(false); 
            
            // Si el score actual es mayor al histórico, lo actualizamos
            if (score > highScore) {
              newHighScore = score;
            }
          } else {
            sfx.playError(); 
          }
          
          set({ 
            score: Math.max(0, score - 50),
            shakeTrigger: Date.now(), 
            strikes: newStrikes,
            status: isGameOver ? 'gameover' : 'playing',
            highScore: newHighScore // Guardamos el récord (persist lo mandará a localStorage)
          });
        }
      }
    }),
    // 5. NUEVO: Configuración de persistencia (va después de la función del store)
    {
      name: 'chronos-high-score', // Nombre clave en el localStorage
      partialize: (state) => ({ highScore: state.highScore }), // Solo guardamos el highScore, el resto se reinicia al recargar
    }
  )
);

// Helpers
function getRandomColor() {
    const keys = Object.values(COLORS);
    return keys[Math.floor(Math.random() * keys.length)];
}
function getRandomShape() {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}