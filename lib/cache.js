function loadCache (name) {
  try {
    const cacheObj = window.localStorage.getItem(`_cache:${name}`)
    return cacheObj ? (JSON.parse(cacheObj)).data : undefined
  } catch (e) {
    return undefined
  }
}

function saveCache (name, object) {
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

function deleteCache (name) {
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
