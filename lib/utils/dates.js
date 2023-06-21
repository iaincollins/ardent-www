// Get ISO timestamp in future or past, by number of days
// e.g. -30 for 30 days ago, or 1 for tomorrow
function getISOTimestamp (numberOfDays) {
  if (numberOfDays > 0) {
    return new Date(new Date().setDate(new Date().getDate() + numberOfDays)).toISOString()
  } else {
    return new Date(new Date().setDate(new Date().getDate() - Math.abs(numberOfDays))).toISOString()
  }
}

function timeBetweenTimestamps (minTimestamp, maxTimestamp = Date.now()) {
  const d1 = new Date(minTimestamp)
  const d2 = new Date(maxTimestamp)
  const diffInSeconds = (d2 - d1) / 1000
  // TODO Fix pluralization
  if (diffInSeconds < 60) {
    if (diffInSeconds === 1) {
      return `${diffInSeconds} second`
    } else {
      return `${diffInSeconds} seconds`
    }
  } else if (diffInSeconds < 60 * 60) {
    if (Math.floor(diffInSeconds / 60) === 1) {
      return `${Math.floor(diffInSeconds / 60)} minute`
    } else {
      return `${Math.floor(diffInSeconds / 60)} minutes`
    }
  } else if (diffInSeconds < 60 * 60 * 24) {
    if (Math.floor(diffInSeconds / 60) === 1) {
      return `${Math.floor(diffInSeconds / (60 * 60))} hour`
    } else {
      return `${Math.floor(diffInSeconds / (60 * 60))} hours`
    }
  } else {
    if (Math.floor(diffInSeconds / (60 * 60 * 24)) === 1) {
      return `${Math.floor(diffInSeconds / (60 * 60 * 24))} day`
    } else {
      return `${Math.floor(diffInSeconds / (60 * 60 * 24))} days`
    }
  }
}

module.exports = {
  getISOTimestamp,
  timeBetweenTimestamps
}
