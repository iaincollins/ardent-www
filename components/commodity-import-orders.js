import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from '../lib/utils/dates'
import { API_BASE_URL } from '../lib/consts'

export default ({ commodities }) => {
  return (
    <Table
      className='data-table data-table--interactive'
      columns={[
        {
          title: 'System',
          dataIndex: 'systemName',
          key: 'systemName',
          align: 'left',
          className: 'max-width-mobile',
          render: (v, r) =>
            <>
              <i className='icon icarus-terminal-star' />{v}<br />
              <small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small>
              <div className='is-visible-mobile'>
                <small style={{ textTransform: 'none', opacity: 0.5 }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</small>
                <table className='data-table--mini'>
                  <tbody style={{ textTransform: 'uppercase' }}>
                    <tr>
                      <td><span className='data-table__label'>Demand</span>{r.demand.toLocaleString()} T</td>
                      <td><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
        },
        {
          title: 'Updated',
          dataIndex: 'updatedAt',
          key: 'updatedAt',
          align: 'right',
          width: 150,
          className: 'is-hidden-mobile',
          render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)} ago</span>
        },
        {
          title: 'Demand',
          dataIndex: 'demand',
          key: 'demand',
          align: 'right',
          width: 150,
          className: 'is-hidden-mobile',
          render: (v) => <>{v.toLocaleString()} T</>
        },
        {
          title: 'Price',
          dataIndex: 'sellPrice',
          key: 'sellPrice',
          align: 'right',
          width: 150,
          className: 'is-hidden-mobile',
          render: (v) => <>{v.toLocaleString()} CR</>
        }
      ]}
      data={commodities}
      expandable={{
        expandRowByClick: true,
        expandedRowRender: (record) => <ExpandedRow record={record} />
      }}
    />
  )
}

function ExpandedRow ({ record }) {
  if (!record) return

  const [imports, setImports] = useState()

  useEffect(() => {
    (async () => {
      const commodityName = record.symbol
      const systemName = record.systemName
      const imports = await getImportsForCommodityBySystem(systemName, commodityName)
      setImports(imports)
    })()
  }, [record])

  if (!imports) return <div className='loading-bar' style={{ marginTop: '.75rem' }} />

  return (
    <>
      <p style={{ whiteSpace: 'normal', marginTop: '.5rem' }}>
        Demand for <strong>{record.name}</strong> in
        {' '}
        <Link href={`/system/${record.systemName}`}>
          <strong>{record.systemName}</strong>
        </Link>
      </p>
      <Table
        className='data-table--mini data-table--striped-not-mobile scrollable'
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
                  <table className='data-table--mini data-table--striped'>
                    <tbody style={{ textTransform: 'uppercase' }}>
                      <tr>
                        <td colSpan={2}>
                          {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                          <br />
                          <span style={{ textTransform: 'none', opacity: 0.5 }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</span>
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
            width: 120,
            className: 'is-hidden-mobile',
            render: (v) => <>{v.toLocaleString()} T</>
          },
          {
            title: 'Price',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            align: 'right',
            width: 120,
            className: 'is-hidden-mobile',
            render: (v) => <>{v.toLocaleString()} CR</>
          }
        ]}
        showHeader={false}
        data={imports}
      />
    </>
  )
}

async function getImportsForCommodityBySystem (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  const exports = await res.json()
  return exports.filter(c => c.commodityName === commodityName)
}
