import * as Tone from 'tone';

class SoundManager {
  constructor() {
    this.isInitialized = false;
    this.isPlayingBGM = false;
    
    // Sintetizadores (se crean vacíos y se configuran al iniciar)
    this.impactSynth = null;
    this.successSynth = null;
    this.errorSynth = null;
    
    // BGM (Música de Fondo)
    this.melodySynth = null;
    this.bassSynth = null;
    this.melodySequence = null;
    this.bassSequence = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    await Tone.start(); // Desbloquear audio del navegador
    
    // Configurar el tempo (Rápido, estilo Tetris "A-Type")
    Tone.Transport.bpm.value = 135; 

    this.setupInstruments();
    this.setupBGM(); // <--- Componemos la música aquí
    
    this.isInitialized = true;
    console.log("Audio Engine & Music Ready");
  }

  setupInstruments() {
    // --- EFECTOS DE SONIDO (SFX) ---
    
    // 1. Impacto (Igual que antes)
    this.impactSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 1 },
    }).toDestination();
    this.impactSynth.volume.value = -12; 

    // 2. Éxito (Igual que antes)
    this.successSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 1 },
    }).toDestination();
    this.successSynth.volume.value = -10;

    // 3. Error (Igual que antes)
    this.errorSynth = new Tone.FMSynth({
      modulationIndex: 10,
      envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 },
      modulation: { type: "square" },
      oscillator: { type: "sawtooth" }
    }).toDestination();
    this.errorSynth.volume.value = -5;

    // --- INSTRUMENTOS PARA MÚSICA (BGM) ---

    // 4. Lead (Melodía): Onda Cuadrada (El sonido clásico de NES/Mario)
    this.melodySynth = new Tone.Synth({
      oscillator: { type: "square" }, 
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 } // Staccato
    }).toDestination();
    this.melodySynth.volume.value = -18; // Mezcla bajita para no molestar

    // 5. Bass (Bajo): Onda Triangular (Suave y rítmica)
    this.bassSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.2 }
    }).toDestination();
    this.bassSynth.volume.value = -12;
  }

  setupBGM() {
    // === COMPOSICIÓN "CHRONOS THEME" ===
    // Estilo: A Minor (La Menor), ritmo rápido.
    
    // MELODÍA (Lead)
    // Usamos notas y 'null' para silencios.
    // Patrón repetitivo pegajoso.
    const melodyNotes = [
      // Compás 1: La - Do - Mi (Arpegio menor)
      "A4", null, "C5", null, "E5", null, "A4", "C5",
      // Compás 2: Bajada rápida
      "D5", "C5", "B4", "A4", "G4", null, "E4", null,
      // Compás 3: Tensión (Mi mayor)
      "G#4", null, "B4", null, "E5", null, "D5", "B4",
      // Compás 4: Resolución
      "C5", "B4", "A4", "G#4", "A4", null, null, null 
    ];

    // BAJO (Bass) - Estilo "Oom-Pah" (Tónica - Quinta)
    const bassNotes = [
      // Am
      "A2", "E3", "A2", "E3", "A2", "E3", "A2", "E3",
      // G
      "G2", "D3", "G2", "D3", "G2", "D3", "G2", "D3",
      // E (Dominante)
      "E2", "B2", "E2", "B2", "E2", "B2", "E2", "B2",
      // Am (Vuelta a casa)
      "A2", "E3", "A2", "E3", "A2", null, "A1", null
    ];

    // Crear las secuencias
    // "8n" significa corcheas (ocho notas por compás)
    this.melodySequence = new Tone.Sequence((time, note) => {
      if (note) this.melodySynth.triggerAttackRelease(note, "16n", time);
    }, melodyNotes, "8n");

    this.bassSequence = new Tone.Sequence((time, note) => {
      if (note) this.bassSynth.triggerAttackRelease(note, "8n", time);
    }, bassNotes, "8n");
  }

  // --- CONTROLES DE MÚSICA ---

  toggleBGM(forceState = null) {
    if (!this.isInitialized) return;

    // Si pasamos true/false forzamos el estado, si no, lo alternamos
    const shouldPlay = forceState !== null ? forceState : !this.isPlayingBGM;

    if (shouldPlay) {
      Tone.Transport.start(); // Arrancar el reloj maestro
      this.melodySequence.start(0);
      this.bassSequence.start(0);
      this.isPlayingBGM = true;
    } else {
      Tone.Transport.stop(); // Parar el reloj
      this.melodySequence.stop();
      this.bassSequence.stop();
      this.isPlayingBGM = false;
    }
    
    return this.isPlayingBGM;
  }

  // --- ACCIONES SFX (Igual que antes) ---
  playSpawn() {
    if (!this.impactSynth) return;
    this.impactSynth.triggerAttackRelease("C5", "32n");
  }

  playImpact(velocity) {
    if (!this.impactSynth) return;
    const note = velocity > 5 ? "C2" : "G1"; 
    const time = Tone.now() + Math.random() * 0.05;
    this.impactSynth.triggerAttackRelease(note, "16n", time, Math.min(1, velocity / 10));
  }

  playSuccess() {
    if (!this.successSynth) return;
    this.successSynth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "8n");
  }

  playError() {
    if (!this.errorSynth) return;
    this.errorSynth.triggerAttackRelease("A1", "8n");
  }
}

export const sfx = new SoundManager();