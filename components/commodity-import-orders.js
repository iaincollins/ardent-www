import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { timeBetweenTimestamps } from '../lib/utils/dates'
import { API_BASE_URL } from '../lib/consts'
import NearbyCommodityImporters from './nearby-commodity-importers'
import NearbyCommodityExporters from './nearby-commodity-exporters'

async function getImportsForCommodityBySystem (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  const exports = await res.json()
  return exports.filter(c => c.commodityName === commodityName)
}

export default ({ commodities }) => {
  return (
    <Table
      className='data-table data-table--striped data-table--interactive'
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
              <small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small>
              <div className='is-visible-mobile'>
                <table className='data-table--mini data-table--compact two-column-table'>
                  <tbody style={{ textTransform: 'uppercase' }}>
                    <tr>
                      <td><span className='data-table__label'>Demand</span>{r.demand > 0 ? `${r.demand.toLocaleString()} T` : <small>Unlimited</small>}</td>
                      <td><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
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
          title: 'Demand',
          dataIndex: 'demand',
          key: 'demand',
          align: 'right',
          width: 140,
          className: 'is-hidden-mobile',
          render: (v) => <>{v > 0 ? `${v.toLocaleString()} T` : <small>Unlimited</small>}</>
        },
        {
          title: 'Price',
          dataIndex: 'sellPrice',
          key: 'sellPrice',
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
        <div className='loading-bar' style={{ marginTop: '.75rem' }} />
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
            title: 'Location',
            dataIndex: 'stationName',
            key: 'stationName',
            align: 'left',
            className: 'max-width-mobile',
            render: (v, r) =>
              <>
                {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                <div className='is-visible-mobile'>
                  <table className='data-table--mini data-table--compact two-column-table'>
                    <tbody style={{ textTransform: 'uppercase' }}>
                      <tr>
                        <td><span className='data-table__label'>Demand</span>{r.demand > 0 ? `${r.demand.toLocaleString()} T` : <small>Unlimited</small>}</td>
                        <td><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
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
            render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)} ago</span>
          },
          {
            title: 'Demand',
            dataIndex: 'demand',
            key: 'demand',
            align: 'right',
            width: 130,
            className: 'is-hidden-mobile',
            render: (v) => <>{v > 0 ? `${v.toLocaleString()} T` : <small>Unlimited</small>}</>
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
        data={imports}
      />
      <Collapsible
        trigger={
          <p className='trade-orders__trigger' style={{ marginTop: '1rem' }}>
            <i className='icarus-terminal-chevron-right' style={{ position: 'relative', top: '-.1rem' }} />
            Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong>
          </p>
        }
        triggerWhenOpen={
          <p className='trade-orders__trigger' style={{ marginTop: '1rem' }}>
            <i className='icarus-terminal-chevron-down' style={{ position: 'relative', top: '-.1rem' }} />
            Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong>
          </p>
        }
      >
        <NearbyCommodityExporters commodity={r} />
      </Collapsible>
      <Collapsible
        trigger={
          <p className='trade-orders__trigger' style={{ marginTop: '0rem' }}>
            <i className='icarus-terminal-chevron-right' style={{ position: 'relative', top: '-.1rem' }} />
            Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong>
          </p>
        }
        triggerWhenOpen={
          <p className='trade-orders__trigger' style={{ marginTop: '0rem' }}>
            <i className='icarus-terminal-chevron-down' style={{ position: 'relative', top: '-.1rem' }} />
            Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong>
          </p>
        }
      >
        <NearbyCommodityImporters commodity={r} />
      </Collapsible>
    </>
  )
}
