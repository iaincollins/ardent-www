import Loader from './loader'
import Head from 'next/head'

export default ({
  title = 'Ardent Industry – Trade & Exploration',
  loading = false,
  loadingText,
  children
}) =>
  <>
    <Head>
      <title>{title}</title>
      <meta name='description' content='Ardent Industry provides trade and exploration data for the game Elite Dangerous' />
      <meta name='keywords' content='Ardent Industry, Elite Dangerous, Elite: Dangerous, market, trade, commodities, pricing, prices, systems, exploration, API, SQL' />
      <meta name='author' content='Iain Collins' />
      <meta name='viewport' content='width=device-width' />
    </Head>
    <Loader visible={loading} text={loadingText} />
    {children}
  </>
