import { getCommodities } from 'lib/commodities'
import { API_BASE_URL } from 'lib/consts'

module.exports = async (systemName) => {
  const allCommodities = await getCommodities()
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/imports`)
  const importOrders = await res.json()
  const importOrdersGroupedByCommodity = {}
  importOrders.forEach(c => {
    const symbol = c.commodityName.toLowerCase()
    const commodityMetadata = allCommodities.find(el => el.symbol.toLowerCase() === symbol)
    if (!commodityMetadata) return
    if (!c.sellPrice) return

    if (!importOrdersGroupedByCommodity[symbol]) {
      importOrdersGroupedByCommodity[symbol] = {
        key: symbol,
        symbol,
        name: commodityMetadata?.name ?? c.commodityName,
        category: commodityMetadata?.category ?? '',
        systemName: c.systemName,
        totalDemand: 0,
        totalPrice: 0,
        avgPrice: 0,
        bestPrice: null,
        galacticAvgPrice: commodityMetadata?.avgSellPrice ?? 0,
        updatedAt: null,
        consumer: c.statusFlags?.includes('Consumer') ?? false,
        importOrders: []
      }
    }

    importOrdersGroupedByCommodity[symbol].importOrders.push(c)
    importOrdersGroupedByCommodity[symbol].totalDemand += c.demand
    if (importOrdersGroupedByCommodity[symbol].totalDemand > 0) {
      importOrdersGroupedByCommodity[symbol].totalPrice += c.sellPrice * c.demand
      importOrdersGroupedByCommodity[symbol].avgPrice = Math.round(importOrdersGroupedByCommodity[symbol].totalPrice / importOrdersGroupedByCommodity[symbol].totalDemand)
    } else if (!importOrdersGroupedByCommodity[symbol].avgPrice) {
      importOrdersGroupedByCommodity[symbol].avgPrice = c.sellPrice
    }
    if (importOrdersGroupedByCommodity[symbol].bestPrice === null ||
        c.sellPrice > importOrdersGroupedByCommodity[symbol].bestPrice) {
      importOrdersGroupedByCommodity[symbol].bestPrice = c.sellPrice
    }
    if (importOrdersGroupedByCommodity[symbol].updatedAt === null ||
        c.updatedAt > importOrdersGroupedByCommodity[symbol].updatedAt) {
      importOrdersGroupedByCommodity[symbol].updatedAt = c.updatedAt
    }
  })

  return Object.values(importOrdersGroupedByCommodity)
    .filter(c => c.totalDemand)
    .sort((a, b) => a.name.localeCompare(b.name))
    .sort((a, b) => a.category.localeCompare(b.category))
}
