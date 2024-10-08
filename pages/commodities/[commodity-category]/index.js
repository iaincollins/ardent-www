import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Table from 'rc-table'
import Layout from 'components/layout'
import { getCommodities } from 'lib/commodities'
import animateTableEffect from 'lib/animate-table-effect'
import commodityCategories from 'lib/commodities/commodity-categories.json'

export async function getServerSideProps ({ query }) {
  const rawCommoditiesData = (await import('../../../../ardent-data/cache/commodities.json')).commodities
  const commodities = await getCommodities(rawCommoditiesData)

  const filterByCategory = (query?.['commodity-category'])
    ? commodities.filter((c) => c.category.toLowerCase() === query?.['commodity-category'].toLowerCase())?.[0]?.category ?? false
    : false

  const categories = filterByCategory
    ? [filterByCategory]
    : [...new Set(commodities.map((c) => c.category).sort())]

  return { props: { commodities, categories } }
}

export default function Page (props) {
  const router = useRouter()
  const [commodities, setCommodities] = useState(props.commodities)
  const [categories, setCategories] = useState(props.categories)

  const onRowClick = (record, index, event) => {
    router.push(`/commodity/${record.commodityName}`)
  }

  useEffect(animateTableEffect)

  useEffect(() => {
    (async () => {
      const commodities_ = commodities ?? await getCommodities()

      const filterByCategory = (router.query?.['commodity-category'])
        ? commodities_.filter((c) => c.category.toLowerCase() === router.query?.['commodity-category'].toLowerCase())?.[0]?.category ?? false
        : false

      const categories_ = filterByCategory
        ? [filterByCategory]
        : [...new Set(commodities_.map((c) => c.category).sort())]

      setCommodities(commodities_)
      setCategories(categories_)
    })()
  }, [router.asPath])

  return (
    <Layout loading={commodities === undefined} loadingText='Loading commodities'>
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/commodities' />
      </Head>
      <ul
        className='breadcrumbs fx__fade-in' onClick={(e) => {
          if (e.target.tagName === 'LI') e.target.children[0].click()
        }}
      >
        <li><Link href='/'>Home</Link></li>
        <li><Link href='/commodities'>Commodities</Link></li>
      </ul>
      {commodities && categories &&
        <div className='fx__fade-in'>
          {categories?.length > 1 &&
            <p className='clear text-center'>
              The best trade prices for commodities anywhere in the galaxy.
            </p>}
          {categories?.length === 1 && commodityCategories[categories[0]]?.description &&
            <p className='clear text-center'>
              {commodityCategories[categories[0]].description}
            </p>}
          {categories?.length === 1 && commodityCategories[categories[0]]?.whereToFind &&
            <p className='clear text-center'>
              {commodityCategories[categories[0]]?.whereToFind}
            </p>}
          {categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category =>
            <div key={`category_${category}`}>
              {categories?.length === 1 && <h3 style={{ marginBottom: '-.1rem' }}>{category}</h3>}
              {categories?.length > 1 && <h3 style={{ marginBottom: '-.1rem' }} onClick={() => router.push(`/commodities/${category.toLowerCase()}`)}>{category}</h3>}
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
                                <td><span className='data-table__label'>Avg Import CR/T</span>
                                  {r.avgSellPrice > 0 ? <>{r.avgSellPrice.toLocaleString()} CR</> : '-'}
                                </td>
                                <td><span className='data-table__label'>Avg Profit CR/T</span>{r.avgProfit > 0 ? <>{r.avgProfit.toLocaleString()} CR</> : '-'}</td>
                              </tr>
                              <tr>
                                <td><span className='data-table__label'>Avg Export CR/T</span>{r.avgBuyPrice > 0 ? <>{r.avgBuyPrice.toLocaleString()} CR</> : '-'}</td>
                                <td><span className='data-table__label'>Max Profit CR/T</span>{r.maxProfit > 0 ? <>{r.maxProfit.toLocaleString()} CR</> : '-'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </>
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
                    title: 'Avg export CR/T',
                    dataIndex: 'avgBuyPrice',
                    key: 'avgBuyPrice',
                    align: 'right',
                    className: 'is-hidden-mobile no-wrap',
                    width: 150,
                    render: (v) => v > 0 ? <>{v.toLocaleString()} CR</> : <small>-</small>
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
