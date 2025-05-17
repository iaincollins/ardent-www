const path = require('path')
const fs = require('fs')

// Valid config file locations
const ARDENT_CONFIG_LOCATIONS = [
  '/etc/ardent.config',
  path.join(__dirname, '../ardent.config'),
  path.join(__dirname, './ardent.config')
]

for (const path of ARDENT_CONFIG_LOCATIONS.reverse()) {
  if (fs.existsSync(path)) require('dotenv').config({ path })
}

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
    ARDENT_DOMAIN: process.env.ARDENT_DOMAIN,
    ARDENT_API_BASE_URL: process.env.ARDENT_API_BASE_URL,
    ARDENT_AUTH_BASE_URL: process.env.ARDENT_AUTH_BASE_URL
  }
}
