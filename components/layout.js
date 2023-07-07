import Header from './header'

export default ({ children }) =>
  <>
    <div className='layout__frame'>
      <div className='fx__background' />
      <Header />
      <div className='layout__content scrollable'>
        {children}
      </div>
    </div>
    <div className='fx__scanlines' />
    <div className='fx__overlay' />
  </>
