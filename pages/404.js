import Layout from 'components/layout'

export default () =>
  <Layout>
    <div className='heading--with-underline'>
      <h2 className='heading--with-icon'>
        <i className='icon icarus-terminal-warning' />
        <span className='text-no-transform'>Error 404</span>
      </h2>
    </div>
    <p className='clear'>
      Unable to find requested information.
    </p>
    <p className='clear'>
      If you require assistance, please contact the Raxxla Helpdesk.
    </p>
    <div className='error__text' style={{ left: '3rem' }}>
      <i className='icon icarus-terminal-warning' />
      <span className='text-blink-slow muted'>File Not Found</span>
    </div>
  </Layout>
