import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import { API_BASE_URL } from 'lib/consts'

const MAX_ROWS_TO_DISPLAY = 10

async function getNearbyImportersOfCommodity (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodity/name/${commodityName}/nearby/imports`)
  return await res.json()
}

export default ({ commodity }) => {
  const [nearbyImporters, setNearbyImporters] = useState()

  useEffect(() => {
    (async () => {
      setNearbyImporters(
        (await getNearbyImportersOfCommodity(commodity.systemName, commodity.symbol)).slice(0, MAX_ROWS_TO_DISPLAY)
      )
    })()
  }, [commodity.commodityName, commodity.systemName])

  return (
    <>
      {!nearbyImporters && <div className='loading-bar' style={{ marginTop: 0 }} />}
      {nearbyImporters &&
        <Table
          className='data-table--mini data-table--striped data-table--border-left scrollable'
          columns={[
            {
              title: 'Location',
              dataIndex: 'stationName',
              key: 'stationName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  <StationIcon stationType={r.stationType} />
                  {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                  {r.distanceToArrival !== null && <small> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                  <div className='is-visible-mobile'>
                    <span style={{ textTransform: 'none', opacity: 0.75, paddingLeft: '2rem' }}>
                      <Link href={`/system/${r.systemName}`}>{r.systemName}</Link> <span style={{ opacity: 0.75, textTransform: 'none' }}>{r.distance} Ly</span>
                    </span>
                    <table className='data-table--mini data-table--compact two-column-table'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td>
                            <span className='data-table__label'>Demand</span>
                            <TradeBracketIcon bracket={r.demandBracket} />
                            {r.demand > 0 ? `${r.demand.toLocaleString()} T` : <small>No demand</small>}
                          </td>
                          <td><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
                        </tr>
                      </tbody>
                    </table>
                    <small style={{ textTransform: 'none', opacity: 0.5 }}>Updated {timeBetweenTimestamps(r.updatedAt)}</small>
                  </div>
                </>
            },
            {
              title: 'System',
              dataIndex: 'systemName',
              key: 'systemName',
              align: 'right',
              className: 'is-hidden-mobile',
              render: (v) => <span style={{ opacity: 0.75 }}><Link href={`/system/${v}`}>{v}</Link></span>
            },
            {
              title: 'Distance',
              dataIndex: 'distance',
              key: 'distance',
              align: 'right',
              width: 100,
              className: 'is-hidden-mobile',
              render: (v) => <span style={{ opacity: 0.75 }}>{v} Ly</span>
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              align: 'right',
              width: 100,
              className: 'is-hidden-mobile',
              render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
            },
            {
              title: 'Demand',
              dataIndex: 'demand',
              key: 'demand',
              align: 'right',
              width: 110,
              className: 'is-hidden-mobile',
              render: (v, r) =>
                <>
                  {v > 0 ? `${v.toLocaleString()} T` : <small>No demand</small>}
                  <TradeBracketIcon bracket={r.demandBracket} />
                </>
            },
            {
              title: 'Price',
              dataIndex: 'sellPrice',
              key: 'sellPrice',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
              render: (v) => <>{v.toLocaleString()} CR</>
            }
          ]}
          data={nearbyImporters}
          rowKey='commodityId'
        />}
    </>
  )
}
