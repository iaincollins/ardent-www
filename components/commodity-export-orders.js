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

async function getExportsForCommodityBySystem (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/exports`)
  const exports = await res.json()
  return exports.filter(c => c.commodityName === commodityName)
}

export default ({ commodities }) => {
  return (
    <Table
      className='data-table data-table--striped data-table--interactive data-table--animated'
      columns={[
        {
          title: 'Location',
          dataIndex: 'systemName',
          key: 'systemName',
          align: 'left',
          className: 'max-width-mobile',
          render: (v, r) =>
            <>
              <i className='icon icarus-terminal-star' />{v}<br />
              <small>
                {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                {(r?.distanceToArrival ?? null) !== null && <small> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
              </small>
              <div className='is-visible-mobile'>
                <table className='data-table--mini data-table--compact two-column-table'>
                  <tbody style={{ textTransform: 'uppercase' }}>
                    <tr>
                      <td>
                        <span className='data-table__label'>Stock</span>
                        <TradeBracketIcon bracket={r.stockBracket} />
                        {r.stock.toLocaleString()} T
                      </td>
                      <td><span className='data-table__label'>Price</span>{r.buyPrice.toLocaleString()} CR</td>
                    </tr>
                  </tbody>
                </table>
                <small style={{ textTransform: 'none' }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</small>
              </div>
            </>
        },
        {
          title: 'Updated',
          dataIndex: 'updatedAt',
          key: 'updatedAt',
          align: 'right',
          width: 110,
          className: 'is-hidden-mobile',
          render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)} ago</span>
        },
        {
          title: 'Stock',
          dataIndex: 'stock',
          key: 'stock',
          align: 'right',
          width: 140,
          className: 'is-hidden-mobile',
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
          className: 'is-hidden-mobile',
          render: (v) => <>{v.toLocaleString()} CR</>
        }
      ]}
      data={commodities}
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
      const commodityName = r.symbol
      const systemName = r.systemName
      const exports = await getExportsForCommodityBySystem(systemName, commodityName)
      setExports(exports)
    })()
  }, [r.commodityName])

  if (!exports) {
    return (
      <>
        <p style={{ whiteSpace: 'normal', marginTop: '.5rem' }}>
          Stock of <strong>{r.name}</strong> in <Link href={`/system/${r.systemName}`}>{r.systemName}</Link> ...
        </p>
        <div className='loading-bar' style={{ marginTop: '.75rem' }} />
      </>
    )
  }

  return (
    <>
      <p style={{ whiteSpace: 'normal', marginTop: '.5rem' }}>
        Stock of <strong>{r.name}</strong> in <Link href={`/system/${r.systemName}`}>{r.systemName}</Link>
      </p>
      <Table
        className='data-table--mini data-table--striped scrollable'
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
                {(r?.distanceToArrival ?? null) !== null && <small> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                <div className='is-visible-mobile'>
                  <table className='data-table--mini data-table--compact two-column-table'>
                    <tbody style={{ textTransform: 'uppercase' }}>
                      <tr>
                        <td>
                          <span className='data-table__label'>Stock</span>
                          <TradeBracketIcon bracket={r.stockBracket} />
                          {r.stock.toLocaleString()} T
                        </td>
                        <td><span className='data-table__label'>Price</span>{r.buyPrice.toLocaleString()} CR</td>
                      </tr>
                    </tbody>
                  </table>
                  <small style={{ textTransform: 'none' }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</small>
                </div>
              </>
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'right',
            width: 130,
            className: 'is-hidden-mobile',
            render: (v) => <>{timeBetweenTimestamps(v)} ago</>
          },
          {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            align: 'right',
            width: 130,
            className: 'is-hidden-mobile',
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
            className: 'is-hidden-mobile',
            render: (v) => <>{v.toLocaleString()} CR</>
          }
        ]}
        data={exports}
        rowKey='commodityId'
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
