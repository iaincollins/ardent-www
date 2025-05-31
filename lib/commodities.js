import listOfCommodities from 'lib/commodities/commodities.json'
import { API_BASE_URL } from 'lib/consts'

let COMMODITY_PRICE_DATA_CACHED_RESPONSE = null

// This coverts the list back into a simple array so I don't have to refactor
// all the code below (and everything that csonumes it) for now, as I'm already
// refactoring a lot in this step
const listOfCommoditiesAsArray = Object.keys(listOfCommodities).map(c => listOfCommodities[c])

async function getCommodityBySymbol (symbol) {
  const commoditiesWithPricing = await getCommoditiesWithPricing()
  return commoditiesWithPricing?.filter(c => c.symbol.toLowerCase() === symbol.toLowerCase())?.[0]
}

async function getCommodityByName (name) {
  const commoditiesWithPricing = await getCommoditiesWithPricing()
  return commoditiesWithPricing?.filter(c => c.name.toLowerCase() === name.toLowerCase())?.[0]
}

async function getCommoditiesWithPricing (commoditiesWithPricingInput = null) {
  // Use commoditiesWithPricingInput if passed, otherwise try to used a cached
  // value. If it's cached alreadu then we call the server to fetch it
  let commoditiesWithPricing = commoditiesWithPricingInput || COMMODITY_PRICE_DATA_CACHED_RESPONSE
  if (commoditiesWithPricing === null) {
    // This data is pre-generated and a cached response returned, so although
    // large enough response that we would wawnt to cache it, it is always fast
    try {
      const res = await fetch(`${API_BASE_URL}/v2/commodities`)
      COMMODITY_PRICE_DATA_CACHED_RESPONSE = await res.json()
      commoditiesWithPricing = COMMODITY_PRICE_DATA_CACHED_RESPONSE
    } catch (e) {
      console.error(e)
    }
  }

  // Blend canonical list of commodities with commodity info from server, if
  // the server has info about that commodity. The list on the server is likely
  // be a subset as not all commodities actively traded all the time.
  return listOfCommoditiesAsArray
    .map(commodityWithoutPricing => {
      const commodityWithPricing = (commoditiesWithPricing.find(el => commodityWithoutPricing.symbol.toLowerCase() === el.commodityName.toLowerCase()))
      const commodity = (commodityWithPricing) ? { ...commodityWithoutPricing, ...commodityWithPricing } : commodityWithoutPricing

      // Normalize properties to make the objects easy to work with in components
      // commodity.key = commodity?.commodityId ?? null
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
  getCommoditiesWithPricing,
  getCommodityBySymbol,
  getCommodityByName,
  listOfCommoditiesAsArray
}
