module.exports = ({ stationType }) => {
  if (stationType === 'Orbis Starport') return <> <i className='station-icon icarus-terminal-orbis-starport' /></>
  if (stationType === 'Coriolis Starport') return <> <i className='station-icon icarus-terminal-coriolis-starport' /></>
  if (stationType === 'Ocellus Starport') return <> <i className='station-icon icarus-terminal-ocellus-starport' /></>
  if (stationType === 'Asteroid base') return <> <i className='station-icon icarus-terminal-asteroid-base' /></>
  if (stationType === 'Outpost') return <> <i className='station-icon icarus-terminal-outpost' /></>
  if (stationType === 'Mega ship') return <> <i className='station-icon icarus-terminal-megaship' /></>
  if (stationType === 'Fleet Carrier') return <> <i className='station-icon icarus-terminal-megaship' /></>
  if (stationType === 'Planetary Port') return <> <i className='station-icon icarus-terminal-planetary-port' /></>
  if (stationType === 'Planetary Outpost') return <> <i className='station-icon icarus-terminal-planetary-port' /></>
  if (stationType === 'Odyssey Settlement') return <> <i className='station-icon icarus-terminal-settlement' /></>
}
