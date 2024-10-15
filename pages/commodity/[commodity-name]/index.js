import path from 'path'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import CommodityTabOptions from 'components/tab-options/commodities'
import Layout from 'components/layout'
import CommodityImportOrders from 'components/commodity-import-orders'
import CommodityExportOrders from 'components/commodity-export-orders'
import listOfCommodities from 'lib/commodities/commodities.json'
import animateTableEffect from 'lib/animate-table-effect'

import {
  API_BASE_URL,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT
} from 'lib/consts'

// FIXME Only terrible code here, sorry 🗑️🔥

export default () => {
  const router = useRouter()
  const [tabIndex, setTabIndex] = useState(0)
  const [commodity, setCommodity] = useState()
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()
  const [rareMarket, setRareMarket] = useState()

  const tabs = ['importers', 'exporters']

  useEffect(animateTableEffect)

  useEffect(() => {
    const basePath = path.basename(router.pathname)
    if (basePath === 'importers') setTabIndex(0)
    if (basePath === 'exporters') setTabIndex(1)
  }, [router.pathname])

  async function getImportsAndExports() {
    // Can't reliably get this from the the route.query object
    const commodityName = window.location.pathname.split('/')[2]
    if (!commodityName) return

    setImports(undefined)
    setExports(undefined)

      // Fetch imports and exports together at the same time
      ; (async () => {
        const imports = await getImports(commodityName)
        if (Array.isArray(imports)) {
          imports.forEach(c => {
            c.key = c.commodityId
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

      ; (async () => {
        const exports = await getExports(commodityName)
        if (Array.isArray(exports)) {
          exports.forEach(c => {
            c.key = c.commodityId
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

  useEffect(() => {
    ; (async () => {
      const commodityName = router.query?.['commodity-name']
      if (!commodityName) return

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

  useEffect(() => {
    const commodityFilterChangeEvent = () => getImportsAndExports()
    window.addEventListener('CommodityFilterChangeEvent', commodityFilterChangeEvent)
    return () => window.removeEventListener('CommodityFilterChangeEvent', commodityFilterChangeEvent)
  }, [])

  return (
    <Layout
      loading={commodity === undefined}
      loadingText='Loading trade data'
      title={commodity ? `${commodity.name} - commodity in Elite Dangerous` : null}
      description={commodity ? `Where to buy and sell ${commodity.name} in Elite Dangerous` : null}
    >
      <Head>
        <link rel='canonical' href={`https://ardent-industry.com/commodity/${commodity?.symbol}/${tabs[tabIndex]}`} />
      </Head>
      <ul
        className='breadcrumbs fx__fade-in' onClick={(e) => {
          if (e.target.tagName === 'LI') e.target.children[0].click()
        }}
      >
        <li><Link href='/commodities'>Commodities</Link></li>
        {commodity?.category && <li><Link href={`/commodities/${commodity?.category.toLowerCase()}`}>{commodity?.category}</Link></li>}
      </ul>
      {commodity === null && <><h1>Error: Not found</h1><p className='text-large clear'>Commodity not found.</p></>}
      {commodity &&
        <div className='fx__fade-in'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-cargo' />
            {commodity.name}
          </h2>
          <table className='properties-table' style={{ marginBottom: 0 }}>
            <tbody>
              <tr>
                <th>Bulk import price</th>
                <td>
                  <span className='fx__animated-text' data-fx-order='2'>
                    {typeof commodity.avgSellPrice === 'number'
                      ? (
                        <>
                          {commodity.avgSellPrice.toLocaleString()} CR/T
                          {' '}
                          {commodity.minSellPrice !== commodity.maxSellPrice &&
                            <small>({commodity.rare && 'Approx. '}{commodity.minSellPrice.toLocaleString()} - {commodity.maxSellPrice.toLocaleString()} CR)</small>}
                        </>
                      )
                      : <InsufficentData />}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Bulk export price</th>
                <td>
                  <span className='fx__animated-text' data-fx-order='3'>
                    {typeof commodity.avgBuyPrice === 'number'
                      ? (
                        <>
                          {commodity.avgBuyPrice.toLocaleString()} CR/T
                          {' '}
                          {commodity.minBuyPrice !== commodity.maxBuyPrice &&
                            <small>({commodity.minBuyPrice.toLocaleString()} - {commodity.maxBuyPrice.toLocaleString()} CR)</small>}
                        </>
                      )
                      : <InsufficentData />}
                  </span>
                </td>
              </tr>
              {typeof commodity.avgBuyPrice === 'number' && typeof commodity.avgSellPrice === 'number' &&
                <tr>
                  <th>Avg profit</th>
                  <td>
                    <span className='fx__animated-text' data-fx-order='5'>
                      {commodity.avgProfit === 0
                        ? <InsufficentData />
                        : (
                          <>
                            {commodity.avgProfit.toLocaleString()} CR/T
                            {' '}
                            <small>({commodity.avgProfitMargin.toLocaleString()}% margin)</small>
                          </>
                        )}
                    </span>
                  </td>
                </tr>}
              {commodity?.rare && rareMarket?.stationName && rareMarket?.systemName &&
                <>
                  {rareMarket?.stationName && rareMarket?.systemName &&
                    <tr>
                      <th>Exported by</th>
                      <td>
                        <span className='fx__animated-text text-no-transform' data-fx-order='4'>
                          <Link href={`/system/${rareMarket.systemName}/`}>{rareMarket.stationName}, {rareMarket.systemName}</Link>
                          {commodity?.rareMaxCount && <small> (limit {commodity.rareMaxCount}T)</small>}
                        </span>
                      </td>
                    </tr>}
                </>}
              {!commodity.rare &&
                <tr>
                  <th>Supply/Demand</th>
                  <td>
                    <span className='fx__fade-in'>
                      {commodity.totalDemand > 0 &&
                        <div style={{ maxWidth: '12rem' }}>
                          <p style={{ margin: 0 }}>
                            {commodity.totalDemand > commodity.totalStock
                              ? <>
                                {Math.floor((commodity.totalStock / commodity.totalDemand) * 100) >= 75 && <><i class="trade-bracket-icon text-warning icarus-terminal-signal flip-vertical"/> Low demand</>}
                                {Math.floor((commodity.totalStock / commodity.totalDemand) * 100) >= 25 && Math.floor((commodity.totalStock / commodity.totalDemand) * 100) < 75 && <><i class="trade-bracket-icon  icarus-terminal-signal"/> Medium demand</>}
                                {Math.floor((commodity.totalStock / commodity.totalDemand) * 100) >= 0 && Math.floor((commodity.totalStock / commodity.totalDemand) * 100) < 25 && <><i class="trade-bracket-icon text-positive icarus-terminal-signal"/> High demand</>}
                              </>
                              : <><i class="trade-bracket-icon text-negative icarus-terminal-signal flip-vertical"/> Oversupply </>
                            }
                          </p>
                        </div>}
                      {(commodity.totalDemand === 0) && <InsufficentData />}
                    </span>
                  </td>
                </tr>
              }
              {listOfCommodities[commodity.symbol]?.description &&
                <tr>
                  <th>
                    Description
                  </th>
                  <td>
                    <p style={{ margin: 0, textTransform: 'none' }}>
                      {listOfCommodities[commodity.symbol]?.description}
                    </p>
                  </td>
                </tr>}
              {commodity.rare &&
                <tr className='muted'>
                  <th style={{ fontSize: '.8rem' }}>
                    <i className='icon icarus-terminal-info' style={{ position: 'relative', top: '-.1rem', marginRight: '.25rem' }} />
                    RARE
                  </th>
                  <td>
                    <p style={{ margin: 0, textTransform: 'none', fontSize: '.8rem' }}>
                      Rare items are usually only available in limited quantities from exclusive locations but can be sold almost anywhere.
                      They fetch a higher price in stations that are further from the system that produced them, typically fetching the
                      the highest possible value around 150-200 ly away.
                    </p>
                  </td>
                </tr>}
            </tbody>
          </table>
          <Tabs
            selectedIndex={tabIndex}
            onSelect={
              (index) => {
                router.push(`/commodity/${router.query['commodity-name']}/${tabs[index]}`)
              }
            }
          >
            <TabList>
              <Tab>Importers</Tab>
              <Tab>Exporters</Tab>
            </TabList>
            <CommodityTabOptions disabled={!!((!imports || !exports))} />
            <TabPanel>
              {!imports && <div className='loading-bar loading-bar--tab' />}
              {imports && <CommodityImportOrders commodities={imports} />}
            </TabPanel>
            <TabPanel>
              {!exports && <div className='loading-bar loading-bar--tab' />}
              {exports && <CommodityExportOrders commodities={exports} />}
            </TabPanel>
          </Tabs>
        </div>}
    </Layout>
  )
}

async function getCommodity(commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/commodity/name/${commodityName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getExports(commodityName) {
  let url = `${API_BASE_URL}/v1/commodity/name/${commodityName}/exports`
  const options = []

  const lastUpdatedFilterValue = window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
  const minVolumeFilterValue = window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT
  const fleetCarrierFilterValue = window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT
  const locationFilterValue = window.localStorage?.getItem('locationFilter') ?? null
  const distanceFilterValue = window.localStorage?.getItem('distanceFilter') ?? null

  options.push(`maxDaysAgo=${lastUpdatedFilterValue}`)
  options.push(`minVolume=${minVolumeFilterValue}`)
  if (fleetCarrierFilterValue === 'excluded') options.push('fleetCarriers=false')
  if (fleetCarrierFilterValue === 'only') options.push('fleetCarriers=true')
  if (locationFilterValue !== null) options.push(`systemName=${encodeURIComponent(locationFilterValue)}`)
  if (distanceFilterValue !== null) options.push(`maxDistance=${distanceFilterValue}`)

  if (options.length > 0) {
    url += `?${options.join('&')}`
  }

  const res = await fetch(url)
  return await res.json()
}

async function getImports(commodityName) {
  let url = `${API_BASE_URL}/v1/commodity/name/${commodityName}/imports`
  const options = []

  const lastUpdatedFilterValue = window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
  const minVolumeFilterValue = window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT
  const fleetCarrierFilterValue = window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT
  const locationFilterValue = window.localStorage?.getItem('locationFilter') ?? null
  const distanceFilterValue = window.localStorage?.getItem('distanceFilter') ?? null

  options.push(`maxDaysAgo=${lastUpdatedFilterValue}`)
  options.push(`minVolume=${minVolumeFilterValue}`)
  if (fleetCarrierFilterValue === 'excluded') options.push('fleetCarriers=false')
  if (fleetCarrierFilterValue === 'only') options.push('fleetCarriers=true')
  if (locationFilterValue !== null) options.push(`systemName=${encodeURIComponent(locationFilterValue)}`)
  if (distanceFilterValue !== null) options.push(`maxDistance=${distanceFilterValue}`)

  if (options.length > 0) {
    url += `?${options.join('&')}`
  }

  const res = await fetch(url)
  return await res.json()
}

async function getCommodityFromMarket(marketId, commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/market/${marketId}/commodity/name/${commodityName}`)
  return (res.status === 200) ? await res.json() : null
}

const InsufficentData = () => <span style={{ opacity: 0.4 }}>Insufficent data</span>

const ratio = (a, b) => {
  const greatestCommonDivisor = (a, b) => (b == 0) ? a : greatestCommonDivisor(b, a % b);
  return `${a / greatestCommonDivisor(a, b)}:${b / greatestCommonDivisor(a, b)}`
}