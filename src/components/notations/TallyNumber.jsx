export default function TallyNumber({ value }) {
  const groups = Math.floor(value / 5);
  const remainder = value % 5;

  // Lógica de ajuste automático:
  // Si el número es mayor a 10 (3 grupos o más), eliminamos el espacio casi por completo.
  // Si es pequeño, dejamos un espacio cómodo.
  const spacing = value > 10 ? 'gap-0.5' : 'gap-2';

  return (
    // Agregamos 'w-full' y 'px-1' para asegurar que use todo el ancho disponible del botón
    <div className={`flex ${spacing} items-center justify-center w-full h-full px-1`}>
      
      {/* 1. Grupos completos (5) */}
      {Array.from({ length: groups }).map((_, i) => (
        <svg 
          key={`group-${i}`} 
          viewBox="0 0 40 40" 
          // CLAVE: 
          // - 'h-auto': Mantiene la proporción.
          // - 'w-full': Intenta llenar espacio pero...
          // - 'max-w-[40px]': ...no crece más de lo necesario.
          // - 'shrink': Permite que se encoja si falta espacio.
          className="stroke-white stroke-[3px] fill-none w-full max-w-[35px] shrink"
        >
          <path d="M5,5 L5,35" strokeLinecap="round" />
          <path d="M12,5 L12,35" strokeLinecap="round" />
          <path d="M19,5 L19,35" strokeLinecap="round" />
          <path d="M26,5 L26,35" strokeLinecap="round" />
          <path d="M2,35 L30,5" strokeWidth="4" stroke="red" strokeLinecap="round" opacity="0.8" />
        </svg>
      ))}

      {/* 2. Resto (líneas sueltas) */}
      {remainder > 0 && (
        <svg 
          viewBox="0 0 40 40" 
          className="stroke-white stroke-[3px] fill-none w-full max-w-[35px] shrink"
        >
          {Array.from({ length: remainder }).map((_, i) => (
            <path 
              key={`line-${i}`} 
              d={`M${5 + (i * 7)},5 L${5 + (i * 7)},35`} 
              strokeLinecap="round" 
            />
          ))}
        </svg>
      )}
    </div>
  );
}