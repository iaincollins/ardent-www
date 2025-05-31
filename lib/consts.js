import getConfig from 'next/config'

// publicRuntimeConfig provides isomorphic access to specified env vars
const { publicRuntimeConfig } = getConfig()

// Note: ARDENT_DOMAIN is not used when ARDENT_API_BASE_URL or
// ARDENT_AUTH_BASE_URL are explicitly set.
const ARDENT_DOMAIN = publicRuntimeConfig?.ARDENT_DOMAIN ?? 'ardent-insight.com'
const API_BASE_URL = publicRuntimeConfig?.ARDENT_API_BASE_URL ?? `https://api.${ARDENT_DOMAIN}`
const AUTH_BASE_URL = publicRuntimeConfig?.ARDENT_AUTH_BASE_URL ?? `https://auth.${ARDENT_DOMAIN}`

const SOL_COORDINATES = [0, 0, 0]
const COLONIA_COORDINATES = [-9530.5, -910.28125, 19808.125]
const GALACTIC_CENTER_COORDINATES = [25.21875, -20.90625, 25899.96875]

// These defaults should ideally match the API defaults for best performance.
// If these are changed in future, the defaults for the API should be changed
// to match, or more explicitly caching strategy implemented, for performance.
const COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT = '30'
const COMMODITY_FILTER_FLEET_CARRIER_DEFAULT = 'excluded'
const COMMODITY_FILTER_MIN_VOLUME_DEFAULT = '1'
const COMMODITY_FILTER_LOCATION_DEFAULT = ''
const COMMODITY_FILTER_DISTANCE_DEFAULT = 'Any distance'
const COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT = '100'
const NO_DEMAND_TEXT = '-'

const SIGN_IN_URL = `${AUTH_BASE_URL}/signin`
const SIGN_OUT_URL = `${AUTH_BASE_URL}/signout`

// These are systems that actually exist in game but that are not "real" systems
// systems you can normally visit; in some cases it makes sense to hide them
const HIDDEN_SYSTEMS = [
  '7780433924818', // Test
  '9154823459538', // Test2
  '9704579273426', // TestRender
  '349203072180', // SingleLightTest
  '353498039476', // BinaryLightTest
  '8055311864530', // Training (Tutorial)
  '7780433924818' // Destination (Tutorial)
]

module.exports = {
  API_BASE_URL,
  AUTH_BASE_URL,
  SIGN_IN_URL,
  SIGN_OUT_URL,
  SOL_COORDINATES,
  COLONIA_COORDINATES,
  GALACTIC_CENTER_COORDINATES,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT,
  COMMODITY_FILTER_LOCATION_DEFAULT,
  COMMODITY_FILTER_DISTANCE_DEFAULT,
  COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT,
  NO_DEMAND_TEXT,
  HIDDEN_SYSTEMS
}
