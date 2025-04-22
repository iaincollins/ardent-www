import path from 'path'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import distance from 'lib/utils/distance'
import animateTableEffect from 'lib/animate-table-effect'
import Layout from 'components/layout'
import SystemMap from 'components/system/system-map'
import SystemList from 'components/system/system-list'
import SystemTrade from 'components/system/system-trade'
import SystemServices from 'components/system/system-services'
import SystemNearby from 'components/system/system-nearby'
import getSystemExports from 'lib/system-exports'
import getSystemImports from 'lib/system-imports'
import listOfCommodities from 'lib/commodities/commodities.json'
import { NavigationContext } from 'lib/context'
import systemIdentiferIsSystemAddress from 'lib/utils/system-identifer-is-system-address'

import {
  API_BASE_URL,
  SOL_COORDINATES,
  COLONIA_COORDINATES,
  GALACTIC_CENTER_COORDINATES
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
  const [loading, setLoading] = useState(true)
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
  const [bodiesInSystem, setBodiesInSystem] = useState()
  const [systemStatus, setSystemStatus] = useState()

  const views = ['', 'list', 'exports', 'imports', 'services', 'nearby']

  useEffect(animateTableEffect)

  useEffect(() => {
    const basePath = path.basename(router.pathname)
    setActiveViewIndex(views.indexOf(basePath) === -1 ? 0 : views.indexOf(basePath))
  }, [router.pathname])

  useEffect(() => {
    (async () => {
      if (system !== undefined && systemStatus !== undefined) {
            setLoading(false)
          }
    })()
  })

  useEffect(() => {
    (async () => {
      setLoading(true)
      const systemIdentifer = router.query?.['system-identifer']?.replaceAll('_', ' ')?.trim()
      if (!systemIdentifer) return

      setStationsInSystem(undefined)
      setSettlementsInSystem(undefined)
      setFleetCarriersInSystem(undefined)
      setMegashipsInSystem(undefined)
      setNearbySystems(undefined)
      setImportOrders(undefined)
      setExportOrders(undefined)
      setLastUpdatedAt(undefined)
      setBodiesInSystem(undefined)
      setSystemStatus(undefined)
      setNearestServices(undefined)

      let mostRecentUpdatedAt

      const system = await getSystem(systemIdentifer)
      if (system) {
        mostRecentUpdatedAt = system.updatedAt
        setLastUpdatedAt(mostRecentUpdatedAt)
        const systemCoordinates = [system.systemX, system.systemY, system.systemZ]
        if (distance(systemCoordinates, SOL_COORDINATES) <= 200) {
          system.tradeZone = 'Core Systems'
          if (system.systemName === 'Sol') {
            system.tradeZoneLocation = 'Centre of the Core Systems'
          } else {
            system.tradeZoneLocation = `${distance(systemCoordinates, SOL_COORDINATES)} ly from Sol`
          }
        } else if (distance(systemCoordinates, SOL_COORDINATES) <= 400) {
          system.tradeZone = 'Core Periphery'
          system.tradeZoneLocation = `${distance(systemCoordinates, SOL_COORDINATES)} ly from Sol`
        } else if (distance(systemCoordinates, COLONIA_COORDINATES) <= 100) {
          system.tradeZone = 'Colonia Region'
          if (system.systemName === 'Colonia') {
            system.tradeZoneLocation = `${distance(systemCoordinates, SOL_COORDINATES)} ly from the Core Systems`
          } else {
            system.tradeZoneLocation = `${distance(systemCoordinates, COLONIA_COORDINATES)} ly from Colonia`
          }
        } else {
          system.tradeZone = 'Deep Space'
          system.tradeZoneLocation = (
            <>
              {`${distance(systemCoordinates, SOL_COORDINATES)} ly from Sol`}
              <br />
              {`${distance(systemCoordinates, COLONIA_COORDINATES)} ly from Colonia`}
              <br />
              {`${distance(systemCoordinates, GALACTIC_CENTER_COORDINATES)} ly from Sagittarius A*`}
            </>
          )
        }
        setSystem(system)

        setNavigationPath([{ name: system.systemName, path: '/', icon: 'icarus-terminal-system-orbits' }])
        ; (async () => {
          const stations = await getStationsInSystem(system.systemAddress)
          setStationsInSystem(
            stations
            // .filter( station =>
            //   station.stationType !== 'OnFootSettlement' &&
            //   station.stationType !== 'MegaShip' &&
            //   station.stationType !== 'FleetCarrier' &&
            //   station.stationType !== 'StrongholdCarrier' &&
            //   station.stationType !== null &&
            //   !station?.stationName?.includes(' Construction Site: ')
            // )
              .sort((a, b) => a?.distanceToArrival - b?.distanceToArrival)
          )
          setSettlementsInSystem(
            stations
              .filter(station => station.stationType === 'OnFootSettlement' || station.stationType === null)
              .sort((a, b) => a?.distanceToArrival - b?.distanceToArrival)
          )
          setFleetCarriersInSystem(
            stations
              .filter(station => station.stationType === 'FleetCarrier')
              .sort((a, b) => a?.distanceToArrival - b?.distanceToArrival)
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
          const _systemStatus = await getSystemStatus(system.systemAddress)
          setSystemStatus(_systemStatus ?? [])
        })()

        ; (async () => {
          const _bodiesInSystem = await getBodiesInSystem(system.systemAddress)
          setBodiesInSystem(_bodiesInSystem ?? [])
        })()

        ; (async () => {
          const [
            interstellarFactors,
            universalCartographics,
            shipyard,
            blackMarket
          ] = await Promise.all([
            getNearestService(system.systemAddress, 'interstellar-factors'),
            getNearestService(system.systemAddress, 'universal-cartographics'),
            getNearestService(system.systemAddress, 'shipyard'),
            getNearestService(system.systemAddress, 'black-market')
          ])
          setNearestServices({
            'Interstellar Factors': interstellarFactors,
            'Universal Cartographics': universalCartographics,
            Shipyard: shipyard,
            'Black Market': blackMarket
          })
        })()

        ; (async () => {
          const nearbySystems = await getNearbySystems(system.systemAddress)
          nearbySystems.forEach(s => {
            s.distance = distance(
              [system.systemX, system.systemY, system.systemZ],
              [s.systemX, s.systemY, s.systemZ]
            )
          })
          setNearbySystems(nearbySystems.filter(s => !HIDDEN_SYSTEMS.includes(`${s.systemAddress}`)))
        })()

        ; (async () => {
          let importOrders = await getSystemImports(system.systemAddress)
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
          let importOrders = await getSystemImports(system.systemAddress)
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
          const exportOrders = await getSystemExports(system.systemAddress)
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
      } else {
        setLoading(false)
        setSystem(null)
        setStationsInSystem(null)
        setSettlementsInSystem(null)
        setFleetCarriersInSystem(null)
        setMegashipsInSystem(null)
        setNearbySystems(null)
        setImportOrders(null)
        setExportOrders(null)
        setLastUpdatedAt(null)
        setBodiesInSystem(null)
        setSystemStatus(null)
        setNearestServices(null)
      }
    })()
  }, [router.query['system-identifer']])

  // If a numeric system ID was specified, use that for links, otherwise, if it
  // looks like a name, keep using that so the URL format doesn't change.
  const systemViewBaseUrl = (Number.isInteger(parseInt(router?.query['system-identifer'])))
    ? `/system/${system?.systemAddress}`
    : `/system/${system?.systemName.replaceAll(' ', '_')}`

  return (
    <Layout
      loading={loading}
      loadingText='Loading system data'
      title={system ? `${system.systemName} system` : null}
      description={system ? `Data for the system ${system.systemName} in Elite Dangerous` : null}
      navigation={[
        {
          name: 'Map',
          icon: 'icarus-terminal-system-bodies',
          url: systemViewBaseUrl,
          active: views[activeViewIndex] === ''
        },
        {
          name: 'Locations',
          icon: 'icarus-terminal-table-index',
          url: `${systemViewBaseUrl}/list`,
          active: views[activeViewIndex] === 'list'
        },
        {
          name: 'Commodities',
          icon: 'icarus-terminal-cargo',
          url: `${systemViewBaseUrl}/exports`,
          active: (views[activeViewIndex] === 'exports' || views[activeViewIndex] === 'imports')
        },
        {
          name: 'Services',
          icon: 'icarus-terminal-scan',
          url: `${systemViewBaseUrl}/services`,
          active: views[activeViewIndex] === 'services'
        },
        {
          name: 'Nearby',
          icon: 'icarus-terminal-route',
          url: `${systemViewBaseUrl}/nearby`,
          active: views[activeViewIndex] === 'nearby'
        }
      ]}
    >
      <Head>
        <link rel='canonical' href={`https://ardent-insight.com/system/${system?.systemName}/${views[activeViewIndex]}`} />
      </Head>
      {system === null && <>
        <div className='heading--with-underline'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-warning' />
            <span className='text-no-transform'>System not found</span>
          </h2>
        </div>
        <div className='error__text' style={{left: '3rem'}}>
          <i className='icon icarus-terminal-warning' />
          <span className='text-blink-slow muted'>System not found</span>
        </div>
      </>}
      {system &&
        <>
          {views[activeViewIndex] === '' &&
            <SystemMap
              system={system}
              systemStatus={systemStatus}
              nearbySystems={nearbySystems}
              stationsInSystem={stationsInSystem}
              settlementsInSystem={settlementsInSystem}
              megashipsInSystem={megashipsInSystem}
              fleetCarriersInSystem={fleetCarriersInSystem}
              bodiesInSystem={bodiesInSystem}
              importOrders={importOrders}
              exportOrders={exportOrders}
              lastUpdatedAt={lastUpdatedAt}
            />}
          {views[activeViewIndex] === 'list' &&
            <SystemList system={system} bodiesInSystem={bodiesInSystem} stationsInSystem={stationsInSystem} />}
          {(views[activeViewIndex] === 'exports' || views[activeViewIndex] === 'imports') &&
            <SystemTrade
              system={system}
              stationsInSystem={stationsInSystem}
              importOrders={importOrders}
              exportOrders={exportOrders}
              rareGoods={rareGoods}
              lastUpdatedAt={lastUpdatedAt}
            />}
          {views[activeViewIndex] === 'services' &&
            <SystemServices system={system} nearestServices={nearestServices} />}
          {views[activeViewIndex] === 'nearby' &&
            <SystemNearby system={system} nearbySystems={nearbySystems} />}
        </>}
    </Layout>
  )
}

async function getSystem (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v1/system/${systemIdentiferType}/${systemIdentifer}`)
    return (res.status === 200) ? await res.json() : null
  } catch (e) {
    console.error(e)
  }
}

async function getStationsInSystem (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v1/system/${systemIdentiferType}/${systemIdentifer}/stations`)
    return (res.status === 200) ? await res.json() : null
  } catch (e) {
    console.error(e)
  }
}

async function getNearbySystems (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v1/system/${systemIdentiferType}/${systemIdentifer}/nearby?maxDistance=25`)
    return await res.json()
  } catch (e) {
    console.error(e)
  }
}

async function getNearestService (systemIdentifer, service) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v1/system/${systemIdentiferType}/${systemIdentifer}/nearest/${service}?minLandingPadSize=3`)
    return res.ok ? await res.json() : null
  } catch (e) {
    console.error(e)
  }
}

async function getBodiesInSystem (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v1/system/${systemIdentiferType}/${systemIdentifer}/bodies`)
    return await res.json()
  } catch (e) {
    console.error(e)
  }
}

async function getSystemStatus (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v1/system/${systemIdentiferType}/${systemIdentifer}/status`)
    return await res.json()
  } catch (e) {
    console.error(e)
  }
}
