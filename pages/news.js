import { useEffect, useContext, useState } from 'react'
import Head from 'next/head'
import Layout from 'components/layout'
import { NavigationContext } from 'lib/context'
import { API_BASE_URL } from 'lib/consts'
import Markdown from 'react-markdown'

export default () => {
  const [, setNavigationPath] = useContext(NavigationContext)
  const [galnetNews, setGalnetNews] = useState()
  useEffect(() => {
    setNavigationPath([{ name: 'Home', path: '/' }, { name: 'News', path: '/news' }])
    ;(async () => {
      const res = await fetch(`${API_BASE_URL}/v1/news/galnet`)
      if (res.ok) setGalnetNews(await res.json())
    })()
  }, [])
  return (
    <Layout
      title='Ardent Industry News for Elite Dangerous'
      description='Ardent Industry is companion software for the game Elite Dangerous.'
    >
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/about' />
      </Head>
      <div className='fx__fade-in'>
        <div style={{ margin: 'auto', maxWidth: '60rem', paddingTop: '1rem' }}>
          <h2>Latest News</h2>
          <div className='clear' />
          {galnetNews && galnetNews.map(newsItem => (
            <div key={newsItem.url}>
              <h3>{newsItem.title}</h3>
              <img src={newsItem.image} width='100%' alt='News headline' />
              <p className='muted'>{newsItem.date} :: <a href={newsItem.url}>Galnet News</a></p>
              <Markdown>{`${newsItem.text.replaceAll('\n', '\n\n')}`}</Markdown>
              <hr style={{ marginBottom: '1rem' }} />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
