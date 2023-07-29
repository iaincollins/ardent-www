import App from 'next/app'
import Head from 'next/head'
import 'css/index.css'
import 'public/fonts/icarus-terminal/icarus-terminal.css'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return (
      <>
        <Head>
          <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
          <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
          <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
          <link rel='manifest' href='/manifest.json' />
          <meta property='og:image' content='https://ardent-industry.com/og-image.png' />
        </Head>
        <Component {...pageProps} />
      </>
    )
  }
}
