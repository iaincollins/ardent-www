import Head from 'next/head'
import Link from 'next/link'
import Loader from './loader'
import Dialog from 'components/dialog'
import { useEffect } from 'react'
import { playLoadingSound } from 'lib/sounds'

const DEFAULT_TITLE = 'Ardent Insight – Trade & Exploration'
const DEFAULT_DESCRIPTION = 'Ardent Insight provides trade and exploration data for the game Elite Dangerous'

export default ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  loading = false,
  loadingText,
  loadingSound = true,
  children,
  sidebar = undefined,
  className = undefined,
  navigation = undefined,
  navigationOverlaid = false,
  inspector = undefined
}) => {
  useEffect(() => {
    ; (() => {
      if (loadingSound === true) playLoadingSound()
    })()
  }, [])

  return (
    <>
      <Head>
        <title>{title ?? DEFAULT_TITLE}</title>
        <meta name='description' content={description ?? DEFAULT_DESCRIPTION} />
        <meta name='keywords' content='Ardent Insight, Elite Dangerous, Elite: Dangerous, market, trade, commodities, pricing, prices, systems, exploration, API, SQL' />
        <meta name='author' content='Iain Collins' />
        <meta name='viewport' content='width=device-width' />
      </Head>
      <Loader visible={loading} text={loadingText} />
      <Dialog />
      <div className={`${sidebar !== undefined ? 'layout__content-wrapper scrollable' : ''} ${className !== undefined ? className : ''}`}>
        {sidebar !== undefined &&
          <div className={`layout__content layout__content--left-sidebar scrollable ${navigation !== undefined ? 'layout__content--with-navigation' : ''}`}>
            {sidebar}
          </div>}
        <div className={`layout__content scrollable ${sidebar !== undefined ? 'layout__content--right' : ''} ${navigation !== undefined ? 'layout__content--with-navigation' : ''} ${navigationOverlaid === true ? 'layout__content--with-navigation-overlayed' : ''} ${inspector !== undefined ? 'layout__content--with-inspector' : ''}`}>
          {children}
        </div>
        {inspector !== undefined &&
          <div className='layout__inspector scrollable'>
            {inspector}
          </div>}
        {navigation !== undefined &&
          <div className='navigation-bar'>
            {navigation.map(item =>
              <Link key={item.name} href={item.url} className='--no-hover'>
                <button className={`${item?.active === true ? '--active' : ''}`} data-name={item.name}>
                  <i className={`icon ${item.icon}`} />
                </button>
              </Link>
            )}
          </div>}
      </div>
    </>
  )
}
