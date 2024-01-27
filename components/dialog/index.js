export default ({ title, children, toggle }) => {
  return (
    <>
      <div className='dialog__background' onClick={() => toggle(false)} />
      <div className='dialog'>
        <h3 className='dialog__title'>{title}</h3>
        <div className='dialog__content scrollable'>
          {children}
        </div>
        <div className='dialog__buttons'>
          <button className='button' onClick={() => toggle(false)}>Close</button>
        </div>
      </div>
    </>
  )
}
