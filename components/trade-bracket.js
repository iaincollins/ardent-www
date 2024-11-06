module.exports = ({ bracket }) => {
  if (bracket === 3) { // High
    return <> <i className='trade-bracket-icon text-positive icarus-terminal-trending-up' /></>
  } else if (bracket === 2) { // Medium
    return <> <i className='trade-bracket-icon icarus-terminal-trending-steady muted' /></>
  } else if (bracket === 1) { // Low
    return <> <i className='trade-bracket-icon text-warning icarus-terminal-trending-down' /></>
  } else if (bracket === 0) { // None
    return <> <i className='trade-bracket-icon text-negative icarus-terminal-trending-down' /></>
  } else { // If 0 or "" then no idea
    return ''
  }
}
