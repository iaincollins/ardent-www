module.exports = ({ stationType, station, children }) => {
  // Default to unknown POI if we don't know the type, and all the data we have
  // is the name and that it's a dockable location of some description.
  let icon = 'poi'

  const _stationType = station?.stationType ?? stationType

  // If we don't know the type for sure, but it's on the surface of a planet, we
  // can use the settlement icon, which is a guess (it could be a port) but
  // is at least more helpful than displaying it as an unknown POI.
  if (!_stationType && station?.bodyName) icon = 'settlement'

  // These are edge cases when we know the name but we don't have an explicit
  // record of the station type as there isn't an entry for the station in the
  // 'Stations' databases, this is usually because for some reason we don't have
  // a record of any docking events at the station.
  if (!_stationType && station?.fleetCarrier === 1) icon = 'fleet-carrier'
  if (!_stationType && station?.stationName === 'Stronghold Carrier') icon = 'megaship'

  if (_stationType === 'Orbis') icon = 'orbis-starport'
  if (_stationType === 'Coriolis') icon = 'coriolis-starport'
  if (_stationType === 'Ocellus') icon = 'ocellus-starport'
  if (_stationType === 'AsteroidBase') icon = 'asteroid-base'
  if (_stationType === 'Outpost') icon = 'outpost'
  if (_stationType === 'MegaShip') icon = 'megaship'
  if (_stationType === 'StrongholdCarrier') icon = 'megaship' // Note: This is not an offical FDev type
  if (_stationType === 'FleetCarrier') icon = 'fleet-carrier'
  if (_stationType === 'CraterPort') icon = 'planetary-port'
  if (_stationType === 'CraterOutpost') icon = 'planetary-port'
  if (_stationType === 'OnFootSettlement') icon = 'settlement'

  // New stations/outposts that are not yet online are coming through as "Surface Stations",
  // even though they are in sapce.
  if (_stationType === 'SurfaceStation') icon = 'poi'

  // No dedicated icons for these two types yet
  if (_stationType === 'PlanetaryConstructionDepot') icon = 'poi-empty'
  if (_stationType === 'SpaceConstructionDepot') icon = 'poi-empty'

  if (children) {
    return (
      <div style={{ position: 'relative', paddingLeft: '2rem' }}>
        <i style={{ position: 'absolute', left: 0, top: '.1rem' }} className={`station-icon icarus-terminal-${icon}`} />
        {children}
      </div>
    )
  } else {
    return <i className={`station-icon icarus-terminal-${icon}`} />
  }
}
