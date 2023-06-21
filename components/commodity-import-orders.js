import { useState, useEffect } from 'react'
import Link from 'next/link'
import Table from 'rc-table'
import prettyoutput from 'prettyoutput'
import commoditiesInfo from '../lib/commodities.json'
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
      imports.forEach(c => {
        c.key = c.commodityId
        c.symbol = c.commodityName
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityId
        delete c.commodityName
        delete c.distance
      })
      setImports(imports)
    })()
  }, [record])

  if (!imports) return <div className='loading-bar' style={{ marginTop: '.75rem' }} />

  return (
    <>
      <em>{record.name}</em> in demand in
      {' '}
      <Link href={`/system/${record.systemName}`}>
        <strong>{record.systemName}</strong>
      </Link>
      {imports && <pre>{prettyoutput(imports)}</pre>}
    </>
  )
}

async function getImportsForCommodityBySystem (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  const exports = await res.json()
  return exports.filter(c => c.commodityName === commodityName)
}