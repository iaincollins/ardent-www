module.exports = ({ stationType, station }) => {
  let icon = 'poi' // Default is to redner as unknown signal if no explit data

  let _stationType = station?.stationType ?? stationType
  if (!_stationType && station?.bodyName) icon = 'settlement' // If we don't know the type for sure, but it's on the surface, use settlement icon
  if (!_stationType && station?.fleetCarrier === 1) icon = 'fleet-carrier' // If the station appears to be a fleet carrier but only the commpodity (and not the station) is logged, then use the fleet carrier icon

  if (_stationType === 'Orbis') icon = 'orbis-starport'
  if (_stationType === 'Coriolis') icon = 'coriolis-starport'
  if (_stationType === 'Ocellus') icon = 'orbis-starport'
  if (_stationType === 'AsteroidBase') icon = 'asteroid-base'
  if (_stationType === 'Outpost') icon = 'outpost'
  if (_stationType === 'Megaship') icon = 'megaship'
  if (_stationType === 'StrongholdCarrier') icon = 'megaship' // Note: This is not an offical FDev type
  if (_stationType === 'FleetCarrier') icon = 'fleet-carrier'
  if (_stationType === 'CraterPort') icon = 'planetary-port'
  if (_stationType === 'CraterOutpost') icon = 'planetary-port'
  if (_stationType === 'SurfaceStation') icon = 'planetary-port'
  if (_stationType === 'OnFootSettlement') icon = 'settlement'

  // No dedicated icons for these two types yet
  if (_stationType === 'PlanetaryConstructionDepot') icon = 'settlement'
  if (_stationType === 'SpaceConstructionDepot') icon = 'megaship'

  return <i className={`station-icon icarus-terminal-${icon}`} />
}
