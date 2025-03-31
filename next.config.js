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
    ARDENT_API_BASE_URL: process.env.ARDENT_API_BASE_URL,
    ARDENT_AUTH_BASE_URL: process.env.ARDENT_AUTH_BASE_URL
  }
}
