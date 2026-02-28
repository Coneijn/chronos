/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Esto genera la carpeta /out con archivos HTML/CSS/JS
  images: {
    unoptimized: true, 
  },
};

module.exports = nextConfig;