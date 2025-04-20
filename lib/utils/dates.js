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
      return '1 second'
    } else {
      return `${Math.floor(diffInSeconds)} sec`
    }
  } else if (diffInSeconds < 60 * 60) {
    if (Math.floor(diffInSeconds / 60) === 1) {
      return `${Math.floor(diffInSeconds / 60)} min`
    } else {
      return `${Math.floor(diffInSeconds / 60)} min`
    }
  } else if (diffInSeconds < 60 * 60 * 24) {
    if (Math.floor(diffInSeconds / (60 * 60)) === 1) {
      return `${Math.floor(diffInSeconds / (60 * 60))} hour`
    } else {
      return `${Math.floor(diffInSeconds / (60 * 60))} hours`
    }
  } else {
    if (Math.floor(diffInSeconds / (60 * 60 * 24)) === 1) {
      return `${Math.floor(diffInSeconds / (60 * 60 * 24))} day`
    } else {
      return `${Math.floor(diffInSeconds / (60 * 60 * 24)).toLocaleString()} days`
    }
  }
}

function eliteDateTime (timestamp = Date.now()) {
  const date = new Date(timestamp)
  date.setFullYear(date.getFullYear() + 1286) // We are living in the future
  const dateTimeString = date.toUTCString()
    .replace(/(.*), /, '') // Strip day of week
    .replace(/:[0-9]{2}$/, '') // Strip seconds
    .replace(/^0/, '') // Strip leading zeros from day of month

  const dateTimeObject = {
    dateTime: dateTimeString,
    date: dateTimeString.split(/^(.*)? (\d\d:\d\d)/)[1],
    time: dateTimeString.split(/^(.*)? (\d\d:\d\d)/)[2],
    day: date.getDate(),
    month: date.toLocaleString('en-us', { month: 'short' }),
    year: date.getFullYear()
  }

  return dateTimeObject
}

module.exports = {
  eliteDateTime,
  getISOTimestamp,
  timeBetweenTimestamps
}
