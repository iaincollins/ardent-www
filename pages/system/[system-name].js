import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
import prettyOutput from 'prettyoutput'
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
  const [produces, setProduces] = useState()
  const [consumes, setConsumes] = useState()

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
      setProduces(undefined)
      setConsumes(undefined)

      const system = await getSystem(systemName)
      if (system) {
        const systemCoordinates = [system.systemX, system.systemY, system.systemZ]
        if (distance(systemCoordinates, SOL_COORDINATES) <= 200) {
          system.tradeZone = 'Core Systems'
          if (system.systemName !== 'Sol') {
            system.tradeZoneDistance = `${distance(systemCoordinates, SOL_COORDINATES).toFixed().toLocaleString()} Ly from Sol`
          }
        } else if (distance(systemCoordinates, SOL_COORDINATES) <= 400) {
          system.tradeZone = 'Core Systems, Periphery'
          system.tradeZoneDistance = `${distance(systemCoordinates, SOL_COORDINATES).toFixed().toLocaleString()} Ly from Sol`
        } else if (distance(systemCoordinates, COLONIA_COORDINATES) <= 100) {
          system.tradeZone = 'Colonia Systems'
          if (system.systemName !== 'Colonia') {
            system.tradeZoneDistance = `${distance(systemCoordinates, COLONIA_COORDINATES).toFixed().toLocaleString()} Ly from Colonia`
          }
        } else {
          system.tradeZone = 'Deep Space'
        }
      }
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

        const exports = await getExports(systemName)
        const commoditesProduced = []
        const commoditesConsumed = []
        exports.forEach(c => {
          c.key = c.commodityId
          c.symbol = c.commodityName
          c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
          c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
          delete c.commodityName
          delete c.commodityId
          if (c.statusFlags?.includes('Producer') && c.fleetCarrier !== 1) {
            if (!commoditesProduced.includes(c.name)) { commoditesProduced.push(c.name) }
          }
        })
        setExports(exports)
        // setProduces(commoditesProduced)

        const imports = await getImports(systemName)
        imports.forEach(c => {
          c.key = c.commodityId
          c.symbol = c.commodityName
          c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
          c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
          delete c.commodityName
          delete c.commodityId
          if (c.statusFlags?.includes('Consumer') && c.fleetCarrier !== 1) {
            if (!commoditesConsumed.includes(c.name)) { commoditesConsumed.push(c.name) }
          }
        })
        setImports(imports)
        // setConsumes(commoditesConsumed)
      }
    })()
  }, [router.query['system-name']])

  return (
    <>
      <p className='breadcrumb'>
        <Link href='/'>Home</Link>
        <i className='icarus-terminal-chevron-right' />
        <Link href='/commodities'>Systems</Link>
      </p>
      {system === undefined && <div className='loading-bar' style={{ marginTop: '1.5rem' }} />}
      {system === null && <><h2>Error</h2><p>Error; System not found</p></>}
      {system &&
        <>
          <h2>
            <i className='icon icarus-terminal-system-bodies' />
            {system.systemName}
          </h2>
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
              <span>
                {system.tradeZone}
                {system.tradeZoneDistance !== undefined && <> ({system.tradeZoneDistance})</>}
              </span>
            </p>
            <p className='object-information'>
              <label>Export orders</label>
              <span>{exports?.length?.toLocaleString() ?? '-'}</span>
            </p>
            <p className='object-information'>
              <label>Import orders</label>
              <span>{imports?.length?.toLocaleString() ?? '-'}</span>
            </p>
            {produces !== 'undefined' && (produces?.length ?? 0) > 0 &&
              <p className='object-information'>
                <label>Produces</label>
                <span>{produces?.join(', ')}</span>
              </p>}
            {consumes !== 'undefined' && (consumes?.length ?? 0) > 0 &&
              <p className='object-information'>
                <label>Consumes</label>
                <span>{consumes?.join(', ')}</span>
              </p>}
            {/* <p className='object-information'>
              <label>Last Updated</label>
              <span>{timeBetweenTimestamps(system.updatedAt)} ago</span>
            </p> */}
          </div>
          <h3>Nearby Systems</h3>
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
                  render: (v, r) =>
                    <>
                      <i className='icon icarus-terminal-star' />
                      {v}
                    </>
                },
                {
                  title: 'Distance',
                  dataIndex: 'distance',
                  key: 'distance',
                  align: 'right',
                  render: (v) => v < 1
                    ? '< 1 Ly'
                    : <>{Math.floor(v).toLocaleString()} Ly</>
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
                          render: (v, r) =>
                            <>
                              <i className='icon icarus-terminal-cargo' />
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
                      data={exports}
                      expandable={{
                        expandRowByClick: true,
                        expandedRowRender: r => <NearbyImporters commodity={r} />
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
                          render: (v, r) =>
                            <>
                              <i className='icon icarus-terminal-cargo' />
                              {v}
                              <br />
                              <small>{r.stationName}</small>
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
                      data={imports}
                      expandable={{
                        expandRowByClick: true,
                        expandedRowRender: r => <NearbyExporters commodity={r} />
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

function NearbyImporters ({ commodity }) {
  const [nearbyImporters, setNearbyImporters] = useState()

  useEffect(() => {
    (async () => {
      setNearbyImporters(await getNearbyImportersOfCommodity(commodity.systemName, commodity.symbol))
    })()
  }, [commodity.commodityName, commodity.systemName])

  return (
    <>
      <p style={{ marginTop: '.5rem' }}>
        Demand for <Link href={`/commodity/${commodity.symbol}`}>
          <strong>{commodity.name}</strong>
        </Link> in nearby systems
      </p>
      {!nearbyImporters && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
      {nearbyImporters &&
        <Table
          className='data-table--mini scrollable'
          columns={[
            {
              title: 'Location',
              dataIndex: 'systemName',
              key: 'systemName',
              align: 'left',
              render: (v, r) => <>{v}<br /><small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small></>
            },
            {
              title: 'Distance',
              dataIndex: 'distance',
              key: 'distance',
              align: 'right',
              render: (v) => <>{v} Ly</>
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
          data={nearbyImporters}
        />}
    </>
  )
}

function NearbyExporters ({ commodity }) {
  const [nearbyExporters, setNearbyExporters] = useState()

  useEffect(() => {
    (async () => {
      setNearbyExporters(await getNearbyExportersOfCommodity(commodity.systemName, commodity.symbol))
    })()
  }, [commodity.commodityName, commodity.systemName])

  return (
    <>
      <p style={{ marginTop: '.5rem' }}>
        Supplies of <Link href={`/commodity/${commodity.symbol}`}>
          <strong>{commodity.name}</strong>
        </Link> in nearby systems
      </p>
      {!nearbyExporters && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
      {nearbyExporters &&
        <Table
          className='data-table--mini scrollable'
          columns={[
            {
              title: 'Location',
              dataIndex: 'systemName',
              key: 'systemName',
              align: 'left',
              render: (v, r) => <>{v}<br /><small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small></>
            },
            {
              title: 'Distance',
              dataIndex: 'distance',
              key: 'distance',
              align: 'right',
              render: (v) => <>{v} Ly</>
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
              dataIndex: 'sellPrice',
              key: 'sellPrice',
              align: 'right',
              render: (v) => <>{v.toLocaleString()} CR</>
            }
          ]}
          showHeader={false}
          data={nearbyExporters}
        />}
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

async function getNearbyImportersOfCommodity (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodity/name/${commodityName}/nearby/imports`)
  return await res.json()
}

async function getNearbyExportersOfCommodity (systemName, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodity/name/${commodityName}/nearby/exports`)
  return await res.json()
}
