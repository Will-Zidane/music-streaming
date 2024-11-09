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
        protocol: 'http', // Assuming this is HTTPS since it's a cloud service
        hostname: 'pg-3b202c4-danpham566-ca69.j.aivencloud.com',
        port: '',  // Leave empty if using standard HTTPS port (443)
        pathname: '/**',  // Allow all paths under this domain
      }
    ],
  },
}