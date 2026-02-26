import { toRoman, toBinary, toHex } from '@/utils/numberSystems';
import MayanNumber from './notations/MayanNumber';
import TallyNumber from './notations/TallyNumber';         // <--- Importar
import CistercianNumber from './notations/CistercianNumber'; // <--- Importar

export default function NotationRenderer({ value, notation = 'arabic' }) {
  
  switch (notation) {
    case 'roman':
      return <span className="font-serif text-4xl tracking-widest text-stone-300">{toRoman(value)}</span>;
      
    case 'binary':
      // Estilo Cyberpunk / Matrix
      return (
        <div className="font-mono flex flex-col items-center">
           <span className="text-xs text-green-700">BIN</span>
           <span className="text-xl text-green-400 font-bold tracking-wider drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]">
             {toBinary(value)}
           </span>
        </div>
      );
      
    case 'hex':
      // Estilo Sci-Fi Industrial
      return (
        <div className="font-mono flex flex-col items-center">
           <span className="text-xs text-orange-800">0x</span>
           <span className="text-2xl text-orange-500 font-bold tracking-widest border border-orange-500/30 px-2 rounded bg-orange-900/20">
             {toHex(value).replace('0x', '')}
           </span>
        </div>
      );
      
    case 'maya':
      return <MayanNumber value={value} />;

    case 'tally':
      return <TallyNumber value={value} />;

    case 'cistercian':
      return <CistercianNumber value={value} />;
      
    case 'arabic':
    default:
      return <span className="text-5xl font-black text-white drop-shadow-lg">{value}</span>;
  }
}