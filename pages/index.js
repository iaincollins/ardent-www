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
    setNavigationPath([{ name: 'Trade Data', path: '/' }])
      ; (async () => {
        const res = await fetch(`${API_BASE_URL}/v1/news/galnet`)
        let news = res.ok ? await res.json() : []
        setGalnetNews(news.slice(0, 2))
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
          <p style={{ textAlign: 'right' }}>
            <small>
              Ardent OS {Package.version} // <a href={API_BASE_URL} rel='noreferrer' target='_blank'>API {version?.version ?? '?.?.?'}</a>
            </small>
          </p>
          <div className='heading--with-underline'>
            <h2 className='heading--with-icon text-uppercase' style={{fontSize: '1rem'}}>
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
              <p className='text-uppercase muted' style={{textAlign: 'center'}}>
                {stats.updatedInLast24Hours.toLocaleString()} updates
                <br/>in the last 24 hours
              </p>
            </>}
          <Link className='button' style={{ textAlign: 'center', display: 'block', padding: '.5rem', fontSize: '1.25rem', margin: '0 1rem'}} href='/commodity/agronomictreatment'>
          <i className='icon icarus-terminal-cargo' style={{ marginRight: '.5rem', fontSize: '1.25rem !important' }} />
            Trade Data
            <i className='icon icarus-terminal-chevron-right' style={{ marginLeft: '.5rem', fontSize: '1.25rem !important' }} />
          </Link>
          <div className='heading--with-underline' style={{marginTop: '1rem'}}>
            <h2 className='heading--with-icon text-uppercase' style={{fontSize: '1rem'}}>
              <i className='icon icarus-terminal-cargo' />
              Commodities
            </h2>
          </div>
          <ul>
            {Object.entries(commodityCategories).map(([c, data]) => c).filter(category => category.toLowerCase() !== 'nonmarketable').map(category =>
              <li key={category}><Link href={`/commodities/${category.toLowerCase()}`}>{category}</Link></li>
            )}
          </ul>
          <div className='heading--with-underline' style={{marginTop: '1rem'}}>
            <h2 className='heading--with-icon text-uppercase' style={{fontSize: '1rem'}}>
              <i className='icon icarus-terminal-logo' />
              About
            </h2>
          </div>
          <p style={{marginTop: 0}}>
            Ardent Industry is the leading provider of trade data and market insights in the galaxy.
          </p>
          <p>
            Our main offices are located on the Icarus Terminal station in <Link href='/system/Puppis%20Sector%20GB-X%20b1-5'>Puppis Sector GB-X b1-5</Link>.
          </p>
          <p>
            Ardent Industry is a subsidiary of ICARUS Communications Corporation (ICC), creators of the <Link target='_blank' href='https://github.com/iaincollins/icarus'>ICARUS Terminal software</Link>.
          </p>
          <p>
            Real time commodity data is provided by interlink with the <Link target='_blank' href='https://eddn.edcd.io/'>EDDN</Link> relay.
          </p>
        </div>
        <div className='news__feed'>
        <div className='heading--with-underline'>
            <h2 className='heading--with-icon text-uppercase' style={{fontSize: '1rem'}}>
              <i className='icon icarus-terminal-location-filled' />
              Galnet News Feed
            </h2>
          </div>
          <div className='clear' />
          {galnetNews && galnetNews.map((newsItem, i) => (
            <div key={newsItem.url}>
              <h3>{newsItem.title}</h3>
              <img src={newsItem.image} width='100%' alt='News headline' style={{ WebkitFilter: 'grayscale(1)' }} />
              <p className='muted'>{newsItem.date} :: <a href={newsItem.url}>Galnet News</a></p>
              <Markdown>{`${newsItem.text.replaceAll('\n', '\n\n')}`}</Markdown>
              {i < galnetNews.length - 1 && <hr style={{ marginBottom: '1rem' }} />}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}


/*

export default function Page(props) {
  const [navigationPath, setNavigationPath] = useContext(NavigationContext)

  const router = useRouter()
  const [commodities, setCommodities] = useState(props.commodities)
  const [categories, setCategories] = useState(props.categories)

  const onRowClick = (record, index, event) => {
    router.push(`/commodity/${record.commodityName}`)
  }

  useEffect(animateTableEffect)

  useEffect(() => {
    (async () => {
      const commodities_ = commodities ?? await getCommoditiesWithAvgPricing()

      const filterByCategory = (router.query?.['commodity-category'])
        ? commodities_.filter((c) => c.category.toLowerCase() === router.query?.['commodity-category'].toLowerCase())?.[0]?.category ?? false
        : false

      const categories_ = filterByCategory
        ? [filterByCategory]
        : [...new Set(commodities_.map((c) => c.category).sort())]

      setCommodities(commodities_)
      setCategories(categories_)

      setNavigationPath(
        (categories_.length === 1)
          ? [{ name: 'Home', path: '/' }, { name: 'Commodities', path: '/commodities' }]
          : [{ name: 'Home', path: '/' }, { name: 'Commodities', path: '/commodities' }]
      )
    })()
  }, [router.asPath])

  return (
    <Layout
      loading={commodities === undefined}
      loadingText='Loading commodities'
      title={categories?.length === 1 ? `${categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category => category)} in Elite Dangerous` : 'Commodities in Elite Dangerous'}
      description={categories?.length === 1 ? `Where to buy and sell ${categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category => category)} in Elite Dangerous` : 'Where to buy and sell commodities in Elite Dangerous'}
    >
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/commodities' />
      </Head>
      {commodities && categories &&
        <div className='fx__fade-in'>
          {categories?.length > 1 &&
            <>
              <div className='heading--with-underline'>
                <h2 className='heading--with-icon'>
                  <i className='icon icarus-terminal-cargo' />
                  Commodities
                </h2>
              </div>
              <p className='text-center muted' style={{marginTop: 0}}>
                Commodity prices and supply / demand updated in real time via <Link target='_blank' href='https://eddn.edcd.io/'>EDDN</Link>.
              </p>
            </>}
          {categories?.length === 1 && commodityCategories[categories[0]]?.description && <>
            <div className='heading--with-underline'>
              <h2 className='heading--with-icon'>
                <i className='icon icarus-terminal-cargo' />
                {categories}
              </h2>
            </div>
            <p className='clear text-centerx' style={{ marginTop: 0, marginBottom: '.5rem' }}>
              {commodityCategories[categories[0]].description}
              {categories?.length === 1 && commodityCategories[categories[0]]?.whereToFind && <>
                {' '}{commodityCategories[categories[0]]?.whereToFind}
              </>}
            </p>
          </>}
          {categories?.length > 1 &&
            <div className='menu-button-grid'>
              {categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category =>
                <Link className='button' href={`/commodities/${category.toLowerCase()}`}>{category}</Link>
              )}
            </div>
          }
          {categories?.length === 1 && categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category =>
            <div key={`category_${category}`} style={{ marginTop: '1rem' }}>
              {categories?.length > 1 && <h2 className='heading--table' onClick={() => router.push(`/commodities/${category.toLowerCase()}`)}>{category}</h2>}
              <Table
                className='data-table data-table--striped data-table--interactive data-table--animated'
                columns={[
                  {
                    title: 'Commodity',
                    dataIndex: 'name',
                    key: 'commodityName',
                    align: 'left',
                    className: 'max-width-mobile',
                    render: (v, r) =>
                      <>
                        <i className='icon icarus-terminal-cargo' />
                        {v}<br />
                        <small>
                          {r.category}
                          {r.market_id && <>, RARE</>}
                        </small>
                        <div className='is-visible-mobile'>
                          <table className='data-table--mini data-table--compact two-column-table'>
                            <tbody style={{ textTransform: 'uppercase' }}>
                              <tr>
                                <td><span className='data-table__label'>Avg Export CR/T</span>{r.avgBuyPrice > 0 ? <>{r.avgBuyPrice.toLocaleString()} CR</> : '-'}</td>

                                <td><span className='data-table__label'>Avg Profit CR/T</span>{r.avgProfit > 0 ? <>{r.avgProfit.toLocaleString()} CR</> : '-'}</td>
                              </tr>
                              <tr>
                                <td><span className='data-table__label'>Avg Import CR/T</span>
                                  {r.avgSellPrice > 0 ? <>{r.avgSellPrice.toLocaleString()} CR</> : '-'}
                                </td>

                                <td><span className='data-table__label'>Max Profit CR/T</span>{r.maxProfit > 0 ? <>{r.maxProfit.toLocaleString()} CR</> : '-'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </>
                  },
                  {
                    title: 'Avg export CR/T',
                    dataIndex: 'avgBuyPrice',
                    key: 'avgBuyPrice',
                    align: 'right',
                    className: 'is-hidden-mobile no-wrap',
                    width: 150,
                    render: (v) => v > 0 ? <>{v.toLocaleString()} CR</> : <small>-</small>
                  },
                  {
                    title: 'Avg import CR/T',
                    dataIndex: 'avgSellPrice',
                    key: 'avgSellPrice',
                    align: 'right',
                    className: 'is-hidden-mobile no-wrap',
                    width: 150,
                    render: (v, r) => (v > 0) ? <>{v.toLocaleString()} CR</> : <small>-</small>
                  },
                  {
                    title: 'Avg profit CR/T',
                    dataIndex: 'avgProfit',
                    key: 'avgProfit',
                    align: 'right',
                    width: 150,
                    className: 'is-hidden-mobile no-wrap',
                    render: (v, r) =>
                      <div style={{ textTransform: 'uppercase' }}>
                        {v > 0 ? <>{v.toLocaleString()} CR</> : <small>-</small>}
                        <br />
                        {v > 0 ? <small>Max {r.maxProfit.toLocaleString()} CR</small> : ''}
                      </div>
                  }
                ]}
                data={commodities.filter(c => c.category.toLowerCase() === category.toLowerCase())}
                rowKey='name'
                onRow={(record, index) => ({
                  onClick: onRowClick.bind(null, record, index)
                })}
              />
            </div>
          )}
        </div>}
    </Layout>
  )
}

*/