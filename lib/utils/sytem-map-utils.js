function parseBodiesAndStations (bodies = [], stations = [], system) {
  // Copy the arrys, so we can modify them without alterting the existing arrays
  const _bodies = JSON.parse(JSON.stringify(bodies)).sort((a, b) => a?.distanceToArrival - b?.distanceToArrival)
  const _stations = JSON.parse(JSON.stringify(stations))

  // This fix handles rare cases where system body name data where the case of the body name does not
  // match the case of the system name. This is mostly rare cases, like 'c Velorum' / 'C Velorum' and
  // seems to happen specifically when there are instances of 2 systems with the same name. This
  // fix ensures the name of the bodies matches the name of the system.
  if (system?.systemName) {
    for (const body of _bodies) {
      body.bodyName = body.bodyName.replace(new RegExp(`^${system.systemName}`, 'i'), system.systemName)
    }
  }

  // The existing station-to-body mapping data is incorrect.
  // The game does not provide this data explicity for stations, so there is no
  // ideal way to determine what planet a station is oribiting automatically.
  //
  // The data being wring is likely a result of an attempt to automatically map
  // them, but both stations and bodies move through space and depending on when
  // each were last scanned the automated guess has ended up wrong.
  //
  // This routine attempts to guess what body the station is orbiting based on
  // the latest positional data for the station and nearby bodies. It's far from
  // perfect but it does a decent job most of the time.
  //
  // Short of FDev expanding the data in their API the only way I can think to
  // improve on this would be to calculate the locations of planets and their
  // distance from the main star at the timestamp when the last telemetry for
  // the station was received, but I'm unsure if that is possible in practice.
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

  const planetaryStations = [
    'CraterPort',
    'CraterOutpost',
    'OnFootSettlement',
    'SurfaceStation'
  ]

  for (const station of _stations) {
    // For stations and megaships always attempt to ovveride the current
    // location (at least until I can get around to updating them in the db)
    if (nonPlanetaryStations.includes(station?.stationType)) {
      station.bodyName = null
      station.bodyId = null
    }

    // If it has a bodyName or bodyId already, then use that, because that
    // SHOULD be correct, for ground stations, we only appliy this logic when
    // we don't have an exact location
    if (station?.bodyName || station?.bodyId) continue

    let bodyDistances = _bodies.map(body => body.distanceToArrival)

    // For surface stations, we know they are only on landable planets, so we
    // can filter the possible body distances
    if (planetaryStations.includes(station?.stationType)) {
      bodyDistances = _bodies
        .filter(body => body.isLandable)
        .map(body => body.distanceToArrival)
    }

    // Find the location of the nearest known body
    const closestBodyInDistance = bodyDistances.reduce(function (prev, curr) {
      return (Math.abs(curr - station.distanceToArrival) < Math.abs(prev - station.distanceToArrival) ? curr : prev)
    })

    // Update the station data to match the first body at that distance
    for (const body of _bodies) {
      if (closestBodyInDistance === body.distanceToArrival) {
        // If it's a plentary station, then ignore the body if it's not landable
        // and just happens to be the same distance away
        if (planetaryStations.includes(station?.stationType) && !body.isLandable) continue

        station.bodyName = body.bodyName
        station.bodyId = body.id
        break
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
  if (_bodies?.[0]?.stations)
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
        .sort((a, b) => a?.distanceToArrival - b?.distanceToArrival)

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
