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
import { getAllCommodities } from 'lib/commodities'
import animateTableEffect from 'lib/animate-table-effect'
import {
  API_BASE_URL,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT
} from 'lib/consts'

export default () => {
  const router = useRouter()
  const [tabIndex, setTabIndex] = useState(0)
  const [commodity, setCommodity] = useState()
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()

  const tabs = ['importers', 'exporters']

  useEffect(animateTableEffect)

  useEffect(() => {
    const basePath = path.basename(router.pathname)
    if (basePath === 'importers') setTabIndex(0)
    if (basePath === 'exporters') setTabIndex(1)
  }, [router.pathname])

  async function getImportsAndExports (arg) {
    const commodityName = router.query?.['commodity-name'] ?? window.location?.pathname?.replace(/\/(importers|exporters)$/, '').replace(/.*\//, '')
    if (!commodityName) return
    setImports(undefined)
    setExports(undefined)

    const imports = await getImports(commodityName)
    imports.forEach(c => {
      c.key = c.commodityId
      c.avgProfit = c.avgSellPrice - c.avgBuyPrice
      c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
      c.maxProfit = c.maxSellPrice - c.minBuyPrice
      c.symbol = c.commodityName.toLowerCase()
      c.category = (getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
      c.name = (getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
      c.rare = ((getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.market_id)
      delete c.commodityId
      delete c.commodityName
    })
    setImports(imports)

    const exports = await getExports(commodityName)
    exports.forEach(c => {
      c.key = c.commodityId
      c.avgProfit = c.avgSellPrice - c.avgBuyPrice
      c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
      c.maxProfit = c.maxSellPrice - c.minBuyPrice
      c.symbol = c.commodityName.toLowerCase()
      c.category = (getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
      c.name = (getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
      c.rare = ((getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.market_id)
      delete c.commodityId
      delete c.commodityName
    })
    setExports(exports)
  }

  useEffect(() => {
    (async () => {
      setCommodity(undefined)

      const commodityName = router.query?.['commodity-name']
      if (!commodityName) return

      let c = await getCommodity(commodityName)
      if (c) {
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName.toLowerCase()
        c.category = (getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? 'Unknown'
        c.name = (getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        c.rare = ((getAllCommodities().find(el => el.symbol.toLowerCase() === c.symbol))?.market_id)
        delete c.commodityName
      }
      if (!c) c = getAllCommodities().find(el => el.symbol.toLowerCase() === commodityName.toLowerCase())
      if (c && !c.totalDemand) c.totalDemand = 0
      if (c && !c.totalStock) c.totalStock = 0
      setCommodity(c || null)

      getImportsAndExports()
    })()
  }, [router.query['commodity-name']])

  useEffect(() => {
    window.addEventListener('CommodityFilterChangeEvent', getImportsAndExports)
    return () => window.removeEventListener('CommodityFilterChangeEvent', getImportsAndExports)
  }, [])

  return (
    <Layout loading={!commodity} loadingText='Loading trade data'>
      <Head>
        <link rel='canonical' href={`https://ardent-industry.com/system/${commodity?.symbol}/${tabs[tabIndex]}`} />
      </Head>
      <ul
        className='breadcrumbs fx__fade-in' onClick={(e) => {
          if (e.target.tagName === 'LI') e.target.children[0].click()
        }}
      >
        <li><Link href='/'>Home</Link></li>
        <li><Link href='/commodities'>Commodities</Link></li>
      </ul>
      {commodity === null && <><h2>Error</h2><p className='clear'>Commodity not found</p></>}
      {commodity &&
        <div className='fx__fade-in'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-cargo' />
            {commodity.name}
          </h2>
          <table className='properties-table'>
            <tbody>
              <tr>
                <th>Category</th>
                <td>
                  <span className='fx__animated-text' data-fx-order='1'>
                    {commodity.category}
                    {commodity.rare && <span className='muted'> (Rare)</span>}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Import price</th>
                <td>
                  <span className='fx__animated-text' data-fx-order='2'>
                    {commodity.rare
                      ? <>
                        {((commodity.avgSellPrice + 16000) / 2).toLocaleString()} CR
                        {' '}
                        <small>({commodity.avgSellPrice.toLocaleString()} - {(commodity.avgSellPrice + 16000).toLocaleString()} CR)</small>
                        </>
                      : <>
                        {typeof commodity.avgSellPrice === 'number'
                          ? <>
                            {commodity.avgSellPrice.toLocaleString()} CR/T
                            {' '}
                            {commodity.minSellPrice !== commodity.maxSellPrice &&
                              <small>({commodity.minSellPrice.toLocaleString()} - {commodity.maxSellPrice.toLocaleString()} CR)</small>}
                            </>
                          : <span className='muted'>Insufficent data</span>}
                        </>}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Export price</th>
                <td>
                  <span className='fx__animated-text' data-fx-order='3'>
                    {typeof commodity.avgBuyPrice === 'number'
                      ? <>
                        {commodity.avgBuyPrice.toLocaleString()} CR/T
                        {' '}
                        {commodity.minBuyPrice !== commodity.maxBuyPrice &&
                          <small>({commodity.minBuyPrice.toLocaleString()} - {commodity.maxBuyPrice.toLocaleString()} CR)</small>}
                        </>
                      : <span className='muted'>Insufficent data</span>}
                  </span>
                </td>
              </tr>
              {typeof commodity.avgBuyPrice === 'number' && typeof commodity.avgSellPrice === 'number' && !commodity.rare &&
                <tr>
                  <th>Typical profit</th>
                  <td>
                    <span className='fx__animated-text' data-fx-order='4'>
                      {commodity.avgProfit === 0
                        ? <span className='muted'>Insufficent data</span>
                        : <>
                          {commodity.avgProfit.toLocaleString()} CR/T
                          {' '}
                          <small>({commodity.avgProfitMargin}% margin)</small>
                        </>}
                    </span>
                  </td>
                </tr>}
              <tr>
                <th>Total demand</th>
                <td>
                  <span className='fx__fade-in'>
                    <progress
                      max={Math.max(commodity.totalStock, commodity.totalDemand)}
                      value={commodity.totalDemand}
                      style={{ maxWidth: '12rem', height: '1.5rem' }}
                    />
                    <p style={{ margin: '0 0 .15rem 0' }}>
                      {commodity.totalDemand > 0 ? <>{commodity.totalDemand.toLocaleString()} T</> : '-'}
                    </p>
                  </span>
                </td>
              </tr>
              <tr>
                <th>Total supply</th>
                <td>
                  <span className='fx__fade-in'>
                    <progress
                      max={Math.max(commodity.totalStock, commodity.totalDemand)}
                      value={commodity.totalStock}
                      style={{ maxWidth: '12rem', height: '1.5rem' }}
                    />
                    <p style={{ margin: '0 0 .15rem 0' }}>
                      <small />{commodity.totalStock > 0 ? <>{commodity.totalStock.toLocaleString()} T</> : '-'}
                    </p>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          {/* <p className='clear muted' style={{ padding: '0 0 1rem .25rem' }}>
            Galactic prices and total supply/demand updated daily
          </p> */}
          {commodity.rare &&
            <>
              <p style={{ textAlign: 'center', position: 'relative', top: '-.5rem' }}>
                <i className='icon icarus-terminal-info' style={{ marginRight: '.25rem' }} />
                Rare goods are only available in limited quantities from exclusive locations but can be sold almost anywhere.
              </p>
            </>}
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
            <CommodityTabOptions />
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

async function getCommodity (commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/commodity/name/${commodityName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getExports (commodityName) {
  let url = `${API_BASE_URL}/v1/commodity/name/${commodityName}/exports`
  const options = []

  const lastUpdatedFilterValue = window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
  const minVolumeFilterValue = window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT
  const fleetCarrierFilterValue = window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT

  options.push(`maxDaysAgo=${lastUpdatedFilterValue}`)
  options.push(`minVolume=${minVolumeFilterValue}`)
  if (fleetCarrierFilterValue === 'excluded') options.push('fleetCarriers=false')
  if (fleetCarrierFilterValue === 'only') options.push('fleetCarriers=true')

  if (options.length > 0) {
    url += `?${options.join('&')}`
  }

  const res = await fetch(url)
  return await res.json()
}

async function getImports (commodityName) {
  let url = `${API_BASE_URL}/v1/commodity/name/${commodityName}/imports`
  const options = []

  const lastUpdatedFilterValue = window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
  const minVolumeFilterValue = window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT
  const fleetCarrierFilterValue = window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT

  options.push(`maxDaysAgo=${lastUpdatedFilterValue}`)
  options.push(`minVolume=${minVolumeFilterValue}`)
  if (fleetCarrierFilterValue === 'excluded') options.push('fleetCarriers=false')
  if (fleetCarrierFilterValue === 'only') options.push('fleetCarriers=true')

  if (options.length > 0) {
    url += `?${options.join('&')}`
  }

  const res = await fetch(url)
  return await res.json()
}
