module.exports = ({ bracket }) => {
  return (
    <span style={{
      display: 'inline-block',
      width: '1.5rem',
      position: 'relative',
      textAlign: 'center'
    }}>
      <TrendingChart bracket={bracket}/>
      <TrendingArrow bracket={bracket}/>
    </span>
  )
}

function TrendingChart({bracket}) {
  const style = {position: 'absolute', top: '.25rem', left: '.1rem', fontSize: '1.1rem', opacity: .3}
  if (bracket === 3) { // High
    return <i style={style} className='trade-bracket-icon icarus-terminal-signal' />
  } else if (bracket === 2) { // Medium
    return <i style={style} className='trade-bracket-icon icarus-terminal-signal-even-bars' />
  } else if (bracket === 1) { // Low
    return <i style={style} className='trade-bracket-icon flip-horizontal icarus-terminal-signal' />
  } else if (bracket === 0) { // None
    return <i style={style} className='trade-bracket-icon flip-horizontal  icarus-terminal-signal' />
  } else { // If 0 or "" then no idea
    return <i style={style} className='trade-bracket-icon icarus-terminal-signal-even-bars' />
  }
}

function TrendingArrow({bracket}) {
  if (bracket === 3) { // High
    return <i className='trade-bracket-icon text-positive icarus-terminal-trending-up' />
  } else if (bracket === 2) { // Medium
    return <i className='trade-bracket-icon icarus-terminal-trending-steady muted' />
  } else if (bracket === 1) { // Low
    return <i className='trade-bracket-icon text-warning icarus-terminal-trending-down' />
  } else if (bracket === 0) { // None
    return <i className='trade-bracket-icon text-negative icarus-terminal-trending-down' />
  } else { // If 0 or "" then no idea
    return ''
  }
}
