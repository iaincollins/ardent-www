function parseBodiesAndStations(bodies = [], stations = []) {

  // Copy the arrys, so we can modify them without alterting the existing arrays
  const _bodies = JSON.parse(JSON.stringify(bodies)).sort((a, b) => a?.distanceToArrival - b?.distanceToArrival)
  const _stations = JSON.parse(JSON.stringify(stations))

  // The existing station-to-body mapping data is incorrect. 
  // The game does not provide this data explicity for stations, so there is no
  // ideal way to determine what planet a station is oribiting automatically.
  //
  // The data being wring is likely a result of an attempt to automatically map
  // them, but both stations and bodies move through space and depending on when
  // each were last scanned the automated guess has ended up wrong.
  //
  // This routine attempts to guess what body the station is orbiting based on
  // the latest positional data for each station an the bodies. It's far from
  // perfect but it does a decent job most of the time.
  // 
  // Short of FDev expanding the data in their API the only way I can thikn to
  // improve on this would be to calculate the locations of planets and their 
  // distance from the main star at the timestamp when the last telemetry for
  // the station was received - I'm unsure if that is possible in practice.
  const nonPlanetaryStations = [
    'Coriolis',
    'Ocellus',
    'Orbis',
    'AsteroidBase',
    'Outpost',
    'FleetCarrier',
    'MegaShip',
    'StrongholdCarrier'
  ]

  for (const station of _stations) {
    // Only apply this logic to stations and megaship
    if (!nonPlanetaryStations.includes(station?.stationType)) continue

    station.bodyName = null
    station.bodyId = null

    // Find the location of the nearest known body
    const bodyDistances = _bodies.map(body => body.distanceToArrival)
    const closestBodyInDistance = bodyDistances.reduce(function(prev, curr) {
      return (Math.abs(curr - station.distanceToArrival) < Math.abs(prev - station.distanceToArrival) ? curr : prev)
    })

    // Update the station data to match the first body at that distance
    for (const body of _bodies) {
      if (closestBodyInDistance === body.distanceToArrival) {
        station.bodyName = body.bodyName
        station.bodyId = body.id
        continue
      }
    }
  }

  // Find stations with no known locaiton and add them to the first body in
  // the system (should be the primary star)
  const stationsWithNoKnownLocation = []
  _stations.forEach(station => {
    if (!station?.bodyName) {
      return stationsWithNoKnownLocation.push(station)
    } else {
      let validLocationFound = false
      _bodies.forEach(body => {
        if (station?.bodyName === body?.bodyName) validLocationFound = true
        if (station?.bodyId === body?.id) validLocationFound = true
      })
      if (validLocationFound !== true) {
        stationsWithNoKnownLocation.push(station)
      }
    }
  })
  _bodies[0].stations = stationsWithNoKnownLocation

  return _bodies
    .map(body => {
      // Some main stars in EDSM don't have a Body ID, this fixes that by assigning a Body ID of zero
      // This allows children to be correctly assigned
      if (body?.isMainStar === true && !body?.bodyId) body.bodyId = 0

      const nearbyStations = _stations.filter(station => (station?.bodyName === body?.bodyName || station?.bodyId === body?.id))
      body.stations = (body.stations) ? body.stations.concat(nearbyStations) : nearbyStations

      // Get all other bodies directly orbiting this body
      const directChildren = _bodies
        .filter(b => b?.parents?.[0]?.[body?.bodyType] === body?.bodyId)

      // Get all bodies orbiting indirectly
      // e.g. around a Null point, that in turn is orbiting this body (or anothre Null point that does, etc)
      const indirectChildren = _bodies.filter(child => {
        // Don't count orbiting this body directly as being indrect children
        const isOrbitingDirectly = child?.parents?.[0]?.[body?.bodyType] === body?.bodyId
        if (isOrbitingDirectly) return false

        // Only count bodies orbiting N number of Null points THEN this body
        // (and no other types of body) as being an indirect child
        for (const parent of child?.parents ?? []) {
          if (parent?.Null !== undefined) continue
          if (parent[body?.bodyType] === body?.bodyId) return true
          if (parent[body?.bodyType] !== body?.bodyId) return false
        }

        return false
      })

      body.children = directChildren
        .concat(indirectChildren)
        .sort((a, b) => a?.bodyName.localeCompare(b?.bodyName))

      return body
    })
    .filter(body => {
      // Only return items at root level if any of the following are true:
      // 1. They are explicitly listed as being a main star
      // 2. They don't have any parents listed
      // 3. They are only orbiting Null points (and not a Star or Planet)
      if (body?.isMainStar === true || !body?.parents) {
        return true
      } else if (!body?.parents) {
        return true
      } else if (body?.parents?.length === 1 && body?.parents?.[0]?.Null !== undefined) {
        return true
      } else {
        let nonNullParentFound = false
        body?.parents?.forEach(parent => {
          //if (parent?.Null === undefined && !(parent?.Star === 0)) nonNullParentFound = true
          if (parent?.Null === undefined) nonNullParentFound = true
        })
        return (nonNullParentFound === false)
      }
    })
    .sort((a, b) => a?.distanceToArrival - b?.distanceToArrival)
}

module.exports = {
  parseBodiesAndStations
}