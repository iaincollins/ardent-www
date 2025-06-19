import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Table from 'rc-table'
import Layout from 'components/layout'
import { getCommoditiesWithPricing } from 'lib/commodities'
import animateTableEffect from 'lib/animate-table-effect'
import commodityCategories from 'lib/commodities/commodity-categories.json'
import { NavigationContext } from 'lib/context'
import { playLoadingSound } from 'lib/sounds'

export default function Page (props) {
  const [, setNavigationPath] = useContext(NavigationContext)

  const router = useRouter()
  const [commodities, setCommodities] = useState(props.commodities)
  const [categories, setCategories] = useState(props.categories)

  const onRowClick = (record, index, event) => {
    router.push(`/commodity/${record.commodityName}`)
  }

  useEffect(animateTableEffect)

  useEffect(() => {
    (async () => {
      setNavigationPath([{ name: 'Commodities', path: '/commodities', icon: 'icarus-terminal-cargo' }])

      const commodities_ = commodities ?? await getCommoditiesWithPricing()

      const filterByCategory = (router.query.slug)
        ? commodities_.filter((c) => c.category.toLowerCase() === router.query.slug[0].toLowerCase())?.[0]?.category ?? false
        : false

      const categories_ = filterByCategory
        ? [filterByCategory]
        : [...new Set(commodities_.map((c) => c.category).sort())]

      setCommodities(commodities_)
      setCategories(categories_)
      playLoadingSound()
    })()
  }, [router.query])

  return (
    <Layout
      loading={commodities === undefined}
      loadingText='Loading commodities'
      title={categories?.length === 1 ? `${categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category => category)} commodities - Elite Dangerous` : 'Commodities in Elite Dangerous'}
      description={categories?.length === 1 ? `Where to buy and sell ${categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category => category)} in Elite Dangerous` : 'Where to buy and sell commodities in Elite Dangerous'}
    >
      <Head>
        <link rel='canonical' href='https://ardent-insight.com/commodities' />
      </Head>
      {commodities && categories &&
        <div className='fx__fade-in'>
          {categories?.length > 1 &&
            <>
              <div className='heading--with-underline'>
                <h2 className='heading--with-icon'>
                  <i className='icon icarus-terminal-cargo' />
                  Commodities
                </h2>
              </div>
            </>}
          {categories?.length === 1 && commodityCategories[categories[0]]?.description &&
            <>
              <div className='heading--with-underline'>
                <h2 className='heading--with-icon'>
                  <i className='icon icarus-terminal-cargo' />
                  {categories}
                </h2>
              </div>
              <p className='clear' style={{ marginBottom: '.5rem' }}>
                {commodityCategories[categories[0]].description}
                {categories?.length === 1 && commodityCategories[categories[0]]?.whereToFind &&
                  <>
                    {' '}{commodityCategories[categories[0]]?.whereToFind}
                  </>}
              </p>
            </>}
          {categories?.length > 1 &&
            <div className='menu-button-grid' style={{ marginTop: '.5rem' }}>
              {categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category =>
                <Link key={`category-button__${category}`} className='button' href={`/commodities/${category.toLowerCase()}`}>{category}</Link>
              )}
            </div>}
          {categories?.length === 1 && categories.filter(category => category.toLowerCase() !== 'nonmarketable').map(category =>
            <div key={`category_${category}`} style={{ marginTop: '1rem' }}>
              {categories?.length > 1 && <h2 className='heading--table' onClick={() => router.push(`/commodities/${category.toLowerCase()}`)}>{category}</h2>}
              <Table
                className='data-table data-table--striped data-table--interactive data-table--animated'
                columns={[
                  {
                    title: 'Commodity',
                    dataIndex: 'name',
                    key: 'commodityName',
                    align: 'left',
                    className: 'max-width-mobile',
                    render: (v, r) =>
                      <>
                        <i className='icon icarus-terminal-cargo' />
                        {v}<br />
                        <small>{r.category}</small>
                        {r?.market_id && <small style={{ opacity: 1 }} className='text-rare'> Rare</small>}
                        <div className='is-visible-mobile'>
                          <table className='data-table--mini data-table--compact two-column-table'>
                            <tbody style={{ textTransform: 'uppercase' }}>
                              <tr>
                                <td><span className='data-table__label'>Avg Export CR/T</span>{r.avgBuyPrice > 0 ? <>{r.avgBuyPrice.toLocaleString()} CR</> : '-'}</td>
                                <td><span className='data-table__label'>Avg Profit CR/T</span>{r.avgProfit > 0 ? <>{r.avgProfit.toLocaleString()} CR</> : '-'}</td>
                              </tr>
                              <tr>
                                <td><span className='data-table__label'>Avg Import CR/T</span>
                                  {r.avgSellPrice > 0 ? <>{r.avgSellPrice.toLocaleString()} CR</> : '-'}
                                </td>
                                <td><span className='data-table__label'>Max Profit CR/T</span>{r.maxProfit > 0 ? <>{r.maxProfit.toLocaleString()} CR</> : '-'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </>
                  },
                  {
                    title: 'Avg export CR/T',
                    dataIndex: 'avgBuyPrice',
                    key: 'avgBuyPrice',
                    align: 'right',
                    className: 'is-hidden-mobile no-wrap',
                    width: 150,
                    render: (v) => v > 0 ? <>{v.toLocaleString()} CR</> : <small>-</small>
                  },
                  {
                    title: 'Avg import CR/T',
                    dataIndex: 'avgSellPrice',
                    key: 'avgSellPrice',
                    align: 'right',
                    className: 'is-hidden-mobile no-wrap',
                    width: 150,
                    render: (v, r) => (v > 0) ? <>{v.toLocaleString()} CR</> : <small>-</small>
                  },
                  {
                    title: 'Avg profit CR/T',
                    dataIndex: 'avgProfit',
                    key: 'avgProfit',
                    align: 'right',
                    width: 150,
                    className: 'is-hidden-mobile no-wrap',
                    render: (v, r) =>
                      <div style={{ textTransform: 'uppercase' }}>
                        {v > 0 ? <>{v.toLocaleString()} CR</> : <small>-</small>}
                        <br />
                        {v > 0 ? <small>Max {r.maxProfit.toLocaleString()} CR</small> : ''}
                      </div>
                  }
                ]}
                data={commodities.filter(c => c.category.toLowerCase() === category.toLowerCase())}
                rowKey='name'
                onRow={(record, index) => ({
                  onClick: onRowClick.bind(null, record, index)
                })}
              />
            </div>
          )}
        </div>}
    </Layout>
  )
}
