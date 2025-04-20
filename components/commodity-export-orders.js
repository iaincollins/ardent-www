import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from './collapsible-trigger'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import { API_BASE_URL } from 'lib/consts'
import NearbyCommodityImporters from './nearby-commodity-importers'
import NearbyCommodityExporters from './nearby-commodity-exporters'
import systemIdentiferIsSystemAddress from 'lib/utils/system-identifer-is-system-address'

async function getExportsForCommodityBySystem (systemAddress, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/address/${systemAddress}/commodity/name/${commodityName}`)
  const exports = await res.json()
  if (!exports || exports.error) return [] // Handle system not found
  return exports.filter(c => c.stock > 0)
}

export default ({ commodities }) => {
  return (
    <Table
      className='data-table data-table--striped data-table--interactive data-table--animated'
      columns={[
        {
          title: 'Exporters',
          dataIndex: 'stationName',
          key: 'stationName',
          align: 'left',
          className: 'max-width-mobile',
          render: (v, r) =>
            <div style={{ paddingLeft: '2em' }}>
              <span style={{ position: 'absolute', left: '.5rem' }}>
                <StationIcon station={r} />
              </span>
              {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
              {(r?.distanceToArrival ?? null) !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
              <div className='is-visible-mobile'>
                <span style={{ textTransform: 'none', opacity: 0.75 }}>
                  {r.systemName} <small style={{ opacity: 0.75, textTransform: 'none' }}>{r.distance ? <>{r.distance.toLocaleString()} ly</> : ''}</small>
                </span>
                <table className='data-table--mini data-table--compact two-column-table'>
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
                <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
              </div>
            </div>
        },
        {
          title: 'System',
          dataIndex: 'systemName',
          key: 'systemName',
          align: 'right',
          className: 'is-hidden-mobile',
          render: (v, r) => (
            <>
              <span style={{ opacity: 0.75 }}>{v}</span>
              {Number.isInteger(r.distance) && <small className='text-no-transform no-wrap' style={{ marginLeft: '.5rem', opacity: 0.5 }}>{Number.isInteger(r.distance) ? <>{r.distance.toLocaleString()} ly</> : ''}</small>}
            </>
          )
        },
        {
          title: 'Updated',
          dataIndex: 'updatedAt',
          key: 'updatedAt',
          align: 'right',
          width: 110,
          className: 'is-hidden-mobile no-wrap',
          render: (v) => <span style={{ fontSize: '.9rem', opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
        },
        {
          title: 'Stock',
          dataIndex: 'stock',
          key: 'stock',
          align: 'right',
          width: 140,
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
          width: 140,
          className: 'is-hidden-mobile no-wrap',
          render: (v) => <>{v.toLocaleString()} CR</>
        }
      ]}
      data={commodities}
      rowKey={(r) => `commodity_export_orders_${r.commodityId}`}
      expandable={{
        expandRowByClick: true,
        expandedRowRender: (r) => <ExpandedRow r={r} />
      }}
    />
  )
}

function ExpandedRow ({ r }) {
  if (!r) return

  const [exports, setExports] = useState()

  useEffect(() => {
    (async () => {
      const exports = await getExportsForCommodityBySystem(r.systemAddress, r.symbol)
      setExports(exports)
    })()
  }, [r.commodityName])

  if (!exports) {
    return (
      <>
        <p style={{ whiteSpace: 'normal', marginTop: '.5rem' }}>
          Stock of <strong>{r.name}</strong> in <Link href={`/system/${r.systemName.replaceAll(' ', '_')}`}>{r.systemName}</Link> ...
        </p>
        <div className='loading-bar loading-bar--table-row' />
      </>
    )
  }

  return (
    <>
      <p style={{ whiteSpace: 'normal', marginTop: '.5rem' }}>
        Stock of <strong>{r.name}</strong> in <Link href={`/system/${r.systemName.replaceAll(' ', '_')}`}>{r.systemName}</Link>
      </p>
      <Table
        className='data-table--mini data-table--striped scrollable'
        columns={[
          {
            title: 'Exporters in system',
            dataIndex: 'stationName',
            key: 'stationName',
            align: 'left',
            className: 'max-width-mobile',
            render: (v, r) =>
              <>
                <StationIcon station={r}>
                  {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                  {(r?.distanceToArrival ?? null) !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                </StationIcon>
                <div className='is-visible-mobile'>
                  <table className='data-table--mini data-table--compact two-column-table'>
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
                  <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
                </div>
              </>
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'right',
            width: 130,
            className: 'is-hidden-mobile no-wrap',
            render: (v) => <>{timeBetweenTimestamps(v)}</>
          },
          {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            align: 'right',
            width: 130,
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
        data={exports}
        rowKey={(r) => `commodity_export_orders_expanded_${r.commodityId}`}
      />
      <Collapsible
        trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
        triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
      >
        <NearbyCommodityExporters commodity={r} />
      </Collapsible>
      <Collapsible
        trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
        triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
      >
        <NearbyCommodityImporters commodity={r} />
      </Collapsible>
    </>
  )
}
