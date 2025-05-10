function parseBodiesAndStations (bodies = [], stations = [], system) {
  // Copy the arrys, so we can modify them without alterting the existing arrays
  const _stations = JSON.parse(JSON.stringify(stations)) ?? []
  const _allBodies = JSON.parse(JSON.stringify(bodies))?.sort((a, b) => a?.distanceToArrival - b?.distanceToArrival) ?? []
  const _bodies = []

  for (const body of _allBodies) {
    // This fix handles rare cases where system body name data where the case of the body name does not
    // match the case of the system name. This is mostly rare cases, like 'c Velorum' / 'C Velorum' and
    // seems to happen specifically when there are instances of 2 systems with the same name. This
    // fix ensures the name of the bodies matches the name of the system.

    if (system?.systemName) {
      body.bodyName = body.bodyName.replace(new RegExp(`^${system.systemName}`, 'i'), system.systemName)
    }

    // This is a bit of a hack to try and and render systems even when bodies are missing a Body ID
    // due to incomplete data from ESDM. The ssytems will not render correctly, but they will at least
    // partially render instead of triggering an error.
    if (!body.bodyId && body.bodyId !== 0) {
      body.bodyId = body.id
    }

    // If there two bodies returned with the same EDSM ID (e.g. the main star in the 'Handh' system)
    // then only use the first one so we don't render the body twice. If we don't have an ID64 then
    // we don't have a clear way to disambiguate, so use it as it and hope it's okay.
    if (body.id64 && _bodies.filter(b => b.id64 == body?.id64) < 1 || !body?.id64) {
      _bodies.push(body)
    }
  }

  // The existing space-station-to-body info in the database is incorrect.
  //
  // The game does not provide this data explicity for stations, so there is no
  // ideal way to determine what planet a station is oribiting automatically.
  //
  // The data being wrong is likely a result of an attempt to automatically map
  // them at some point but both stations and bodies move through space and
  // depending on when each were last scanned the automated guess has ended up
  // wrong.
  //
  // This routine attempts to guess what body the station is orbiting based on
  // the latest positional data for the station and nearby bodies. It's far from
  // perfect but it does a decent job most of the time.
  //
  // Short of FDev expanding the data in their API the only way I can think to
  // improve on this would be to calculate the locations of planets and their
  // distance from the main star at the timestamp when the last telemetry for
  // the station was received, but I'm unsure if that is possible in practice as
  // I don't think there is enough data exposed by the game to be able to
  // calcuate the in-system positions of orbiting bodies at an arbitrary time.
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

  // Plentary stations *mostly* have a Body Name + ID, but not always. If they
  // do it should always be treated as correct though, we only need to guess
  // it when the data for one is incomplete.
  const planetaryStations = [
    'CraterPort',
    'CraterOutpost',
    'OnFootSettlement',
    'SurfaceStation'
  ]

  // Error handling to avoid edges case errors due to incomplete data
  // If we only have one body, set all stations to orbit it.
  if (_bodies.length === 1) {
    // If there is only one body and it doesn't have a Body ID for some reason,
    // give it Body ID 0 as a placeholder so we can point stations at it
    if (!_bodies[0].bodyId) _bodies[0].bodyId = 0
    for (const station of _stations) {
      station.bodyName = _bodies[0].bodyName
      station.bodyId = _bodies[0].bodyId
    }

  // Ensure we have at least two bodies before we try to find which is closest
  } else if (_bodies.length > 1) {
    for (const station of _stations) {
      // For stations and megaships always attempt to ovveride the current
      // location (at least until I can get around to updating them in the db)
      if (nonPlanetaryStations.includes(station?.stationType)) {
        station.bodyName = null
        station.bodyId = null
      }

      // If it's a ground station with a bodyName or bodyId already, then then
      // we don't need to override it as it should be correct, so we don't need
      // to contintue.
      if (station?.bodyName || station?.bodyId) continue

      // For surface stations, we know they are only on landable planets, so we
      // try to use them as the only valid bodies.
      const bodyDistances = planetaryStations.includes(station?.stationType)
        ? _bodies.filter(body => body.isLandable).map(body => body.distanceToArrival)
        : _bodies.map(body => body.distanceToArrival)

      // Error handling required to avoid edges case due to incomplete data.
      if (bodyDistances.length > 1) {
        // Find the location of the nearest known body
        const closestBodyInDistance = bodyDistances.reduce(function (prev, curr) {
          return (Math.abs(curr - station?.distanceToArrival ?? 0) < Math.abs(prev - station?.distanceToArrival ?? 0) ? curr : prev)
        })

        let matchFound = false
        // Update the station data to match the first body at that distance
        for (const body of _bodies) {
          if (closestBodyInDistance === body.distanceToArrival) {
            // If it's a plentary station, then ignore the body if it's not landable
            // and just happens to be the same distance away
            if (planetaryStations.includes(station?.stationType) && !body.isLandable) continue

            station.bodyName = body.bodyName
            station.bodyId = body.bodyId
            break
          }
        }
      }

      // For landable stations, if we _still_ haven't managed to work out what
      // body it's really on yet, then just try mapping it to any body we
      // know of. Being wrong but still rendering the station is more useful
      // than not rendering it at all.
      //
      // While this can happen if we have data for a settlement or port but
      // not the body it is on, the most likely use case for this is actually
      // a player based Station or Outpost in space that has recently been
      // constructed and eroniously has the type 'SurfaceStation' and that
      // is actually orbiting a star or a non-landable planet.
      if (planetaryStations.includes(station?.stationType) &&
            (!station?.bodyName || !station?.bodyId)) {
        // For this fallback, match on closest body, regardless of type.
        const closestBodyInDistance = _bodies.map(body => body.distanceToArrival).reduce(function (prev, curr) {
          return (Math.abs(curr - station?.distanceToArrival ?? 0) < Math.abs(prev - station?.distanceToArrival ?? 0) ? curr : prev)
        })
        for (const body of _bodies) {
          if (closestBodyInDistance === body.distanceToArrival) {
            station.bodyName = body.bodyName
            station.bodyId = body.bodyId
            break
          }
        }
      }
    }
  }

  // Find stations with no known locaiton and add them to the first body in
  // the system (should be the primary star)
  const stationsWithNoKnownLocation = []
  _stations.forEach(station => {
    if (station?.bodyName === null && stationIcon.bodyId === null) {
      return stationsWithNoKnownLocation.push(station)
    } else {
      let validLocationFound = false
      _bodies.forEach(body => {
        if (station?.bodyName === body?.bodyName) validLocationFound = true
        if (station?.bodyId === body?.bodyId) validLocationFound = true
      })
      if (validLocationFound !== true) {
        stationsWithNoKnownLocation.push(station)
      }
    }
  })
  if (_bodies?.[0]?.stations) { _bodies[0].stations = stationsWithNoKnownLocation }


  return _bodies
    .map(body => {
      // Some main stars in EDSM don't have a Body ID, this fixes that by assigning a Body ID of zero
      // This allows children to be correctly assigned.
      if (body?.isMainStar === true && (!body?.bodyId || body?.bodyId === body.id)) body.bodyId = 0

      const nearbyStations = _stations.filter(station => (station?.bodyName === body?.bodyName || station?.bodyId === body?.bodyId))
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
