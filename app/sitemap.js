import { getCommodities } from 'lib/commodities'

export default async function sitemap () {
  const commodities = await getCommodities()
  const sitemap = [
    {
      url: 'https://ardent-industry.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: 'https://ardent-industry.com/commodities',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: 'https://ardent-industry.com/about',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.3
    },
    {
      url: 'https://ardent-industry.com/downloads',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.3
    }
  ]

  commodities.forEach(commodity => {
    sitemap.push({
      url: `https://ardent-industry.com/commodity/${commodity.commodityName}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8
    })
  })

  return sitemap
}
