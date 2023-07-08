import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Table from 'rc-table'
import Loader from '../components/loader'
import commoditiesInfo from '../lib/commodities.json'

import { API_BASE_URL } from '../lib/consts'

export default () => {
  const router = useRouter()
  const [commodities, setCommodities] = useState()

  const onRowClick = (record, index, event) => {
    router.push(`/commodity/${record.commodityName}`)
  }

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/commodities`)
      let commoditiesFromServer = await res.json()
      let listOfCommodities = commoditiesInfo
        .map(commodity => {
          const commodityFromServer = (commoditiesFromServer.find(el => commodity.symbol.toLowerCase() === el.commodityName.toLowerCase()))
          const c = (commodityFromServer) ? {...commodity, ...commodityFromServer } : commodity
          c.key = c.commodityId
          c.avgProfit = c.avgSellPrice - c.avgBuyPrice
          c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
          c.maxProfit = c.maxSellPrice - c.minBuyPrice
          if (!c.totalDemand) c.totalDemand = 0
          if (!c.totalStock) c.totalStock = 0
          if (!c.avgBuyPrice) c.avgBuyPrice = 0
          if (!c.avgSellPrice) c.avgSellPrice = 0
          return c
        })
        // .filter(c => c.avgProfit > 0)
        // .filter(c => c.totalStock > 0)
        // .filter(c => c.totalDemand > 0)
        //.sort((a, b) => b.avgProfit - a.avgProfit)
        .sort((a, b) => a.name.localeCompare(b.name))
      setCommodities(listOfCommodities)
    })()
  }, [])

  if (commodities === undefined) return <Loader />

  return (
    <>
      {/* <p className='breadcrumb'>
        <Link href='/'>Home</Link>
      </p> */}
      <h2 style={{ marginBottom: 0 }}>Commodities</h2>
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
                    <table className='data-table--mini data-table--compact data-table--two-equal-columns'>
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
                  { v > 0 ? <>{v.toLocaleString()} CR</> : '-'}
                  <br />
                 { v > 0 ? <small>Max {r.maxProfit.toLocaleString()} CR</small> : ''}
                </div>
            }
          ]}
          data={commodities}
          onRow={(record, index) => ({
            onClick: onRowClick.bind(null, record, index)
          })}
        />}
      <p className='muted' style={{ fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
        Trade and exploration data for <a href='https://www.elitedangerous.com/' rel='noreferrer' target='_blank'>Elite Dangerous</a>
      </p>
      <p className='muted' style={{ fontStyle: 'italic', textAlign: 'center' }}>
        Live data feed powered by <a href='https://edcd.github.io/' rel='noreferrer' target='_blank'>EDCD</a> / <a href='https://eddn.edcd.io' rel='noreferrer' target='_blank'>EDDN</a>
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
