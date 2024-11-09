// next.config.js
module.exports = {
  images: {
    domains: [
      'localhost',
      'pg-3b202c4-danpham566-ca69.j.aivencloud.com'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
}