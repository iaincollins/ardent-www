import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import { API_BASE_URL } from 'lib/consts'

const MAX_ROWS_TO_DISPLAY = 10

async function getNearbyExportersOfCommodity(systemAddress, commodityName) {
  const url = `${API_BASE_URL}/v2/system/address/${systemAddress}/commodity/name/${commodityName}/nearby/exports`
  const res = await fetch(url)
  return await res.json()
}

export default ({ commodity }) => {
  const [nearbyExporters, setNearbyExporters] = useState()
  useEffect(() => {
    (async () => {
      const _nearbyExporters = await getNearbyExportersOfCommodity(commodity.systemAddress, commodity.symbol)
        ; (_nearbyExporters.length > 0)
          ? setNearbyExporters(_nearbyExporters.slice(0, MAX_ROWS_TO_DISPLAY))
          : setNearbyExporters([])

    })()
  }, [commodity.commodityName, commodity.systemAddress])

  return (
    <>
      {!nearbyExporters && <div className='loading-bar' style={{ marginTop: 0, marginBottom: '1rem' }} />}
      {nearbyExporters &&
        <Table
          className='data-table--mini data-table--striped data-table--border-left scrollable fx__fade-in'
          columns={[
            {
              title: 'Exporters nearby',
              dataIndex: 'stationName',
              key: 'stationName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  <StationIcon station={r}>
                    {r.stationName}
                    {r.distanceToArrival !== undefined && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                    <span className='is-visible-mobile'>
                      <br />
                      <Link href={`/system/${r.systemAddress}`}>{r.systemName}</Link>
                      {r.distance !== undefined && <small style={{ textTransform: 'none' }}> {r.distance.toLocaleString()} ly</small>}
                    </span>
                  </StationIcon>
                  <div className='is-visible-mobile'>
                    <table className='data-table--mini data-table--compact  two-column-table'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td>
                            <span className='data-table__label'>Stock</span>
                            <TradeBracketIcon bracket={r.stockBracket} />
                            {r.stock.toLocaleString()} T
                          </td>
                          <td className='text-right'><span className='data-table__label'>Price</span>{r.buyPrice.toLocaleString()} CR</td>
                        </tr>
                      </tbody>
                    </table>
                    <small>{timeBetweenTimestamps(r.updatedAt)} ago</small>
                  </div>
                </>
            },
            {
              title: 'System',
              dataIndex: 'systemName',
              key: 'systemName',
              align: 'right',
              className: 'is-hidden-mobile',
              render: (v, r) =>
                <>
                  <Link href={`/system/${r.systemAddress}`}>{r.systemName}</Link>
                  {r.distance !== undefined && <small style={{ textTransform: 'none' }}> {r.distance.toLocaleString()} ly</small>}
                </>
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              align: 'right',
              width: 100,
              className: 'is-hidden-mobile no-wrap',
              render: (v) => <small>{timeBetweenTimestamps(v)}</small>
            },
            {
              title: 'Stock',
              dataIndex: 'stock',
              key: 'stock',
              align: 'right',
              width: 110,
              className: 'is-hidden-mobile no-wrap',
              render: (v, r) =>
                <>
                  {v.toLocaleString()} T
                  <TradeBracketIcon bracket={r.stockBracket} />
                </>
            },
            {
              title: 'Price',
              dataIndex: 'buyPrice',
              key: 'buyPrice',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile no-wrap',
              render: (v) => <>{v.toLocaleString()} CR</>
            }
          ]}
          data={nearbyExporters}
          rowKey={(r) => `nearby_commodity_exporters_${r.marketId}_${r.commodityName}`}
        />}
    </>
  )
}
