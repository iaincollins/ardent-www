import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
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
      let commodities = await res.json()
      commodities = commodities
        .map(c => {
          c.key = c.commodityId
          c.avgProfit = c.avgSellPrice - c.avgBuyPrice
          c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
          c.maxProfit = c.maxSellPrice - c.minBuyPrice
          c.symbol = c.commodityName
          c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
          c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
          return c
        })
        .filter(c => c.avgProfit > 0)
        .filter(c => c.totalStock > 0)
        .filter(c => c.totalDemand > 0)
        .sort((a, b) => b.avgProfit - a.avgProfit)
      setCommodities(commodities)
    })()
  }, [])

  return (
    <>
      <p className='breadcrumb'>
        <Link href='/'>Home</Link>
      </p>
      <h2>Commodities</h2>
      {!commodities && <div className='loading-bar' />}
      {commodities &&
        <Table
          className='data-table'
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'commodityName',
              align: 'left',
              render: (v, r) => <>{v}<br /><small>{r.category}</small></>
            },
            {
              title: 'Avg Export CR/T',
              dataIndex: 'avgBuyPrice',
              key: 'avgBuyPrice',
              align: 'right',
              render: (v) => <>{v.toLocaleString()} CR</>
            },
            {
              title: 'Avg Import CR/T',
              dataIndex: 'avgSellPrice',
              key: 'avgSellPrice',
              align: 'right',
              render: (v) => <>{v.toLocaleString()} CR</>
            },
            {
              title: 'Profit CR/T',
              dataIndex: 'avgProfit',
              key: 'avgProfit',
              align: 'right',
              render: (v, r) =>
                <>
                  ~ {v.toLocaleString()} CR
                  <br />
                  <small>MAX {r.maxProfit.toLocaleString()} CR</small>
                </>
            }
          ]}
          data={commodities}
          onRow={(record, index) => ({
            onClick: onRowClick.bind(null, record, index)
          })}
        />}
    </>
  )
}
