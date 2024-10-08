import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from './collapsible-trigger'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import { API_BASE_URL, UNLIMTED_DEMAND_TEXT, NO_DEMAND_TEXT } from 'lib/consts'
import NearbyCommodityImporters from './nearby-commodity-importers'
import NearbyCommodityExporters from './nearby-commodity-exporters'

async function getImportsForCommodityBySystem (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  const imports = await res.json()
  if (!imports || imports.error) return [] // Handle system not found
  return imports.filter(c => c.commodityName === commodityName)
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
            <div>
              <StationIcon stationType={r.fleetCarrier === 1 ? 'Fleet Carrier' : r.stationType} />
              {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
              {(r?.distanceToArrival ?? null) !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
              <div className='is-visible-mobile'>
                <span style={{ textTransform: 'none', opacity: 0.75, paddingLeft: '2rem' }}>
                  {r.systemName} <span style={{ opacity: 0.75, textTransform: 'none' }}>{r.distance ? <>{r.distance} Ly</> :''}</span>
                </span>
                <table className='data-table--mini data-table--compact two-column-table'>
                  <tbody style={{ textTransform: 'uppercase' }}>
                    <tr>
                      <td>
                        <span className='data-table__label'>Demand</span>
                        {r.demand > 0 && <TradeBracketIcon bracket={r.demandBracket} />}
                        {r.demand > 0 ? `${r.demand.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>}
                      </td>
                      <td><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
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
          render: (v) => <span style={{ opacity: 0.5 }}>{v}</span>
        },
        {
          title: 'Dist',
          dataIndex: 'distance',
          key: 'distance',
          align: 'right',
          width: 110,
          className: 'is-hidden-mobile no-wrap',
          render: (v) => <span style={{ opacity: 0.5 }}>{v ? <>{v.toLocaleString()} ly</> : '?'}</span>,
          hidden: !window.localStorage?.getItem('locationFilter')
        },
        {
          title: 'Updated',
          dataIndex: 'updatedAt',
          key: 'updatedAt',
          align: 'right',
          width: 110,
          className: 'is-hidden-mobile no-wrap',
          render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
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
              {v > 0 ? `${v.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>}
              {r.demand > 0 && <TradeBracketIcon bracket={r.demandBracket} />}
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
      expandable={{
        expandRowByClick: true,
        expandedRowRender: (r) => <ExpandedRow r={r} />
      }}
    />
  )
}

function ExpandedRow ({ r }) {
  if (!r) return

  const [imports, setImports] = useState()

  useEffect(() => {
    (async () => {
      const commodityName = r.symbol
      const systemName = r.systemName
      const imports = await getImportsForCommodityBySystem(systemName, commodityName)
      setImports(imports)
    })()
  }, [r])

  if (!imports) {
    return (
      <>
        <p style={{ whiteSpace: 'normal', marginTop: '.5rem' }}>
          Demand for <strong>{r.name}</strong> in <Link href={`/system/${r.systemName}`}>{r.systemName}</Link> ...
        </p>
        <div className='loading-bar loading-bar--table-row' />
      </>
    )
  }

  return (
    <>
      <p style={{ whiteSpace: 'normal', marginTop: '.5rem' }}>
        Demand for <strong>{r.name}</strong> in <Link href={`/system/${r.systemName}`}>{r.systemName}</Link>
      </p>
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
                <StationIcon stationType={r.fleetCarrier === 1 ? 'Fleet Carrier' : r.stationType} />
                {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                {(r?.distanceToArrival ?? null) !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                <div className='is-visible-mobile'>
                  <table className='data-table--mini data-table--compact two-column-table'>
                    <tbody style={{ textTransform: 'uppercase' }}>
                      <tr>
                        <td>
                          <span className='data-table__label'>Demand</span>
                          {r.demandBracket !== 0 && r.demand > 0 && <TradeBracketIcon bracket={r.demandBracket} />}
                          {r.demandBracket === 0
                            ? <small>{NO_DEMAND_TEXT}</small>
                            : v > 0 ? `${v.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>}
                        </td>
                        <td><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
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
            render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
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
                {r.demandBracket === 0
                  ? <small>{NO_DEMAND_TEXT}</small>
                  : v > 0 ? `${v.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>}
                {r.demandBracket !== 0 && r.demand > 0 && <TradeBracketIcon bracket={r.demandBracket} />}
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
