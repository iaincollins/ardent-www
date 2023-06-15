import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
import prettyoutput from 'prettyoutput'
import commoditiesInfo from '../../lib/commodities.json'

import { API_BASE_URL } from '../../lib/consts'

export default () => {
  const router = useRouter()
  const [commodity, setCommodity] = useState()
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()

  useEffect(() => {
    (async () => {
      const commodityName = router.query?.['commodity-name']
      if (!commodityName) return

      const c = await getCommodity(commodityName)
      c.avgProfit = c.avgSellPrice - c.avgBuyPrice
      c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
      c.maxProfit = c.maxSellPrice - c.minBuyPrice
      c.symbol = c.commodityName
      c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
      c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
      delete c.commodityName
      setCommodity(c)

      const exports = await getExports(commodityName)
      exports.forEach(c => {
        c.key = c.commodityId
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityId
        delete c.commodityName
      })
      setExports(exports)

      const imports = await getImports(commodityName)
      imports.forEach(c => {
        c.key = c.commodityId
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityId
        delete c.commodityName
      })
      setImports(imports)
    })()
  }, [router.query['commodity-name']])

  return (
    <>
      <p className='breadcrumb'>
        <Link href='/'>Home</Link>
        <i className='icarus-terminal-chevron-right' />
        <Link href='/commodities'>Commodities</Link>
      </p>
      {!commodity && <div className='loading-bar' style={{ marginTop: '1.5rem' }} />}
      {commodity &&
        <>
          <h2>{commodity.name}</h2>
          <p style={{ margin: 0 }}><small>{commodity.category}</small></p>
          <pre>{prettyoutput(commodity)}</pre>
          <table>
            <thead>
              <tr>
                <th align='left'><h3 style={{ margin: 0, top: '.5rem' }}>Exports</h3></th>
                <th align='left'><h3 style={{ margin: 0, top: '.5rem' }}>Imports</h3></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td valign='top' style={{ width: '50%' }}>
                  {!exports && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
                  {exports &&
                    <Table
                      className='data-table'
                      columns={[
                        {
                          title: 'System',
                          dataIndex: 'systemName',
                          key: 'systemName',
                          align: 'left',
                          render: (v, r) => <>{v}<br /> <small>{r.stationName}</small></>
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
                      data={exports}
                      expandable={{
                        expandRowByClick: true,
                        expandedRowRender: (record) => <ExpandedExportsRow record={record} />
                      }}
                    />}
                </td>
                <td valign='top' style={{ width: '50%' }}>
                  {!imports && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
                  {imports &&
                    <Table
                      className='data-table'
                      columns={[
                        {
                          title: 'System',
                          dataIndex: 'systemName',
                          key: 'systemName',
                          align: 'left',
                          render: (v, r) => <>{v}<br /> <small>{r.stationName}</small></>
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
                      data={imports}
                      expandable={{
                        expandRowByClick: true,
                        expandedRowRender: (record) => <ExpandedImportsRow record={record} />
                      }}
                    />}
                </td>
              </tr>
            </tbody>
          </table>
        </>}
    </>
  )
}

function ExpandedExportsRow ({ record }) {
  if (!record) return

  const [exports, setExports] = useState()

  useEffect(() => {
    (async () => {
      const commodityName = record.symbol
      const systemName = record.systemName
      const exports = await getExportsForCommodityBySystem(systemName, commodityName)
      exports.forEach(c => {
        c.key = c.commodityId
        c.symbol = c.commodityName
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityId
        delete c.commodityName
        delete c.distance
      })
      setExports(exports)
    })()
  }, [record.commodityName])

  if (!exports) return <div className='loading-bar' style={{ marginTop: '.75rem' }} />

  return (
    <>
      {record.name} for sale in
      {' '}
      <Link href={`/system/${record.systemName}`}>
        <strong>{record.systemName}</strong>
      </Link>
      {exports && <pre>{prettyoutput(exports)}</pre>}
    </>
  )
}

function ExpandedImportsRow ({ record }) {
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
      {record.name} in demand in
      {' '}
      <Link href={`/system/${record.systemName}`}>
        <strong>{record.systemName}</strong>
      </Link>
      {imports && <pre>{prettyoutput(imports)}</pre>}
    </>
  )
}

async function getCommodity (commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/commodity/name/${commodityName}`)
  return await res.json()
}

async function getExports (commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/commodity/name/${commodityName}/exports`)
  return await res.json()
}

async function getImports (commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/commodity/name/${commodityName}/imports`)
  return await res.json()
}

async function getExportsForCommodityBySystem (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/exports`)
  const exports = await res.json()
  return exports.filter(c => c.commodityName === commodityName)
}

async function getImportsForCommodityBySystem (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  const imports = await res.json()
  return imports.filter(c => c.commodityName === commodityName)
}
