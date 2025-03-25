module.exports = {
  async rewrites () {
    return [
      {
        source: '/',
        destination: '/commodities'
      }
    ]
  },
  async redirects () {
    return [
      {
        source: '/commodity',
        destination: '/commodities',
        permanent: true
      },
      {
        source: '/system',
        destination: '/',
        permanent: false
      },
      {
        source: '/trade-data',
        destination: '/commodity/advancedcatalysers',
        permanent: false
      }
    ]
  },
  publicRuntimeConfig: {
    API_BASE_URL: process.env.API_BASE_URL
  }
}
