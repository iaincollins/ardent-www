module.exports = ({ stationType }) => {
  let icon = 'poi'
  if (stationType === 'Orbis Starport') icon = 'orbis-starport'
  if (stationType === 'Coriolis Starport') icon = 'coriolis-starport'
  if (stationType === 'Ocellus Starport') icon = 'orbis-starport'
  if (stationType === 'Asteroid Base') icon = 'asteroid-base'
  if (stationType === 'Outpost') icon = 'outpost'
  if (stationType === 'Megaship') icon = 'megaship'
  if (stationType === 'Stronghold Carrier') icon = 'megaship'
  if (stationType === 'Fleet Carrier') icon = 'fleet-carrier'
  if (stationType === 'Planetary Port') icon = 'planetary-port'
  if (stationType === 'Planetary Outpost') icon = 'planetary-port'
  if (stationType === 'Odyssey Settlement') icon = 'settlement'
  return <i className={`station-icon icarus-terminal-${icon}`} />
}
