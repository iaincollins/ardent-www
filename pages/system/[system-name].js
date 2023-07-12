import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { timeBetweenTimestamps } from '../../lib/utils/dates'
import { getCommodities } from '../../lib/commodities'
import { formatSystemSector } from '../../lib/utils/system-sectors'
import distance from '../../lib/utils/distance'
import Loader from '../../components/loader'
import LocalCommodityImporters from '../../components/local-commodity-importers'
import LocalCommodityExporters from '../../components/local-commodity-exporters'
import NearbyCommodityImporters from '../../components/nearby-commodity-importers'
import NearbyCommodityExporters from '../../components/nearby-commodity-exporters'
import {
  API_BASE_URL,
  SOL_COORDINATES,
  COLONIA_COORDINATES
} from '../../lib/consts'

export default () => {
  const router = useRouter()
  const [system, setSystem] = useState()
  const [stationsInSystem, setStationsInSystem] = useState()
  const [fleetCarriersInSystem, setFleetCarriersInSystem] = useState()
  const [nearbySystems, setNearbySystems] = useState()
  const [importOrders, setImportOrders] = useState()
  const [exportOrders, setExportOrders] = useState()
  const [lastUpdatedAt, setLastUpdatedAt] = useState()

  const onSystemsRowClick = (record, index, event) => {
    router.push(`/system/${record.systemName}`)
  }

  useEffect(() => {
    (async () => {
      const systemName = router.query?.['system-name']?.trim()
      if (!systemName) return

      setSystem(undefined)
      setStationsInSystem(undefined)
      setFleetCarriersInSystem(undefined)
      setNearbySystems(undefined)
      setImportOrders(undefined)
      setExportOrders(undefined)
      setLastUpdatedAt(undefined)

      let mostRecentUpdatedAt

      const system = await getSystem(systemName)
      if (system) {
        mostRecentUpdatedAt = system.updatedAt
        setLastUpdatedAt(mostRecentUpdatedAt)
        const systemCoordinates = [system.systemX, system.systemY, system.systemZ]
        if (distance(systemCoordinates, SOL_COORDINATES) <= 200) {
          system.tradeZone = 'Core Systems'
          if (system.systemName !== 'Sol') {
            system.tradeZoneDistance = `${distance(systemCoordinates, SOL_COORDINATES)} Ly from Sol`
          }
        } else if (distance(systemCoordinates, SOL_COORDINATES) <= 400) {
          system.tradeZone = 'Core Systems, Periphery'
          system.tradeZoneDistance = `${distance(systemCoordinates, SOL_COORDINATES)} Ly from Sol`
        } else if (distance(systemCoordinates, COLONIA_COORDINATES) <= 100) {
          system.tradeZone = 'Colonia Region'
          if (system.systemName !== 'Colonia') {
            system.tradeZoneDistance = `${distance(systemCoordinates, COLONIA_COORDINATES)} Ly from Colonia`
          }
        } else {
          system.tradeZone = 'Deep Space'
          system.tradeZoneDistance = (
            <>
              {`${distance(systemCoordinates, SOL_COORDINATES)} Ly from Sol`}
              <br />
              {`${distance(systemCoordinates, COLONIA_COORDINATES)} Ly from Colonia`}
            </>
          )
        }
        const marketsInSystem = await getMarketsInSystem(systemName)
        if (marketsInSystem?.length > 0) {
          setStationsInSystem(marketsInSystem.filter(station => station.fleetCarrier !== 1))
          setFleetCarriersInSystem(marketsInSystem.filter(station => station.fleetCarrier === 1))
        } else {
          setStationsInSystem([])
          setFleetCarriersInSystem([])
        }
      }
      setSystem(system)

      if (system) {
        ;(async () => {
          const importOrders = await getImports(systemName)
          setImportOrders(importOrders)
          importOrders.forEach(order => {
            if (new Date(order.updatedAt).getTime() > new Date(mostRecentUpdatedAt).getTime()) {
              mostRecentUpdatedAt = order.updatedAt
            }
          })
          setLastUpdatedAt(mostRecentUpdatedAt)
        })()

        ;(async () => {
          const exportOrders = await getExports(systemName)
          setExportOrders(exportOrders)
          exportOrders.forEach(order => {
            if (new Date(order.updatedAt).getTime() > new Date(mostRecentUpdatedAt).getTime()) {
              mostRecentUpdatedAt = order.updatedAt
            }
          })
          setLastUpdatedAt(mostRecentUpdatedAt)
        })()

        ;(async () => {
          const nearbySystems = await getNearbySystems(systemName)
          nearbySystems.forEach(s => {
            s.distance = distance(
              [system.systemX, system.systemY, system.systemZ],
              [s.systemX, s.systemY, s.systemZ]
            )
          })
          setNearbySystems(nearbySystems.filter((s, i) => i < 100))
        })()
      }
    })()
  }, [router.query['system-name']])

  return (
    <>
      <ul className='breadcrumbs'>
        <li><Link href='/'>Home</Link></li>
        <li><Link href='/commodities'>Systems</Link></li>
      </ul>
      {system === undefined && <Loader />}
      {system === null && <><h2>Error</h2><p className='clear'>System not found</p></>}
      {system &&
        <>
          <h2>
            <i className='icon icarus-terminal-system-orbits' />
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
                  {system.tradeZoneDistance !== undefined && <small style={{ textTransform: 'none' }}><br />{system.tradeZoneDistance}</small>}
                </td>
              </tr>
              <tr>
                <th>Trade markets</th>
                <td>
                  {stationsInSystem?.length > 0 &&
                    <Collapsible
                      trigger={
                        <p className='collapsible__trigger'>
                          <i className='collapsible__trigger-icon icarus-terminal-chevron-right' style={{ position: 'relative', top: '-.1rem' }} />
                          <span className='collapsible__trigger-text'>{stationsInSystem.length} {stationsInSystem.length === 1 ? 'market' : 'markets'}</span>
                        </p>
                      }
                      triggerWhenOpen={
                        <p className='collapsible__trigger'>
                          <i className='collapsible__trigger-icon icarus-terminal-chevron-down' style={{ position: 'relative', top: '-.1rem' }} />
                          <span className='collapsible__trigger-text'>{stationsInSystem.length} {stationsInSystem.length === 1 ? 'market' : 'markets'}</span>
                        </p>
                      }
                    >
                      <ul>
                        {stationsInSystem.map(station =>
                          <Fragment key={`marketId_${station.marketId}`}>
                            <li>{station.stationName}</li>
                          </Fragment>
                        )}
                      </ul>
                    </Collapsible>}
                  {stationsInSystem?.length === 0 && <span className='muted'>No markets</span>}
                  {stationsInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Trade Carriers</th>
                <td>
                  {fleetCarriersInSystem?.length > 0 &&
                    <Collapsible
                      trigger={
                        <p className='collapsible__trigger'>
                          <i className='collapsible__trigger-icon icarus-terminal-chevron-right' style={{ position: 'relative', top: '-.1rem' }} />
                          <span className='collapsible__trigger-text'>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'carrier' : 'carriers'}</span>
                        </p>
                      }
                      triggerWhenOpen={
                        <p className='collapsible__trigger'>
                          <i className='collapsible__trigger-icon icarus-terminal-chevron-down' style={{ position: 'relative', top: '-.1rem' }} />
                          <span className='collapsible__trigger-text'>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'carrier' : 'carriers'}</span>
                        </p>
                      }
                    >
                      <ul>
                        {fleetCarriersInSystem.map(station =>
                          <Fragment key={`marketId_${station.marketId}`}>
                            <li>{station.stationName}</li>
                          </Fragment>
                        )}
                      </ul>
                    </Collapsible>}
                  {fleetCarriersInSystem?.length === 0 && <span className='muted'>No carriers</span>}
                  {fleetCarriersInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Last update</th>
                {/* <td>{timeBetweenTimestamps(system.updatedAt)} ago</td> */}
                <td>{timeBetweenTimestamps(lastUpdatedAt)} ago</td>
              </tr>
            </tbody>
          </table>
          <Tabs>
            <TabList>
              <Tab>
                <span className='is-hidden-mobile'>Imports</span>
                <span className='is-visible-mobile'>Imp</span>
                {importOrders !== undefined && ` [${importOrders.length}]`}
              </Tab>
              <Tab>
                <span className='is-hidden-mobile'>Exports</span>
                <span className='is-visible-mobile'>Exp</span>
                {exportOrders !== undefined && ` [${exportOrders.length}]`}
              </Tab>
              <Tab>Nearby</Tab>
            </TabList>
            <TabPanel>
              {!importOrders && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
              {importOrders &&
                <Table
                  className='data-table data-table--striped data-table--interactive'
                  columns={[
                    {
                      title: 'Commodities imported',
                      dataIndex: 'name',
                      key: 'name',
                      align: 'left',
                      className: 'max-width-mobile',
                      render: (v, r) =>
                        <>
                          <i className='icon icarus-terminal-cargo' />{v}{r?.consumer === true && <> <small>(Consumer)</small></>}<br />
                          <small>{r.importOrders.length === 1 ? '1 importer ' : `${r.importOrders.length} importers`}</small>
                          <div className='is-visible-mobile'>
                            <table className='data-table--mini data-table--compact two-column-table'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Total demand</span>{r.totalDemand > 0 ? `${r.totalDemand.toLocaleString()} T` : <small>Unlimited</small>}</td>
                                  <td>
                                    <span className='data-table__label'>Price</span>
                                    {r.avgPrice.toLocaleString()} CR
                                    <br />
                                    {r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                                    {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                                  </td>
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
                      width: 150,
                      className: 'is-hidden-mobile',
                      render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)} ago</span>
                    },
                    {
                      title: 'Total demand',
                      dataIndex: 'totalDemand',
                      key: 'totalDemand',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile',
                      render: (v) => <>{v > 0 ? `${v.toLocaleString()} T` : <small>Unlimited</small>}</>
                    },
                    {
                      title: 'Avg price',
                      dataIndex: 'avgPrice',
                      key: 'avgPrice',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile',
                      render: (v, r) =>
                        <>
                          {v.toLocaleString()} CR
                          <br />
                          {r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                          {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                        </>
                    }
                  ]}
                  data={importOrders}
                  expandable={{
                    expandRowByClick: true,
                    expandedRowRender: r =>
                      <>
                        <p style={{ marginTop: '.5rem' }}>
                          Demand for <Link href={`/commodity/${r.symbol}`}>{r.name}</Link> in <strong>{r.systemName}</strong>
                        </p>
                        <LocalCommodityImporters
                          commodityName={r.name}
                          commoditySymbol={r.symbol}
                          commodityOrders={r.importOrders}
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
                  }}
                />}
            </TabPanel>
            <TabPanel>
              {!exportOrders && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
              {exportOrders &&
                <Table
                  className='data-table data-table--striped data-table--interactive'
                  columns={[
                    {
                      title: 'Commodities exported',
                      dataIndex: 'name',
                      key: 'name',
                      align: 'left',
                      className: 'max-width-mobile',
                      render: (v, r) =>
                        <>
                          <i className='icon icarus-terminal-cargo' />{v}{r?.producer === true && <> <small>(Producer)</small></>}<br />
                          <small>{r.exportOrders.length === 1 ? '1 exporter ' : `${r.exportOrders.length} exporters`}</small>
                          <div className='is-visible-mobile'>
                            <table className='data-table--mini two-column-table data-table--compact'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Total stock</span>{r.totalStock.toLocaleString()} T</td>
                                  <td>
                                    <span className='data-table__label'>Price</span>
                                    {r.avgPrice.toLocaleString()} CR
                                    <br />
                                    {r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                                    {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                                  </td>
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
                      width: 150,
                      className: 'is-hidden-mobile',
                      render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)} ago</span>
                    },
                    {
                      title: 'Total stock',
                      dataIndex: 'totalStock',
                      key: 'totalStock',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile',
                      render: (v) => <>{v.toLocaleString()} T</>
                    },
                    {
                      title: 'Avg price',
                      dataIndex: 'avgPrice',
                      key: 'avgPrice',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile',
                      render: (v, r) =>
                        <>
                          {v.toLocaleString()} CR
                          <br />
                          {r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                          {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                        </>
                    }
                  ]}
                  data={exportOrders}
                  expandable={{
                    expandRowByClick: true,
                    expandedRowRender: r =>
                      <>
                        <p style={{ marginTop: '.5rem' }}>
                          Stock of <Link href={`/commodity/${r.symbol}`}>{r.name}</Link> in <strong>{r.systemName}</strong>
                        </p>
                        <LocalCommodityExporters
                          commodityName={r.name}
                          commoditySymbol={r.symbol}
                          commodityOrders={r.exportOrders}
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
                  }}
                />}
            </TabPanel>
            <TabPanel>
              {!nearbySystems && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
              {nearbySystems &&
                <Table
                  className='data-table data-table--striped data-table--interactive'
                  columns={[
                    {
                      title: 'Nearest systems',
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
          </Tabs>
        </>}
    </>
  )
}

async function getSystem (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getMarketsInSystem (systemName) {
  // @TODO No API endpoint for stations yet, so using 'markets' endpoint
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/markets`)
  return (res.status === 200) ? await res.json() : null
}

async function getNearbySystems (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/nearby?maxDistance=25`)
  return await res.json()
}

async function getExports (systemName) {
  const allCommodities = await getCommodities()
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/exports`)
  const exportOrders = await res.json()
  const exportOrdersGroupedByCommodity = {}
  exportOrders.forEach(c => {
    const symbol = c.commodityName.toLowerCase()

    if (!exportOrdersGroupedByCommodity[symbol]) {
      exportOrdersGroupedByCommodity[symbol] = {
        key: symbol,
        symbol,
        name: (allCommodities.find(el => el.symbol.toLowerCase() === symbol))?.name ?? c.commodityName,
        category: (allCommodities.find(el => el.symbol.toLowerCase() === symbol))?.category ?? '',
        systemName: c.systemName,
        totalStock: 0,
        totalPrice: 0,
        avgPrice: 0,
        bestPrice: null,
        galacticAvgPrice: (allCommodities.find(el => el.symbol.toLowerCase() === symbol))?.avgSellPrice ?? 0,
        updatedAt: null,
        producer: c.statusFlags?.includes('Producer') ?? false,
        exportOrders: []
      }
    }

    exportOrdersGroupedByCommodity[symbol].exportOrders.push(c)
    exportOrdersGroupedByCommodity[symbol].totalStock += c.stock
    exportOrdersGroupedByCommodity[symbol].totalPrice += c.buyPrice * c.stock
    exportOrdersGroupedByCommodity[symbol].avgPrice = Math.round(exportOrdersGroupedByCommodity[symbol].totalPrice / exportOrdersGroupedByCommodity[symbol].totalStock)
    if (exportOrdersGroupedByCommodity[symbol].bestPrice === null ||
        c.buyPrice < exportOrdersGroupedByCommodity[symbol].bestPrice) {
      exportOrdersGroupedByCommodity[symbol].bestPrice = c.buyPrice
    }
    if (exportOrdersGroupedByCommodity[symbol].updatedAt === null ||
        c.updatedAt > exportOrdersGroupedByCommodity[symbol].updatedAt) {
      exportOrdersGroupedByCommodity[symbol].updatedAt = c.updatedAt
    }
  })

  return Object.values(exportOrdersGroupedByCommodity)
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function getImports (systemName) {
  const allCommodities = await getCommodities()
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  const importOrders = await res.json()
  const importOrdersGroupedByCommodity = {}
  importOrders.forEach(c => {
    const symbol = c.commodityName.toLowerCase()
    const commodityMetadata = allCommodities.find(el => el.symbol.toLowerCase() === symbol)
    if (!commodityMetadata) return
    if (!c.sellPrice) return

    if (!importOrdersGroupedByCommodity[symbol]) {
      importOrdersGroupedByCommodity[symbol] = {
        key: symbol,
        symbol,
        name: commodityMetadata?.name ?? c.commodityName,
        category: commodityMetadata?.category ?? '',
        systemName: c.systemName,
        totalDemand: 0,
        totalPrice: 0,
        avgPrice: 0,
        bestPrice: null,
        galacticAvgPrice: commodityMetadata?.avgSellPrice ?? 0,
        updatedAt: null,
        consumer: c.statusFlags?.includes('Consumer') ?? false,
        importOrders: []
      }
    }

    importOrdersGroupedByCommodity[symbol].importOrders.push(c)
    importOrdersGroupedByCommodity[symbol].totalDemand += c.demand
    if (importOrdersGroupedByCommodity[symbol].totalDemand > 0) {
      importOrdersGroupedByCommodity[symbol].totalPrice += c.sellPrice * c.demand
      importOrdersGroupedByCommodity[symbol].avgPrice = Math.round(importOrdersGroupedByCommodity[symbol].totalPrice / importOrdersGroupedByCommodity[symbol].totalDemand)
    } else if (!importOrdersGroupedByCommodity[symbol].avgPrice) {
      importOrdersGroupedByCommodity[symbol].avgPrice = c.sellPrice
    }
    if (importOrdersGroupedByCommodity[symbol].bestPrice === null ||
        c.sellPrice > importOrdersGroupedByCommodity[symbol].bestPrice) {
      importOrdersGroupedByCommodity[symbol].bestPrice = c.sellPrice
    }
    if (importOrdersGroupedByCommodity[symbol].updatedAt === null ||
        c.updatedAt > importOrdersGroupedByCommodity[symbol].updatedAt) {
      importOrdersGroupedByCommodity[symbol].updatedAt = c.updatedAt
    }
  })

  return Object.values(importOrdersGroupedByCommodity)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// function average (arr) { return arr.reduce((a, b) => a + b) / arr.length }
