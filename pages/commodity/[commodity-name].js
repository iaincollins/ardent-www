import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Loader from '../../components/loader'
import CommodityExportOrders from '../../components/commodity-export-orders'
import CommodityImportOrders from '../../components/commodity-import-orders'
import CommodityReport from '../../components/commodity-report'
import commoditiesInfo from '../../lib/commodities.json'

import { API_BASE_URL } from '../../lib/consts'

export default () => {
  const router = useRouter()
  const [commodity, setCommodity] = useState()
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()

  useEffect(() => {
    (async () => {
      setCommodity(undefined)
      setExports(undefined)
      setImports(undefined)

      const commodityName = router.query?.['commodity-name']
      if (!commodityName) return

      const c = await getCommodity(commodityName)
      if (c) {
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName.toLowerCase()
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? 'Unknown'
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityName
      }
      setCommodity(c)

      const exports = await getExports(commodityName)
      exports.forEach(c => {
        c.key = c.commodityId
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName.toLowerCase()
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityId
        delete c.commodityName
      })
      setExports(exports)

      const imports = await getImports(commodityName)
      imports.forEach(c => {
        c.key = c.commodityId
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName.toLowerCase()
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityId
        delete c.commodityName
      })
      setImports(imports)
    })()
  }, [router.query['commodity-name']])

  return (
    <>
      <p className='breadcrumb'>
        <Link href='/'>Home</Link>
        <i className='icarus-terminal-chevron-right' />
        <Link href='/commodities'>Commodities</Link>
      </p>
      {commodity === undefined && <Loader />}
      {commodity === null && <><h2>Error</h2><p className='clear'>Commodity not found</p></>}
      {commodity &&
        <>
          <h2>
            <i className='icon icarus-terminal-cargo' />
            {commodity.name}
          </h2>
          <table className='properties-table'>
            <tbody>
              <tr>
                <th>Category</th>
                <td>{commodity.category}</td>
              </tr>
              <tr>
                <th>Import price</th>
                <td>{typeof commodity.avgSellPrice === 'number'
                  ? (
                    <>
                      {commodity.avgSellPrice.toLocaleString()} CR/T
                      {' '}
                      <small>({commodity.minSellPrice.toLocaleString()} - {commodity.maxSellPrice.toLocaleString()} CR)</small>
                    </>
                    )
                  : <>Insufficent data</>}
                </td>
              </tr>
              <tr>
                <th>Export price</th>
                <td>{typeof commodity.avgBuyPrice === 'number'
                  ? (
                    <>
                      {commodity.avgBuyPrice.toLocaleString()} CR/T
                      {' '}
                      <small>({commodity.minBuyPrice.toLocaleString()} - {commodity.maxBuyPrice.toLocaleString()} CR)</small>
                    </>
                    )
                  : <>Insufficent data</>}
                </td>
              </tr>
              {typeof commodity.avgBuyPrice === 'number' && typeof commodity.avgSellPrice === 'number' &&
                <tr>
                  <th>Typical profit</th>
                  <td>
                    {commodity.avgProfit.toLocaleString()} CR/T
                    {' '}
                    <small>({commodity.avgProfitMargin}% margin)</small>
                  </td>
                </tr>}
              <tr>
                <th>Total demand</th>
                <td>
                  <progress
                    max={Math.max(commodity.totalStock, commodity.totalDemand)}
                    value={commodity.totalDemand}
                    style={{ maxWidth: '12rem' }}
                  />
                  <p style={{ margin: '0 0 .15rem 0' }}>
                    <small>{commodity.totalDemand.toLocaleString()} T</small>
                  </p>
                </td>
              </tr>
              <tr>
                <th>Total supply</th>
                <td>
                  <progress
                    max={Math.max(commodity.totalStock, commodity.totalDemand)}
                    value={commodity.totalStock}
                    style={{ maxWidth: '12rem' }}
                  />
                  <p style={{ margin: '0 0 .15rem 0' }}>
                    <small>{commodity.totalStock.toLocaleString()} T</small>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
          <Tabs>
            <TabList>
              <Tab>Core<span className='is-hidden-mobile'> Systems</span></Tab>
              <Tab>Colonia<span className='is-hidden-mobile'> Systems</span></Tab>
              <Tab>Live<span className='is-hidden-mobile'> Data</span></Tab>
            </TabList>
            <div className='tab-panel__container'>
              <TabPanel>
                <div className='tab-panel__header'>
                  <p>
                    Best bulk trading prices for <strong>{commodity.name}</strong> in
                    the Core Systems (aka "The Bubble")
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
              <TabPanel>
                <div className='tab-panel__header'>
                  <p>
                    Best prices for <strong>{commodity.name}</strong> anywhere in the galaxy
                  </p>
                </div>
                <Tabs>
                  <TabList>
                    <Tab>Imports</Tab>
                    <Tab>Exports</Tab>
                  </TabList>
                  <TabPanel>
                    {!imports && <div className='loading-bar' style={{ marginTop: '.75rem', marginBottom: 0 }} />}
                    {imports && <CommodityImportOrders commodities={imports} />}
                  </TabPanel>
                  <TabPanel>
                    {!exports && <div className='loading-bar' style={{ marginTop: '.75rem', marginBottom: 0 }} />}
                    {exports && <CommodityExportOrders commodities={exports} />}
                  </TabPanel>
                </Tabs>
              </TabPanel>
            </div>
          </Tabs>
        </>}
    </>
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
