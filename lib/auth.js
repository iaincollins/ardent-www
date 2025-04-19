import { AUTH_BASE_URL } from 'lib/consts'

async function getAccessToken() {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/token`, { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      if (json?.accessToken) return json
    }
  } catch (e) {
    console.error(e)
  }
  return null
}

async function getCsrfToken() {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/csrftoken`, { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      if (json.csrfToken) return json.csrfToken
    }
  } catch (e) {
    console.error(e)
  }
  return null
}

module.exports = {
  getAccessToken,
  getCsrfToken
}
