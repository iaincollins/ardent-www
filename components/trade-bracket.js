module.exports = ({ bracket }) => {
  if (bracket === 3) {
    return <> <i className='trade-bracket-icon text-positive icarus-terminal-signal' /></>
  } else if (bracket === 1) {
    return <> <i className='trade-bracket-icon text-negative flip-vertical icarus-terminal-signal' /></>
  } else if (bracket === 0) {
    return <> <i className='trade-bracket-icon text-negative flip-vertical muted icarus-terminal-signal' /></>
  } else {
    return <> <i className='trade-bracket-icon icarus-terminal-signal' /></>
  }
}
