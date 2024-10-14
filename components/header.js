import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AboutDialog from 'components/dialog/about-dialog'
import { getCommoditiesWithAvgPricing } from 'lib/commodities'
import commodities from 'lib/commodities/commodities'
import {
  API_BASE_URL,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT
} from 'lib/consts'

export default () => {
  const router = useRouter()
  const [fullScreenState, setFullScreenState] = useState(false)
  const [aboutDialogVisible, setAboutDialogVisible] = useState(false)
  const [newsTicker, setNewsTicker] = useState([])

  useEffect(() => {
    document.addEventListener('fullscreenchange', onFullScreenChangeHandler)
    return () => document.removeEventListener('click', onFullScreenChangeHandler)
    function onFullScreenChangeHandler(event) {
      setFullScreenState(isFullScreen())
    }
  }, [])

  const updateTicker = async () => {
    const res = await fetch(`${API_BASE_URL}/v1-beta/commodities/ticker`)
    const ticker = await res.json()
    const latestCommodityData = await getCommoditiesWithAvgPricing()

    const newTickerItems = []
    ticker.forEach((item, i) => {
      const metadataForCommodity = latestCommodityData.find(el => el.symbol.toLowerCase() === item.commodityName.toLowerCase())
      if (metadataForCommodity) {
        newTickerItems.push({
          ...metadataForCommodity,
          ...item
        })
      }
    })
    setNewsTicker(newTickerItems)
  }
  useEffect(() => {
    updateTicker()
    const timeoutId = setInterval(() => {
      updateTicker()
    }, 1000 * 200 - 30)
    return () => clearInterval(timeoutId)
  }, [])

  return (
    <header>
      <Link href='/' className='--no-hover' style={{ border: 'none' }}>
        <div className='header__logo'>
          <h1>
            <em>A</em>rdent <span className='is-hidden-mobile'><em>I</em>ndustry</span>
          </h1>
          <p style={{ fontStyle: 'italic' }}>
            Trade &amp; Exploration<span className='is-hidden-mobile'> Data</span>
          </p>
        </div>
      </Link>
      <div className='header__navigation' style={{ display: 'block' }}>
        {/* <Link href='/commodities'>
          <button className='button'><i className='icon icarus-terminal-cargo' /></button>
        </Link>
        <button className='button'><i className='icon icarus-terminal-system-orbits' /></button> */}
        <button
          className='button'
          onClick={() => setAboutDialogVisible(!aboutDialogVisible)}
        >
          <i className='icon icarus-terminal-info' />
        </button>
        <button className='button' onClick={() => toggleFullScreen()}>
          <i className={`icon ${fullScreenState === true ? 'icarus-terminal-exit' : 'icarus-terminal-fullscreen'}`} />
        </button>
      </div>
      <div className='news-ticker'>
        {/* Ticker contents rendered twice to allow us to use CSS to make it appear to loop seemlessly */}
        {[...Array(2)].map((arr, i) =>
          <span key={`news-ticker-${i}`} className={`news-ticker__ticker news-ticker__ticker--${i}`}>
            {newsTicker.map(item =>
              <span key={`ticker_${i}_${item.marketId}_${item.commodityName}`} className='news-ticker__ticker-item'
                onClick={() => router.push(`/commodity/${item.commodityName}/${item.demandBracket === 3 ? 'importers' : 'exporters'}?maxDaysAgo=${COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT}&fleetCarriers=${COMMODITY_FILTER_FLEET_CARRIER_DEFAULT}&minVolume=${COMMODITY_FILTER_MIN_VOLUME_DEFAULT}&location=${item.systemName}&maxDistance=1`)}
              >
                <span className='muted'>{item.stationName}, {item.systemName}</span>
                <br />
                {item.demandBracket === 3 && <>Buying</>}
                {item.stockBracket === 3 && <>Selling</>}
                {' '}
                <span style={{ color: 'var(--color-primary--lighter)' }}>{commodities?.[item.commodityName]?.name ?? item.commodityName}</span>
                <span className='news-ticker__ticker-item-price'>
                  {item.demandBracket === 3 && <>{item.demand === 0 ? '' : <>{item.demand.toLocaleString()} T</>}<br />{item.sellPrice.toLocaleString()} CR/T</>}
                  {item.stockBracket === 3 && <>{item.stock.toLocaleString()} T<br />{item.buyPrice.toLocaleString()} CR/T</>}
                </span>
                <span className='news-ticker__ticker-item-price-difference'>
                  {item.avgSellPrice !== 0 && item.demandBracket === 3 && <span className='muted'>AVG {item.avgSellPrice.toLocaleString()} CR</span>}
                  {item.avgBuyPrice !== 0 && item.stockBracket === 3 && <span className='muted'>AVG {item.avgBuyPrice.toLocaleString()} CR</span>}
                  <br />
                  {item.demandBracket === 3 && item.avgSellPrice !== 0 &&
                    <>
                      {item.sellPrice > item.avgSellPrice && <small className='commodity__price text-positive '>+ {(item.sellPrice - item.avgSellPrice).toLocaleString()} CR</small>}
                      {item.sellPrice < item.avgSellPrice && <small className='commodity__price text-negative'>- {(item.avgSellPrice - item.sellPrice).toLocaleString()} CR</small>}
                    </>}
                  {item.stockBracket === 3 && item.avgBuyPrice !== 0 &&
                    <>
                      {item.buyPrice > item.avgBuyPrice && <small className='commodity__price text-negative'>- {(item.buyPrice - item.avgBuyPrice).toLocaleString()} CR</small>}
                      {item.buyPrice < item.avgBuyPrice && <small className='commodity__price text-positive'>+ {(item.avgBuyPrice - item.buyPrice).toLocaleString()} CR</small>}
                    </>}
                </span>
              </span>
            )}
          </span>
        )}

      </div>
      {aboutDialogVisible && <AboutDialog toggle={setAboutDialogVisible} />}
    </header>
  )
}

function isFullScreen() {
  if (typeof document === 'undefined') return false

  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.webkitCurrentFullScreenElement) {
    return false
  } else {
    return true
  }
}

async function toggleFullScreen() {
  if (isFullScreen()) {
    if (document.cancelFullScreen) {
      document.cancelFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
    return false
  } else {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen()
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen()
    }
    return true
  }
}
