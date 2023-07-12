import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Table from 'rc-table'
import Loader from '../components/loader'
import { getCommodities } from '../lib/commodities'

export default () => {
  const router = useRouter()
  const [commodities, setCommodities] = useState()

  const onRowClick = (record, index, event) => {
    router.push(`/commodity/${record.commodityName}`)
  }

  useEffect(() => {
    (async () => {
      setCommodities(await getCommodities())
    })()
  }, [])

  if (commodities === undefined) return <Loader />

  return (
    <>
      <h2 style={{ marginTop: '1.2rem', marginBottom: '-.1rem', width: 'auto' }}>
        Commodities
        <span className='is-visible-mobile' style={{ marginRight: '.5rem' }} />
      </h2>
      {commodities &&
        <Table
          className='data-table data-table--striped data-table--interactive'
          columns={[
            {
              title: 'Commodity',
              dataIndex: 'name',
              key: 'commodityName',
              align: 'left',
              render: (v, r) =>
                <>
                  <i className='icon icarus-terminal-cargo' />{v}<br /><small>{r.category}</small>
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
          onRow={(record, index) => ({
            onClick: onRowClick.bind(null, record, index)
          })}
        />}
      <p className='muted' style={{ fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
        Trade &amp; exploration data for <a href='https://www.elitedangerous.com/' rel='noreferrer' target='_blank'>Elite Dangerous</a>
      </p>
      <p className='muted' style={{ fontStyle: 'italic', textAlign: 'center' }}>
        Real time data from <a href='https://eddn.edcd.io' rel='noreferrer' target='_blank'>EDDN</a> by  <a href='https://edcd.github.io/' rel='noreferrer' target='_blank'>EDCD</a>
      </p>
      <p className='muted' style={{ fontStyle: 'italic', textAlign: 'center' }}>
        <a href='https://github.com/iaincollins/ardent-www' rel='noreferrer' target='_blank'>ArdentOS</a>
        <span className='muted'> | </span>
        <a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>Ardent API</a>
        <span className='muted'> | </span>
        <a href='https://github.com/iaincollins/ardent-collector' rel='noreferrer' target='_blank'>Ardent Collector</a>
      </p>
    </>
  )
}
