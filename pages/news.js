import { useEffect, useContext, useState, Fragment } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Layout from 'components/layout'
import { NavigationContext } from 'lib/context'
import { API_BASE_URL } from 'lib/consts'
import Markdown from 'react-markdown'

export default (props) => {
  const router = useRouter()
  const [, setNavigationPath] = useContext(NavigationContext)
  const [galnetNews, setGalnetNews] = useState()
  const [articleSlug, setArticleSlug] = useState()

  useEffect(() => {
    setNavigationPath([{ name: 'Galnet News', path: '/news' }])
    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v2/news/galnet`)
        if (res.ok) setGalnetNews(await res.json())
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  useEffect(() => {
    setArticleSlug(router?.query?.article ?? undefined)
  }, [router.query])

  return (
    <Layout
      title='Ardent Insight'
      description='Ardent Insight is companion software for the game Elite Dangerous'
    >
      <Head>
        <link rel='canonical' href='https://ardent-insight.com/about' />
      </Head>
      <div className='fx__fade-in'>
        <div style={{ left: '.5rem', right: '.5rem', marginLeft: 'auto', marginRight: 'auto', maxWidth: '60rem' }}>
          <div className='heading--with-underline'>
            <h2 className='text-uppercase'>Galnet News</h2>
          </div>
          {galnetNews && galnetNews.map((newsItem, i) => (
            <Fragment key={`galnet-news-item-${i}}`}>
              {(articleSlug === undefined || articleSlug === newsItem.slug) &&
                <div id={newsItem.slug} key={newsItem.url} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '.2rem dashed var(--color-primary-darkest)' }}>
                  <div className='home__news-article-body'>
                    <img src={newsItem.image} width='100%' alt='News article headline' className='home__news-headline-image' />
                    <div className='home__news-article-text scrollable'>
                      <h3 className='home__news-article-headline'>{newsItem.title}</h3>
                      <p className='muted text-uppercase'><a target='_blank' href={`https://www.elitedangerous.com/news/galnet/${newsItem.slug}`} rel='noreferrer'>Galnet {newsItem.date} </a></p>
                      <Markdown>{`${newsItem.text.replaceAll('\n', '\n\n')}`}</Markdown>
                    </div>
                  </div>
                </div>}
            </Fragment>
          ))}

          {articleSlug !== undefined && galnetNews !== undefined &&
            <div style={{ position: 'relative', top: '-2rem' }}>
              <div className='heading--with-underline'>
                <h3>More from Galnet</h3>
              </div>
              <ul style={{ margin: '1rem 0' }}>
                {galnetNews.filter(a => a.slug !== articleSlug).map((nextNewsItem, j) => (
                  <li key={nextNewsItem.url} className='text-uppercase' style={{ marginTop: '.5rem' }}><Link scroll={false} href={`/news?article=${nextNewsItem.slug}`}>{nextNewsItem.title}</Link></li>
                ))}
              </ul>
            </div>}

          <p className='text-center'>
            <Link className='button' style={{ textAlign: 'center', display: 'inline-block', padding: '.5rem 2rem', fontSize: '1.25rem' }} href='/'>
              <i className='icon icarus-terminal-home' style={{ position: 'relative', top: '-.1rem', marginRight: '1rem' }} />
              Home
            </Link>
          </p>

        </div>
      </div>
    </Layout>
  )
}
