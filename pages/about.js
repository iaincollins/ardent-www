import Head from 'next/head'
import Layout from 'components/layout'
import About from 'components/about'

export default () => {
  return (
    <Layout
      title='About Ardent Industry for Elite Dangerous'
      description='Ardent Industry is companion software for the game Elite Dangerous.'
    >
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/about' />
      </Head>
      <div className='fx__fade-in'>
        <h1>
          About this software
        </h1>
        <div className='clear'>
          <About />
        </div>
      </div>
    </Layout>
  )
}
