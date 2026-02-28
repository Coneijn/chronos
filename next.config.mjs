/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Esto genera la carpeta /out con archivos HTML/CSS/JS
  images: {
    unoptimized: true, 
  },
};

export default nextConfig; // Usa esto en lugar de module.exports