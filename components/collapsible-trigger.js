function CollapsibleTrigger ({ children, open = false }) {
  return (
    <p className={`collapsible__trigger${open === true ? ' collapsible__trigger--open' : ''}`}>
      <i className='collapsible__trigger-icon icarus-terminal-chevron-right' style={{ position: 'relative', top: '-.1rem' }} />
      <span className='collapsible__trigger-text'>{children}</span>
    </p>
  )
}

module.exports = {
  CollapsibleTrigger
}
