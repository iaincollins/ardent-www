import Layout from 'components/layout'

export default () =>
  <Layout>
    <div className='heading--with-underline'>
      <h2 className='heading--with-icon'>
        <i className='icon icarus-terminal-warning' />
        <span className='text-no-transform'>Unknown Error</span>
      </h2>
    </div>
    <p className='clear'>
      An unknown system error has occured.
    </p>
    <p className='clear'>
      An Advanced Tactical Response team has been dispatched to your location to investigate.
    </p>
    <div className='error__text' style={{ left: '3rem' }}>
      <i className='icon icarus-terminal-warning' />
      <span className='text-blink-slow muted'>System Error</span>
    </div>
  </Layout>
