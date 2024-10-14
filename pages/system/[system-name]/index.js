import path from 'path'
import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Table from 'rc-table'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from '../../../components/collapsible-trigger'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { timeBetweenTimestamps } from 'lib/utils/dates'
// import { formatSystemSector } from 'lib/utils/system-sectors'
import distance from 'lib/utils/distance'
import animateTableEffect from 'lib/animate-table-effect'
import Layout from 'components/layout'
import LocalCommodityImporters from 'components/local-commodity-importers'
import LocalCommodityExporters from 'components/local-commodity-exporters'
import NearbyCommodityImporters from 'components/nearby-commodity-importers'
import NearbyCommodityExporters from 'components/nearby-commodity-exporters'
import StationIcon from 'components/station-icon'
import getSystemExports from 'lib/system-exports'
import getSystemImports from 'lib/system-imports'
import commmoditiesWithDescriptions from 'lib/commodities/commodities.json'

import {
  API_BASE_URL,
  SOL_COORDINATES,
  COLONIA_COORDINATES,
  NO_DEMAND_TEXT
} from 'lib/consts'

// These are systems that actually exist in game but that are not "real" systems
// systems you can normally visit, so we don't want to display them
const HIDDEN_SYSTEMS = [
  '7780433924818', // Test
  '9154823459538', // Test2
  '9704579273426', // TestRender
  '349203072180',  // SingleLightTest
  '353498039476',  // BinaryLightTest
  '8055311864530', // Training (Tutorial)
  '7780433924818', // Destination (Tutorial)
]

const SYSTEM_MAP_POINT_PLOT_MULTIPLIER = 50

// FIXME Ugh who wrote this 🗑️🔥

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
  const [tabIndex, setTabIndex] = useState(0)
  const [rareGoods, setRareGoods] = useState([])

  const tabs = ['imports', 'exports', 'nearby']

  useEffect(animateTableEffect)

  useEffect(() => {
    const basePath = path.basename(router.pathname)
    if (basePath === 'imports') setTabIndex(0)
    if (basePath === 'exports') setTabIndex(1)
    if (basePath === 'nearby') setTabIndex(2)
  }, [router.pathname])

  const onSystemsRowClick = (record, index, event) => {
    router.push(`/system/${record.systemName}/imports`)
  }

  useEffect(() => {
    (async () => {
      const systemName = router.query?.['system-name']?.trim()
      if (!systemName) return

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
          if (system.systemName === 'Sol') {
            system.tradeZoneLocation = 'The centre of the Core Systems'
          } else {
            system.tradeZoneLocation = <>{distance(systemCoordinates, SOL_COORDINATES)} Ly from Sol</>
          }
        } else if (distance(systemCoordinates, SOL_COORDINATES) <= 400) {
          system.tradeZone = 'Core Periphery'
          system.tradeZoneLocation = <>{distance(systemCoordinates, SOL_COORDINATES)} Ly from Sol</>
        } else if (distance(systemCoordinates, COLONIA_COORDINATES) <= 100) {
          system.tradeZone = 'Colonia Region'
          if (system.systemName === 'Colonia') {
            system.tradeZoneLocation = `The Colonia Region is ${distance(systemCoordinates, SOL_COORDINATES)} Ly from the Core Systems`
          } else {
            system.tradeZoneLocation = <>{distance(systemCoordinates, COLONIA_COORDINATES)} Ly from Colonia</>
          }
        } else {
          system.tradeZone = 'Deep Space'
          system.tradeZoneLocation = (
            <>
              {`${distance(systemCoordinates, SOL_COORDINATES)} Ly from Sol`}
              <br />
              {`${distance(systemCoordinates, COLONIA_COORDINATES)} Ly from Colonia`}
            </>
          )
        }
        setSystem(system)
      } else {
        setSystem(undefined)
      }


      if (system) {
        ; (async () => {
          const stations = await getStationsInSystem(systemName)
          setStationsInSystem(stations.filter(
            station => station.stationType !== 'Fleet Carrier' &&
              station.stationType !== 'Odyssey Settlement' &&
              station.stationType !== 'Megaship' &&
              station.stationType !== null
          ))
          setSettlementsInSystem(stations.filter(station => station.stationType === 'Odyssey Settlement' || station.stationType === null))
          setFleetCarriersInSystem(
            stations
              .filter(station => station.stationType === 'Fleet Carrier')
              .sort((a, b) => b?.updatedAt.localeCompare(a?.updatedAt))
          )
          setMegashipsInSystem(stations.filter(station => station.stationType === 'Megaship'))

          const marketIds = stations.map(s => s.marketId)
          const rareItems = []
          for (const [, commodity] of Object.entries(commmoditiesWithDescriptions)) {
            if (marketIds.includes(parseInt(commodity.market_id)) && commodity.rare) {
              rareItems.push({
                stationName: stations.filter(s => s.marketId === parseInt(commodity.market_id))[0].stationName,
                ...commodity
              })
            }
          }
          setRareGoods(rareItems)
        })()

          ; (async () => {
            let importOrders = await getSystemImports(systemName)
            importOrders.forEach((order, i) => {
              if (new Date(order.updatedAt).getTime() > new Date(mostRecentUpdatedAt).getTime()) {
                mostRecentUpdatedAt = order.updatedAt
              }
              // Enrich order data with commodity metadata
              if (commmoditiesWithDescriptions[order.symbol]) {
                importOrders[i] = {
                  ...commmoditiesWithDescriptions[order.symbol],
                  ...order
                }
              }
            })
            importOrders = importOrders.filter(order => !order.rare) // Filter 'Rare' items from imports
            setImportOrders(importOrders)
            setLastUpdatedAt(mostRecentUpdatedAt)
          })()

          ; (async () => {
            const exportOrders = await getSystemExports(systemName)
            exportOrders.forEach((order, i) => {
              if (new Date(order.updatedAt).getTime() > new Date(mostRecentUpdatedAt).getTime()) {
                mostRecentUpdatedAt = order.updatedAt
              }
              // Enrich order data with commodity metadata
              if (commmoditiesWithDescriptions[order.symbol]) {
                exportOrders[i] = {
                  ...commmoditiesWithDescriptions[order.symbol],
                  ...order
                }
              }
            })
            setExportOrders(exportOrders)
            setLastUpdatedAt(mostRecentUpdatedAt)
          })()

          ; (async () => {
            const nearbySystems = await getNearbySystems(systemName)
            nearbySystems.forEach(s => {
              s.distance = distance(
                [system.systemX, system.systemY, system.systemZ],
                [s.systemX, s.systemY, s.systemZ]
              )
            })
            setNearbySystems(nearbySystems.filter(s => !HIDDEN_SYSTEMS.includes(`${s.systemAddress}`)));
          })()
      }
    })()
  }, [router.query['system-name']])

  return (
    <Layout
      loading={system === undefined}
      loadingText='Loading system data'
      title={system ? `${system.systemName} - star system in Elite Dangerous` : null}
      description={system ? `Trade data for ${system.systemName} in Elite Dangerous` : null}
    >
      <Head>
        <link rel='canonical' href={`https://ardent-industry.com/system/${system?.systemName}/${tabs[tabIndex]}`} />
      </Head>
      <ul
        className='breadcrumbs fx__fade-in' onClick={(e) => {
          if (e.target.tagName === 'LI') e.target.children[0].click()
        }}
      >
        <li><Link href='/'>Systems</Link></li>
        {system?.tradeZone && <li><Link href='/'>{system.tradeZone}</Link></li>}
      </ul>
      {system === null && <><h1>Error: Not found</h1><p className='text-large clear'>System not found.</p></>}
      {system &&
        <div className='fx__fade-in'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-system-orbits' />
            {system.systemName}
          </h2>
          <div className='system-map'>
            <div className='system-map__point system-map__point--highlighted' style={{ top: '50%', left: '50%' }} data-name={system.systemName} />
            {nearbySystems && nearbySystems.map((nearbySystem, i) =>
              <div
                key={nearbySystem.systemAddress} className='system-map__point'
                onClick={() => router.push(`/system/${nearbySystem.systemName}`)}
                data-name={nearbySystem.systemName}
                style={{
                  animationDelay: `${i * 10}ms`,
                  top: nearbySystem.systemZ > system.systemZ ? `calc(50% + ${(nearbySystem.systemZ - system.systemZ) * SYSTEM_MAP_POINT_PLOT_MULTIPLIER}px)` : `calc(50% - ${(system.systemZ - nearbySystem.systemZ) * SYSTEM_MAP_POINT_PLOT_MULTIPLIER}px)`, // Z
                  left: nearbySystem.systemX > system.systemX ? `calc(50% + ${(nearbySystem.systemX - system.systemX) * SYSTEM_MAP_POINT_PLOT_MULTIPLIER}px)` : `calc(50% - ${(system.systemX - nearbySystem.systemX) * SYSTEM_MAP_POINT_PLOT_MULTIPLIER}px)`// X
                }}
              />
            )}
          </div>
          <table className='properties-table' style={{ marginBottom: 0 }}>
            <tbody>
              <tr>
                <th>Address</th>
                <td><span className='fx__animated-text' data-fx-order='1'>{system.systemAddress}</span></td>
              </tr>
              <tr>
                <th>Location</th>
                <td><span className='fx__animated-text' data-fx-order='2'>{system.systemX}, {system.systemY}, {system.systemZ}</span></td>
              </tr>
              {/* <tr>
                <th>Ardent sector</th>
                <td><span className='fx__animated-text' data-fx-order='3'>{formatSystemSector(system.systemSector)}</span></td>
              </tr> */}
              <tr>
                <th>Trade zone</th>
                <td>
                  <span className='fx__animated-text' data-fx-order='4'>
                    {system.tradeZone}
                    {system.tradeZoneLocation !== undefined && <small style={{ textTransform: 'none' }}><br />{system.tradeZoneLocation}</small>}
                  </span>
                </td>
              </tr>
              <tr>
                <th className='is-hidden-mobile'>Stations/Ports</th>
                <td className={stationsInSystem?.length === 0 && 'is-hidden-mobile'}>
                  {stationsInSystem?.length > 0 &&
                    <span className='fx__fade-in'>
                      <Collapsible
                        trigger={<CollapsibleTrigger>{stationsInSystem.length} {stationsInSystem.length === 1 ? 'station/port' : 'stations/ports'}</CollapsibleTrigger>}
                        triggerWhenOpen={<CollapsibleTrigger open>{stationsInSystem.length} {stationsInSystem.length === 1 ? 'station/port' : 'stations/ports'}</CollapsibleTrigger>}
                      >
                        {stationsInSystem.map(station =>
                          <Fragment key={`marketId_${station.marketId}`}>
                            <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                              <div className='system__entity-name'>
                                <StationIcon stationType={station.stationType} />
                                {station.stationName}
                              </div>
                              <div className='system__entity-information'>
                                {station.distanceToArrival !== null && <small className='text-no-transform'> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                              </div>
                            </div>
                          </Fragment>
                        )}
                      </Collapsible>
                    </span>}
                  {stationsInSystem?.length === 0 && <span className='muted-2'>No Stations/Ports</span>}
                  {stationsInSystem === undefined && <span className='muted'>...</span>}
                </td>
              </tr>
              <tr>
                <th className='is-hidden-mobile'>Settlements</th>
                <td className={settlementsInSystem?.length === 0 && 'is-hidden-mobile'}>
                  {settlementsInSystem?.length > 0 &&
                    <span className='fx__fade-in'>
                      <Collapsible
                        trigger={<CollapsibleTrigger>{settlementsInSystem.length} {settlementsInSystem.length === 1 ? 'settlement' : 'settlements'}</CollapsibleTrigger>}
                        triggerWhenOpen={<CollapsibleTrigger open>{settlementsInSystem.length} {settlementsInSystem.length === 1 ? 'settlement' : 'settlements'}</CollapsibleTrigger>}
                      >
                        {settlementsInSystem.map(station =>
                          <Fragment key={`marketId_${station.marketId}`}>
                            <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                              <div className='system__entity-name'>
                                <StationIcon stationType={station.stationType} />
                                {station.stationName}
                              </div>
                              <div className='system__entity-information'>
                                {station.bodyName && <small><i className='icon icarus-terminal-planet' style={{ position: 'relative', top: '-.1rem' }} />{station.bodyName}</small>}
                                {station.bodyName && station.distanceToArrival !== null && <small>{' ('}</small>}
                                {station.distanceToArrival !== null && <small className='text-no-transform'>{Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                                {station.bodyName && station.distanceToArrival !== null && <small>)</small>}
                              </div>
                            </div>
                          </Fragment>
                        )}
                      </Collapsible>
                    </span>}
                  {settlementsInSystem?.length === 0 && <span className='muted-2'>No Settlements</span>}
                  {settlementsInSystem === undefined && <span className='muted'>...</span>}
                </td>
              </tr>
              <tr>
                <th className='is-hidden-mobile'>Megaships</th>
                <td className={megashipsInSystem?.length === 0 && 'is-hidden-mobile'}>
                  {megashipsInSystem?.length > 0 &&
                    <span className='fx__fade-in'>
                      <Collapsible
                        trigger={<CollapsibleTrigger>{megashipsInSystem.length} {megashipsInSystem.length === 1 ? 'megaship' : 'megaships'}</CollapsibleTrigger>}
                        triggerWhenOpen={<CollapsibleTrigger open>{megashipsInSystem.length} {megashipsInSystem.length === 1 ? 'megaship' : 'megaships'}</CollapsibleTrigger>}
                      >
                        {megashipsInSystem.map(station =>
                          <Fragment key={`marketId_${station.marketId}`}>
                            <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                              <div className='system__entity-name'>
                                <StationIcon stationType={station.stationType} />
                                {station.stationName}
                              </div>
                              <div className='system__entity-information'>
                                {station.distanceToArrival !== null && <small className='text-no-transform'> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                                {station.updatedAt && station.distanceToArrival !== null && <small>{' // '}</small>}
                                {station.updatedAt && <small>{timeBetweenTimestamps(station.updatedAt)}</small>}
                              </div>
                            </div>
                          </Fragment>
                        )}
                      </Collapsible>
                    </span>}
                  {megashipsInSystem?.length === 0 && <span className='muted-2'>No Megaships</span>}
                  {megashipsInSystem === undefined && <span className='muted'>...</span>}
                </td>
              </tr>
              <tr>
                <th className='is-hidden-mobile'>Fleet Carriers</th>
                <td className={fleetCarriersInSystem?.length === 0 && 'is-hidden-mobile'}>
                  {fleetCarriersInSystem?.length > 0 &&
                    <span className='fx__fade-in'>
                      <Collapsible
                        trigger={<CollapsibleTrigger>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'Fleet carrier' : 'Fleet carriers'}</CollapsibleTrigger>}
                        triggerWhenOpen={<CollapsibleTrigger open>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'Fleet carrier' : 'Fleet carriers'}</CollapsibleTrigger>}
                      >
                        {fleetCarriersInSystem.map(station =>
                          <Fragment key={`marketId_${station.marketId}`}>
                            <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                              <div className='system__entity-name'>
                                <StationIcon stationType='Fleet Carrier' />
                                FC {station.stationName}
                              </div>
                              <div className='system__entity-information'>
                                {station.updatedAt && <small>{timeBetweenTimestamps(station.updatedAt)}</small>}
                                {station.distanceToArrival !== null && <small className='text-no-transform'> ({Math.round(station.distanceToArrival).toLocaleString()} Ls)</small>}
                              </div>
                            </div>
                          </Fragment>
                        )}
                      </Collapsible>
                    </span>}
                  {fleetCarriersInSystem?.length === 0 && <span className='muted-2'>No Fleet Carriers</span>}
                  {fleetCarriersInSystem === undefined && <span className='muted'>...</span>}
                </td>
              </tr>
              <tr>
                <th>Last update</th>
                <td>
                  {(system !== undefined && importOrders !== undefined && exportOrders !== undefined)
                    ? `${timeBetweenTimestamps(lastUpdatedAt)}`
                    : <span className='muted'>...</span>}
                </td>
              </tr>
              {rareGoods.length > 0 &&
                <tr>
                  <th>Rare export</th>
                  <td>
                    {rareGoods.map(rare =>
                      <span key={`rare_good_${rare.symbol}`} className='text-no-transform'>
                        {rare.stationName} is the exclusive exporter of {rare.name}.
                        {' '}
                        {rare?.description}
                        {rare?.limit && <> Export restrictions limit orders to {rare.limit}T at a time.</>}
                      </span>)}
                  </td>
                </tr>}
            </tbody>
          </table>
          <Tabs
            selectedIndex={tabIndex}
            onSelect={
              (index) => {
                router.push(`/system/${router.query['system-name']}/${tabs[index]}`)
              }
            }
          >
            <TabList>
              <Tab>
                <span className='is-hidden-mobile'>Imports</span>
                <span className='is-visible-mobile'>Imp</span>
                {importOrders && <span className='tab-badge'>{importOrders.length}</span>}
              </Tab>
              <Tab>
                <span className='is-hidden-mobile'>Exports</span>
                <span className='is-visible-mobile'>Exp</span>
                {exportOrders && <span className='tab-badge'>{exportOrders.length}</span>}
              </Tab>
              <Tab>
                <span className='is-hidden-mobile'>Nearby</span>
                <span className='is-visible-mobile'>Near</span>
              </Tab>
            </TabList>
            {/* {tabIndex !== 2 && <CommodityTabOptions />} */}
            <TabPanel>
              {!importOrders && <div style={{ marginTop: '2rem' }} className='loading-bar loading-bar--tab' />}
              {importOrders &&
                <Table
                  className='data-table data-table--striped data-table--interactive data-table--animated'
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
                          <div className='is-visible-mobile'>
                            <small style={{ float: 'right' }}>{r.importOrders.length === 1 ? '1 importer ' : `${r.importOrders.length} importers`}</small>
                          </div>
                          <small>
                            {r.category}
                            {r?.consumer === true && ', Consumer'}
                          </small>
                          <div className='is-visible-mobile'>
                            <table className='data-table--mini data-table--compact two-column-table'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Total demand</span>{r.totalDemand > 0 ? `${r.totalDemand.toLocaleString()} T` : <small>{NO_DEMAND_TEXT}</small>}</td>
                                  <td className='text-right'>
                                    <span className='data-table__label'>Price</span>
                                    {r.avgPrice.toLocaleString()} CR
                                    <br />
                                    {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                                    {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
                          </div>
                        </>
                    },
                    {
                      title: 'Importers',
                      dataIndex: 'importOrders',
                      key: 'importOrders',
                      align: 'center',
                      width: 100,
                      className: 'is-hidden-mobile',
                      render: (v) => <span className='muted'>{v.length === 1 ? '1 ' : `${v.length}`}<i style={{ fontSize: '1.25rem', position: 'relative', top: '-.2rem', marginLeft: '.4rem' }} className='icarus-terminal-settlement muted' /></span>
                    },
                    {
                      title: 'Updated',
                      dataIndex: 'updatedAt',
                      key: 'updatedAt',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile no-wrap',
                      render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
                    },
                    {
                      title: 'Total demand',
                      dataIndex: 'totalDemand',
                      key: 'totalDemand',
                      align: 'right',
                      width: 200,
                      className: 'is-hidden-mobile no-wrap',
                      render: (v) => <>{v > 0 ? `${v.toLocaleString()} T` : <small>{NO_DEMAND_TEXT}</small>}</>
                    },
                    {
                      title: 'Avg price',
                      dataIndex: 'avgPrice',
                      key: 'avgPrice',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile no-wrap',
                      render: (v, r) =>
                        <>
                          {v.toLocaleString()} CR
                          <br />
                          {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                          {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                        </>
                    }
                  ]}
                  data={importOrders}
                  rowKey={(r) => `system_imports_${r.systemAddress}_${r.symbol}`}
                  expandable={{
                    expandRowByClick: true,
                    expandedRowRender: r =>
                      <>
                        <p style={{ marginTop: '.5rem' }}>
                          Demand for <Link href={`/commodity/${r.symbol}/importers?systemName=${encodeURIComponent(r.systemName)}&maxDistance=100`}>{r.name}</Link> in {r.systemName}
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
              {!exportOrders && <div style={{ marginTop: '2rem' }} className='loading-bar loading-bar--tab' />}
              {exportOrders &&
                <Table
                  className='data-table data-table--striped data-table--interactive data-table--animated'
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
                          <div className='is-visible-mobile'>
                            <small style={{ float: 'right' }}>{r.exportOrders.length === 1 ? '1 exporter ' : `${r.exportOrders.length} exporters`}</small>
                          </div>
                          <small>
                            {r.category}
                            {r?.rare === true && ', Rare'}
                            {r?.producer === true && ', Producer'}
                          </small>
                          <div className='is-visible-mobile'>
                            <table className='data-table--mini two-column-table data-table--compact'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Total stock</span>{r.totalStock.toLocaleString()} T</td>
                                  <td className='text-right'>
                                    <span className='data-table__label'>Price</span>
                                    {r.avgPrice.toLocaleString()} CR
                                    <br />
                                    {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                                    {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
                          </div>
                        </>
                    },
                    {
                      title: 'Exporters',
                      dataIndex: 'exportOrders',
                      key: 'exportOrders',
                      align: 'center',
                      width: 100,
                      className: 'is-hidden-mobile',
                      render: (v) => <span className='muted'>{v.length === 1 ? '1 ' : `${v.length}`}<i style={{ fontSize: '1.25rem', position: 'relative', top: '-.2rem', marginLeft: '.4rem' }} className='icarus-terminal-settlement muted' /></span>
                    },
                    {
                      title: 'Updated',
                      dataIndex: 'updatedAt',
                      key: 'updatedAt',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile no-wrap',
                      render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
                    },
                    {
                      title: 'Total stock',
                      dataIndex: 'totalStock',
                      key: 'totalStock',
                      align: 'right',
                      width: 200,
                      className: 'is-hidden-mobile no-wrap',
                      render: (v) => <>{v.toLocaleString()} T</>
                    },
                    {
                      title: 'Avg price',
                      dataIndex: 'avgPrice',
                      key: 'avgPrice',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile no-wrap',
                      render: (v, r) =>
                        <>
                          {v.toLocaleString()} CR
                          <br />
                          {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                          {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                        </>
                    }
                  ]}
                  data={exportOrders}
                  rowKey={(r) => `system_exports_${r.systemAddress}_${r.symbol}`}
                  expandable={{
                    expandRowByClick: true,
                    expandedRowRender: r =>
                      <>
                        <p style={{ marginTop: '.5rem' }}>
                          Stock of <Link href={`/commodity/${r.symbol}/exporters?systemName=${encodeURIComponent(r.systemName)}&maxDistance=100`}>{r.name}</Link> in {r.systemName}
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
                  className='data-table data-table--striped data-table--interactive data-table--animated'
                  columns={[
                    {
                      title: 'Nearest systems',
                      dataIndex: 'systemName',
                      key: 'systemName',
                      align: 'left',
                      render: (v) => <><i className='icon icarus-terminal-star' />{v}</>
                    },
                    {
                      title: 'Dist.',
                      dataIndex: 'distance',
                      key: 'distance',
                      align: 'right',
                      className: 'no-wrap',
                      render: (v) => v < 1
                        ? '< 1 Ly'
                        : <>{Math.floor(v).toLocaleString()} Ly</>
                    }
                  ]}
                  data={nearbySystems}
                  rowKey='systemAddress'
                  onRow={(record, index) => ({
                    onClick: onSystemsRowClick.bind(null, record, index)
                  })}
                />}
            </TabPanel>
          </Tabs>
        </div>}
    </Layout>
  )
}

async function getSystem(systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getStationsInSystem(systemName) {
  // @TODO No API endpoint for stations yet, so using 'markets' endpoint
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/stations`)
  return (res.status === 200) ? await res.json() : null
}

async function getNearbySystems(systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/nearby?maxDistance=25`)
  return await res.json()
}
