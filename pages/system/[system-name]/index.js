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
import { formatSystemSector } from 'lib/utils/system-sectors'
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
  UNLIMTED_DEMAND_TEXT
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
          if (system.systemName === 'Sol') {
            system.tradeZoneLocation = `Systems within 200 Ly of Sol are known as the Core Systems`
          } else {
            system.tradeZoneLocation = <>{system.systemName} is the Core Systems<br />{distance(systemCoordinates, SOL_COORDINATES)} Ly from Sol</>
          }
        } else if (distance(systemCoordinates, SOL_COORDINATES) <= 400) {
          system.tradeZone = 'Periphery'
          system.tradeZoneLocation = <>{system.systemName} is on the periphery of the Core Worlds<br />{distance(systemCoordinates, SOL_COORDINATES)} Ly from Sol</>
        } else if (distance(systemCoordinates, COLONIA_COORDINATES) <= 100) {
          system.tradeZone = 'Colonia Region'
          if (system.systemName === 'Colonia') {
            system.tradeZoneLocation = `The Colonia Region is ${distance(systemCoordinates, SOL_COORDINATES)} Ly from the Core Systems`
          } else {
            system.tradeZoneLocation = <>{system.systemName} is in the Colonia Region<br />{distance(systemCoordinates, COLONIA_COORDINATES)} Ly from Colonia</>
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
      }
      setSystem(system)

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
          setFleetCarriersInSystem(stations.filter(station => station.stationType === 'Fleet Carrier'))
          setMegashipsInSystem(stations.filter(station => station.stationType === 'Megaship'))

          const marketIds = stations.map(s => s.marketId)
          const rareItems = []
          for (const [commoditySymbol, commodity] of Object.entries(commmoditiesWithDescriptions)) {
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
            importOrders = importOrders.filter(order => !order.rare) // Filter 'Rare' items list
            setImportOrders(importOrders)
            setLastUpdatedAt(mostRecentUpdatedAt)
          })()

          ; (async () => {
            let exportOrders = await getSystemExports(systemName)
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
            exportOrders = exportOrders.filter(order => !order.rare) // Filter 'Rare' items list
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
            setNearbySystems(nearbySystems.filter((s, i) => i < 100))
          })()
      }
    })()
  }, [router.query['system-name']])

  return (
    <Layout
      loading={system === undefined}
      loadingText='Loading system data'
      title={system ? `${system.systemName} system in Elite Dangerous` : null}
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
        <li><Link href='/'>Home</Link></li>
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
          <table className='properties-table'>
            <tbody>
              <tr>
                <th>Address</th>
                <td><span className='fx__animated-text' data-fx-order='1'>{system.systemAddress}</span></td>
              </tr>
              <tr>
                <th>Location</th>
                <td><span className='fx__animated-text' data-fx-order='2'>{system.systemX}, {system.systemY}, {system.systemZ}</span></td>
              </tr>
              <tr>
                <th>Ardent sector</th>
                <td><span className='fx__animated-text' data-fx-order='3'>{formatSystemSector(system.systemSector)}</span></td>
              </tr>
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
                <th>Stations/Ports</th>
                <td>
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
                  {stationsInSystem?.length === 0 && <span className='muted'>None</span>}
                  {stationsInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Settlements</th>
                <td>
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
                                {station.bodyName && station.distanceToArrival !== null && <small>{')'}</small>}
                              </div>
                            </div>
                          </Fragment>
                        )}
                      </Collapsible>
                    </span>}
                  {settlementsInSystem?.length === 0 && <span className='muted'>None</span>}
                  {settlementsInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Megaships</th>
                <td>
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
                  {megashipsInSystem?.length === 0 && <span className='muted'>None</span>}
                  {megashipsInSystem === undefined && '-'}
                </td>
              </tr>
              <tr>
                <th>Fleet Carriers</th>
                <td>
                  {fleetCarriersInSystem?.length > 0 &&
                    <span className='fx__fade-in'>
                      <Collapsible
                        trigger={<CollapsibleTrigger>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'carrier' : 'carriers'}</CollapsibleTrigger>}
                        triggerWhenOpen={<CollapsibleTrigger open>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'carrier' : 'carriers'}</CollapsibleTrigger>}
                      >
                        {fleetCarriersInSystem.map(station =>
                          <Fragment key={`marketId_${station.marketId}`}>
                            <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }} className='muted'>
                              <div className='system__entity-name'>
                                <StationIcon stationType={'Fleet Carrier'} />
                                Fleet Carrier {station.stationName}
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
                  {fleetCarriersInSystem?.length === 0 && <span className='muted'>None</span>}
                  {fleetCarriersInSystem === undefined && '-'}
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
              {rareGoods.length > 0 && <tr>
                <th>Rare export</th>
                <td>
                  {rareGoods.map(rare => <span className='text-no-transform'>
                    {rare.stationName}, {system.systemName} is the exlusive exporter of <Link href={`/commodity/${rare.symbol}`}>{rare.name}</Link>.
                    {' '}
                    {rare?.description}
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
            {/* {tabIndex !== 2 && <CommodityTabOptions />} */}
            <TabPanel>
              {!importOrders && <div className='loading-bar loading-bar--tab' />}
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
                          <small>{r.importOrders.length === 1 ? '1 importer ' : `${r.importOrders.length} importers`}</small>
                          {r?.consumer === true && <small> | Consumer</small>}
                          <div className='is-visible-mobile'>
                            <table className='data-table--mini data-table--compact two-column-table'>
                              <tbody style={{ textTransform: 'uppercase' }}>
                                <tr>
                                  <td><span className='data-table__label'>Total demand</span>{r.totalDemand > 0 ? `${r.totalDemand.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>}</td>
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
                            <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
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
                      render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
                    },
                    {
                      title: 'Total demand',
                      dataIndex: 'totalDemand',
                      key: 'totalDemand',
                      align: 'right',
                      width: 150,
                      className: 'is-hidden-mobile no-wrap',
                      render: (v) => <>{v > 0 ? `${v.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>}</>
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
              {!exportOrders && <div className='loading-bar loading-bar--tab' />}
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
                          <small>{r.exportOrders.length === 1 ? '1 exporter ' : `${r.exportOrders.length} exporters`}</small>
                          {r?.producer === true && <small> | Producer</small>}
                          {r?.rare === true && <small> | Rare</small>}
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
                            <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
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
                      render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
                    },
                    {
                      title: 'Total stock',
                      dataIndex: 'totalStock',
                      key: 'totalStock',
                      align: 'right',
                      width: 150,
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
                      render: (v, r) =>
                        <>
                          <i className='icon icarus-terminal-star' />
                          {v}
                        </>
                    },
                    {
                      title: 'Dist',
                      dataIndex: 'distance',
                      key: 'distance',
                      align: 'right',
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
