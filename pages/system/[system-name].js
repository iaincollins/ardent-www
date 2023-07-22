import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from '../../components/collapsible-trigger'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import { getCommodities } from 'lib/commodities'
import { formatSystemSector } from 'lib/utils/system-sectors'
import distance from 'lib/utils/distance'
import Layout from 'components/layout'
import LocalCommodityImporters from 'components/local-commodity-importers'
import LocalCommodityExporters from 'components/local-commodity-exporters'
import NearbyCommodityImporters from 'components/nearby-commodity-importers'
import NearbyCommodityExporters from 'components/nearby-commodity-exporters'
import StationIcon from 'components/station-icon'
import {
  API_BASE_URL,
  SOL_COORDINATES,
  COLONIA_COORDINATES
} from 'lib/consts'

export default () => {
  const router = useRouter()
  const [system, setSystem] = useState()
  const [stationsInSystem, setStationsInSystem] = useState()
  const [settlementsInSystem, setSettlementsInSystem] = useState()
  const [fleetCarriersInSystem, setFleetCarriersInSystem] = useState()
  const [megashipsInSystem, setMegashipsInSystem] = useState()
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
      setSettlementsInSystem(undefined)
      setFleetCarriersInSystem(undefined)
      setMegashipsInSystem(undefined)
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
      }
      setSystem(system)

      if (system) {
        ;(async () => {
          const stations = await getStationsInSystem(systemName)
          setStationsInSystem(stations.filter(
            station => station.stationType !== 'Fleet Carrier' &&
                       station.stationType !== 'Odyssey Settlement' &&
                       station.stationType !== 'Megaship' &&
                       station.stationType !== null
          ))
          setSettlementsInSystem(stations.filter(station => station.stationType === 'Odyssey Settlement' || station.stationType === null))
          setFleetCarriersInSystem(stations.filter(station => station.stationType === 'Fleet Carrier'))
          setMegashipsInSystem(stations.filter(station => station.stationType === 'Megaship'))
        })()

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
    <Layout loading={system === undefined}>
      <ul className='breadcrumbs'>
        <li><Link href='/'>Home</Link></li>
        <li><Link href='/commodities'>Systems</Link></li>
      </ul>
      {system === null && <><h2>Error</h2><p className='clear'>System not found</p></>}
      {system &&
        <>
          <h2 className='heading--with-icon'>
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
                <th>Stations/Ports</th>
                <td>
                  {stationsInSystem?.length > 0 &&
                    <Collapsible
                      trigger={<CollapsibleTrigger>{stationsInSystem.length} {stationsInSystem.length === 1 ? 'station/port' : 'stations/ports'}</CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>{stationsInSystem.length} {stationsInSystem.length === 1 ? 'station/port' : 'stations/ports'}</CollapsibleTrigger>}
                    >
                      {stationsInSystem.map(station =>
                        <Fragment key={`marketId_${station.marketId}`}>
                          <p style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                            <StationIcon stationType={station.stationType} />
                            {station.stationName}
                            {station.distanceToArrival !== null && <small> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                          </p>
                        </Fragment>
                      )}
                    </Collapsible>}
                  {stationsInSystem?.length === 0 && <span className='muted'>None</span>}
                  {stationsInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Settlements</th>
                <td>
                  {settlementsInSystem?.length > 0 &&
                    <Collapsible
                      trigger={<CollapsibleTrigger>{settlementsInSystem.length} {settlementsInSystem.length === 1 ? 'settlement' : 'settlements'}</CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>{settlementsInSystem.length} {settlementsInSystem.length === 1 ? 'settlement' : 'settlements'}</CollapsibleTrigger>}
                    >
                      {settlementsInSystem.map(station =>
                        <Fragment key={`marketId_${station.marketId}`}>
                          <p style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                            <StationIcon stationType={station.stationType} />
                            {station.stationName}
                            {station.bodyName && <small> {station.bodyName.replace(`${station.systemName} `, '')}</small>}
                            {station.bodyName && station.distanceToArrival !== null && <small>, </small>}
                            {station.distanceToArrival !== null && <small> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                          </p>
                        </Fragment>
                      )}
                    </Collapsible>}
                  {settlementsInSystem?.length === 0 && <span className='muted'>None</span>}
                  {settlementsInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Megaships</th>
                <td>
                  {megashipsInSystem?.length > 0 &&
                    <Collapsible
                      trigger={<CollapsibleTrigger>{megashipsInSystem.length} {megashipsInSystem.length === 1 ? 'megaship' : 'megaships'}</CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>{megashipsInSystem.length} {megashipsInSystem.length === 1 ? 'megaship' : 'megaships'}</CollapsibleTrigger>}
                    >
                      {megashipsInSystem.map(station =>
                        <Fragment key={`marketId_${station.marketId}`}>
                          <p style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                            <StationIcon stationType={station.stationType} />
                            {station.stationName}
                            {station.updatedAt && <small> {timeBetweenTimestamps(station.updatedAt)} ago</small>}
                            {station.updatedAt && station.distanceToArrival !== null && <small>, </small>}
                            {station.distanceToArrival !== null && <small> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                          </p>
                        </Fragment>
                      )}
                    </Collapsible>}
                  {megashipsInSystem?.length === 0 && <span className='muted'>None</span>}
                  {megashipsInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Fleet Carriers</th>
                <td>
                  {fleetCarriersInSystem?.length > 0 &&
                    <Collapsible
                      trigger={<CollapsibleTrigger>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'carrier' : 'carriers'}</CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'carrier' : 'carriers'}</CollapsibleTrigger>}
                    >
                      {fleetCarriersInSystem.map(station =>
                        <Fragment key={`marketId_${station.marketId}`}>
                          <p style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                            <StationIcon stationType={station.stationType} />
                            Fleet Carrier {station.stationName}
                            {station.updatedAt && <small> {timeBetweenTimestamps(station.updatedAt)} ago</small>}
                            {station.updatedAt && station.distanceToArrival !== null && <small>, </small>}
                            {station.distanceToArrival !== null && <small> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                          </p>
                        </Fragment>
                      )}
                    </Collapsible>}
                  {fleetCarriersInSystem?.length === 0 && <span className='muted'>None</span>}
                  {fleetCarriersInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Last update</th>
                <td>{timeBetweenTimestamps(lastUpdatedAt)} ago</td>
              </tr>
            </tbody>
          </table>
          <Tabs>
            <TabList>
              <Tab>
                <span className='is-hidden-mobile'>Imports</span>
                <span className='is-visible-mobile'>Imp</span>
                <span className='muted'> [{importOrders?.length ?? '-'}]</span>
              </Tab>
              <Tab>
                <span className='is-hidden-mobile'>Exports</span>
                <span className='is-visible-mobile'>Exp</span>
                <span className='muted'> [{exportOrders?.length ?? '-'}]</span>
              </Tab>
              <Tab>
                <span className='is-hidden-mobile'>Nearby</span>
                <span className='is-visible-mobile'>Near</span>
              </Tab>
            </TabList>
            <TabPanel>
              {!importOrders && <div className='loading-bar loading-bar--tab' />}
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
                          <i className='icon icarus-terminal-cargo' />{v}<br />
                          <small>{r.importOrders.length === 1 ? '1 importer ' : `${r.importOrders.length} importers`}</small>
                          {r?.consumer === true && <small> | Consumer</small>}
                          <div className='is-visible-mobile'>
                            <table className='data-table--mini data-table--compact two-column-table'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Total demand</span>{r.totalDemand > 0 ? `${r.totalDemand.toLocaleString()} T` : <small>No demand</small>}</td>
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
                      render: (v) => <>{v > 0 ? `${v.toLocaleString()} T` : <small>No demand</small>}</>
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
                          trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                          triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                        >
                          <NearbyCommodityExporters commodity={r} />
                        </Collapsible>
                        <Collapsible
                          trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                          triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                        >
                          <NearbyCommodityImporters commodity={r} />
                        </Collapsible>
                      </>
                  }}
                />}
            </TabPanel>
            <TabPanel>
              {!exportOrders && <div className='loading-bar loading-bar--tab' />}
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
                          <i className='icon icarus-terminal-cargo' />{v}<br />
                          <small>{r.exportOrders.length === 1 ? '1 exporter ' : `${r.exportOrders.length} exporters`}</small>
                          {r?.producer === true && <small> | Producer</small>}
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
                          trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                          triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                        >
                          <NearbyCommodityExporters commodity={r} />
                        </Collapsible>
                        <Collapsible
                          trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                          triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                        >
                          <NearbyCommodityImporters commodity={r} />
                        </Collapsible>
                      </>
                  }}
                />}
            </TabPanel>
            <TabPanel>
              {!nearbySystems && <div className='loading-bar loading-bar--tab' />}
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
    </Layout>
  )
}

async function getSystem (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getStationsInSystem (systemName) {
  // @TODO No API endpoint for stations yet, so using 'markets' endpoint
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/stations`)
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
        galacticAvgPrice: (allCommodities.find(el => el.symbol.toLowerCase() === symbol))?.avgBuyPrice ?? 0,
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
