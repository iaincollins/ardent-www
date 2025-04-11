async function loadCache (name) {
  try {
    const cacheObj = JSON.parse(window.localStorage.getItem(`_cache:${name}`))
    return cacheObj.data
  } catch (e) {
    return null
  }
  return null
}

async function saveCache (name, object) {
  try {
    window.localStorage.setItem(`_cache:${name}`, JSON.stringify(
      {
        data: object,
        timestamp: Date.now()
      }))
    return true
  } catch (e) { }
  return false
}

async function deleteCache (name) {
  try {
    JSON.parse(window.localStorage.removeItem(`_cache:${name}`))
  } catch (e) { }
  return true
}

module.exports = {
  loadCache,
  saveCache,
  deleteCache
}
