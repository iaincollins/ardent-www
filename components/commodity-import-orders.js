import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import { timeBetweenTimestamps } from '../lib/utils/dates'
import { API_BASE_URL } from '../lib/consts'

export default ({ commodities }) => {
  return (
    <Table
      className='data-table'
      columns={[
        {
          title: 'System',
          dataIndex: 'systemName',
          key: 'systemName',
          align: 'left',
          render: (v, r) =>
            <>
              <i className='icon icarus-terminal-star' />
              {v}
              <br />
              <small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small>
              <br />
              <small style={{ textTransform: 'none', opacity: 0.5 }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
            </>
        },
        {
          title: 'Demand',
          dataIndex: 'demand',
          key: 'demand',
          align: 'right',
          render: (v) => <>{v.toLocaleString()} T</>
        },
        {
          title: 'Price',
          dataIndex: 'sellPrice',
          key: 'sellPrice',
          align: 'right',
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
      <p style={{ marginTop: '.5rem' }}>
        Demand for <strong>{record.name}</strong> in
        {' '}
        <Link href={`/system/${record.systemName}`}>
          <strong>{record.systemName}</strong>
        </Link>
      </p>
      <Table
        className='data-table--mini scrollable'
        columns={[
          {
            title: 'Location',
            dataIndex: 'stationName',
            key: 'stationName',
            align: 'left',
            render: (v, r) => <>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</>
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'right',
            render: (v) => <>{timeBetweenTimestamps(v)} ago</>
          },
          {
            title: 'Demand',
            dataIndex: 'demand',
            key: 'demand',
            align: 'right',
            render: (v) => <>{v.toLocaleString()} T</>
          },
          {
            title: 'Price',
            dataIndex: 'sellPrice',
            key: 'sellPrice',
            align: 'right',
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
