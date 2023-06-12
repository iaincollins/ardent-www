import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
import prettyoutput from 'prettyoutput'
import commoditiesInfo from '../../lib/commodities.json'
import distance from '../../lib/utils/distance'

import { API_BASE_URL } from '../../lib/consts'

export default () => {
  const router = useRouter()
  const [system, setSystem] = useState()
  const [nearbySystems, setNearbySystems] = useState()
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()

  const onSystemsRowClick = (record, index, event) => {
    router.push(`/system/${record.systemName}`)
  }

  useEffect(() => {
    (async () => {
      const systemName = router.query?.['system-name']
      if (!systemName) return

      setSystem(undefined)
      setNearbySystems(undefined)
      setExports(undefined)
      setImports(undefined)

      const system = await getSystem(systemName)
      setSystem(system)

      const nearbySystems = await getNearbySystems(systemName)
      nearbySystems.forEach(s => {
        s.distance = distance(
          [system.systemX, system.systemY, system.systemZ],
          [s.systemX, s.systemY, s.systemZ]
        )
      })
      setNearbySystems(nearbySystems.filter((s, i) => i < 5))
      console.log(nearbySystems)

      const exports = await getExports(systemName)
      exports.forEach(c => {
        c.key = c.commodityId
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
      })
      setExports(exports)

      const imports = await getImports(systemName)
      imports.forEach(c => {
        c.key = c.commodityId
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
      })
      setImports(imports)
    })()
  }, [router.query['system-name']])

  return (
    <>
      <p className='breadcrumb'>
        <Link href='/'>Home</Link>
        {' : '}
        <Link href='/commodities'>System</Link>
      </p>
      {system &&
        <>
          <h2>{system.systemName}</h2>
          <pre>{prettyoutput(system)}</pre>
          <h2>Nearby Systems</h2>
          {nearbySystems &&
            <Table
              className='data-table'
              columns={[
                {
                  title: 'System',
                  dataIndex: 'systemName',
                  key: 'systemName',
                  align: 'left',
                  xrender: (v, r) => <>{v}<br /> <small>{r.stationName}</small></>
                },
                {
                  title: 'Distance',
                  dataIndex: 'distance',
                  key: 'distance',
                  align: 'right',
                  render: (v) => <>{Math.floor(v).toLocaleString()} Ly</>
                }
              ]}
              data={nearbySystems}
              onRow={(record, index) => ({
                onClick: onSystemsRowClick.bind(null, record, index)
              })}
            />}
          <table>
            <thead>
              <tr>
                <th align='left'><h3 style={{ margin: 0 }}>Exports</h3></th>
                <th align='left'><h3 style={{ margin: 0 }}>Imports</h3></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td valign='top' style={{ width: '50%' }}>
                  {!exports && <div className='loading-bar' />}
                  {exports &&
                    <Table
                      className='data-table'
                      columns={[
                        {
                          title: 'Commodity',
                          dataIndex: 'name',
                          key: 'name',
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
                        expandedRowRender: record => <pre>{prettyoutput(record)}</pre>
                      }}
                    />}
                </td>
                <td valign='top' style={{ width: '50%' }}>
                  {!imports && <div className='loading-bar' />}
                  {imports &&
                    <Table
                      className='data-table'
                      columns={[
                        {
                          title: 'Commodity',
                          dataIndex: 'name',
                          key: 'name',
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
                        expandedRowRender: record => <pre>{prettyoutput(record)}</pre>
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

async function getSystem (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}`)
  return await res.json()
}

async function getNearbySystems (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/nearby?maxDistance=20`)
  return await res.json()
}

async function getExports (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/exports`)
  return await res.json()
}

async function getImports (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  return await res.json()
}
