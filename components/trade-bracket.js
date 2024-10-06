module.exports = ({ bracket }) => {
  if (bracket === 3) { // High
    return <> <i className='trade-bracket-icon text-positive icarus-terminal-signal'/></>
  } else if (bracket === 2) { // Medium
    return <> <i className='trade-bracket-icon icarus-terminal-signal' /></>
  } else if (bracket === 1) { // Low
    return <> <i className='trade-bracket-icon text-negative flip-vertical icarus-terminal-signal' /></>
  } else { // If 0 or "" then no idea
    return ''
  }
}
