// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https', // Assuming this is HTTPS since it's a cloud service
        hostname: 'music-streaming-fnhg.onrender.com',
        port: '',  // Leave empty if using standard HTTPS port (443)
        pathname: '/**',  // Allow all paths under this domain
      }
    ],
  },
}