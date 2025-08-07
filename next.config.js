/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Flagcdn
      { protocol: 'https', hostname: 'flagcdn.com', pathname: '/**' },

      // Avatares Google
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },

      // TU subdominio de Supabase (ruta amplia, ya cubre /object y /render)
      { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/**' },

      // 🔹 Placeholder
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
