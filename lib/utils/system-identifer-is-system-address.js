module.exports = (systemIdentifer) => {
  if (/^[0-9]+$/.test(systemIdentifer)) {
    return true 
  } else {
    return false
  }
}