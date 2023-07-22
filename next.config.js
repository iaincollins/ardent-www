module.exports = {
  async redirects() {
    return [
      {
        source: '/commodity',
        destination: '/commodities',
        permanent: true,
      },
      {
        source: '/system',
        destination: '/',
        permanent: false,
      },
    ]
  },
}