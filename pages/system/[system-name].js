import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { timeBetweenTimestamps } from '../../lib/utils/dates'
import commoditiesInfo from '../../lib/commodities.json'
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
  const [nearbySystems, setNearbySystems] = useState()
  const [importOrders, setImportOrders] = useState()
  const [exportOrders, setExportOrders] = useState()
  const [consumes, setConsumes] = useState()
  const [produces, setProduces] = useState()

  const onSystemsRowClick = (record, index, event) => {
    router.push(`/system/${record.systemName}`)
  }

  useEffect(() => {
    (async () => {
      const systemName = router.query?.['system-name']
      if (!systemName) return

      setSystem(undefined)
      setNearbySystems(undefined)
      setImportOrders(undefined)
      setExportOrders(undefined)
      setConsumes(undefined)
      setProduces(undefined)

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

        ;(async () => {
          const { importOrders, commoditesConsumed } = await getImports(systemName)
          setImportOrders(importOrders)
          setConsumes(commoditesConsumed)
        })()

        ;(async () => {
          const { exportOrders, commoditesProduced } = await getExports(systemName)
          setExportOrders(exportOrders)
          setProduces(commoditesProduced)
        })()
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
                <td colspan={2} align='left'>
                  <h3 style={{ marginBottom: '.5rem' }}>Commodities</h3>
                </td>
              </tr>
              <tr>
                <th>Imported</th>
                <td>{importOrders?.length?.toLocaleString() ?? '-'} </td>
              </tr>
              <tr>
                <th>Exported</th>
                <td>{exportOrders?.length?.toLocaleString() ?? '-'}</td>
              </tr>
              <tr>
                <th>Consumes</th>
                <td>{consumes?.length?.toLocaleString() ?? '-'}</td>
              </tr>
              <tr>
                <th>Produces</th>
                <td>{produces?.length?.toLocaleString() ?? '-'} </td>
              </tr>
            </tbody>
          </table>
          <Tabs>
            <TabList>
              <Tab>Imports</Tab>
              <Tab>Exports</Tab>
              <Tab>Nearby</Tab>
            </TabList>
            <TabPanel>
              {!importOrders && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
              {importOrders &&
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
                          <i className='icon icarus-terminal-cargo' />{v}{r?.consumer === true && <> <small>(Consumer)</small></>}<br />
                          <small>{r.importOrders.length} importers</small>
                          <div className='is-visible-mobile'>
                            <small style={{ textTransform: 'none', opacity: 0.5 }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</small>
                            <table className='data-table--mini'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Total demand</span>{r.totalDemand.toLocaleString()} T</td>
                                  <td>
                                    <span className='data-table__label'>Price</span>
                                    {r.avgPrice.toLocaleString()} CR
                                    <br />
                                    <small>MAX {r.bestPrice.toLocaleString()}</small>
                                  </td>
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
                      title: 'Total demand',
                      dataIndex: 'totalDemand',
                      key: 'totalDemand',
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
                          <small>MAX {r.bestPrice.toLocaleString()} CR</small>
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
                      title: 'Commodity',
                      dataIndex: 'name',
                      key: 'name',
                      align: 'left',
                      className: 'max-width-mobile',
                      render: (v, r) =>
                        <>
                          <i className='icon icarus-terminal-cargo' />{v}{r?.producer === true && <> <small>(Producer)</small></>}<br />
                          <small>{r.exportOrders.length} exporters</small>
                          <div className='is-visible-mobile'>
                            <small style={{ textTransform: 'none', opacity: 0.5 }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</small>
                            <table className='data-table--mini'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Total stock</span>{r.totalStock.toLocaleString()} T</td>
                                  <td>
                                    <span className='data-table__label'>Price</span>
                                    {r.avgPrice.toLocaleString()} CR
                                    <br />
                                    <small>MAX {r.bestPrice.toLocaleString()}</small>
                                  </td>
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
                          <small>MAX {r.bestPrice.toLocaleString()} CR</small>
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
          </Tabs>
        </>}
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
  const exportOrders = await res.json()
  const exportOrdersGroupedByCommodity = {}
  exportOrders.forEach(c => {
    c.key = c.commodityId
    c.symbol = c.commodityName
    c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
    c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
    delete c.commodityName
    delete c.commodityId

    if (!exportOrdersGroupedByCommodity[c.name]) {
      exportOrdersGroupedByCommodity[c.name] = {
        key: c.symbol,
        name: c.name,
        symbol: c.symbol,
        category: c.category,
        systemName: c.systemName,
        totalStock: 0,
        totalPrice: 0,
        avgPrice: 0,
        bestPrice: null,
        updatedAt: null,
        producer: c.statusFlags?.includes('Producer') ?? false,
        exportOrders: []
      }
    }

    exportOrdersGroupedByCommodity[c.name].exportOrders.push(c)
    exportOrdersGroupedByCommodity[c.name].totalStock += c.stock
    exportOrdersGroupedByCommodity[c.name].totalPrice += c.buyPrice * c.stock
    exportOrdersGroupedByCommodity[c.name].avgPrice = Math.round(exportOrdersGroupedByCommodity[c.name].totalPrice / exportOrdersGroupedByCommodity[c.name].totalStock)
    if (exportOrdersGroupedByCommodity[c.name].bestPrice === null ||
        c.buyPrice > exportOrdersGroupedByCommodity[c.name].bestPrice) {
      exportOrdersGroupedByCommodity[c.name].bestPrice = c.buyPrice
    }
    if (exportOrdersGroupedByCommodity[c.name].updatedAt === null ||
        c.updatedAt > exportOrdersGroupedByCommodity[c.name].updatedAt) {
      exportOrdersGroupedByCommodity[c.name].updatedAt = c.updatedAt
    }
  })

  const commoditesProduced = []
  exportOrders.forEach(c => {
    if (c.statusFlags?.includes('Producer') && c.fleetCarrier !== 1) {
      if (!commoditesProduced.includes(c.name)) { commoditesProduced.push(c.name) }
    }
  })

  return {
    exportOrders: Object.values(exportOrdersGroupedByCommodity),
    commoditesProduced
  }
}

async function getImports (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  const importOrders = await res.json()
  const importOrdersGroupedByCommodity = {}
  importOrders.forEach(c => {
    c.key = c.commodityId
    c.symbol = c.commodityName
    c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
    c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
    delete c.commodityName
    delete c.commodityId

    if (!importOrdersGroupedByCommodity[c.name]) {
      importOrdersGroupedByCommodity[c.name] = {
        key: c.symbol,
        name: c.name,
        symbol: c.symbol,
        category: c.category,
        systemName: c.systemName,
        totalDemand: 0,
        totalPrice: 0,
        avgPrice: 0,
        bestPrice: null,
        updatedAt: null,
        consumer: c.statusFlags?.includes('Consumer') ?? false,
        importOrders: []
      }
    }

    importOrdersGroupedByCommodity[c.name].importOrders.push(c)
    importOrdersGroupedByCommodity[c.name].totalDemand += c.demand
    importOrdersGroupedByCommodity[c.name].totalPrice += c.sellPrice * c.demand
    importOrdersGroupedByCommodity[c.name].avgPrice = Math.round(importOrdersGroupedByCommodity[c.name].totalPrice / importOrdersGroupedByCommodity[c.name].totalDemand)
    if (importOrdersGroupedByCommodity[c.name].bestPrice === null ||
        c.sellPrice > importOrdersGroupedByCommodity[c.name].bestPrice) {
      importOrdersGroupedByCommodity[c.name].bestPrice = c.sellPrice
    }
    if (importOrdersGroupedByCommodity[c.name].updatedAt === null ||
        c.updatedAt > importOrdersGroupedByCommodity[c.name].updatedAt) {
      importOrdersGroupedByCommodity[c.name].updatedAt = c.updatedAt
    }
  })

  const commoditesConsumed = []
  importOrders.forEach(c => {
    if (c.statusFlags?.includes('Consumer') && c.fleetCarrier !== 1) {
      if (!commoditesConsumed.includes(c.name)) { commoditesConsumed.push(c.name) }
    }
  })

  return {
    importOrders: Object.values(importOrdersGroupedByCommodity),
    commoditesConsumed
  }
}

// function average (arr) { return arr.reduce((a, b) => a + b) / arr.length }
