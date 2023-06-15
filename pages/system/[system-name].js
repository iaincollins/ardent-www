import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
import prettyoutput from 'prettyoutput'
import { timeBetweenTimestamps } from '../../lib/utils/dates'
import commoditiesInfo from '../../lib/commodities.json'
import { formatSystemSector } from '../../lib/utils/system-sectors'
import distance from '../../lib/utils/distance'

import { API_BASE_URL, SOL_COORDINATES, COLONIA_COORDINATES } from '../../lib/consts'

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

      if (system) {
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
          c.symbol = c.commodityName
          c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
          c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
          delete c.commodityName
          delete c.commodityId
        })
        setExports(exports)

        const imports = await getImports(systemName)
        imports.forEach(c => {
          c.key = c.commodityId
          c.symbol = c.commodityName
          c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
          c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
          delete c.commodityName
          delete c.commodityId
        })
        setImports(imports)
      }
    })()
  }, [router.query['system-name']])

  return (
    <>
      <p className='breadcrumb'>
        <Link href='/'>Home</Link>
        <i className='icarus-terminal-chevron-right' />
        <Link href='/commodities'>System</Link>
      </p>
      {system === undefined && <div className='loading-bar' style={{ marginTop: '1.5rem' }} />}
      {system === null && <><h3>Error</h3><p>System not found</p></>}
      {system &&
        <>
          <h2>{system.systemName}</h2>
          <div>
            <p className='object-information'>
              <label>System Address</label>
              <span>{system.systemAddress}</span>
            </p>
            <p className='object-information'>
              <label>System Location</label>
              <span>{system.systemX}, {system.systemY}, {system.systemZ}</span>
            </p>
            <p className='object-information'>
              <label>Ardent Sector</label>
              <span>{formatSystemSector(system.systemSector)}</span>
            </p>
            <p className='object-information'>
              <label>Trade Zone</label>
              {distance([system.systemX, system.systemY, system.systemZ], SOL_COORDINATES) <= 200 &&
                <span>
                  Core Systems
                  {' '}
                  {system.systemName !== 'Sol' && <>({Math.ceil(distance([system.systemX, system.systemY, system.systemZ], SOL_COORDINATES)).toLocaleString()} Ly from Sol)</>}
                </span>}
              {distance([system.systemX, system.systemY, system.systemZ], SOL_COORDINATES) > 200 &&
              distance([system.systemX, system.systemY, system.systemZ], SOL_COORDINATES) <= 400 &&
                <span>
                  Core Systems, Periphery
                  {' '}
                  ({Math.ceil(distance([system.systemX, system.systemY, system.systemZ], SOL_COORDINATES)).toLocaleString()} Ly from Sol)
                </span>}
              {distance([system.systemX, system.systemY, system.systemZ], COLONIA_COORDINATES) <= 100 &&
                <span>
                  Colonia Systems
                  {' '}
                  {system.systemName !== 'Colonia' && <>({Math.ceil(distance([system.systemX, system.systemY, system.systemZ], COLONIA_COORDINATES)).toLocaleString()} Ly from Colonia)</>}
                </span>}
              {distance([system.systemX, system.systemY, system.systemZ], SOL_COORDINATES) > 400 &&
              distance([system.systemX, system.systemY, system.systemZ], COLONIA_COORDINATES) > 100 &&
                <span>Deep Space</span>}
            </p>
            {/* <p className='object-information'>
              <label>Last Updated</label>
              <span>{timeBetweenTimestamps(system.updatedAt)} ago</span>
            </p> */}
          </div>
          <h2>Nearby Systems</h2>
          {!nearbySystems && <div className='loading-bar' />}
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
          <table style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th align='left'><h3 style={{ margin: 0, top: '.5rem' }}>System Exports</h3></th>
                <th align='left'><h3 style={{ margin: 0, top: '.5rem' }}>System Imports</h3></th>
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
                  {!imports && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
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
  return (res.status === 200) ? await res.json() : null
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
