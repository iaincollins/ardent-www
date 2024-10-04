import listOfCommodities from 'lib/commodities/commodities.json'
import { API_BASE_URL } from 'lib/consts'

// This coverts the list back into a simple array so I don't have to refactor
// all the code below (and everything that csonumes it) for now, as I'm already
// refactoring a lot in this step
const listOfCommoditiesAsArray = Object.keys(listOfCommodities).map(c => listOfCommodities[c])

async function getCommodities (rawCommoditiesData) {
  // Use rawCommoditiesData if provided, else fetch data from server
  let latestCommoditiesData = rawCommoditiesData
  if (!latestCommoditiesData) {
    const res = await fetch(`${API_BASE_URL}/v1/commodities`)
    latestCommoditiesData = await res.json()
  }

  // Blend canonical list of commodities with commodity info from server, if
  // the server has info about that commodity. The list on the server is likely
  // be a subset as not all commodities actively traded all the time.
  return listOfCommoditiesAsArray
    .map(commodityInfo => {
      const latestCommodityData = (latestCommoditiesData.find(el => commodityInfo.symbol.toLowerCase() === el.commodityName.toLowerCase()))
      const commodity = (latestCommodityData) ? { ...commodityInfo, ...latestCommodityData } : commodityInfo

      // Normalize properties to make the objects easy to work with in components
      commodity.key = commodity?.commodityId ?? null
      commodity.avgProfit = commodity.avgSellPrice - commodity.avgBuyPrice
      commodity.avgProfitMargin = Math.floor((commodity.avgProfit / commodity.avgBuyPrice) * 100)
      commodity.maxProfit = commodity.maxSellPrice - commodity.minBuyPrice
      if (!commodity.totalDemand) commodity.totalDemand = 0
      if (!commodity.avgSellPrice) commodity.avgSellPrice = 0
      if (!commodity.totalStock) commodity.totalStock = 0
      if (!commodity.avgBuyPrice) commodity.avgBuyPrice = 0
      return commodity
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

module.exports = {
  getCommodities
}
