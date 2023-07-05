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
          <title>Ardent Industry – Trade &amp; exploration data</title>
          <meta name='description' content='Ardent Industry provides trade and exploration data for Elite Dangerous. Find the best prices for anything in the galaxy!' />
          <meta name='keywords' content='Ardent Industry, Elite Dangerous, Elite: Dangerous, market, trade, commodities, pricing, prices, systems, exploration' />
          <meta name='author' content='Ardent Industry' />
          <meta name='viewport' content='width=device-width' />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </>
    )
  }
}
