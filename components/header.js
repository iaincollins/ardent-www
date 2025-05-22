import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getCommoditiesWithAvgPricing, listOfCommoditiesAsArray } from 'lib/commodities'
import commodities from 'lib/commodities/commodities'
import { NavigationContext } from 'lib/context'
import { API_BASE_URL } from 'lib/consts'
import { eliteDateTime } from 'lib/utils/dates'

export default () => {
  const router = useRouter()
  const [navigationPath] = useContext(NavigationContext)
  const [fullScreenState, setFullScreenState] = useState(false)
  const [newsTicker, setNewsTicker] = useState([])
  const [commoditySearchResults, setCommoditySearchResults] = useState()
  const [systemSearchResults, setSystemSearchResults] = useState()
  const [stationSearchResults, setStationSearchResults] = useState()
  const [searchResults, setSearchResults] = useState()
  const [hilightedSearchResult, setHilightedSearchResult] = useState()
  const [searchResultsVisible, setSearchResultsVisible] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [dateTime, setDateTime] = useState()

  const toggleMenu = () => setMenuVisible(!menuVisible)

  useEffect(() => {
    const onFullScreenChangeHandler = (event) => setFullScreenState(isFullScreen())
    document.addEventListener('fullscreenchange', onFullScreenChangeHandler)
    return () => document.removeEventListener('fullscreenchange', onFullScreenChangeHandler)
  }, [])

  useEffect(() => {
    const hideMenuHandler = (event) => {
      if (event?.target?.id !== 'header-menu-toggle') setMenuVisible(false)
    }
    document.addEventListener('click', hideMenuHandler)
    return () => document.removeEventListener('click', hideMenuHandler)
  }, [])

  useEffect(() => {
    const dateTimeInterval = setInterval(async () => {
      setDateTime(eliteDateTime())
    }, 1000)
    return () => clearInterval(dateTimeInterval)
  }, [])

  async function onSearchInputChange(e) {
    const searchText = e.target.value.trim()

    if (searchText.length === 0) {
      setSearchResults(undefined)
      setCommoditySearchResults(undefined)
      setStationSearchResults(undefined)
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
      let matchingStations = []

      try {
        const res = await fetch(`${API_BASE_URL}/v2/search/station/name/${searchText}`)
        matchingStations = await res.json()
      } catch (e) {
        console.error(e)
      }

      ; (matchingStations.length > 0)
        ? setStationSearchResults(matchingStations.splice(0, 5))
        : setStationSearchResults(undefined)
    } catch (e) { console.error(e) }

    try {
      let matchingSystems = []

      try {
        const res = await fetch(`${API_BASE_URL}/v2/search/system/name/${searchText}`)
        matchingSystems = await res.json()
      } catch (e) {
        console.error(e)
      }

      // If the search text looks like it MIGHT be a system address,
      // check to see if there is a matching system address and if it
      // is, make it the first suggestion
      if (searchText?.length > 3 && Number.isInteger(parseInt(searchText))) {
        try {
          const systemByAddressRes = await fetch(`${API_BASE_URL}/v2/system/address/${searchText}`)
          const systemByAddress = await systemByAddressRes.json()
          if (systemByAddressRes.ok && systemByAddress.systemName) {
            matchingSystems.unshift({
              ...systemByAddress,
              _useSystemAddress: true
            })
          }
        } catch (e) {
          console.error(e)
        }
      }

      ; (matchingSystems.length > 0)
        ? setSystemSearchResults(matchingSystems.splice(0, 5))
        : setSystemSearchResults(undefined)
    } catch (e) { console.error(e) }
  }

  const updateTicker = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v2/news/commodities`)
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
    } catch (e) {
      console.error(e)
    }
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
        description: `${i.systemX}, ${i.systemY}, ${i.systemZ}`,
        path: (i?.ambiguous !== undefined || i?._useSystemAddress === true)
          ? `/system/${i.systemAddress}`
          : `/system/${i.systemName.replaceAll(' ', '_')}`
      }))
    }
    if (Array.isArray(stationSearchResults)) {
      stationSearchResults.forEach(i => {
        const _stationType = i?.stationType
        let icon = 'poi'
        if (!_stationType && i?.bodyName) icon = 'settlement'
        if (!_stationType && i?.stationName.match('^[A-Z0-9]{3}-[A-Z0-9]{3}$')) icon = 'fleet-carrier'
        if (!_stationType && i?.stationName === 'Stronghold Carrier') icon = 'megaship'
        if (_stationType === 'Orbis') icon = 'orbis-starport'
        if (_stationType === 'Coriolis') icon = 'coriolis-starport'
        if (_stationType === 'Ocellus') icon = 'ocellus-starport'
        if (_stationType === 'AsteroidBase') icon = 'asteroid-base'
        if (_stationType === 'Outpost') icon = 'outpost'
        if (_stationType === 'MegaShip') icon = 'megaship'
        if (_stationType === 'StrongholdCarrier') icon = 'megaship'
        if (_stationType === 'FleetCarrier') icon = 'fleet-carrier'
        if (_stationType === 'CraterPort') icon = 'planetary-port'
        if (_stationType === 'CraterOutpost') icon = 'planetary-port'
        if (_stationType === 'OnFootSettlement') icon = 'settlement'
        if (_stationType === 'SurfaceStation') icon = 'poi'
        if (_stationType === 'PlanetaryConstructionDepot') icon = 'poi-empty'
        if (_stationType === 'SpaceConstructionDepot') icon = 'poi-empty'
        searchResults.push({
          icon: `icarus-terminal-${icon}`,
          name: i.stationName,
          description: i.systemName ? i.systemName : 'Location unknown',
          path: i.systemAddress ? `/system/${i.systemAddress}` : ''
        })
      })
    }
    setSearchResults(searchResults)
    setHilightedSearchResult(0)
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
          // If focus is on an INPUT element do nothing (may add more exceptions)
          if (document?.activeElement?.tagName === 'INPUT') return
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
          {navigationPath.map(({ icon, name, path }, i) => (
            <li key={`${name}:${path}`}>
              {(i > 0 || navigationPath.length === 1)
                ? <Link href={path}>{icon ? <i className={`${icon} icon`} /> : ''}<span>{name}</span></Link>
                : ''}
            </li>
          ))}
        </ul>
      </div>
      <div className='header__navigation' style={{ display: 'block' }}>
        <div className='header__search'>
          <label className='header__search-input' aria-label='Search' onClick={() => document.getElementById('header-search').focus()}>
            <i className='icon icarus-terminal-search' />
            <input
              id='header-search' name='header-search' type='text' autoComplete='off' placeholder='Search'
              onBlur={(e) => {
                setSearchResultsVisible(false)
              }}
              onFocus={(e) => {
                onSearchInputChange(e)
              }}
              // onMouseEnter={(e) => document.getElementById('header-search').focus()}
              onChange={(e) => onSearchInputChange(e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const searchText = e.target.value.trim().toLowerCase()
                  if (searchResults?.length > 0) {
                    /*
                    let exactMatchFound = false
                    for (const result of searchResults) {
                      if (result.name.toLowerCase() === searchText) {
                        setSearchResultsVisible(false)
                        exactMatchFound = true
                        router.push(result.path)
                        document.getElementById('header-search').value = ''
                      }
                    }
                    */
                    // if (exactMatchFound !== true) {
                    router.push(searchResults[hilightedSearchResult].path)
                    setSearchResultsVisible(false)
                    document.getElementById('header-search').value = ''
                    // }
                  }
                } else if (e.key === 'ArrowDown') {
                  if (hilightedSearchResult < searchResults.length - 1) {
                    setHilightedSearchResult(hilightedSearchResult + 1)
                  }
                } else if (e.key === 'ArrowUp') {
                  if (hilightedSearchResult - 1 >= 0) {
                    setHilightedSearchResult(hilightedSearchResult - 1)
                  }
                } else if (e.key === 'Escape') {
                  e.target.value = ''
                  document.activeElement.blur()
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
                onMouseEnter={() => { setHilightedSearchResult(i) }}
                className={i === hilightedSearchResult ? 'header__search-result--highlighted' : undefined}
                key={`${i}:${result.icon}:${result.name}`}
                onMouseDown={() => {
                  router.push(result.path)
                  setSearchResultsVisible(false)
                  document.getElementById('header-search').value = ''
                }}
              ><i className={result.icon} />{result.name}
                {result.description !== undefined &&
                  <div style={{ marginLeft: '1rem', overflow: 'hidden', fontSize: '.7rem', lineHeight: '.8rem', marginBottom: '.25rem' }}>
                    <small style={{ textTransform: 'none' }}>{result.description}</small>
                  </div>}
              </p>
            )}
          </div>
        </div>
        <Link href='/' className='--no-hover'><button aria-label='Home' className='button'><i className='icon icarus-terminal-home' /></button></Link>
        <Link href='/commodity/advancedcatalysers' className='--no-hover is-hidden-mobile'><button aria-label='Commodities' className='button'><i className='icon icarus-terminal-cargo' /></button></Link>
        <button aria-label='Toggle Fullscreen' className='button --no-hover is-hidden-mobile' onClick={() => toggleFullScreen()}>
          <i className={`icon ${fullScreenState === true ? 'icarus-terminal-fullscreen-exit' : 'icarus-terminal-fullscreen'}`} />
        </button>
        <button id='header-menu-toggle' aria-label='Menu' className={`button header__menu-button is-visible-mobile ${menuVisible ? '--active' : ''}`} onClick={() => toggleMenu()}>
          <i className={`icon icarus-terminal-chevron-${menuVisible ? 'up' : 'down'}`} />
        </button>
        <div className='header__menu is-visible-mobile' style={{ visibility: menuVisible ? 'visible' : 'hidden' }}>
          <Link href='/commodity/advancedcatalysers' className='--no-hover'><button aria-label='Commodities' className='header__menu-item'>
            <i className='icon icarus-terminal-cargo' />
            Commodities
          </button>
          </Link>
          <br />
          <button aria-label='Toggle Fullscreen' className='--no-hover header__menu-item' onClick={() => toggleFullScreen()}>
            <i className={`icon ${fullScreenState === true ? 'icarus-terminal-fullscreen-exit' : 'icarus-terminal-fullscreen'}`} />
            Fullscreen
          </button>
        </div>
      </div>

      <div className='news-ticker'>
        <div className='news-ticker__clock'>
          {dateTime !== undefined &&
            <div className='fx__fade-in'>
              <div className='news-ticker__clock-time'>{dateTime.time}</div>
              <div className='news-ticker__clock-date'>{dateTime.day} {dateTime.month} {dateTime.year}</div>
            </div>}
        </div>

        {/* Ticker contents rendered twice to allow us to use CSS to make it appear to loop seemlessly */}
        {[...Array(2)].map((arr, i) =>
          <span key={`news-ticker-${i}`} className={`news-ticker__ticker news-ticker__ticker--${i}`}>
            {newsTicker.map(item =>
              <span
                key={`ticker_${i}_${item.marketId}_${item.commodityName}`} className='news-ticker__ticker-item'
                onClick={() => router.push(`/commodity/${item.commodityName}/${item.demandBracket === 3 ? 'importers' : 'exporters'}?location=${encodeURIComponent(item.systemAddress)}&maxDistance=1`)}
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
                      {item.sellPrice > item.avgSellPrice && <small className='muted'>Avg profit</small>}
                      {item.sellPrice < item.avgSellPrice && <small className='muted'>Avg Loss</small>}
                    </>}
                  {item.avgBuyPrice !== 0 && item.stockBracket === 3 &&
                    <>
                      {item.buyPrice > item.avgBuyPrice && <small className='muted'>Avg Loss</small>}
                      {item.buyPrice < item.avgBuyPrice && <small className='muted'>Avg profit</small>}
                    </>}
                  <br />
                  {item.demandBracket === 3 && item.avgSellPrice !== 0 &&
                    <>
                      {item.sellPrice > item.avgSellPrice && <small className='commodity__price text-positive '>+{(item.sellPrice - item.avgSellPrice).toLocaleString()} CR/T</small>}
                      {item.sellPrice < item.avgSellPrice && <small className='commodity__price text-negative'>-{(item.avgSellPrice - item.sellPrice).toLocaleString()} CR/T</small>}
                    </>}
                  {item.stockBracket === 3 && item.avgBuyPrice !== 0 &&
                    <>
                      {item.buyPrice > item.avgBuyPrice && <small className='commodity__price text-negative'>-{(item.buyPrice - item.avgBuyPrice).toLocaleString()} CR/T</small>}
                      {item.buyPrice < item.avgBuyPrice && <small className='commodity__price text-positive'>+{(item.avgBuyPrice - item.buyPrice).toLocaleString()} CR/T</small>}
                    </>}
                </span>
              </span>
            )}
          </span>
        )}
      </div>
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
