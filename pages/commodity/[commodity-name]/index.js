import path from 'path'
import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import CommodityTabOptions from 'components/commodities-options'
import Layout from 'components/layout'
import CommodityImportOrders from 'components/commodity-import-orders'
import CommodityExportOrders from 'components/commodity-export-orders'
import listOfCommodities from 'lib/commodities/commodities.json'
import animateTableEffect from 'lib/animate-table-effect'
import { NavigationContext } from 'lib/context'
import commodityCategories from 'lib/commodities/commodity-categories.json'
import { playLoadingSound } from 'lib/sounds'

import {
  API_BASE_URL,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT,
  COMMODITY_FILTER_LOCATION_DEFAULT,
  COMMODITY_FILTER_DISTANCE_DEFAULT
} from 'lib/consts'

const TABS = ['exporters', 'importers']

export default () => {
  const router = useRouter()
  const [, setNavigationPath] = useContext(NavigationContext)
  const [cachedQuery, setCachedQuery] = useState()
  const [tabIndex, setTabIndex] = useState(0)
  const [commodity, setCommodity] = useState()
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()
  const [rareMarket, setRareMarket] = useState()

  useEffect(animateTableEffect)

  useEffect(() => {
    const basePath = path.basename(router.pathname)
    let newTabIndex = 0
    if (basePath === 'exporters') {
      setExports(undefined)
    }
    if (basePath === 'importers') {
      setImports(undefined)
      newTabIndex = 1
    }
    setTabIndex(newTabIndex)
  }, [router.pathname])

  async function getImportsAndExports () {
    playLoadingSound()

    // Can't reliably get this from the the route.query object
    const commodityName = window.location.pathname.split('/')[2]
    if (!commodityName) return

    const activeTab = window.location.pathname.split('/')[3]?.toLowerCase() ?? TABS[0]

    if (activeTab === 'importers') {
      setImports(undefined)
      ; (async () => {
        const imports = await getImports(commodityName)
        if (Array.isArray(imports)) {
          imports.forEach(c => {
            c.key = `${c.marketId}_${c.commodityName}`
            c.avgProfit = c.avgSellPrice - c.avgBuyPrice
            c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
            c.maxProfit = c.maxSellPrice - c.minBuyPrice
            c.symbol = c.commodityName.toLowerCase()
            c.category = listOfCommodities[c.symbol]?.category ?? ''
            c.name = listOfCommodities[c.symbol]?.name ?? c.commodityName
            delete c.commodityName
          })
          setImports(imports)
        } else {
          setImports([])
        }
      })()
    }

    if (activeTab === 'exporters') {
      setExports(undefined)
      ; (async () => {
        const exports = await getExports(commodityName)
        if (Array.isArray(exports)) {
          exports.forEach(c => {
            c.key = `${c.marketId}_${c.commodityName}`
            c.avgProfit = c.avgSellPrice - c.avgBuyPrice
            c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
            c.maxProfit = c.maxSellPrice - c.minBuyPrice
            c.symbol = c.commodityName.toLowerCase()
            c.category = listOfCommodities[c.symbol]?.category ?? ''
            c.name = listOfCommodities[c.symbol]?.name ?? c.commodityName
            delete c.commodityName
          })
          setExports(exports)
        } else {
          setExports([])
        }
      })()
    }
  }

  useEffect(() => {
    ; (async () => {
      setNavigationPath([{ name: 'Commodities', path: '/commodities', icon: 'icarus-terminal-cargo' }])

      const commodityName = router.query?.['commodity-name']
      if (!commodityName) return

      // Compare current tab (i.e. Importers, Exporters) and query options
      // If they have not actually changed then avoid triggering a redraw.
      const activeTab = window.location.pathname.split('/')[3]?.toLowerCase() ?? TABS[0]
      const cacheFingerprint = JSON.stringify({ activeTab, query: router.query }) // Could be a checksum, but not worth it
      if (cachedQuery && cachedQuery === cacheFingerprint) return // If the query hasn't *really* changed, return early
      setCachedQuery(cacheFingerprint) // If the query has changed, continue and update the "last seen" query

      setImports(undefined)
      setExports(undefined)

      let c = await getCommodity(commodityName)
      if (c) {
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName.toLowerCase()
        c.category = listOfCommodities[c.symbol]?.category ?? 'Insufficent data'
        c.name = listOfCommodities[c.symbol]?.name ?? c.commodityName
        delete c.commodityName
      }
      if (!c) c = listOfCommodities[commodityName.toLowerCase()]
      if (c && !c.totalDemand) c.totalDemand = 0
      if (c && !c.totalStock) c.totalStock = 0
      c ? setCommodity(c) : setCommodity(undefined)
      if (c?.rareMarketId) {
        setRareMarket(await getCommodityFromMarket(c.rareMarketId, c.symbol))
      } else {
        setRareMarket(undefined)
      }

      getImportsAndExports()
    })()
  }, [router.query])

  return (
    <Layout
      loading={commodity === undefined}
      loadingText='Loading trade data'
      title={commodity ? `${commodity.name} commodity` : null}
      description={commodity ? `Where to buy and sell ${commodity.name} in Elite Dangerous` : null}
      sidebar={<CommodityInfo commodity={commodity} rareMarket={rareMarket} />}
      heading={
        <div className='heading--with-underline'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-cargo' />Trade Data
          </h2>
        </div>
      }
    >
      <Head>
        <link rel='canonical' href={`https://ardent-insight.com/commodity/${commodity?.symbol}${(tabIndex > 0) ? `/${TABS[tabIndex]}` : ''}`} />
      </Head>
      {commodity === null && <><h1>Error: Not found</h1><p className='text-large clear'>Commodity not found.</p></>}
      {commodity &&
        <div className='sticky-heading fx__fade-in'>
          <Tabs
            selectedIndex={tabIndex}
            className='clear'
            onSelect={
              (newTabIndex) => {
                router.push(`/commodity/${router.query['commodity-name'].toLowerCase()}/${TABS[newTabIndex]}${window.location.search}`)
              }
            }
          >
            <TabList>
              <Tab>
                <i style={{ lineHeight: '1.5rem', fontSize: '1.5rem', top: '-.15rem', position: 'relative' }} className='icarus-terminal-cargo-export' />
                Exp<span className='is-hidden-mobile'>orters</span>
              </Tab>
              <Tab>
                <i style={{ lineHeight: '1.5rem', fontSize: '1.5rem', top: '-.15rem', position: 'relative' }} className='icarus-terminal-cargo-import' />
                Imp<span className='is-hidden-mobile'>orters</span>
              </Tab>
            </TabList>
            <TabPanel>
              {!exports && <div className='loading-bar loading-bar--tab' />}
              {exports && <CommodityExportOrders tableName={`Exporters of ${commodity.name}`} commodities={exports} />}
            </TabPanel>
            <TabPanel>
              {!imports && <div className='loading-bar loading-bar--tab' />}
              {imports && <CommodityImportOrders tableName={`Importers of ${commodity.name}`} commodities={imports} rare={!!rareMarket} />}
            </TabPanel>
          </Tabs>
        </div>}
    </Layout>
  )
}

async function getCommodity (commodityName) {
  const res = await fetch(`${API_BASE_URL}/v2/commodity/name/${commodityName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getExports (commodityName) {
  try {
    const url = `${API_BASE_URL}/v2/commodity/name/${commodityName}/exports?${apiQueryOptions()}`
    const res = await fetch(url)
    return await res.json()
  } catch (e) {
    return []
  }
}

async function getImports (commodityName) {
  try {
    const url = `${API_BASE_URL}/v2/commodity/name/${commodityName}/imports?${apiQueryOptions()}`
    const res = await fetch(url)
    return await res.json()
  } catch (e) {
    return []
  }
}

async function getCommodityFromMarket (marketId, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v2/market/${marketId}/commodity/name/${commodityName}`)
  return (res.status === 200) ? await res.json() : null
}

// const InsufficentData = () => <span style={{ opacity: 0.4 }}>Insufficent data</span>

// const ratio = (a, b) => {
//   const greatestCommonDivisor = (a, b) => (b === 0) ? a : greatestCommonDivisor(b, a % b)
//   return `${a / greatestCommonDivisor(a, b)}:${b / greatestCommonDivisor(a, b)}`
// }

const TabDescription = ({ children }) => {
  return (
    <div className='tab-options' style={{ paddingTop: '.25rem' }}>
      <p style={{ margin: '.25rem .25rem .25rem .25rem', textTransform: 'uppercase' }}>{children}</p>
    </div>
  )
}

function apiQueryOptions () {
  // Parse current query string and convert the params to an API query parametrer string
  const options = []

  const query = parseQueryString()
  const lastUpdatedFilterValue = query?.maxDaysAgo ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
  const minVolumeFilterValue = query?.minVolume ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT
  const fleetCarrierFilterValue = query?.fleetCarriers ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT
  const locationFilterValue = query?.location ?? COMMODITY_FILTER_LOCATION_DEFAULT
  const distanceFilterValue = query?.maxDistance ?? COMMODITY_FILTER_DISTANCE_DEFAULT

  options.push(`maxDaysAgo=${lastUpdatedFilterValue}`)
  options.push(`minVolume=${minVolumeFilterValue}`)
  if (fleetCarrierFilterValue === 'excluded') options.push('fleetCarriers=false')
  if (fleetCarrierFilterValue === 'only') options.push('fleetCarriers=true')
  if (locationFilterValue && locationFilterValue !== COMMODITY_FILTER_LOCATION_DEFAULT) {
    options.push(`systemName=${encodeURIComponent(locationFilterValue)}`)
    if (distanceFilterValue && distanceFilterValue !== COMMODITY_FILTER_DISTANCE_DEFAULT) {
      options.push(`maxDistance=${distanceFilterValue}`)
    }
  }

  return options.join('&')
}

function parseQueryString () {
  const obj = {}
  window.location.search.replace(
    new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
    ($0, $1, $2, $3) => { obj[$1] = decodeURIComponent($3) }
  )
  return obj
};

const CommodityInfo = ({ commodity, rareMarket }) => {
  if (!commodity) return

  return (
    <div style={{ paddingTop: '.5rem' }}>
      <CommodityTabOptions />
      <div className='fx__fade-in' style={{ padding: '0 .1rem' }}>
        <p className='fx__animated-text text-uppercase' data-fx-order='3' style={{ marginBottom: '.25rem', fontSize: '.9rem' }}>
          <Link href={`/commodities/${commodity.category.toLowerCase()}`}>{commodity.category}</Link>{commodity?.rare ? <span className='text-uppercase muted'>, Rare</span> : undefined}
        </p>
        <p className='text-no-transform muted' style={{ fontSize: '.8rem', marginTop: '.1rem' }}>
          {commodityCategories[commodity.category].description}
        </p>
        {commodity?.rare && rareMarket?.stationName && rareMarket?.systemName &&
          <>
            <span className='text-uppercase muted' style={{ fontSize: '.9rem', display: 'block', marginTop: '.5rem' }}>Only exported from</span>
            <span className='fx__animated-text text-no-transform' data-fx-order='2' style={{ fontSize: '.9rem' }}>
              <Link href={`/commodity/${commodity.symbol.toLowerCase()}?location=${rareMarket.systemName}`}>{rareMarket.stationName}, {rareMarket.systemName}</Link>
              {commodity?.rareMaxCount && <><br /><small>limit {commodity.rareMaxCount}T</small></>}
            </span>
          </>}
        {listOfCommodities[commodity.symbol]?.description &&
          <p style={{ marginBottom: 0, textTransform: 'none', fontSize: '.9rem' }}>
            {listOfCommodities[commodity.symbol]?.description}
          </p>}
      </div>
    </div>
  )
}
