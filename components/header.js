import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AboutDialog from 'components/dialog/about-dialog'
import { getCommoditiesWithAvgPricing, listOfCommoditiesAsArray } from 'lib/commodities'
import commodities from 'lib/commodities/commodities'
import { NavigationContext } from 'lib/context'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const router = useRouter()
  const [navigationPath] = useContext(NavigationContext)
  const [fullScreenState, setFullScreenState] = useState(false)
  const [aboutDialogVisible, setAboutDialogVisible] = useState(false)
  const [newsTicker, setNewsTicker] = useState([])
  const [commoditySearchResults, setCommoditySearchResults] = useState()
  const [systemSearchResults, setSystemSearchResults] = useState()
  const [stationSearchResults, setStationSearchResults] = useState()
  const [searchResults, setSearchResults] = useState()
  const [searchResultsVisible, setSearchResultsVisible] = useState(false)

  useEffect(() => {
    document.addEventListener('fullscreenchange', onFullScreenChangeHandler)
    return () => document.removeEventListener('click', onFullScreenChangeHandler)
    function onFullScreenChangeHandler (event) {
      setFullScreenState(isFullScreen())
    }
  }, [])

  const updateTicker = async () => {
    const res = await fetch(`${API_BASE_URL}/v1/news/commodities`)
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

  useEffect(() => {
    const searchResults = []
    if (Array.isArray(commoditySearchResults)) {
      commoditySearchResults.forEach(i => searchResults.push({
        icon: 'icarus-terminal-cargo',
        name: i.name,
        path: `/commodity/${i.symbol.toLowerCase()}`
      }))
    }
    if (Array.isArray(systemSearchResults)) {
      systemSearchResults.forEach(i => searchResults.push({
        icon: 'icarus-terminal-star',
        name: i.systemName,
        path: `/system/${i.systemName}`
      }))
    }
    if (Array.isArray(stationSearchResults)) {
      stationSearchResults.forEach(i => searchResults.push({
        icon: '',
        name: i.stationName
      }))
    }
    setSearchResults(searchResults)
    if (searchResults.length > 0) {
      setSearchResultsVisible(true)
    } else {
      setSearchResultsVisible(false)
    }
  }, [commoditySearchResults, systemSearchResults, stationSearchResults])

  useEffect(() => {
    const onKeyDown = ({ key }) => {
      if (key === 'Enter') {
        if (document.activeElement?.id === 'header-search' ||
            document.activeElement?.id === 'location') {
          document.activeElement.blur()
        } else {
          document.getElementById('header-search').focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keyup', onKeyDown)
    }
  }, [])

  return (
    <header>
      <div className='header__logo'>
        <Link href='/' className='--no-hover' style={{ border: 'none' }}>
          <h1>
            <i className='icarus-terminal-logo icon' />
            Ardent <span className='is-hidden-mobile'>Insight</span>
          </h1>
        </Link>
        <ul className='breadcrumbs' style={{ position: 'relative', top: '-.5rem', left: '.6rem' }}>
          {navigationPath.map(({ name, path }) => (
            <li key={`${name}:${path}`}><Link href={path}>{name}</Link></li>
          ))}
        </ul>
      </div>
      <div className='header__navigation' style={{ display: 'block' }}>
        {/*
        <button aria-label='Commodities' className='button'><i className='icon icarus-terminal-cargo' /></button>
        <button aria-label='Map' className='button'><i className='icon icarus-terminal-system-orbits' /></button>
        */}
        <div className='header__search' style={{ xdisplay: 'none' }}>
          <label className='header__search-input' aria-label='Search' onClick={() => document.getElementById('header-search').focus()}>
            <i className='icon icarus-terminal-search' />
            <input
              id='header-search' name='header-search' type='text' autoComplete='off' placeholder='Search'
              onBlur={(e) => {
                setSearchResultsVisible(false)
              }}
              onFocus={(e) => {
                e.target.value = ''
                setSearchResultsVisible(false)
                setSearchResults(undefined)
                setCommoditySearchResults(undefined)
                setSystemSearchResults(undefined)
              }}
              onChange={async (e) => {
                const searchText = e.target.value.trim()

                if (searchText.length === 0) {
                  setSearchResults(undefined)
                  setCommoditySearchResults(undefined)
                  setSystemSearchResults(undefined)
                  return
                }

                try {
                  const matchingCommodities = listOfCommoditiesAsArray
                    .filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()))

                  matchingCommodities.forEach((c, i) => {
                    if (c.name.toLowerCase().startsWith(searchText.toLowerCase())) {
                      delete matchingCommodities[i]
                      matchingCommodities.unshift(c)
                    }
                  })

                  matchingCommodities.forEach((c, i) => {
                    if (c.name.toLowerCase() === searchText.toLowerCase()) {
                      delete matchingCommodities[i]
                      matchingCommodities.unshift(c)
                    }
                  })

                  ; (matchingCommodities.length > 0)
                    ? setCommoditySearchResults(matchingCommodities.splice(0, 5))
                    : setCommoditySearchResults(undefined)
                } catch (e) { }

                try {
                  const res = await fetch(`${API_BASE_URL}/v1/search/system/name/${searchText}`)
                  const matchingSystems = await res.json()
                    ; (matchingSystems.length > 0)
                    ? setSystemSearchResults(matchingSystems.splice(0, 5))
                    : setSystemSearchResults(undefined)
                } catch (e) { }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const searchText = e.target.value.trim().toLowerCase()
                  if (searchResults?.length > 0) {
                    searchResults.forEach(result => {
                      if (result.name.toLowerCase() === searchText) {
                        router.push(result.path)
                        setSearchResultsVisible(false)
                      }
                    })
                    // TODO Attempt to match against exact name of commodity or a system (do nothing if neither)
                  }
                }
              }}
            />
          </label>
          <div
            className='header__search-results'
            style={{
              opacity: (searchResultsVisible) ? 1 : 0
            }}
          >
            {searchResults?.length > 0 && searchResults.map((result, i) =>
              <p
                key={`${i}:${result.icon}:${result.name}`}
                onMouseDown={() => {
                  router.push(result.path)
                  setSearchResultsVisible(false)
                }}
              ><i className={result.icon} />{result.name}
              </p>
            )}
          </div>
        </div>
        <button aria-label='About' className='button' onClick={() => setAboutDialogVisible(!aboutDialogVisible)}>
          <i className='icon icarus-terminal-info' />
        </button>
        <button aria-label='Toggle Fullscreen' className='button' onClick={() => toggleFullScreen()}>
          <i className={`icon ${fullScreenState === true ? 'icarus-terminal-fullscreen-exit' : 'icarus-terminal-fullscreen'}`} />
        </button>
      </div>
      <div className='news-ticker'>
        {/* Ticker contents rendered twice to allow us to use CSS to make it appear to loop seemlessly */}
        {[...Array(2)].map((arr, i) =>
          <span key={`news-ticker-${i}`} className={`news-ticker__ticker news-ticker__ticker--${i}`}>
            {newsTicker.map(item =>
              <span
                key={`ticker_${i}_${item.marketId}_${item.commodityName}`} className='news-ticker__ticker-item'
                onClick={() => router.push(`/commodity/${item.commodityName}/${item.demandBracket === 3 ? 'importers' : 'exporters'}?location=${encodeURIComponent(item.systemName)}&maxDistance=1`)}
              >
                <i
                  className={`icarus-terminal-cargo-${item.demandBracket > item.stockBracket ? 'sell' : 'buy'} muted`}
                  style={{ position: 'absolute', left: '-2.25rem', fontSize: '2rem', lineHeight: '2rem' }}
                />
                <span className='muted'>{item.stationName}, {item.systemName}</span>
                <br />
                {item.demandBracket > item.stockBracket ? 'Buying' : 'Selling'}
                {' '}
                <span style={{ color: 'var(--color-primary--lighter)' }}>{commodities?.[item.commodityName]?.name ?? item.commodityName}</span>
                <span className='news-ticker__ticker-item-price'>
                  {(item.demandBracket > item.stockBracket)
                    ? <>{item.demand === 0 ? '' : <>{item.demand.toLocaleString()} T</>}<br />{item.sellPrice.toLocaleString()} CR/T</>
                    : <>{item.stock.toLocaleString()} T<br />{item.buyPrice.toLocaleString()} CR/T</>}
                </span>
                <span className='news-ticker__ticker-item-price-difference'>
                  {item.avgSellPrice !== 0 && item.demandBracket === 3 &&
                    <>
                      {item.sellPrice > item.avgSellPrice && <small className='text-positive'>AVG Profit</small>}
                      {item.sellPrice < item.avgSellPrice && <small className='text-negative'>AVG Loss</small>}
                    </>}
                  {item.avgBuyPrice !== 0 && item.stockBracket === 3 &&
                    <>
                      {item.buyPrice > item.avgBuyPrice && <small className='text-negative'>AVG Loss</small>}
                      {item.buyPrice < item.avgBuyPrice && <small className='text-positive'>AVG Profit</small>}
                    </>}
                  <br />
                  {item.demandBracket === 3 && item.avgSellPrice !== 0 &&
                    <>
                      {item.sellPrice > item.avgSellPrice && <small className='commodity__price text-positive '>+ {(item.sellPrice - item.avgSellPrice).toLocaleString()} CR/T</small>}
                      {item.sellPrice < item.avgSellPrice && <small className='commodity__price text-negative'>- {(item.avgSellPrice - item.sellPrice).toLocaleString()} CR/T</small>}
                    </>}
                  {item.stockBracket === 3 && item.avgBuyPrice !== 0 &&
                    <>
                      {item.buyPrice > item.avgBuyPrice && <small className='commodity__price text-negative'>- {(item.buyPrice - item.avgBuyPrice).toLocaleString()} CR/T</small>}
                      {item.buyPrice < item.avgBuyPrice && <small className='commodity__price text-positive'>+ {(item.avgBuyPrice - item.buyPrice).toLocaleString()} CR/T</small>}
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

function isFullScreen () {
  if (typeof document === 'undefined') return false

  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.webkitCurrentFullScreenElement) {
    return false
  } else {
    return true
  }
}

async function toggleFullScreen () {
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
