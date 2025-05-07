import { useEffect, useContext, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from 'components/layout'
import Cmdr from 'components/cmdr'
import { NavigationContext } from 'lib/context'
import { API_BASE_URL } from 'lib/consts'
import Markdown from 'react-markdown'
// import commodityCategories from 'lib/commodities/commodity-categories.json'
import Package from 'package.json'

export default () => {
  const [, setNavigationPath] = useContext(NavigationContext)
  const [galnetNews, setGalnetNews] = useState()
  const [stats, setStats] = useState()
  const [version, setVersion] = useState()

  useEffect(() => {
    setNavigationPath([{ name: 'Welcome CMDR', path: '/' }])

    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/news/galnet`)
        const news = await res.json()
        setGalnetNews(news)
      } catch (e) {
        console.error(e)
      }
    })()

    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/stats`)
        const stats = await res.json()
        setStats(stats)
      } catch (e) {
        console.error(e)
      }
    })()
    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/version`)
        const version = await res.json()
        setVersion(version)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  return (
    <Layout
      title='Ardent Insight - Elite Dangerous'
      description='Ardent Insight is companion software for the game Elite Dangerous'
    >
      <Head>
        <link rel='canonical' href='https://ardent-insight.com/about' />
      </Head>
      <div className='home fx__fade-in scrollable'>

        <div className='home__news-feed'>
          <div className='heading--with-underline'>
            <h2 className='text-uppercase'>Galnet News</h2>
          </div>
          {galnetNews && galnetNews.slice(0, 1).map((newsItem, i) => (
            <div key={newsItem.url}>
              <div className='home__news-article-body'>
                <img src={newsItem.image} width='100%' alt='News article headline' className='home__news-headline-image' />
                <div className='home__news-article-text scrollable'>
                  <h3 className='home__news-article-headline'>{newsItem.title}</h3>
                  <p className='muted text-uppercase'><a target='_blank' href={`https://www.elitedangerous.com/news/galnet/${newsItem.slug}`} rel='noreferrer'>Galnet {newsItem.date} </a></p>
                  <Markdown>{`${newsItem.text.replaceAll('\n', '\n\n')}`}</Markdown>
                  <div className='heading--with-underline'>
                    <h3>Recent Galnet headlines</h3>
                  </div>
                  <ul style={{ margin: '1rem 0' }}>
                    {galnetNews.slice(1, 5).map((nextNewsItem, j) => (
                      <li key={nextNewsItem.url} className='text-uppercase' style={{ marginTop: '.5rem' }}><Link href='/news' rel='noreferrer'>{nextNewsItem.title}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='home__cmdr'>
          <div className='heading--with-underline is-hidden-desktop'>
            <h2 className='text-uppercase'>CMDR</h2>
          </div>
          <Cmdr />
        </div>

        <div className='home__about'>
          <div className='heading--with-underline is-hidden-desktop' style={{ marginBottom: '1rem' }}>
            <h2 className='text-uppercase'>About</h2>
          </div>
          <p style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>
            <small>
              <i className='icarus-terminal-info' style={{ position: 'relative', top: '-.1rem' }} />
              <Link href='/about'>Ardent OS {Package.version} | API {version?.version ?? '?.?.?'}</Link>
            </small>
          </p>
          <p className='counter'>
            <span className='counter__number'>{stats ? stats.systems.toLocaleString() : '…'}</span> Star Systems
          </p>
          <p className='counter'>
            <span className='counter__number'>{stats ? stats.stations.stations.toLocaleString() : '…'}</span> Stations/Ports
          </p>
          <p className='counter'>
            <span className='counter__number'>{stats ? stats.stations.carriers.toLocaleString() : '…'}</span> Fleet Carriers
          </p>
          <p className='counter'>
            <span className='counter__number'>{stats ? stats.trade.tradeOrders.toLocaleString() : '…'}</span> Buy/Sell Orders
          </p>
          <p className='counter'>
            <span className='counter__number'>{stats ? (stats.trade.stations + stats.trade.carriers).toLocaleString() : '…'}</span> Markets
          </p>
          <p className='counter'>
            <span className='counter__number'>{stats ? stats.pointsOfInterest.toLocaleString() : '…'}</span> Points of Interest
          </p>
          <p className='text-uppercase muted' style={{ textAlign: 'center' }}>
            {stats ? stats.updatedInLast24Hours.toLocaleString() : '…'} updates
            <br />in the last 24 hours
          </p>
          <Link className='button' style={{ textAlign: 'center', display: 'block', padding: '.75rem .25rem', fontSize: '1.25rem', margin: '.5rem' }} href='/commodity/advancedcatalysers'>
            <i className='icon icarus-terminal-cargo' style={{ marginRight: '.5rem', fontSize: '1.5rem !important' }} />
            Commodities
            <i className='icon icarus-terminal-chevron-right' style={{ marginLeft: '.5rem', fontSize: '1.25rem !important' }} />
          </Link>

          {/* <div className='heading--with-underline' style={{ marginTop: '1rem' }}>
            <h2 className='heading--with-icon text-uppercase' style={{ fontSize: '1rem' }}>
              <i className='icon icarus-terminal-cargo' />
              Commodities
            </h2>
          </div>
          <ul className='home__commodity_categories'>
            {Object.entries(commodityCategories).map(([c, data]) => c).filter(category => category.toLowerCase() !== 'nonmarketable').map(category =>
              <li key={category}><Link href={`/commodities/${category.toLowerCase()}`}>{category}</Link></li>
            )}
          </ul> */}

          <div className='heading--with-underline' style={{ marginTop: '1.5rem' }}>
            <h3 className='text-uppercase'>Ardent Insight</h3>
          </div>
          <p>
            Ardent Insight is the leading provider of open trade data in the galaxy.
          </p>
          <p>
            Latest commodity prices and buy/sell orders are provided by data from the <Link target='_blank' href='https://eddn.edcd.io/' rel='noreferrer'>EDDN</Link> relay.
          </p>
          <div className='heading--with-underline'>
            <h3>Ardent HQ</h3>
          </div>
          <p style={{ margin: 0, padding: '.5rem .25rem' }}>
            <Link href='/system/Puppis%20Sector%20GB-X%20b1-5' className='text-uppercase' style={{ border: 0 }}>
              <i className='icon icarus-terminal-outpost' />Icarus Terminal
              <br />
              <i className='icon icarus-terminal-star' />Puppis Sector GB-X b1-5
              <br />
            </Link>
          </p>
          <br />
          <div className='heading--with-underline'>
            <h3>Ardent Carrier</h3>
          </div>
          <p style={{ margin: 0, padding: '.5rem .25rem' }}>
            <span className='text-uppercase'>
              <i className='icon icarus-terminal-fleet-carrier' />Ardent Pioneer V9G-G7Z
            </span>
          </p>
        </div>
      </div>
    </Layout>
  )
}
