import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from '../lib/utils/dates'
import { API_BASE_URL } from '../lib/consts'

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
          className='data-table--mini data-table--striped scrollable'
          style={{ marginBottom: '.5rem' }}
          columns={[
            {
              title: 'Location',
              dataIndex: 'stationName',
              key: 'stationName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  <span className='is-hidden-mobile'>
                    {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                  </span>
                  <div className='is-visible-mobile'>
                    <table className='data-table--mini data-table--striped data-table--two-equal-columns'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td colSpan={2}>
                            {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                            <br />
                            <span style={{ textTransform: 'none' }}>
                              <Link href={`/system/${r.systemName}`}>{r.systemName}</Link> <span style={{ opacity: 0.75, textTransform: 'none' }}>{r.distance} Ly</span>
                            </span>
                            <br />
                            <small style={{ textTransform: 'none', opacity: 0.5 }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</small>
                          </td>
                        </tr>
                        <tr>
                          <td><span class='data-table__label'>Demand</span>{r.demand.toLocaleString()} T</td>
                          <td><span class='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
                        </tr>
                      </tbody>
                    </table>
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
              className: 'is-hidden-mobile',
              render: (v) => <span style={{ opacity: 0.75 }}>{v} Ly</span>
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
              render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)} ago</span>
            },
            {
              title: 'Demand',
              dataIndex: 'demand',
              key: 'demand',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
              render: (v) => <>{v.toLocaleString()} T</>
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
        />}
    </>
  )
}