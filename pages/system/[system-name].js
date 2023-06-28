import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
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
        setNearbySystems(nearbySystems.filter((s, i) => i < 100))

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
          <table className='properties-table'>
            <tbody>
              <tr>
                <th>System address</th>
                <td>{system.systemAddress}</td>
              </tr>
              <tr>
                <th>System location</th>
                <td>{system.systemX}, {system.systemY}, {system.systemZ}</td>
              </tr>
              <tr>
                <th>Ardent sector</th>
                <td>{formatSystemSector(system.systemSector)}</td>
              </tr>
              <tr>
                <th>Trade zone</th>
                <td>
                  {system.tradeZone}
                  {system.tradeZoneDistance !== undefined && <small><br />({system.tradeZoneDistance})</small>}
                </td>
              </tr>
              <tr>
                <th># exports</th>
                <td>{exports?.length?.toLocaleString() ?? '-'}</td>
              </tr>
              <tr>
                <th># imports</th>
                <td>{imports?.length?.toLocaleString() ?? '-'}</td>
              </tr>
            </tbody>
          </table>
          <Tabs>
            <TabList>
              <Tab>Nearby<span className='is-hidden-mobile'> Systems</span></Tab>
              <Tab>Imports</Tab>
              <Tab>Exports</Tab>
            </TabList>
            <TabPanel>
              {!nearbySystems && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
              {nearbySystems &&
                <Table
                  className='data-table data-table--striped data-table--interactive'
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
            </TabPanel>
            <TabPanel>
              {!imports && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
              {imports &&
                <Table
                  className='data-table data-table--striped data-table--interactive'
                  columns={[
                    {
                      title: 'Commodity',
                      dataIndex: 'name',
                      key: 'name',
                      align: 'left',
                      className: 'max-width-mobile',
                      render: (v, r) =>
                        <>
                          <i className='icon icarus-terminal-cargo' />{v}<br />
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
                  data={imports}
                  expandable={{
                    expandRowByClick: true,
                    expandedRowRender: r => <NearbyExporters commodity={r} />
                  }}
                />}
            </TabPanel>
            <TabPanel>
              {!exports && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
              {exports &&
                <Table
                  className='data-table data-table--striped data-table--interactive'
                  columns={[
                    {
                      title: 'Commodity',
                      dataIndex: 'name',
                      key: 'name',
                      align: 'left',
                      className: 'max-width-mobile',
                      render: (v, r) =>
                        <>
                          <i className='icon icarus-terminal-cargo' />{v}<br />
                          <small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small>
                          <div className='is-visible-mobile'>
                            <small style={{ textTransform: 'none', opacity: 0.5 }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</small>
                            <table className='data-table--mini'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Stock</span>{r.stock.toLocaleString()} T</td>
                                  <td><span className='data-table__label'>Price</span>{r.buyPrice.toLocaleString()} CR</td>
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
                      title: 'Stock',
                      dataIndex: 'stock',
                      key: 'stock',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile',
                      render: (v) => <>{v.toLocaleString()} T</>
                    },
                    {
                      title: 'Price',
                      dataIndex: 'buyPrice',
                      key: 'buyPrice',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile',
                      render: (v) => <>{v.toLocaleString()} CR</>
                    }
                  ]}
                  data={exports}
                  expandable={{
                    expandRowByClick: true,
                    expandedRowRender: r => <NearbyImporters commodity={r} />
                  }}
                />}
            </TabPanel>
          </Tabs>
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
          className='data-table--mini data-table--striped scrollable'
          columns={[
            {
              title: 'Location',
              dataIndex: 'systemName',
              key: 'systemName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  <span className='is-hidden-mobile'>
                    {r.systemName}<br />
                    <small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small>
                  </span>
                  <div className='is-visible-mobile'>
                    <table className='data-table--mini data-table--striped'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td colSpan={2}>
                            {r.systemName} <span style={{ opacity: 0.5 }}> ({r.distance} Ly) </span>
                            <br />
                            <small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small>
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
              title: 'Distance',
              dataIndex: 'distance',
              key: 'distance',
              align: 'right',
              className: 'is-hidden-mobile',
              render: (v) => <span style={{ opacity: 0.5 }}>{v} Ly</span>
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
              render: (v) => <>{v.toLocaleString()} T</>
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
          className='data-table--mini data-table--striped scrollable'
          columns={[
            {
              title: 'Location',
              dataIndex: 'systemName',
              key: 'systemName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  <span className='is-hidden-mobile'>
                    {r.systemName}<br />
                    <small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small>
                  </span>
                  <div className='is-visible-mobile'>
                    <table className='data-table--mini data-table--striped'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td colSpan={2}>
                            {r.systemName} <span style={{ opacity: 0.5 }}> ({r.distance} Ly) </span>
                            <br />
                            <small>{r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}</small>
                          </td>
                        </tr>
                        <tr>
                          <td><span class='data-table__label'>Stock</span>{r.stock.toLocaleString()} T</td>
                          <td><span class='data-table__label'>Price</span>{r.buyPrice.toLocaleString()} CR</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
            },
            {
              title: 'Distance',
              dataIndex: 'distance',
              key: 'distance',
              align: 'right',
              className: 'is-hidden-mobile',
              render: (v) => <span style={{ opacity: 0.5 }}>{v} Ly</span>
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
              title: 'Stock',
              dataIndex: 'stock',
              key: 'stock',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
              render: (v) => <>{v.toLocaleString()} T</>
            },
            {
              title: 'Price',
              dataIndex: 'buyPrice',
              key: 'buyPrice',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
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
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/nearby?maxDistance=25`)
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
