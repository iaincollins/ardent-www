import { getCommoditiesWithPricing } from 'lib/commodities'

export default async function sitemap () {
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

  try {
    // Fetching the live commodities list requires the API to be online.
    // This is wrapped in a try/catch block to suppress errors if the API is
    // unavailable (e.g. when deploying during a maintenance window)
    const commodities = await getCommoditiesWithPricing()
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
  } catch (e) {
    console.warn('WARNING: Skipped building sitemap for commodites - API may be unavailable')
  }

  return sitemap
}
