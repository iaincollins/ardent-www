import path from 'path'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import distance from 'lib/utils/distance'
import animateTableEffect from 'lib/animate-table-effect'
import Layout from 'components/layout'
import SystemMap from 'components/system/system-map'
import SystemTrade from 'components/system/system-trade'
import SystemServices from 'components/system/system-services'
import SystemNearby from 'components/system/system-nearby'
import getSystemExports from 'lib/system-exports'
import getSystemImports from 'lib/system-imports'
import listOfCommodities from 'lib/commodities/commodities.json'
import { NavigationContext } from 'lib/context'

import {
  API_BASE_URL,
  SOL_COORDINATES,
  COLONIA_COORDINATES
} from 'lib/consts'

// These are systems that actually exist in game but that are not "real" systems
// systems you can normally visit, so we don't want to display them
const HIDDEN_SYSTEMS = [
  '7780433924818', // Test
  '9154823459538', // Test2
  '9704579273426', // TestRender
  '349203072180', // SingleLightTest
  '353498039476', // BinaryLightTest
  '8055311864530', // Training (Tutorial)
  '7780433924818' // Destination (Tutorial)
]

// FIXME Ugh who wrote this 🗑️🔥

export default () => {
  const router = useRouter()
  const [, setNavigationPath] = useContext(NavigationContext)
  const [system, setSystem] = useState()
  const [stationsInSystem, setStationsInSystem] = useState()
  const [settlementsInSystem, setSettlementsInSystem] = useState()
  const [fleetCarriersInSystem, setFleetCarriersInSystem] = useState()
  const [megashipsInSystem, setMegashipsInSystem] = useState()
  const [nearbySystems, setNearbySystems] = useState()
  const [importOrders, setImportOrders] = useState()
  const [exportOrders, setExportOrders] = useState()
  const [lastUpdatedAt, setLastUpdatedAt] = useState()
  const [activeViewIndex, setActiveViewIndex] = useState(0)
  const [rareGoods, setRareGoods] = useState([])
  const [nearestServices, setNearestServices] = useState()

  const views = ['', 'exports', 'imports', 'services', 'nearby']

  useEffect(animateTableEffect)

  useEffect(() => {
    const basePath = path.basename(router.pathname)
    setActiveViewIndex(views.indexOf(basePath) === -1 ? 0 : views.indexOf(basePath))
  }, [router.pathname])

  useEffect(() => {
    (async () => {
      const systemName = router.query?.['system-name']?.replaceAll('_', ' ')?.trim()
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

        setNavigationPath([{ name: system.systemName, path: '/', icon: 'icarus-terminal-system-orbits' }])
      } else {
        setSystem(undefined)
      }

      if (system) {
        ; (async () => {
          const stations = await getStationsInSystem(systemName)
          setStationsInSystem(
            stations
            .filter(
              station => station.stationType !== 'OnFootSettlement' &&
              station.stationType !== 'MegaShip' &&
              station.stationType !== 'FleetCarrier' &&
              station.stationType !== 'StrongholdCarrier' &&
              station.stationType !== null &&
              !station?.stationName?.includes(' Construction Site: ')
            )
            .sort((a, b) => a?.stationName.localeCompare(b?.stationName))
          )
          setSettlementsInSystem(
            stations
            .filter(station => station.stationType === 'OnFootSettlement' || station.stationType === null)
            .sort((a, b) => a?.stationName.localeCompare(b?.stationName))
          )
          setFleetCarriersInSystem(
            stations
              .filter(station => station.stationType === 'FleetCarrier')
              .sort((a, b) => b?.updatedAt.localeCompare(a?.updatedAt))
          )
          setMegashipsInSystem(stations.filter(station => (station.stationType === 'MegaShip' || station.stationType === 'StrongholdCarrier')))

          const marketIds = stations.map(s => s.marketId)
          const rareItems = []
          for (const [, commodity] of Object.entries(listOfCommodities)) {
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
            if (listOfCommodities[order.symbol]) {
              importOrders[i] = {
                ...listOfCommodities[order.symbol],
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
            if (listOfCommodities[order.symbol]) {
              exportOrders[i] = {
                ...listOfCommodities[order.symbol],
                ...order
              }
            }
          })
          setExportOrders(exportOrders)
          setLastUpdatedAt(mostRecentUpdatedAt)
        })()

        ; (async () => {
          const [
            interstellarFactors,
            universalCartographics,
            shipyard,
            blackMarket
          ] = await Promise.all([
            getNearestService(systemName, 'interstellar-factors'),
            getNearestService(systemName, 'universal-cartographics'),
            getNearestService(systemName, 'shipyard'),
            getNearestService(systemName, 'black-market')
          ])
          setNearestServices({
            'Interstellar Factors': interstellarFactors,
            'Universal Cartographics': universalCartographics,
            Shipyard: shipyard,
            'Black Market': blackMarket
          })
        })()

        ; (async () => {
          const nearbySystems = await getNearbySystems(systemName)
          nearbySystems.forEach(s => {
            s.distance = distance(
              [system.systemX, system.systemY, system.systemZ],
              [s.systemX, s.systemY, s.systemZ]
            )
          })
          setNearbySystems(nearbySystems.filter(s => !HIDDEN_SYSTEMS.includes(`${s.systemAddress}`)))
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
      heading={
        system?.systemName
          ? <div className='heading--with-underline' style={{ marginBottom: 0 }}>
            <h2 className='heading--with-icon'>
              <i className='icon icarus-terminal-system-orbits' />{system?.systemName}
            </h2>
            </div>
          : ''
      }
      navigation={[
        {
          name: 'Map',
          icon: 'icarus-terminal-system-bodies',
          url: `/system/${system?.systemName.replaceAll(' ', '_')}`,
          active: views[activeViewIndex] === ''
        },
        {
          name: 'Trade',
          icon: 'icarus-terminal-cargo',
          url: `/system/${system?.systemName.replaceAll(' ', '_')}/exports`,
          active: (views[activeViewIndex] === 'exports' || views[activeViewIndex] === 'imports')
        },
        {
          name: 'Services',
          icon: 'icarus-terminal-scan',
          url: `/system/${system?.systemName.replaceAll(' ', '_')}/services`,
          active: views[activeViewIndex] === 'services'
        },
        {
          name: 'Nearby',
          icon: 'icarus-terminal-route',
          url: `/system/${system?.systemName.replaceAll(' ', '_')}/nearby`,
          active: views[activeViewIndex] === 'nearby'
        }
      ]}
    >
      <Head>
        <link rel='canonical' href={`https://ardent-insight.com/system/${system?.systemName}/${views[activeViewIndex]}`} />
      </Head>
      {system === null && <><h1>Error: Not found</h1><p className='text-large clear'>System not found.</p></>}
      {system &&
        <>
          {views[activeViewIndex] === '' &&
            <SystemMap
              system={system}
              nearbySystems={nearbySystems}
              stationsInSystem={stationsInSystem}
              settlementsInSystem={settlementsInSystem}
              megashipsInSystem={megashipsInSystem}
              fleetCarriersInSystem={fleetCarriersInSystem}
              importOrders={importOrders}
              exportOrders={exportOrders}
              lastUpdatedAt={lastUpdatedAt}
            />}
          {(views[activeViewIndex] === 'exports' || views[activeViewIndex] === 'imports') &&
            <SystemTrade
              systemName={system.systemName}
              importOrders={importOrders}
              exportOrders={exportOrders}
              rareGoods={rareGoods}
              lastUpdatedAt={lastUpdatedAt}
            />}
          {views[activeViewIndex] === 'services' &&
            <SystemServices systemName={system.systemName} nearestServices={nearestServices} />}
          {views[activeViewIndex] === 'nearby' &&
            <SystemNearby systemName={system.systemName} nearbySystems={nearbySystems} />}
        </>}
    </Layout>
  )
}

async function getSystem (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getStationsInSystem (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/stations`)
  return (res.status === 200) ? await res.json() : null
}

async function getNearbySystems (systemName) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/nearby?maxDistance=25`)
  return await res.json()
}

async function getNearestService (systemName, service) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/nearest/${service}?minLandingPadSize=3`)
  return res.ok ? await res.json() : null
}
