import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
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
        c.symbol = c.commodityName
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
        c.symbol = c.commodityName
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
        c.symbol = c.commodityName
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
      {commodity === undefined && <div className='loading-bar' style={{ marginTop: '1.5rem' }} />}
      {commodity === null && <><h2>Error</h2><p>Error: Commodity not found</p></>}
      {commodity &&
        <>
          <h2>
            <i className='icon icarus-terminal-cargo' />
            {commodity.name}
          </h2>
          {/* <p style={{ marginTop: '0.25rem' }}><small>{commodity.category}</small></p> */}
          <div>
            <p className='object-information'>
              <label>Commodity type</label>
              <span>{commodity.category}</span>
            </p>

            <p className='object-information'>
              <label>Export price</label>
              <span>
                {typeof commodity.avgBuyPrice === 'number'
                  ? <>~ {commodity.avgBuyPrice.toLocaleString()} CR ({commodity.minBuyPrice.toLocaleString()} - {commodity.maxBuyPrice.toLocaleString()} CR)</>
                  : <>Insufficent data</>}
              </span>
            </p>
            <p className='object-information'>
              <label>Import price</label>
              <span>
                {typeof commodity.avgSellPrice === 'number'
                  ? <>~ {commodity.avgSellPrice.toLocaleString()} CR ({commodity.minSellPrice.toLocaleString()} - {commodity.maxSellPrice.toLocaleString()} CR)</>
                  : <>Insufficent data</>}
              </span>
            </p>
            {typeof commodity.avgBuyPrice === 'number' && typeof commodity.avgSellPrice === 'number' &&
              <p className='object-information'>
                <label>Average profit</label>
                <span>~ {commodity.avgProfit.toLocaleString()} CR ({commodity.avgProfitMargin}% margin)</span>
              </p>}
            <p className='object-information'>
              <label>Total supply</label>
              <span>
                <progress
                  max={Math.max(commodity.totalStock, commodity.totalDemand)}
                  value={commodity.totalStock}
                  style={{ maxWidth: '10rem' }}
                />
                {commodity.totalStock.toLocaleString()} T
              </span>
            </p>
            <p className='object-information'>
              <label>Total demand</label>
              <span>
                <progress
                  max={Math.max(commodity.totalStock, commodity.totalDemand)}
                  value={commodity.totalDemand}
                  style={{ maxWidth: '10rem' }}
                />
                {commodity.totalDemand.toLocaleString()} T
              </span>
            </p>
          </div>
          <h2>Core Systems Trade Report</h2>
          <p>
            Best export and import prices for <strong>{commodity.name}</strong>
            {' '}near the Sol system.
          </p>
          <p>
            <small style={{ textTransform: 'none' }}>
              Trade reports only include orders for at least 1000 T and do not
              include Fleet Carrier market data.
            </small>
          </p>
          <CommodityReport commodityName={commodity.name} reportName='core-systems-1000' />
          <h2>Colonia Systems Trade Report</h2>
          <p>
            Best export and import prices for <strong>{commodity.name}</strong>
            {' '}near the Colonia system.
          </p>
          <p>
            <small style={{ textTransform: 'none' }}>
              Trade reports only include orders for at least 1000 T and do not
              include Fleet Carrier market data.
            </small>
          </p>
          <CommodityReport commodityName={commodity.name} reportName='colonia-systems-1000' />
          <h2>Live Trade Data</h2>
          <p>
            All known export and import orders for <strong>{commodity.name}</strong>.
          </p>
          <p>
            <small style={{ textTransform: 'none' }}>
              Live trade data updated in real time. Results may be cached for up to 5 minutes.
            </small>
          </p>
          <table>
            <thead>
              <tr>
                <th align='left'><h3 style={{ margin: 0, top: '.5rem' }}>Exporters</h3></th>
                <th align='left'><h3 style={{ margin: 0, top: '.5rem' }}>Importers</h3></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td valign='top' style={{ width: '50%' }}>
                  {!exports && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
                  {exports && <CommodityExportOrders commodities={exports} />}
                </td>
                <td valign='top' style={{ width: '50%' }}>
                  {!imports && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
                  {imports && <CommodityImportOrders commodities={imports} />}
                </td>
              </tr>
            </tbody>
          </table>
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
