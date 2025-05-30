import { useState, useEffect } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import CommodityExportOrders from './commodity-exporters'
import CommodityImportOrders from './commodity-importers'
import commoditiesInfo from 'lib/commodities.json'
import { API_BASE_URL } from 'lib/consts'

export default ({ commodityName, reportName = 'core-systems-1000' }) => {
  const [exports, setExports] = useState()
  const [imports, setImports] = useState()

  useEffect(() => {
    (async () => {
      setExports(undefined)
      setImports(undefined)

      if (!commodityName) return

      const commodityReport = await getCommodityReport(commodityName, reportName)

      ;(commodityReport?.bestExporters ?? []).forEach(c => {
        c.key = `${c.marketId}_${c.commodityName}`
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName.toLowerCase()
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityName
      })
      setExports((commodityReport?.bestExporters ?? []))

      ;(commodityReport?.bestImporters ?? []).forEach(c => {
        c.key = `${c.marketId}_${c.commodityName}`
        c.avgProfit = c.avgSellPrice - c.avgBuyPrice
        c.avgProfitMargin = Math.floor((c.avgProfit / c.avgBuyPrice) * 100)
        c.maxProfit = c.maxSellPrice - c.minBuyPrice
        c.symbol = c.commodityName.toLowerCase()
        c.category = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.category ?? ''
        c.name = (commoditiesInfo.find(el => el.symbol.toLowerCase() === c.symbol))?.name ?? c.commodityName
        delete c.commodityName
      })
      setImports((commodityReport?.bestImporters ?? []))
    })()
  }, [commodityName, reportName])

  return (
    <>
      <Tabs>
        <TabList>
          <Tab>Imports</Tab>
          <Tab>Exports</Tab>
        </TabList>
        <TabPanel>
          {!imports && <div className='loading-bar loading-bar--tab' />}
          {imports && <CommodityImportOrders commodities={imports} />}
        </TabPanel>
        <TabPanel>
          {!exports && <div className='loading-bar loading-bar--tab' />}
          {exports && <CommodityExportOrders commodities={exports} />}
        </TabPanel>
      </Tabs>
    </>
  )
}

async function getCommodityReport (commodityName, reportName) {
  const res = await fetch(`${API_BASE_URL}/v2/commodity/name/${commodityName}/${reportName}`)
  return await res.json()
}
