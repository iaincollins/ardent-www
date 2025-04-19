import { AUTH_BASE_URL } from 'lib/consts'

async function getCmdrInfo (info) {
  try {
  const res = await fetch(`${AUTH_BASE_URL}/cmdr/${info}`, { credentials: 'include' })
  if (res.ok) return await res.json()
  } catch (e) {
    console.error(e)
  }
  return null
}

module.exports = {
  getCmdrInfo
}
