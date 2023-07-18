import App from 'next/app'
import '../css/index.css'
import '../public/fonts/icarus-terminal/icarus-terminal.css'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
    return <Component {...pageProps} />
  }
}
