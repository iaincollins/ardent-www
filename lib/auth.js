import { AUTH_BASE_URL } from 'lib/consts'

async function getAccessToken () {
  const res = await fetch(`${AUTH_BASE_URL}/token`, { credentials: 'include' })
  if (res.ok) {
    const json = await res.json()
    if (json?.accessToken) return json
  }
  return null
}

async function getCsrfToken () {
  const res = await fetch(`${AUTH_BASE_URL}/csrftoken`, { credentials: 'include' })
  if (res.ok) {
    const json = await res.json()
    if (json.csrfToken) return json.csrfToken
  }
  return null
}

module.exports = {
  getAccessToken,
  getCsrfToken
}
