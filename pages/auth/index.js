import Layout from 'components/layout'

export default () => {
  return (
    <Layout >
      <div className='fx__fade-in'>
        <p className='clear text-center'>
          <a href='https://api.ardent-industry.com/auth/signin' className='button' style={{ position: 'relative', top: '25vh', fontSize: '2rem' }}>Sign in <i style={{ position: 'relative', top: '-.2rem'}} className='icon icarus-terminal-chevron-right'/></a>
        </p>
      </div>
    </Layout>
  )
}
