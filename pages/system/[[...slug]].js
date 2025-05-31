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
import { playLoadingSound } from 'lib/sounds'

import {
  API_BASE_URL,
  SOL_COORDINATES,
  COLONIA_COORDINATES,
  GALACTIC_CENTER_COORDINATES,
  HIDDEN_SYSTEMS
} from 'lib/consts'

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

  // TODO Refactor to read path from slug
  const views = ['', 'list', 'exports', 'imports', 'services', 'nearby']

  useEffect(animateTableEffect)

  useEffect(() => {
    if (system !== undefined) setLoading(false)
  })

  useEffect(() => {
    (async () => {
      if (!router.query.slug) return

      const systemIdentifer = router.query.slug[0]?.replaceAll('_', ' ')?.trim()
      if (!systemIdentifer) return

      (router.query?.slug?.[1])
        ? setActiveViewIndex(views.indexOf(router.query.slug[1]))
        : setActiveViewIndex(0)

      setNavigationPath([{ name: '', path: '/', icon: 'icarus-terminal-system-orbits' }])
      setLoading(true)
      setTimeout(playLoadingSound, 1500)

      setSystem(undefined)
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

      const _system = await getSystem(systemIdentifer)
      if (_system) {
        mostRecentUpdatedAt = _system.updatedAt
        setLastUpdatedAt(mostRecentUpdatedAt)
        const systemCoordinates = [_system.systemX, _system.systemY, _system.systemZ]
        if (distance(systemCoordinates, SOL_COORDINATES) <= 200) {
          _system.tradeZone = 'Core Systems'
          if (_system.systemName === 'Sol') {
            _system.tradeZoneLocation = 'Centre of the Core Systems'
          } else {
            _system.tradeZoneLocation = `${distance(systemCoordinates, SOL_COORDINATES)} ly from Sol`
          }
        } else if (distance(systemCoordinates, SOL_COORDINATES) <= 400) {
          _system.tradeZone = 'Core Periphery'
          _system.tradeZoneLocation = `${distance(systemCoordinates, SOL_COORDINATES)} ly from Sol`
        } else if (distance(systemCoordinates, COLONIA_COORDINATES) <= 100) {
          _system.tradeZone = 'Colonia Region'
          if (_system.systemName === 'Colonia') {
            _system.tradeZoneLocation = `${distance(systemCoordinates, SOL_COORDINATES)} ly from the Core Systems`
          } else {
            _system.tradeZoneLocation = `${distance(systemCoordinates, COLONIA_COORDINATES)} ly from Colonia`
          }
        } else {
          _system.tradeZone = 'Deep Space'
          _system.tradeZoneLocation = (
            <>
              {`${distance(systemCoordinates, SOL_COORDINATES)} ly from Sol`}
              <br />
              {`${distance(systemCoordinates, COLONIA_COORDINATES)} ly from Colonia`}
              <br />
              {`${distance(systemCoordinates, GALACTIC_CENTER_COORDINATES)} ly from Sagittarius A*`}
            </>
          )
        }
        setSystem(_system)

        setNavigationPath([{ name: _system.systemName, path: '/', icon: 'icarus-terminal-system-orbits' }])
        ; (async () => {
          const stations = await getStationsInSystem(_system.systemAddress)
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
          const _systemStatus = await getSystemStatus(_system.systemAddress)
          setSystemStatus(_systemStatus ?? [])
        })()

        ; (async () => {
          const _bodiesInSystem = await getBodiesInSystem(_system.systemAddress)
          setBodiesInSystem(_bodiesInSystem ?? [])
        })()

        ; (async () => {
          const [
            interstellarFactors,
            universalCartographics,
            shipyard,
            blackMarket
          ] = await Promise.all([
            getNearestService(_system.systemAddress, 'interstellar-factors'),
            getNearestService(_system.systemAddress, 'universal-cartographics'),
            getNearestService(_system.systemAddress, 'shipyard'),
            getNearestService(_system.systemAddress, 'black-market')
          ])
          setNearestServices({
            'Interstellar Factors': interstellarFactors,
            'Universal Cartographics': universalCartographics,
            Shipyard: shipyard,
            'Black Market': blackMarket
          })
        })()

        ; (async () => {
          const nearbySystems = await getNearbySystems(_system.systemAddress)
          nearbySystems.forEach(s => {
            s.distance = distance(
              [_system.systemX, _system.systemY, _system.systemZ],
              [s.systemX, s.systemY, s.systemZ]
            )
          })
          setNearbySystems(nearbySystems.filter(s => !HIDDEN_SYSTEMS.includes(`${s.systemAddress}`)))
        })()

        ; (async () => {
          let importOrders = await getSystemImports(_system.systemAddress)
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
          let importOrders = await getSystemImports(_system.systemAddress)
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
          const exportOrders = await getSystemExports(_system.systemAddress)
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
  }, [router.query])

  // If a numeric system ID was specified, use that for links, otherwise, if it
  // looks like a name, keep using that so the URL format doesn't change.
  const systemIdentifer = router.query.slug ? router.query.slug[0]?.replaceAll('_', ' ')?.trim() : null
  const systemViewBaseUrl = (systemIdentifer && Number.isInteger(parseInt(systemIdentifer)))
    ? `/system/${system?.systemAddress}`
    : `/system/${system?.systemName.replaceAll(' ', '_')}`

  return (
    <Layout
      loading={loading}
      loadingText='Loading system data'
      loadingSound={false}
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
      navigationOverlaid={!!((views[activeViewIndex] === '' && system !== null))} // Overlay navigation for map view
    >
      <Head>
        <link rel='canonical' href={`https://ardent-insight.com/system/${system?.systemName}/${views[activeViewIndex]}`} />
      </Head>
      {system === null && <>
        <div className='heading--with-underline'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-warning' />
            <span className='text-no-transform'> UNKNOWN SYSTEM</span>
          </h2>
        </div>
        <div className='error__text' style={{ left: '3rem' }}>
          <i className='icon icarus-terminal-warning' />
          <span className='text-blink-slow muted'> No data for this system</span>
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
    const res = await fetch(`${API_BASE_URL}/v2/system/${systemIdentiferType}/${systemIdentifer}`)
    return (res.status === 200) ? await res.json() : null
  } catch (e) {
    console.error(e)
  }
}

async function getStationsInSystem (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v2/system/${systemIdentiferType}/${systemIdentifer}/stations`)
    return (res.status === 200) ? await res.json() : null
  } catch (e) {
    console.error(e)
  }
}

async function getNearbySystems (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v2/system/${systemIdentiferType}/${systemIdentifer}/nearby?maxDistance=25`)
    return await res.json()
  } catch (e) {
    console.error(e)
  }
}

async function getNearestService (systemIdentifer, service) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v2/system/${systemIdentiferType}/${systemIdentifer}/nearest/${service}?minLandingPadSize=3`)
    return res.ok ? await res.json() : null
  } catch (e) {
    console.error(e)
  }
}

async function getBodiesInSystem (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v2/system/${systemIdentiferType}/${systemIdentifer}/bodies`)
    return await res.json()
  } catch (e) {
    console.error(e)
  }
}

async function getSystemStatus (systemIdentifer) {
  try {
    const systemIdentiferType = systemIdentiferIsSystemAddress(systemIdentifer) ? 'address' : 'name'
    const res = await fetch(`${API_BASE_URL}/v2/system/${systemIdentiferType}/${systemIdentifer}/status`)
    return await res.json()
  } catch (e) {
    console.error(e)
  }
}
