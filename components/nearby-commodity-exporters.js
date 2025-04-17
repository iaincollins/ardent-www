import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import { API_BASE_URL } from 'lib/consts'

const MAX_ROWS_TO_DISPLAY = 10

async function getNearbyExportersOfCommodity (systemName, commodityName) {
  const url = `${API_BASE_URL}/v1/system/name/${systemName}/commodity/name/${commodityName}/nearby/exports`
  const res = await fetch(url)
  return await res.json()
}

export default ({ commodity }) => {
  const [nearbyExporters, setNearbyExporters] = useState()

  useEffect(() => {
    (async () => {
      setNearbyExporters(
        (await getNearbyExportersOfCommodity(commodity.systemName, commodity.symbol)).slice(0, MAX_ROWS_TO_DISPLAY)
      )
    })()
  }, [commodity.commodityName, commodity.systemName])

  return (
    <>
      {!nearbyExporters && <div className='loading-bar' style={{ marginTop: 0, marginBottom: '1rem' }} />}
      {nearbyExporters &&
        <Table
          className='data-table--mini data-table--striped data-table--border-left scrollable'
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
                    {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                    {r.distanceToArrival !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                  </StationIcon>
                  <div className='is-visible-mobile'>
                    <span style={{ textTransform: 'none', opacity: 0.75, paddingLeft: '2rem' }}>
                      <Link href={`/system/${r.systemName.replaceAll(' ', '_')}`}>{r.systemName}</Link> <span style={{ opacity: 0.75, textTransform: 'none' }}>{r.distance} ly</span>
                    </span>
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
                  <span style={{ opacity: 0.75 }}><Link href={`/system/${v.replaceAll(' ', '_')}`}>{v}</Link></span>
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
          rowKey={(r) => `nearby_commodity_exporters_${r.commodityId}`}
        />}
    </>
  )
}
