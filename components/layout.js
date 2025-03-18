import Loader from './loader'
import Head from 'next/head'

const DEFAULT_TITLE = 'Ardent Industry – Trade & Exploration'
const DEFAULT_DESCRIPTION = 'Ardent Industry provides trade and exploration data for the game Elite Dangerous'

export default ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  loading = false,
  loadingText,
  children,
  sidebar = undefined,
  heading = undefined,
  className = undefined
}) =>
  <>
    <Head>
      <title>{title ?? DEFAULT_TITLE}</title>
      <meta name='description' content={description ?? DEFAULT_DESCRIPTION} />
      <meta name='keywords' content='Ardent Industry, Elite Dangerous, Elite: Dangerous, market, trade, commodities, pricing, prices, systems, exploration, API, SQL' />
      <meta name='author' content='Iain Collins' />
      <meta name='viewport' content='width=device-width' />
    </Head>
    <Loader visible={loading} text={loadingText} />
    <div className={`${sidebar !== undefined ? 'layout__content-wrapper scrollable' : ''} ${className !== undefined ? className : '' }`}>
      {heading !== undefined && sidebar !== undefined &&
        <div className='layout__content-heading'>
          {heading}
        </div>}
      {sidebar !== undefined &&
        <div className='layout__content layout__content--left-sidebar scrollable'>
          {sidebar}
        </div>}
      <div className={`layout__content scrollable ${sidebar !== undefined ? 'layout__content--right' : ''}`}>
        {heading !== undefined && sidebar === undefined &&
          <div>
            {heading}
          </div>}
        {children}
      </div>
    </div>
  </>
