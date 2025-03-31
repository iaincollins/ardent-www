import { useEffect, useContext, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from 'components/layout'
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
    setNavigationPath([{ name: 'Home', path: '/' }, { name: 'News', path: '/' }])
    ; (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/news/galnet`)
      const news = res.ok ? await res.json() : []
      setGalnetNews(news)
    })()

    ; (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/stats`)
      const stats = await res.json()
      setStats(stats)
    })()
    ; (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/version`)
      const version = await res.json()
      setVersion(version)
    })()
  }, [])

  return (
    <Layout
      title='Ardent Industry - Elite Dangerous'
      description='Ardent Industry provides trade and exploration data for the game Elite Dangerous.'
    >
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/about' />
      </Head>
      <div className='fx__fade-in'>
        <div className='home__news-about'>
          <p style={{ textAlign: 'center', margin: '.5rem 0 0 0' }}>
            <small>
              Ardent OS {Package.version} | <a href={API_BASE_URL} rel='noreferrer' target='_blank'>API {version?.version ?? '?.?.?'}</a>
            </small>
          </p>
          <div className='heading--with-underline'>
            <h2 className='heading--with-icon text-uppercase'>
              <i className='icon icarus-terminal-economy' />
              Data
            </h2>
          </div>

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
          <Link className='button' style={{ textAlign: 'center', display: 'block', padding: '.5rem', fontSize: '1.25rem', margin: '0 1rem' }} href='/commodity/advancedcatalysers'>
            <i className='icon icarus-terminal-cargo' style={{ marginRight: '.5rem', fontSize: '1.25rem !important' }} />
            Trade Data
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
          <div className='heading--with-underline' style={{ marginTop: '1rem' }}>
            <h2 className='heading--with-icon text-uppercase'>
              <i className='icon icarus-terminal-logo' />
              About
            </h2>
          </div>
          <p style={{ marginTop: 0 }}>
            Ardent Industry is the leading provider of open trade data and market insights in the galaxy.
          </p>
          <p>
            Real time commodity data sourced from the <Link target='_blank' href='https://eddn.edcd.io/' rel='noreferrer'>EDDN</Link> relay.
          </p>
          <h3 style={{ fontSize: '1rem', lineHeight: '1.2rem' }}>Ardent HQ</h3>
          <p style={{ backgroundColor: 'var(--color-text-inverted)', margin: 0, padding: '.5rem .25rem' }}>
            <Link href='/system/Puppis%20Sector%20GB-X%20b1-5' className='text-uppercase' style={{ border: 0 }}>
              <i className='icon icarus-terminal-outpost' />Icarus Terminal
              <br />
              <i className='icon icarus-terminal-star' />Puppis Sector GB-X b1-5
            </Link>
          </p>
          <h3 style={{ marginTop: '1rem', fontSize: '1rem', lineHeight: '1.2rem' }}>Ardent Carrier</h3>
          <p style={{ backgroundColor: 'var(--color-text-inverted)', margin: 0, padding: '.5rem .25rem' }}>
            <span className='text-uppercase'>
              <i className='icon icarus-terminal-fleet-carrier' />Ardent Pioneer (V9G-G7Z)
            </span>
          </p>
          <p className='muted' style={{ fontSize: '.8rem' }}>
            Ardent Industry is a subsidiary of ICARUS Communications Corporation (ICC), creators of <Link target='_blank' href='https://github.com/iaincollins/icarus' rel='noreferrer'>ICARUS Terminal</Link>.
          </p>
        </div>
        <div className='home__news-feed-heading'>
          <h2 className='heading--with-icon text-uppercase'>
            <i className='icon icarus-terminal-location-filled' />
            Galnet News
          </h2>
        </div>
        <div className='home__news-feed'>
          {galnetNews && galnetNews.slice(0, 1).map((newsItem, i) => (
            <div key={newsItem.url}>
              <div className='home__news-article-body'>
                <img src={newsItem.image} width='100%' alt='News article headline' className='home__news-headline-image' />
                <div className='home__news-article-text scrollable'>
                  <h3 className='home__news-article-headline'>{newsItem.title}</h3>
                  <p className='muted text-uppercase'><a target='_blank' href={`https://www.elitedangerous.com/news/galnet/${newsItem.slug}`} rel='noreferrer'>Galnet News, {newsItem.date} </a></p>
                  <Markdown>{`${newsItem.text.replaceAll('\n', '\n\n')}`}</Markdown>
                  <h3 style={{ fontSize: '1.2rem' }}>More from Galnet</h3>
                  <ul>
                    {galnetNews.slice(1, 5).map((nextNewsItem, j) => (
                      <li key={nextNewsItem.url} className='text-uppercase' style={{ marginTop: '.5rem' }}><a target='_blank' href={`https://www.elitedangerous.com/news/galnet/${nextNewsItem.slug}`} rel='noreferrer'>{nextNewsItem.title}</a> <small>{nextNewsItem.date}</small></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
