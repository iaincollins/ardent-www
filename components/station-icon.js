module.exports = ({ stationType }) => {
  let icon = 'poi' // Default is to redner as unknown signal if no explit data
  if (stationType === 'Orbis') icon = 'orbis-starport'
  if (stationType === 'Coriolis') icon = 'coriolis-starport'
  if (stationType === 'Ocellus') icon = 'orbis-starport'
  if (stationType === 'AsteroidBase') icon = 'asteroid-base'
  if (stationType === 'Outpost') icon = 'outpost'
  if (stationType === 'Megaship') icon = 'megaship'
  if (stationType === 'StrongholdCarrier') icon = 'megaship' // Note: This is not an offical FDev type
  if (stationType === 'FleetCarrier') icon = 'fleet-carrier'
  if (stationType === 'CraterPort') icon = 'planetary-port'
  if (stationType === 'CraterOutpost') icon = 'planetary-port'
  if (stationType === 'SurfaceStation') icon = 'planetary-port'
  if (stationType === 'OnFootSettlement') icon = 'settlement'
  // No icons for these two yet!
  if (stationType === 'PlanetaryConstructionDepot') icon = 'megaship'
  if (stationType === 'SpaceConstructionDepot') icon = 'megaship'
  return <i className={`station-icon icarus-terminal-${icon}`} />
}
