import Header from './header'
import Loader from './loader'
import Head from 'next/head'

export default ({
  title = 'Ardent Industry – Trade & exploration data',
  loading = false,
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
    <div className='layout__frame'>
      <div className='fx__background' />
      <Loader visible={loading} />
      <Header />
      <div className='layout__content scrollable'>
        {children}
      </div>
    </div>
    <div className='fx__scanlines' />
    <div className='fx__overlay' />
  </>
