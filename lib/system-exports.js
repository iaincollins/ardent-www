import { getCommoditiesWithAvgPricing } from 'lib/commodities'
import { API_BASE_URL } from 'lib/consts'

module.exports = async (systemName) => {
  const allCommodities = await getCommoditiesWithAvgPricing()
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/commodities/exports`)
  const exportOrders = await res.json()

  const exportOrdersGroupedByCommodity = {}
  exportOrders.forEach(c => {
    const symbol = c.commodityName.toLowerCase()

    if (!exportOrdersGroupedByCommodity[symbol]) {
      exportOrdersGroupedByCommodity[symbol] = {
        key: symbol,
        symbol,
        name: (allCommodities.find(el => el.symbol.toLowerCase() === symbol))?.name ?? c.commodityName,
        category: (allCommodities.find(el => el.symbol.toLowerCase() === symbol))?.category ?? '',
        systemName: c.systemName,
        totalStock: 0,
        totalPrice: 0,
        avgPrice: 0,
        bestPrice: null,
        galacticAvgPrice: (allCommodities.find(el => el.symbol.toLowerCase() === symbol))?.avgBuyPrice ?? 0,
        updatedAt: null,
        producer: c.statusFlags?.includes('Producer') ?? false,
        exportOrders: []
      }
    }

    exportOrdersGroupedByCommodity[symbol].exportOrders.push(c)
    exportOrdersGroupedByCommodity[symbol].totalStock += c.stock
    exportOrdersGroupedByCommodity[symbol].totalPrice += c.buyPrice * c.stock
    exportOrdersGroupedByCommodity[symbol].avgPrice = Math.round(exportOrdersGroupedByCommodity[symbol].totalPrice / exportOrdersGroupedByCommodity[symbol].totalStock)
    if (exportOrdersGroupedByCommodity[symbol].bestPrice === null ||
        c.buyPrice < exportOrdersGroupedByCommodity[symbol].bestPrice) {
      exportOrdersGroupedByCommodity[symbol].bestPrice = c.buyPrice
    }
    if (exportOrdersGroupedByCommodity[symbol].updatedAt === null ||
        c.updatedAt > exportOrdersGroupedByCommodity[symbol].updatedAt) {
      exportOrdersGroupedByCommodity[symbol].updatedAt = c.updatedAt
    }
  })

  return Object.values(exportOrdersGroupedByCommodity)
    .sort((a, b) => a.name.localeCompare(b.name))
    .sort((a, b) => a.category.localeCompare(b.category))
}
