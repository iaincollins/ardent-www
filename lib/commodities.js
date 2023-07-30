import allRareCommodities from 'lib/commodities/rare-commodities.json'
import allRegularCommodities from 'lib/commodities/regular-commodities.json'
import { API_BASE_URL } from 'lib/consts'

const allCommodities = [...allRegularCommodities, ...allRareCommodities]

async function getCommodities () {
  const res = await fetch(`${API_BASE_URL}/v1/commodities`)
  const commoditiesOnServer = await res.json()

  // Blend canonical list of commodities with commodity info from server, if
  // the server has info about that commodity. The list on the server is likely
  // be a subset as not all commodities actively traded all the time.
  return allCommodities
    .map(commodityInfo => {
      const commodityFromServer = (commoditiesOnServer.find(el => commodityInfo.symbol.toLowerCase() === el.commodityName.toLowerCase()))
      const commodity = (commodityFromServer) ? { ...commodityInfo, ...commodityFromServer } : commodityInfo

      // Normalize properties to make the objects easy to work with in components
      commodity.key = commodity.commodityId
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

function getAllCommodities () { return allCommodities }

module.exports = {
  getCommodities,
  getAllCommodities
}
