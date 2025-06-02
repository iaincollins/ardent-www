import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import CommodityFilterOptions from 'components/commodity-filter-options'
import Layout from 'components/layout'
import CommodityImporters from 'components/commodity-importers/commodity-importers'
import CommodityExporters from 'components/commodity-exporters/commodity-exporters'
import listOfCommodities from 'lib/commodities/commodities.json'
import animateTableEffect from 'lib/animate-table-effect'
import { NavigationContext } from 'lib/context'
import commodityCategories from 'lib/commodities/commodity-categories.json'
import { playLoadingSound } from 'lib/sounds'
import { getCommodityBySymbolOrName, getCommoditiesWithPricing } from 'lib/commodities'

import {
  API_BASE_URL,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT,
  COMMODITY_FILTER_LOCATION_DEFAULT,
  COMMODITY_FILTER_DISTANCE_DEFAULT
} from 'lib/consts'
import StationIcon from 'components/station-icon'

const TABS = ['exporters', 'importers']

export default () => {
  const router = useRouter()
  const [, setNavigationPath] = useContext(NavigationContext)
  const [cachedQuery, setCachedQuery] = useState()
  const [activeTab, setActiveTab] = useState()
  const [commodities, setCommodities] = useState([])
  const [commodity, setCommodity] = useState()
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()
  const [rareMarket, setRareMarket] = useState()

  useEffect(animateTableEffect)

  async function getExporters(commoditySymbol) {
    setExports(undefined)
      ; (async () => {
        const exports = await getExports(commoditySymbol)
        if (Array.isArray(exports)) {
          exports.forEach(c => {
            c.key = `${c.marketId}_${c.commoditySymbol}`
            c.symbol = commoditySymbol
            c.avgProfit = c.avgSellPrice - c.avgBuyPrice
            c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
            c.maxProfit = c.maxSellPrice - c.minBuyPrice
            c.category = listOfCommodities[c.symbol]?.category ?? ''
            c.name = listOfCommodities[commoditySymbol]?.name ?? commoditySymbol
            delete c.commodityName
          })
          setExports(exports)
        } else {
          setExports([])
        }
      })()
  }

  async function getImporters(commoditySymbol) {
    setImports(undefined)
      ; (async () => {
        const imports = await getImports(commoditySymbol)
        if (Array.isArray(imports)) {
          imports.forEach(c => {
            c.symbol = commoditySymbol
            c.key = `${c.marketId}_${c.commoditySymbol}`
            c.avgProfit = c.avgSellPrice - c.avgBuyPrice
            c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
            c.maxProfit = c.maxSellPrice - c.minBuyPrice
            c.category = listOfCommodities[commoditySymbol]?.category ?? ''
            c.name = listOfCommodities[commoditySymbol]?.name ?? commoditySymbol
            delete c.commodityName
          })
          setImports(imports)
        } else {
          setImports([])
        }
      })()
  }

  async function loadCommodity(_commoditySymbol, _activeTab) {
    const commoditySymbol = _commoditySymbol?.toLowerCase()
    
    if (!commoditySymbol)

    setNavigationPath([{ name: 'Commodities', path: '/commodities', icon: 'icarus-terminal-cargo' }])

    const cacheFingerprint = JSON.stringify({
      commoditySymbol,
      activeTab: _activeTab,
      query: parseQueryString()
    })
    if (cachedQuery && cachedQuery === cacheFingerprint) return // If the query hasn't *really* changed, return early
    setCachedQuery(cacheFingerprint) // If the query has changed, continue and update the "last seen" query

    // Reset Imports / Exports when loading a new commodity or applying new filter rules
    setImports(undefined)
    setExports(undefined)

    const c = await getCommodityBySymbolOrName(commoditySymbol)
    if (c) {
      if (commoditySymbol.toLowerCase() !== c.symbol.toLowerCase()) {
        router.push(`/commodity/${c.symbol.toLowerCase()}/${_activeTab}${window.location.search}`)
        return
      }
      setCommodity(c)
      if (c?.rareMarketId) {
        const rareMarket = await getMarket(c.rareMarketId)
        setRareMarket(rareMarket)
      } else {
        setRareMarket(undefined)
      }

      playLoadingSound()
      if (activeTab === 'exporters') getExporters(commoditySymbol, activeTab)
      if (activeTab === 'importers') getImporters(commoditySymbol, activeTab)
    } else {
      // Invalid commodity names / symbols get set to null
      setCommodity(null)
    }
  }

  const loadCommodityEventHandler = (e) => {
    const commoditySymbol = e.detail.toLowerCase()

    // We don't have access to the router.query from an event, so hackily reading from the URL
    const _activeTab = window.location.pathname.split('/')?.[3]?.toLowerCase() ?? TABS[0]

    router.push(`/commodity/${commoditySymbol}/${_activeTab}${window.location.search}`)
  }

  useEffect(() => {
    ; (async () => {
      const commoditiesWithPricing = await getCommoditiesWithPricing()
      setCommodities(commoditiesWithPricing)
    })()

    window.addEventListener('LoadCommodityEvent', loadCommodityEventHandler)
    return () => window.removeEventListener('LoadCommodityEvent', loadCommodityEventHandler)
  }, [])

  useEffect(() => {
    const commoditySymbol = router.query?.slug?.[0]?.toLowerCase()
    const _activeTab = router.query?.slug?.[1] ?? TABS[0]

    // TODO: Check inputs and gracefully invalid values
    if (!commoditySymbol) return
    if (!_activeTab) return

    setActiveTab(_activeTab)

    if (_activeTab !== activeTab) {
      router.push(`/commodity/${commoditySymbol}/${_activeTab}${window.location.search}`)
    } else {
      loadCommodity(commoditySymbol, _activeTab)
    }
  }, [router.query])

  if (commodity === null) {
    router.push('/commodities')
    return
  }

  return (
    <Layout
      loading={commodity === undefined}
      loadingText='Loading trade data'
      title={commodity ? `${commodity.name} commodity` : null}
      description={commodity ? `Where to buy and sell ${commodity.name} in Elite Dangerous` : null}
      sidebar={(commodity !== null ? <CommodityInfo commodities={commodities} commodity={commodity} rareMarket={rareMarket} /> : undefined)}
      heading={
        <div className='heading--with-underline'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-cargo' />Trade Data
          </h2>
        </div>
      }
    >
      <Head>
        <link rel='canonical' href={`https://ardent-insight.com/commodity/${commodity?.symbol}/${activeTab}`} />
      </Head>
      {commodity &&
        <div className='sticky-heading fx__fade-in'>
          <Tabs
            selectedIndex={TABS.indexOf(activeTab)}
            className='clear'
            onSelect={
              (index) => {
                router.push(`/commodity/${commodity?.symbol.toLowerCase()}/${TABS[index]}${window.location.search}`)
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
              {exports && <CommodityExporters tableName={`Exporters of ${commodity.name}`} commodities={exports} />}
            </TabPanel>
            <TabPanel>
              {!imports && <div className='loading-bar loading-bar--tab' />}
              {imports && <CommodityImporters tableName={`Importers of ${commodity.name}`} commodities={imports} rare={!!rareMarket} />}
            </TabPanel>
          </Tabs>
        </div>}
    </Layout>
  )
}

async function getCommodity(commodityName) {
  const res = await fetch(`${API_BASE_URL}/v2/commodity/name/${commodityName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getExports(commodityName) {
  try {
    const url = `${API_BASE_URL}/v2/commodity/name/${commodityName}/exports?${apiQueryOptions()}`
    const res = await fetch(url)
    return await res.json()
  } catch (e) {
    return []
  }
}

async function getImports(commodityName) {
  try {
    const url = `${API_BASE_URL}/v2/commodity/name/${commodityName}/imports?${apiQueryOptions()}`
    const res = await fetch(url)
    return await res.json()
  } catch (e) {
    return []
  }
}

async function getMarket(marketId) {
  const res = await fetch(`${API_BASE_URL}/v2/market/${marketId}`)
  return (res.status === 200) ? await res.json() : null
}

// const InsufficentData = () => <span style={{ opacity: 0.4 }}>Insufficent data</span>

// const ratio = (a, b) => {
//   const greatestCommonDivisor = (a, b) => (b === 0) ? a : greatestCommonDivisor(b, a % b)
//   return `${a / greatestCommonDivisor(a, b)}:${b / greatestCommonDivisor(a, b)}`
// }

function apiQueryOptions() {
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
    // If the location value is a number, treat it as a system address
    if (isNaN(locationFilterValue)) {
      options.push(`systemName=${encodeURIComponent(locationFilterValue)}`)
    } else {
      options.push(`systemAddress=${encodeURIComponent(locationFilterValue)}`)
    }
    if (distanceFilterValue && distanceFilterValue !== COMMODITY_FILTER_DISTANCE_DEFAULT) {
      options.push(`maxDistance=${distanceFilterValue}`)
    }
  }

  return options.join('&')
}

function parseQueryString() {
  const obj = {}
  window.location.search.replace(
    new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
    ($0, $1, $2, $3) => { obj[$1] = decodeURIComponent($3) }
  )
  return obj
}

const CommodityInfo = ({ commodities, commodity, rareMarket }) => {
  if (!commodity) return
  return (
    <div style={{ paddingTop: '.5rem' }}>
      <CommodityFilterOptions commodities={commodities} commodity={commodity} />
      <div className='fx__fade-in' style={{ padding: '0 .1rem' }}>
        <p className='fx__animated-text text-uppercase' data-fx-order='3' style={{ marginBottom: '.25rem', fontSize: '.9rem' }}>
          <Link href={`/commodities/${commodity.category.toLowerCase()}`}>{commodity.category}</Link>
        </p>
        <p className='text-no-transform muted' style={{ fontSize: '.8rem', marginTop: '.1rem' }}>
          {commodityCategories[commodity.category]?.description}
        </p>
        {commodity?.rare && rareMarket?.stationName && rareMarket?.systemName &&
          <>
            <span className='text-rare text-uppercase' style={{ fontSize: '.9rem', lineHeight: '1.5rem', display: 'block', marginTop: '.5rem' }}>
              Rare export
              {commodity?.rareMaxCount && <small> Limit {commodity.rareMaxCount}T</small>}
            </span>
            <StationIcon station={rareMarket}>
              <span className='fx__animated-text text-no-transform' data-fx-order='2' style={{ fontSize: '.9rem' }}>
                <Link href={`/commodity/${commodity.symbol.toLowerCase()}?location=${rareMarket.systemName}`}>{rareMarket.stationName}</Link>
                {rareMarket.distanceToArrival !== undefined &&
                  <>
                    <small className='text-no-transform'> {Math.round(rareMarket.distanceToArrival).toLocaleString()} Ls</small>
                  </>}
              </span>
              {/* <br />
              <span className='fx__animated-text text-no-transform' data-fx-order='3' style={{ fontSize: '.9rem' }}>
                <Link href={`/commodity/${commodity.symbol.toLowerCase()}?location=${rareMarket.systemName}`}>{rareMarket.systemName}</Link>
              </span> */}
              {/* {commodity?.rareMaxCount && <>
                <br />
                <span className='fx__animated-text text-no-transform' data-fx-order='3' style={{ fontSize: '.9rem' }}>
                  <small>Limit {commodity.rareMaxCount}T</small>
                </span></>} */}
            </StationIcon>
            <div style={{ paddingTop: '.5rem' }}>
              <Link className='button--small' href={`/system/${rareMarket.systemAddress}`}>
                <i className='icarus-terminal-star system-icon' />
                {rareMarket.systemName}
              </Link>
            </div>
          </>}
        {listOfCommodities[commodity.symbol]?.description &&
          <p style={{ marginBottom: 0, textTransform: 'none', fontSize: '.9rem' }}>
            {listOfCommodities[commodity.symbol]?.description}
          </p>}
      </div>
    </div>
  )
}
