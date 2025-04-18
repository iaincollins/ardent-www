import Head from 'next/head'
import Link from 'next/link'
import Loader from './loader'

const DEFAULT_TITLE = 'Ardent Insight – Trade & Exploration'
const DEFAULT_DESCRIPTION = 'Ardent Insight provides trade and exploration data for the game Elite Dangerous'

export default ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  loading = false,
  loadingText,
  children,
  sidebar = undefined,
  heading = undefined,
  className = undefined,
  navigation = undefined
}) =>
  <>
    <Head>
      <title>{title ?? DEFAULT_TITLE}</title>
      <meta name='description' content={description ?? DEFAULT_DESCRIPTION} />
      <meta name='keywords' content='Ardent Insight, Elite Dangerous, Elite: Dangerous, market, trade, commodities, pricing, prices, systems, exploration, API, SQL' />
      <meta name='author' content='Iain Collins' />
      <meta name='viewport' content='width=device-width' />
    </Head>
    <Loader visible={loading} text={loadingText} />
    <div className={`${sidebar !== undefined ? 'layout__content-wrapper scrollable' : ''} ${className !== undefined ? className : ''}`}>
      {/* {heading !== undefined && sidebar !== undefined &&
        <div className='layout__content-heading'>
          {heading}
        </div>} */}
      {sidebar !== undefined &&
        <div className={`layout__content layout__content--left-sidebar scrollable ${navigation !== undefined ? 'layout__content--with-navigation' : ''}`}>
          {sidebar}
        </div>}
      <div className={`layout__content scrollable ${sidebar !== undefined ? 'layout__content--right' : ''} ${navigation !== undefined ? 'layout__content--with-navigation' : ''}`}>
        {/* {heading !== undefined && sidebar === undefined &&
          <div>
            {heading}
          </div>} */}
        {children}
      </div>
      {navigation !== undefined &&
        <div className='navigation-bar'>
          {navigation.map(item =>
            <Link key={item.url} href={item.url}><button className={`${item?.active === true ? '--active' : ''}`}>
              <i className={`icon ${item.icon}`} />
            </button>
            </Link>
          )}
        </div>}
    </div>
  </>
