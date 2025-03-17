import { useEffect, useContext, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from 'components/layout'
import { NavigationContext } from 'lib/context'
import { API_BASE_URL } from 'lib/consts'
import Markdown from 'react-markdown'
import commodityCategories from 'lib/commodities/commodity-categories.json'
import Package from 'package.json'

export default (props) => {
  const router = useRouter()
  const [navigationPath, setNavigationPath] = useContext(NavigationContext)
  const [galnetNews, setGalnetNews] = useState()
  const [stats, setStats] = useState()
  const [version, setVersion] = useState()

  useEffect(() => {
    setNavigationPath([{ name: 'Home', path: '/' }, { name: 'News', path: '/' }])
      ; (async () => {
        const res = await fetch(`${API_BASE_URL}/v1/news/galnet`)
        let news = res.ok ? await res.json() : []
        setGalnetNews(news.slice(0, 3))
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
        <div className='news__about'>
          <p style={{ textAlign: 'center' }}>
            <small>
              Ardent OS {Package.version} | <a href={API_BASE_URL} rel='noreferrer' target='_blank'>API {version?.version ?? '?.?.?'}</a>
            </small>
          </p>
          <div className='heading--with-underline'>
            <h2 className='heading--with-icon text-uppercase' style={{ fontSize: '1rem' }}>
              <i className='icon icarus-terminal-economy' />
              Trade Data
            </h2>
          </div>
          {stats &&
            <>
              <ul>
                <li>
                  {stats.systems.toLocaleString()} Star Systems
                </li>
                <li>
                  {stats.stations.stations.toLocaleString()}<span className='muted'></span> Stations/Ports
                </li>
                <li>
                  {stats.stations.carriers.toLocaleString()} Fleet Carriers
                </li>
                <li>
                  {stats.trade.tradeOrders.toLocaleString()} Buy/Sell Orders
                </li>
                <li>
                  {(stats.trade.stations + stats.trade.carriers).toLocaleString()} Markets
                </li>
                <li>
                  {stats.pointsOfInterest.toLocaleString()} Points of Interest
                </li>
              </ul>
              <p className='text-uppercase muted' style={{ textAlign: 'center' }}>
                {stats.updatedInLast24Hours.toLocaleString()} updates
                <br />in the last 24 hours
              </p>
            </>}
          <Link className='button' style={{ textAlign: 'center', display: 'block', padding: '.5rem', fontSize: '1.25rem', margin: '0 1rem' }} href='/trade-data'>
            <i className='icon icarus-terminal-cargo' style={{ marginRight: '.5rem', fontSize: '1.25rem !important' }} />
            Trade Data
            <i className='icon icarus-terminal-chevron-right' style={{ marginLeft: '.5rem', fontSize: '1.25rem !important' }} />
          </Link>
          <div className='heading--with-underline' style={{ marginTop: '1rem' }}>
            <h2 className='heading--with-icon text-uppercase' style={{ fontSize: '1rem' }}>
              <i className='icon icarus-terminal-cargo' />
              Commodities
            </h2>
          </div>
          <ul>
            {Object.entries(commodityCategories).map(([c, data]) => c).filter(category => category.toLowerCase() !== 'nonmarketable').map(category =>
              <li key={category}><Link href={`/commodities/${category.toLowerCase()}`}>{category}</Link></li>
            )}
          </ul>
          <div className='heading--with-underline' style={{ marginTop: '1rem' }}>
            <h2 className='heading--with-icon text-uppercase' style={{ fontSize: '1rem' }}>
              <i className='icon icarus-terminal-logo' />
              About
            </h2>
          </div>
          <p style={{ marginTop: 0 }}>
            Ardent Industry is the leading provider of open trade data and market insights in the galaxy.
          </p>
          <p>
            Real time commodity data sourced from <Link target='_blank' href='https://eddn.edcd.io/'>EDDN</Link> relay.
          </p>
          <h3 style={{ fontSize: '.9rem', lineHeight: '1rem' }}>Main Office</h3>
          <p>
            <Link href='/system/Puppis%20Sector%20GB-X%20b1-5' className='text-uppercase' style={{ border: 0 }}>
              <i className='icon icarus-terminal-outpost' />Icarus Terminal
              <br />
              <i className='icon icarus-terminal-star' />Puppis Sector GB-X b1-5</Link>
          </p>
          <p className='muted' style={{ fontSize: '.8rem' }}>
            Ardent Industry is a subsidiary of ICARUS Communications Corporation (ICC), creators of <Link target='_blank' href='https://github.com/iaincollins/icarus'>ICARUS Terminal</Link>.
          </p>

        </div>
        <div className='news__feed'>
          <div className='heading--with-underline'>
            <h2 className='heading--with-icon text-uppercase' style={{ fontSize: '1rem' }}>
              <i className='icon icarus-terminal-location-filled' />
              Galnet News Headlines
            </h2>
          </div>
          <div className='clear' />
          {galnetNews && galnetNews.map((newsItem, i) => (
            <div key={newsItem.url}>
              <h3 className='news__article-headline'>{newsItem.title}</h3>
              <div className='news__article-body'>
                <img src={newsItem.image} width='100%' alt='News article headline' className='news__headline-image' />
                <div className='news__article-text'>
                  <p className='muted text-uppercase'><a target='_blank' href={newsItem.url}>Galnet News, {newsItem.date} </a></p>
                  <Markdown>{`${newsItem.text.replaceAll('\n', '\n\n')}`}</Markdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
