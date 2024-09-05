const API_BASE_URL_PROD = 'https://api.ardent-industry.com'
const API_BASE_URL_LOCAL = 'http://localhost:3001/api'

const API_BASE_URL = process?.env?.NODE_ENV === 'development'
  ? API_BASE_URL_LOCAL
  : API_BASE_URL_PROD

const SOL_COORDINATES = [0, 0, 0]
const COLONIA_COORDINATES = [-9530.5, -910.28125, 19808.125]

module.exports = {
  API_BASE_URL,
  SOL_COORDINATES,
  COLONIA_COORDINATES
}
