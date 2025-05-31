import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import { API_BASE_URL, NO_DEMAND_TEXT } from 'lib/consts'
import animateTableEffect from 'lib/animate-table-effect'

const MAX_ROWS_TO_DISPLAY = 10

async function getNearbyImportersOfCommodity (systemAddress, commodityName) {
  const url = `${API_BASE_URL}/v2/system/address/${systemAddress}/commodity/name/${commodityName}/nearby/imports?maxDaysAgo=30&fleetCarriers=0&sort=distance`
  const res = await fetch(url)
  return await res.json()
}

export default ({ commodity, rare }) => {
  const [nearbyImporters, setNearbyImporters] = useState()

  useEffect(animateTableEffect)

  useEffect(() => {
    (async () => {
      const _nearbyImporters = await getNearbyImportersOfCommodity(commodity.systemAddress, commodity.symbol)
        ; (_nearbyImporters.length > 0)
        ? setNearbyImporters(_nearbyImporters.slice(0, MAX_ROWS_TO_DISPLAY))
        : setNearbyImporters([])
    })()
  }, [commodity.commodityName, commodity.systemAddress])

  return (
    <>
      {!nearbyImporters && <div className='loading-bar' style={{ marginTop: 0 }} />}
      {nearbyImporters &&
        <Table
          className='data-table--mini data-table--striped data-table--border-left data-table--animated scrollable'
          columns={[
            {
              title: 'Importers nearby',
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
                    <table className='data-table--mini data-table--compact two-column-table'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td>
                            <span className='data-table__label'>Demand</span>
                            <TradeBracketIcon bracket={rare ? 2 : r.demandBracket} />
                            {r.demand > 0 ? `${r.demand.toLocaleString()} T` : <small>{NO_DEMAND_TEXT}</small>}
                          </td>
                          <td className='text-right'><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
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
              title: 'Demand',
              dataIndex: 'demand',
              key: 'demand',
              align: 'right',
              width: 110,
              className: 'is-hidden-mobile no-wrap',
              render: (v, r) =>
                <>
                  {v > 0 ? `${v.toLocaleString()} T` : <small>{NO_DEMAND_TEXT}</small>}
                  <TradeBracketIcon bracket={rare ? 2 : r.demandBracket} />
                </>
            },
            {
              title: 'Price',
              dataIndex: 'sellPrice',
              key: 'sellPrice',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile no-wrap',
              render: (v) => <>{v.toLocaleString()} CR</>
            }
          ]}
          data={nearbyImporters}
          rowKey={(r) => `nearby_commodity_importers_${r.marketId}_${r.commodityName}`}
        />}
    </>
  )
}
