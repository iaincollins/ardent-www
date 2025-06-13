import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from 'components/collapsible-trigger'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from 'components/trade-bracket'
import StationIcon from 'components/station-icon'
import { API_BASE_URL, NO_DEMAND_TEXT } from 'lib/consts'
import CommodityImportersNearby from 'components/commodity-importers/commodity-importers-nearby'
import CommodityExportersNearby from 'components/commodity-exporters/commodity-exporters-nearby'
import animateTableEffect from 'lib/animate-table-effect'
import CopyOnClick from 'components/copy-on-click'

async function getImportsForCommodityBySystem (systemAddress, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v2/system/address/${systemAddress}/commodity/name/${commodityName}`)
  const imports = await res.json()
  if (!imports || imports.error) return [] // Handle system not found
  return imports.filter(c => (c.demand > 0 || c.demand === 0) && c.sellPrice > 1)
}

export default ({ tableName = 'Importers', commodities, rare }) => {
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
          title: 'Demand',
          dataIndex: 'demand',
          key: 'demand',
          align: 'right',
          width: 140,
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
          width: 140,
          className: 'is-hidden-mobile no-wrap',
          render: (v) => <>{v.toLocaleString()} CR</>
        }
      ]}
      data={commodities}
      rowKey={(r) => `commodity_import_orders_${r.marketId}_${r.commodityName}`}
      expandable={{
        expandRowByClick: true,
        expandedRowRender: (r) => <ExpandedRow r={r} rare={rare} />
      }}
    />
  )
}

function ExpandedRow ({ r, rare }) {
  if (!r) return

  const [imports, setImports] = useState()

  useEffect(() => {
    (async () => {
      const imports = await getImportsForCommodityBySystem(r.systemAddress, r.symbol)
      setImports(imports)
    })()
  }, [r])

  if (!imports) {
    return <div className='loading-bar loading-bar--table-row' />
  }

  return (
    <>
      <Collapsible
        trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> in {r.systemName}</CollapsibleTrigger>}
        triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> in {r.systemName}</CollapsibleTrigger>}
        open
      >
        <Table
          className='data-table--mini data-table--striped scrollable'
          columns={[
            {
              title: 'Importers in system',
              dataIndex: 'stationName',
              key: 'stationName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  <StationIcon station={r}>
                    <CopyOnClick>{r.stationName}</CopyOnClick>
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
              title: 'Demand',
              dataIndex: 'demand',
              key: 'demand',
              align: 'right',
              width: 130,
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
              className: 'is-hidden-mobile no-wrap no-wrap',
              render: (v) => <>{v.toLocaleString()} CR</>
            }
          ]}
          data={imports}
          rowKey={(r) => `commodity_import_orders_expanded_${r.marketId}_${r.commodityName}`}
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
        <CommodityImportersNearby commodity={r} rare={rare} />
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
