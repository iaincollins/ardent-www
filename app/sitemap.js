import { getCommoditiesWithAvgPricing } from 'lib/commodities'

export default async function sitemap () {
  const commodities = await getCommoditiesWithAvgPricing()
  const sitemap = [
    {
      url: 'https://ardent-insight.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: 'https://ardent-insight.com/commodities',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: 'https://ardent-insight.com/about',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.3
    },
    {
      url: 'https://ardent-insight.com/downloads',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.3
    }
  ]

  commodities.forEach(commodity => {
    sitemap.push({
      url: `https://ardent-insight.com/commodity/${commodity.commodityName}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    })
    sitemap.push({
      url: `https://ardent-insight.com/commodity/${commodity.commodityName}/importers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    })
    sitemap.push({
      url: `https://ardent-insight.com/commodity/${commodity.commodityName}/exporters`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    })
  })

  return sitemap
}
