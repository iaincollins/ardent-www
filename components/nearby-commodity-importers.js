import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import { API_BASE_URL, NO_DEMAND_TEXT } from 'lib/consts'

const MAX_ROWS_TO_DISPLAY = 10

async function getNearbyImportersOfCommodity (systemAddress, commodityName) {
  const url = `${API_BASE_URL}/v1/system/address/${systemAddress}/commodity/name/${commodityName}/nearby/imports`
  const res = await fetch(url)
  return await res.json()
}

export default ({ commodity, rare }) => {
  const [nearbyImporters, setNearbyImporters] = useState()
  useEffect(() => {
    (async () => {
      const _nearbyImporters = await getNearbyImportersOfCommodity(commodity.systemAddress, commodity.symbol)
      if (_nearbyImporters.length > 0)
        setNearbyImporters(_nearbyImporters.slice(0, MAX_ROWS_TO_DISPLAY))
    })()
  }, [commodity.commodityName, commodity.systemAddress])

  return (
    <>
      {!nearbyImporters && <div className='loading-bar' style={{ marginTop: 0 }} />}
      {nearbyImporters &&
        <Table
          className='data-table--mini data-table--striped data-table--border-left scrollable'
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
                    {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                    {r.distanceToArrival !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                  </StationIcon>
                  <div className='is-visible-mobile'>
                    <span style={{ textTransform: 'none', opacity: 0.75, paddingLeft: '2rem' }}>
                      <Link href={`/system/${r.systemAddress}`}>{r.systemName}</Link> <span style={{ opacity: 0.75, textTransform: 'none' }}>{r.distance} ly</span>
                    </span>
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
                    <small style={{ textTransform: 'none', opacity: 0.5 }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
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
                  <span style={{ opacity: 0.75 }}><Link href={`/system/${r.systemAddress}`}>{v}</Link></span>
                  <span style={{ fontSize: '.8rem', opacity: 0.5 }}> {r.distance.toLocaleString()} ly</span>
                </>
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              align: 'right',
              width: 100,
              className: 'is-hidden-mobile no-wrap',
              render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
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
          rowKey={(r) => `nearby_commodity_importers_${r.commodityId}`}
        />}
    </>
  )
}
