export default function CistercianNumber({ value }) {
  // Separamos unidades y decenas (asumiendo que el juego no pasa de 99 por ahora)
  const units = value % 10;
  const tens = Math.floor(value / 10);

  // Definición de caminos (paths) para el cuadrante superior derecho (unidades)
  // Basado en el sistema real cisterciense
  const getPath = (num) => {
    switch (num) {
      case 1: return "M0,0 L20,0"; // Línea superior
      case 2: return "M0,20 L20,20"; // Línea inferior
      case 3: return "M0,0 L20,20"; // Diagonal bajando
      case 4: return "M0,20 L20,0"; // Diagonal subiendo
      case 5: return "M0,0 L20,0 M0,20 L20,0"; // 1 + 4
      case 6: return "M20,0 L20,20"; // Línea vertical derecha
      case 7: return "M0,0 L20,0 M20,0 L20,20"; // 1 + 6
      case 8: return "M0,20 L20,20 M20,0 L20,20"; // 2 + 6
      case 9: return "M0,0 L20,0 M0,20 L20,20 M20,0 L20,20"; // 1 + 2 + 6
      default: return "";
    }
  };

  return (
    <div className="flex items-center justify-center p-2">
      <svg width="60" height="80" viewBox="-30 0 60 100" className="stroke-amber-200 stroke-[4px] fill-none">
        
        {/* EL TRONCO CENTRAL (Siempre visible) */}
        <path d="M0,0 L0,100" />

        {/* UNIDADES (Cuadrante Superior Derecho) */}
        {/* Renderizamos tal cual */}
        <g transform="translate(0, 0)">
            <path d={getPath(units)} />
        </g>

        {/* DECENAS (Cuadrante Superior Izquierdo) */}
        {/* Espejamos horizontalmente (scale X -1) las unidades */}
        {tens > 0 && (
          <g transform="scale(-1, 1)">
            <path d={getPath(tens)} />
          </g>
        )}
        
        {/* Si quisieras centenas, sería transform="scale(1, -1) translate(0, -100)" */}
      </svg>
    </div>
  );
}