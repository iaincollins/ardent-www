import path from 'path'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Layout from 'components/layout'
import CommodityImportOrders from 'components/commodity-import-orders'
import CommodityExportOrders from 'components/commodity-export-orders'
// import CommodityReport from 'components/commodity-report'
import { getAllCommodities } from 'lib/commodities'
import animateTableEffect from 'lib/animate-table-effect'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const router = useRouter()
  const [tabIndex, setTabIndex] = useState(0)
  const [commodity, setCommodity] = useState()
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()

  useEffect(animateTableEffect)

  useEffect(() => {
    const basePath = path.basename(router.pathname)
    if (basePath === 'importers') setTabIndex(0)
    if (basePath === 'exporters') setTabIndex(1)
  }, [router.pathname])

  useEffect(() => {
    (async () => {
      setCommodity(undefined)
      setExports(undefined)
      setImports(undefined)

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
    })()
  }, [router.query['commodity-name']])

  return (
    <Layout loading={commodity === undefined || imports === undefined}>
      <ul className='breadcrumbs fx__fade-in'>
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
                    {typeof commodity.avgSellPrice === 'number'
                      ? (
                        <>
                          {commodity.avgSellPrice.toLocaleString()} CR/T
                          {' '}
                          <small>({commodity.minSellPrice.toLocaleString()} - {commodity.maxSellPrice.toLocaleString()} CR)</small>
                        </>
                        )
                      : <span className='muted'>Insufficent data</span>}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Export price</th>
                <td>
                  <span className='fx__animated-text' data-fx-order='3'>
                    {typeof commodity.avgBuyPrice === 'number'
                      ? (
                        <>
                          {commodity.avgBuyPrice.toLocaleString()} CR/T
                          {' '}
                          <small>({commodity.minBuyPrice.toLocaleString()} - {commodity.maxBuyPrice.toLocaleString()} CR)</small>
                        </>
                        )
                      : <span className='muted'>Insufficent data</span>}
                  </span>
                </td>
              </tr>
              {typeof commodity.avgBuyPrice === 'number' && typeof commodity.avgSellPrice === 'number' &&
                <tr>
                  <th>Typical profit</th>
                  <td>
                    <span className='fx__animated-text' data-fx-order='4'>
                      {commodity.avgProfit.toLocaleString()} CR/T
                      {' '}
                      <small>({commodity.avgProfitMargin}% margin)</small>
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
                      {commodity.totalStock > 0 ? <>{commodity.totalStock.toLocaleString()} T</> : '-'}
                    </p>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          {/* <p className='clear muted' style={{ padding: '0 0 1rem .25rem' }}>
            Galactic prices and total supply/demand updated daily
          </p> */}
          {imports &&
            <Tabs
              selectedIndex={tabIndex}
              onSelect={
                (index) => {
                  const tabs = ['importers', 'exporters']
                  router.push(`/commodity/${router.query['commodity-name']}/${tabs[index]}`)
                }
              }
            >
              <TabList>
                <Tab>Importers</Tab>
                <Tab>Exporters</Tab>
              </TabList>
              <TabPanel>
                {!imports && <div className='loading-bar loading-bar--tab' />}
                {imports && <CommodityImportOrders commodities={imports} />}
              </TabPanel>
              <TabPanel>
                {!exports && <div className='loading-bar loading-bar--tab' />}
                {exports && <CommodityExportOrders commodities={exports} />}
              </TabPanel>
            </Tabs>}
          {/*
          <Tabs>
            <TabList>
              <Tab>Live<span className='is-hidden-mobile'> Data</span></Tab>
              <Tab>Core<span className='is-hidden-mobile'> Systems</span></Tab>
              <Tab>Colonia<span className='is-hidden-mobile'> Region</span></Tab>
            </TabList>
            <div className='tab-panel__container'>
              <TabPanel>
                <div className='tab-panel__header'>
                  <p>
                    Best prices for <strong>{commodity.name}</strong> anywhere in the galaxy
                  </p>
                </div>
              </TabPanel>
              <TabPanel>
                <div className='tab-panel__header'>
                  <p>
                    Best bulk trading prices for <strong>{commodity.name}</strong> in
                    systems near the Core Worlds (aka "The Bubble")
                  </p>
                </div>
                <CommodityReport commodityName={commodity.name} reportName='core-systems-1000' />
              </TabPanel>
              <TabPanel>
                <div className='tab-panel__header'>
                  <p>
                    Best bulk trading prices for <strong>{commodity.name}</strong> in systems near Colonia
                  </p>
                </div>
                <CommodityReport commodityName={commodity.name} reportName='colonia-systems-1000' />
              </TabPanel>
            </div>
          </Tabs> */}
        </div>}
    </Layout>
  )
}

async function getCommodity (commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/commodity/name/${commodityName}`)
  return (res.status === 200) ? await res.json() : null
}

async function getExports (commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/commodity/name/${commodityName}/exports`)
  return await res.json()
}

async function getImports (commodityName) {
  const res = await fetch(`${API_BASE_URL}/v1/commodity/name/${commodityName}/imports`)
  return await res.json()
}
