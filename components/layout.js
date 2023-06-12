import Header from './header'

export default ({ children }) =>
  <>
    <Header />
    {children}
    <div className='fx-scanlines' />
  </>
