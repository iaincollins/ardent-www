import { useEffect, useContext } from 'react'
import Head from 'next/head'
import Layout from 'components/layout'
import About from 'components/about'
import { NavigationContext } from 'lib/context'

export default () => {
  const [, setNavigationPath] = useContext(NavigationContext)
  useEffect(() => {
    setNavigationPath([{ name: 'ABOUT ARDENT', path: '/about' }])
  }, [])
  return (
    <Layout
      title='About Ardent Insight for Elite Dangerous'
      description='Ardent Insight is companion software for the game Elite Dangerous'
    >
      <Head>
        <link rel='canonical' href='https://ardent-insight.com/about' />
      </Head>
      <div className='fx__fade-in'>
        <div className='clear'>
          <About />
        </div>
      </div>
    </Layout>
  )
}
