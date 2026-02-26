'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import NotationRenderer from '@/components/NotationRenderer';
import { sfx } from '@/utils/SoundManager';

// Importación dinámica para desactivar SSR en la escena 3D
const GameScene = dynamic(() => import('@/components/GameScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-white animate-pulse">
      Cargando Motor Físico...
    </div>
  ),
});

export default function Home() {
  const { score, level, options, currentNotation, instruction, startNewRound, submitAnswer } = useGameStore();
  
  // Estado local para el botón de música
  const [isMusicOn, setIsMusicOn] = useState(false);

  // Iniciar el juego
  useEffect(() => {
    startNewRound();
  }, []);

  // Manejador del botón de música
  const toggleMusic = async () => {
    await sfx.initialize(); // Asegura que Tone.js arranque
    const playing = sfx.toggleBGM(); // Alterna Play/Stop
    setIsMusicOn(playing);
  };

  return (
    <main className="w-full h-screen bg-black relative overflow-hidden font-sans select-none">
      
      {/* === HUD (UI) === */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4 md:p-6 flex flex-col justify-between">
        
        {/* HEADER: Info + Música + Misión */}
        <div className="flex justify-between items-start w-full">
            
            {/* Columna Izquierda: Stats y Control de Audio */}
            <div className="flex flex-col gap-4 pointer-events-auto">
               
               {/* Stats */}
               <div>
                  <div className="text-lg font-bold text-slate-400">Nivel {level}</div>
                  <div className="text-2xl font-bold text-amber-400">Pts: {score}</div>
               </div>

               {/* Botón de Música Retro */}
               <button 
                 onClick={toggleMusic}
                 className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur px-3 py-2 rounded-full border border-white/10 transition-all active:scale-95 w-fit group"
               >
                 <span className="text-lg group-hover:scale-110 transition-transform">
                    {isMusicOn ? "🔊" : "🔇"}
                 </span>
                 <span className="text-xs font-bold uppercase text-slate-300">
                    {isMusicOn ? "BGM ON" : "BGM OFF"}
                 </span>
               </button>
            </div>
            
            {/* Columna Derecha: LA MISIÓN (Instrucción) */}
            <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-xl border-b-4 border-amber-500 shadow-xl animate-in slide-in-from-top-5 duration-500">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] text-center mb-1">
                    Misión Actual
                </p>
                <h2 className="text-xl md:text-2xl font-black text-white text-center min-w-[120px] whitespace-nowrap drop-shadow-sm">
                    {instruction || "CARGANDO..."} 
                </h2>
            </div>
        </div>

        {/* FOOTER: Botones de Respuesta */}
        <div className="flex gap-3 md:gap-6 justify-center pointer-events-auto pb-8 md:pb-12">
          {options.map((number, index) => (
            <button
              key={index}
              onClick={() => submitAnswer(number)}
              className="relative bg-slate-800/40 backdrop-blur-md border border-white/10 
                         w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center
                         hover:bg-white/10 hover:border-amber-400 hover:scale-105 transition-all duration-200
                         active:scale-95 active:bg-amber-500/20 shadow-2xl group overflow-hidden"
            >
               {/* Brillo ambiental en hover */}
               <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:to-amber-500/10 transition-all duration-300" />
               
               {/* Renderizador de Notaciones (Maya, Romano, etc) */}
               <div className="relative z-10">
                 <NotationRenderer value={number} notation={currentNotation} />
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* === ESCENA 3D === */}
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>
      
    </main>
  );
}