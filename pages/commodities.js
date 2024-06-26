import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Table from 'rc-table'
import Layout from 'components/layout'
import { getCommodities } from 'lib/commodities'
import animateTableEffect from 'lib/animate-table-effect'

export default () => {
  const router = useRouter()
  const [commodities, setCommodities] = useState()

  const onRowClick = (record, index, event) => {
    router.push(`/commodity/${record.commodityName}`)
  }

  useEffect(animateTableEffect)

  useEffect(() => {
    (async () => {
      setCommodities(await getCommodities())
    })()
  }, [])

  return (
    <Layout loading={commodities === undefined}>
      {commodities &&
        <div className='fx__fade-in'>
          <h2 style={{ marginBottom: '-.1rem' }}>Commodities</h2>
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
                    <i className='icon icarus-terminal-cargo' />{v}<br />
                    <small>
                      {r.category}
                      {r.market_id && <span className='muted'> (Rare)</span>}
                    </small>
                    <div className='is-visible-mobile'>
                      <table className='data-table--mini data-table--compact two-column-table'>
                        <tbody style={{ textTransform: 'uppercase' }}>
                          <tr>
                            <td><span className='data-table__label'>Avg Import CR/T</span>{r.avgSellPrice > 0 ? <>{r.avgSellPrice.toLocaleString()} CR</> : '-'}</td>
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
                render: (v) => v > 0 ? <>{v.toLocaleString()} CR</> : '-'
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
            data={commodities}
            rowKey='name'
            onRow={(record, index) => ({
              onClick: onRowClick.bind(null, record, index)
            })}
          />
        </div>}
    </Layout>
  )
}
