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
              <small>{r.stationName}</small>
              <br />
              <small style={{ textTransform: 'none', opacity: 0.5 }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
            </>
        },
        {
          title: 'Stock',
          dataIndex: 'stock',
          key: 'stock',
          align: 'right',
          render: (v) => <>{v.toLocaleString()} T</>
        },
        {
          title: 'Price',
          dataIndex: 'buyPrice',
          key: 'buyPrice',
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

  const [exports, setExports] = useState()

  useEffect(() => {
    (async () => {
      const commodityName = record.symbol
      const systemName = record.systemName
      const exports = await getExportsForCommodityBySystem(systemName, commodityName)
      setExports(exports)
    })()
  }, [record.commodityName])

  if (!exports) return <div className='loading-bar' style={{ marginTop: '.75rem' }} />
  return (
    <>
      <p style={{ marginTop: '.5rem' }}>
        <strong>{record.name}</strong> supply in
        {' '}
        <Link href={`/system/${record.systemName}`}>
          <strong>{record.systemName}</strong>
        </Link>
      </p>
      <Table
        className='data-table--mini'
        columns={[
          {
            title: 'Location',
            dataIndex: 'stationName',
            key: 'stationName',
            align: 'left'
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'right',
            render: (v) => <>{timeBetweenTimestamps(v)} ago</>
          },
          {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            align: 'right',
            render: (v) => <>{v.toLocaleString()} T</>
          },
          {
            title: 'Price',
            dataIndex: 'buyPrice',
            key: 'buyPrice',
            align: 'right',
            render: (v) => <>{v.toLocaleString()} CR</>
          }
        ]}
        showHeader={false}
        data={exports}
      />
    </>
  )
}

async function getExportsForCommodityBySystem (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/exports`)
  const exports = await res.json()
  return exports.filter(c => c.commodityName === commodityName)
}
