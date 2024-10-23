import { API_BASE_URL } from 'lib/consts'

async function getAccessToken () {
  const res = await fetch(`${API_BASE_URL}/auth/token`, { credentials: 'include' })
  if (res.ok) {
    const json = await res.json()
    if (json?.accessToken) return json
  }
  return null
}

async function getCsrfToken () {
  const res = await fetch(`${API_BASE_URL}/auth/csrftoken`, { credentials: 'include' })
  if (res.ok) {
    const json = await res.json()
    if (json.csrfToken) return json.csrfToken
  }
  return null
}

async function isSignedIn () {
  return !!await getAccessToken()
}

module.exports = {
  getAccessToken,
  getCsrfToken,
  isSignedIn
}
