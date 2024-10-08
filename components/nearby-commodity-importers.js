import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import {
  API_BASE_URL,
  // COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  // COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  // COMMODITY_FILTER_MIN_VOLUME_DEFAULT,
  UNLIMTED_DEMAND_TEXT
} from 'lib/consts'

const MAX_ROWS_TO_DISPLAY = 10

async function getNearbyImportersOfCommodity (systemName, commodityName) {
  let url = `${API_BASE_URL}/v1/system/name/${systemName}/commodity/name/${commodityName}/nearby/imports`
  const options = []

  /*
  const lastUpdatedFilterValue = window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
  const minVolumeFilterValue = window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT
  const fleetCarrierFilterValue = window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT

  options.push(`maxDaysAgo=${lastUpdatedFilterValue}`)
  options.push(`minVolume=${minVolumeFilterValue}`)
  if (fleetCarrierFilterValue === 'excluded') options.push('fleetCarriers=false')
  if (fleetCarrierFilterValue === 'only') options.push('fleetCarriers=true')
  */

  if (options.length > 0) {
    url += `?${options.join('&')}`
  }

  const res = await fetch(url)
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

  useEffect(() => {
    const eventHandler = async () => {
      setNearbyImporters(
        (await getNearbyImportersOfCommodity(commodity.systemName, commodity.symbol)).slice(0, MAX_ROWS_TO_DISPLAY)
      )
    }
    window.addEventListener('CommodityFilterChangeEvent', eventHandler)
    return () => window.removeEventListener('CommodityFilterChangeEvent', eventHandler)
  }, [])

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
                  <StationIcon stationType={r.fleetCarrier === 1 ? 'Fleet Carrier' : r.stationType} />
                  {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                  {r.distanceToArrival !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                  <div className='is-visible-mobile'>
                    <span style={{ textTransform: 'none', opacity: 0.75, paddingLeft: '2rem' }}>
                      <Link href={`/system/${r.systemName}`}>{r.systemName}</Link> <span style={{ opacity: 0.75, textTransform: 'none' }}>{r.distance} Ly</span>
                    </span>
                    <table className='data-table--mini data-table--compact two-column-table'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td>
                            <span className='data-table__label'>Demand</span>
                            {r.demand > 0 && <TradeBracketIcon bracket={r.demandBracket} />}
                            {r.demand > 0 ? `${r.demand.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>}
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
              render: (v) => <span style={{ opacity: 0.75 }}><Link href={`/system/${v}`}>{v}</Link></span>
            },
            {
              title: 'Dist',
              dataIndex: 'distance',
              key: 'distance',
              align: 'right',
              width: 100,
              className: 'is-hidden-mobile no-wrap',
              render: (v) => <span style={{ opacity: 0.75 }}>{v} Ly</span>
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
                  {v > 0 ? `${v.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>}
                  {r.demand > 0 && <TradeBracketIcon bracket={r.demandBracket} />}
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
          rowKey='commodityId'
        />}
    </>
  )
}
