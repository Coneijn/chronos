import { getMayaComponents } from '@/utils/numberSystems';

export default function MayanNumber({ value }) {
  const { bars, dots } = getMayaComponents(value);

  return (
    <div className="flex flex-col items-center gap-1 justify-center p-2">
      
      {/* 1. Capa de PUNTOS (Arriba) */}
      <div className="flex gap-2">
        {Array.from({ length: dots }).map((_, i) => (
          <div 
            key={`dot-${i}`} 
            className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]"
          />
        ))}
      </div>

      {/* 2. Capa de BARRAS (Abajo) */}
      <div className="flex flex-col gap-1">
        {Array.from({ length: bars }).map((_, i) => (
          <div 
            key={`bar-${i}`} 
            className="w-16 h-3 rounded-full bg-amber-600 shadow-sm border border-amber-800" 
          />
        ))}
      </div>
      
    </div>
  );
}