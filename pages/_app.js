import App from 'next/app'
import Head from 'next/head'
import Layout from '../components/layout'
import '../css/index.css'
import '../public/fonts/icarus-terminal/icarus-terminal.css'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return (
      <>
        <Head>
          <meta name='viewport' content='width=device-width' />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </>
    )
  }
}
