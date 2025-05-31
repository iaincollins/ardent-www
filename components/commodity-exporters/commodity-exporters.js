import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from 'components/collapsible-trigger'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from 'components/trade-bracket'
import StationIcon from 'components/station-icon'
import { API_BASE_URL } from 'lib/consts'
import CommodityImportersNearby from 'components/commodity-importers/commodity-importers-nearby'
import CommodityExportersNearby from 'components/commodity-exporters/commodity-exporters-nearby'
import animateTableEffect from 'lib/animate-table-effect'

async function getExportsForCommodityBySystem (systemAddress, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v2/system/address/${systemAddress}/commodity/name/${commodityName}`)
  const exports = await res.json()
  if (!exports || exports.error) return [] // Handle system not found
  return exports.filter(c => c.stock > 0)
}

export default ({ tableName = 'Exporters', commodities }) => {
  useEffect(animateTableEffect)

  return (
    <Table
      className='data-table data-table--striped data-table--interactive data-table--animated'
      columns={[
        {
          title: tableName,
          dataIndex: 'stationName',
          key: 'stationName',
          align: 'left',
          className: 'max-width-mobile',
          render: (v, r) =>
            <div>
              <StationIcon station={r}>
                {r.stationName}
                {r.distanceToArrival !== undefined && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                <span className='is-visible-mobile'>
                  <br />
                  {r.systemName}
                  {r.distance !== undefined && <small style={{ textTransform: 'none' }}> {r.distance.toLocaleString()} ly</small>}
                </span>
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
                <small>{timeBetweenTimestamps(r.updatedAt)} ago</small>
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
              {r.systemName}
              {r.distance !== undefined && <small style={{ textTransform: 'none' }}> {r.distance.toLocaleString()} ly</small>}
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
          render: (v) => <small>{timeBetweenTimestamps(v)}</small>
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
      rowKey={(r) => `commodity_export_orders_${r.marketId}_${r.commodityName}`}
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
    return <div className='loading-bar loading-bar--table-row' />
  }

  return (
    <>
      <Collapsible
        trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> in {r.systemName}</CollapsibleTrigger>}
        triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> in {r.systemName}</CollapsibleTrigger>}
        open
      >
        <Table
          className='data-table--mini data-table--striped data-table--animated scrollable'
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
              render: (v, r) => <Link href={`/system/${r.systemAddress}`}>{v}</Link>
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile no-wrap',
              render: (v) => <small>{timeBetweenTimestamps(v)}</small>
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
          rowKey={(r) => `commodity_export_orders_expanded_${r.marketId}_${r.commodityName}`}
        />
      </Collapsible>
      <Collapsible
        trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
        triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
      >
        <CommodityExportersNearby commodity={r} />
      </Collapsible>
      <Collapsible
        trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
        triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
      >
        <CommodityImportersNearby commodity={r} />
      </Collapsible>
      {/* <p className='table-row-expanded-link'>
        <Link className='button--small' href={`/system/${r.systemAddress}`}>
          <i className='station-icon icarus-terminal-star' />
          {r.systemName}
        </Link>
      </p> */}
    </>
  )
}
