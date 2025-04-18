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
    setNavigationPath([{ name: 'GALNET NEWS', path: '/news' }]
    )
    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/news/galnet`)
        if (res.ok) setGalnetNews(await res.json())
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])
  return (
    <Layout
      title='Ardent Insight'
      description='Ardent Insight is companion software for the game Elite Dangerous'
    >
      <Head>
        <link rel='canonical' href='https://ardent-insight.com/about' />
      </Head>
      <div className='fx__fade-in'>
        <div style={{ left: '.5rem', right: '.5rem', maxWidth: '50rem', marginLeft: 'auto', marginRight: 'auto'}}>
          {galnetNews && galnetNews.map((newsItem, i) => (
            <div key={newsItem.url} style={{marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '.2rem dashed var(--color-primary-darkest)'}}>
              <div className='home__news-article-body'>
                <img src={newsItem.image} width='100%' alt='News article headline' className='home__news-headline-image' />
                <div className='home__news-article-text scrollable'>
                  <h3 className='home__news-article-headline'>{newsItem.title}</h3>
                  <p className='muted text-uppercase'><a target='_blank' href={`https://www.elitedangerous.com/news/galnet/${newsItem.slug}`} rel='noreferrer'>Galnet {newsItem.date} </a></p>
                  <Markdown>{`${newsItem.text.replaceAll('\n', '\n\n')}`}</Markdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
