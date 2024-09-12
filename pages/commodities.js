import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Table from 'rc-table'
import Layout from 'components/layout'
import { getCommodities } from 'lib/commodities'
import animateTableEffect from 'lib/animate-table-effect'

export default () => {
  const router = useRouter()
  const [commodities, setCommodities] = useState()
  const [categories, setCategories] = useState()

  const onRowClick = (record, index, event) => {
    router.push(`/commodity/${record.commodityName}`)
  }

  useEffect(animateTableEffect)

  useEffect(() => {
    (async () => {
      const commodities = await getCommodities()
      const categories = [...new Set(commodities.map((c) => c.category).sort())]
      setCommodities(commodities)
      setCategories(categories)
    })()
  }, [])

  return (
    <Layout loading={commodities === undefined} loadingText='Loading commodities'>
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/commodities' />
      </Head>
      {commodities && categories &&
        <div className='fx__fade-in'>
          <h2>Trade Commodities</h2>
          <p className='clear' style={{ fontSize: '1.1rem' }}>
            Find the best trade prices for any commodity in the galaxy.
          </p>

          {categories.map(category =>
            <div key={`category_${category}`}>
              <h3 style={{ marginBottom: '-.1rem' }}>{category}</h3>
              <Table
                className='data-table data-table--striped data-table--interactive data-table--animated'
                columns={[
                  {
                    title: 'Commodity',
                    dataIndex: 'name',
                    key: 'commodityName',
                    align: 'left',
                    render: (v, r) =>
                      <>
                        <i className='icon icarus-terminal-cargo' />
                          {v}{r.market_id && <>{' '}<span className='muted'>(Rare)</span></>}<br />
                        <small>
                          {r.category}
                        </small>
                        <div className='is-visible-mobile'>
                          <table className='data-table--mini data-table--compact two-column-table'>
                            <tbody style={{ textTransform: 'uppercase' }}>
                              <tr>
                                <td><span className='data-table__label'>Avg Import CR/T</span>
                                  {!r.market_id
                                    ? <>{r.avgSellPrice > 0 ? <>{r.avgSellPrice.toLocaleString()} CR</> : '-'}</>
                                    : <span className='muted'>-</span>
                                  }
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
                    className: 'is-hidden-mobile',
                    render: (v, r) => (v > 0) ? <>
                      {!r.market_id
                        ? <>{v.toLocaleString()} CR</>
                        : <span className='muted'>-</span>
                      }
                    </> : '-'
                  },
                  {
                    title: 'Avg export CR/T',
                    dataIndex: 'avgBuyPrice',
                    key: 'avgBuyPrice',
                    align: 'right',
                    className: 'is-hidden-mobile',
                    render: (v) => v > 0 ? <>{v.toLocaleString()} CR</> : '-'
                  },
                  {
                    title: 'Avg profit CR/T',
                    dataIndex: 'avgProfit',
                    key: 'avgProfit',
                    align: 'right',
                    className: 'is-hidden-mobile',
                    render: (v, r) =>
                      <div style={{ textTransform: 'uppercase' }}>
                        {v > 0 ? <>{v.toLocaleString()} CR</> : '-'}
                        <br />
                        {v > 0 ? <small>Max {r.maxProfit.toLocaleString()} CR</small> : ''}
                      </div>
                  }
                ]}
                data={commodities.filter(c => c.category === category)}
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
