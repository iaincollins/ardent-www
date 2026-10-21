import { AUTH_BASE_URL } from 'lib/consts'

const CAPI_ENDPOINTS = [
  'profile',
  'market',
  'shipyard',
  'profile',
  'communitygoals',
  'journal',
  'fleetcarrier',
  'visitedstars'
]

const cmdrInfoCache = new Map()
const CACHE_TTL_MS = 10 * 1000

async function getCmdrInfo (info, forceRefresh = false) {
  const cached = cmdrInfoCache.get(info)
  const now = Date.now()

  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.contents
  }

  try {
    const res = await fetch(`${AUTH_BASE_URL}/cmdr/${info}`, { credentials: 'include' })
    if (res.ok) {
      const contents = await res.json()
      cmdrInfoCache.set(info, { contents, timestamp: Date.now() })
      return contents
    }
  } catch (e) {
    console.error(e)
  }
  return null
}

module.exports = {
  getCmdrInfo,
  CAPI_ENDPOINTS
}
