'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import NotationRenderer from '@/components/NotationRenderer';
import { sfx } from '@/utils/SoundManager';
import { saveScoreToCloud, getTopScores} from '@/utils/firebase'; // Añade esta importación arriba

const GameScene = dynamic(() => import('@/components/GameScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-white animate-pulse">
      Cargando Motor Físico...
    </div>
  ),
});

export default function Home() {
  // Extraemos las nuevas funciones del store
  const { 
    score, highScore, level, options, currentNotation, instruction, submitAnswer, 
    strikes, status, startGame, pauseGame, resumeGame, resetGame 
  } = useGameStore();
  
  const [isMusicOn, setIsMusicOn] = useState(false);
// NUEVOS ESTADOS PARA EL LEADERBOARD
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const handleOpenLeaderboard = async () => {
    setShowLeaderboard(true);
    setIsLoadingLeaderboard(true);
    const topScores = await getTopScores();
    setLeaderboardData(topScores);
    setIsLoadingLeaderboard(false);
  };
  const handleSubmitScore = async () => {
    if (playerName.length < 3 || isSubmitting) return;
    setIsSubmitting(true);
    
    const success = await saveScoreToCloud(playerName, score, level);
    if (success) {
      setScoreSubmitted(true);
    }
    setIsSubmitting(false);
  };
  // NOTA: Eliminamos el useEffect con startNewRound()
  // Ahora el juego inicia cuando el jugador hace clic en "JUGAR"

  const toggleMusic = async () => {
    await sfx.initialize(); 
    const playing = sfx.toggleBGM(); 
    setIsMusicOn(playing);
  };

  const handleStart = async () => {
    await sfx.initialize(); // Desbloqueamos audio con el primer clic
    const playing = sfx.toggleBGM(true);
    setIsMusicOn(playing);
    startGame();
  };

  return (
    <main className="w-full h-screen bg-black relative overflow-hidden font-sans select-none">
      
      {/* === PANTALLA DE INICIO (IDLE) === */}
      {status === 'idle' && !showLeaderboard && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white animate-in fade-in duration-500">
          <h1 className="text-5xl md:text-7xl font-black text-amber-500 mb-4 tracking-wider drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] text-center">
            CHRONOS<br/>COUNTER
          </h1>
          <p className="text-lg text-slate-400 mb-10 text-center max-w-sm">
            Cuenta rápido antes de que la luz se apague. Cuidado con los engaños visuales.
          </p>
          
          {/* NUEVO: Contenedor con dos botones */}
          <div className="flex flex-col gap-4 w-64">
            <button 
              onClick={handleStart}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-12 rounded-full text-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(251,191,36,0.6)] w-full"
            >
              JUGAR
            </button>
            <button 
              onClick={handleOpenLeaderboard}
              className="bg-slate-900 hover:bg-slate-800 text-amber-500 border-2 border-amber-500/50 font-black py-3 px-8 rounded-full text-lg transition-all hover:scale-105 active:scale-95 w-full flex justify-center items-center gap-2"
            >
              🏆 RANKING GLOBAL
            </button>
          </div>
        </div>
      )}
      {/* === PANTALLA DE LEADERBOARD === */}
      {showLeaderboard && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl text-white animate-in zoom-in-95 duration-300">
          <h2 className="text-4xl md:text-5xl font-black text-amber-500 mb-6 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] tracking-widest text-center">
            TOP 10 GLOBAL
          </h2>
          
          <div className="bg-slate-900/80 border border-amber-500/30 w-[90%] max-w-md rounded-2xl p-4 md:p-6 min-h-[300px] flex flex-col shadow-2xl">
            {isLoadingLeaderboard ? (
              <div className="flex-1 flex items-center justify-center text-amber-500/80 font-bold animate-pulse text-xl">
                Conectando a la red...
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-center">
                Aún no hay récords.<br/>¡Sé el primero en hacer historia!
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Encabezados de la tabla */}
                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-widest border-b border-slate-700 pb-2 mb-2 px-2">
                  <span>Jugador</span>
                  <span className="text-right">Pts (Nvl)</span>
                </div>
                
                {/* Lista de Jugadores */}
                {leaderboardData.map((player, index) => (
                  <div key={player.id} className="flex justify-between items-center bg-slate-800/40 p-3 rounded-lg hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`font-black text-lg ${index === 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                        #{index + 1}
                      </span>
                      <span className="font-bold text-xl text-white tracking-widest">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-400 text-xl">{player.score}</span>
                      <span className="text-xs text-slate-400 font-bold bg-slate-950 px-2 py-1 rounded-md">Lvl {player.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowLeaderboard(false)}
            className="mt-8 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-10 rounded-full border border-white/20 transition-all hover:scale-110 active:scale-95"
          >
            CERRAR
          </button>
        </div>
      )}

      {/* === MENÚ DE PAUSA === */}
      {status === 'paused' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white animate-in zoom-in-95 duration-200">
          <h2 className="text-6xl font-black text-white mb-10 drop-shadow-md tracking-widest">PAUSA</h2>
          <div className="flex flex-col gap-4 w-64">
            <button 
              onClick={resumeGame}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105 active:scale-95"
            >
              CONTINUAR
            </button>
            <button 
              onClick={resetGame}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all hover:scale-105 active:scale-95 border border-white/10"
            >
              REINICIAR
            </button>
          </div>
        </div>
      )}

     {/* === PANTALLA DE GAME OVER === */}
      {status === 'gameover' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white animate-in fade-in duration-500">
          <h1 className="text-5xl md:text-7xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,111,0.8)]">
            GAME OVER
          </h1>
          
          <div className="flex flex-col items-center gap-2 mb-6 mt-6 bg-slate-800/50 p-6 rounded-2xl border border-white/10">
            <p className="text-xl text-slate-300">Nivel Alcanzado: <span className="text-white font-bold">{level}</span></p>
            <p className="text-xl text-slate-300">Puntuación Final: <span className="text-amber-400 font-bold text-3xl">{score}</span></p>
          </div>

          {/* NUEVO: Formulario Arcade para el Leaderboard */}
          {score > 0 && !scoreSubmitted ? (
            <div className="flex flex-col items-center mb-8 bg-slate-900/80 p-4 rounded-xl border border-amber-500/30">
              <p className="text-sm text-slate-400 mb-2 uppercase tracking-widest">Registra tu récord mundial</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={3}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                  placeholder="AAA"
                  className="bg-black border-2 border-slate-600 text-amber-400 text-center text-2xl font-black w-20 h-12 rounded-lg focus:outline-none focus:border-amber-400 uppercase transition-colors"
                />
                <button 
                  onClick={handleSubmitScore}
                  disabled={playerName.length < 3 || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-4 rounded-lg transition-colors"
                >
                  {isSubmitting ? '...' : 'ENVIAR'}
                </button>
              </div>
            </div>
          ) : scoreSubmitted ? (
            <p className="text-green-400 font-bold mb-8 animate-pulse">¡Récord subido a la nube! ☁️</p>
          ) : null}

          <button 
            onClick={() => {
              // Limpiamos los estados al reiniciar
              setPlayerName("");
              setScoreSubmitted(false);
              resetGame();
            }}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-10 rounded-full text-xl transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
          >
            VOLVER A INTENTAR
          </button>
        </div>
      )}

      {/* === HUD (UI) === */}
      <div className={`absolute inset-0 z-10 pointer-events-none p-4 md:p-6 flex flex-col justify-between transition-opacity duration-300 ${(status === 'idle' || status === 'paused') ? 'opacity-0' : 'opacity-100'}`}>
        
        <div className="flex justify-between items-start w-full">
            
            <div className="flex flex-col gap-4 pointer-events-auto">
               <div>
                  <div className="text-lg font-bold text-slate-400">Nivel {level}</div>
                  <div className="text-2xl font-bold text-amber-400">Pts: {score}</div>
                  
                  <div className="flex gap-1 mt-1">
                    {[0, 1, 2].map((index) => (
                      <span 
                        key={index} 
                        className={`text-xl transition-all duration-300 ${index < strikes ? 'opacity-30 grayscale' : 'opacity-100 drop-shadow-[0_0_8px_rgba(239,68,111,0.8)]'}`}
                      >
                        ❌
                      </span>
                    ))}
                  </div>
               </div>

               {/* Botones de Control (Música y Pausa) */}
               <div className="flex gap-2">
                 <button 
                   onClick={toggleMusic}
                   className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur px-3 py-2 rounded-full border border-white/10 transition-all active:scale-95 w-fit group"
                 >
                   <span className="text-lg group-hover:scale-110 transition-transform">
                      {isMusicOn ? "🔊" : "🔇"}
                   </span>
                 </button>
                 
                 <button 
                   onClick={pauseGame}
                   disabled={status !== 'playing'}
                   className="flex items-center justify-center w-11 h-11 bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur rounded-full border border-white/10 transition-all active:scale-95"
                 >
                   <span className="text-lg">⏸️</span>
                 </button>
               </div>
            </div>
            
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
              disabled={status !== 'playing'} 
              className={`relative bg-slate-800/40 backdrop-blur-md border border-white/10 
                         w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center
                         transition-all duration-200 shadow-2xl group overflow-hidden
                         ${status !== 'playing' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-amber-400 hover:scale-105 active:scale-95 active:bg-amber-500/20'}`}
            >
               <div className="absolute inset-0 bg-gradient-to-t from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:to-amber-500/10 transition-all duration-300" />
               <div className="relative z-10">
                 <NotationRenderer value={number} notation={currentNotation} />
               </div>
            </button>
          ))}
        </div>
      </div>

      {/* === ESCENA 3D === */}
      {/* Al poner blur dinámico hacemos que el fondo se desenfoque cuando hay menús superpuestos */}
      <div className={`absolute inset-0 z-0 transition-all duration-500 ${(status === 'idle' || status === 'paused') ? 'blur-sm scale-105 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>
        <GameScene />
      </div>
      
    </main>
  );
}