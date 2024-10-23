import { useEffect, useContext } from 'react'
import Head from 'next/head'
import Layout from 'components/layout'
import About from 'components/about'
import { NavigationContext } from 'lib/context'

export default () => {
  const [navigationPath, setNavigationPath] = useContext(NavigationContext)
  useEffect(() => {
    setNavigationPath([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])
  }, [])
  return (
    <Layout
      title='About Ardent Industry for Elite Dangerous'
      description='Ardent Industry is companion software for the game Elite Dangerous.'
    >
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/about' />
      </Head>
      <div className='fx__fade-in'>
        <div className='heading--with-underline'>
          <h2>
            About this software
          </h2>
        </div>
        <div className='clear'>
          <About />
        </div>
      </div>
    </Layout>
  )
}
