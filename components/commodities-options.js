import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  API_BASE_URL,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_LOCATION_DEFAULT,
  COMMODITY_FILTER_DISTANCE_DEFAULT,
  COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
} from 'lib/consts'
import { getCommoditiesWithAvgPricing } from 'lib/commodities'
import InputWithAutoComplete from './input-with-autocomplete'

const ZERO_WIDTH_SPACE = '​' // Looking forward to regretting *this* later

const DEFAULT_LOCATION_OPTIONS = ['Any location', 'Core Systems', 'Colonia Region']

function parseQueryString() {
  const obj = {}
  window.location.search.replace(
    new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
    ($0, $1, $2, $3) => { obj[$1] = decodeURIComponent($3) }
  )
  return obj
}

export default ({ disabled = false }) => {
  const router = useRouter()
  const componentMounted = useRef(false)
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState()
  const [minVolumeFilter, setMinVolumeFilter] = useState()
  const [fleetCarrierFilter, setFleetCarrierFilter] = useState()
  const [locationFilter, setLocationFilter] = useState()
  const [distanceFilter, setDistanceFilter] = useState()
  const [userSelectedDistanceFilter, setUserSelectedDistanceFilter] = useState()
  const [commodities, setCommodities] = useState([])
  const [selectedCommodity, setSelectedCommodity] = useState()
  const [commodityAutoCompleteResults, setCommodityAutoCompleteResults] = useState()
  const [systemAutoCompleteResults, setSystemAutoCompleteResults] = useState()

  useEffect(() => {
    if (distanceFilter && distanceFilter !== 'Any distance') {
      setUserSelectedDistanceFilter(distanceFilter)
    }
  }, [distanceFilter])

  useEffect(() => {
    (async () => {
      const commoditiesWithPricing = await getCommoditiesWithAvgPricing()
      setCommodities(commoditiesWithPricing)

      // When commodities are loaded, check the commodity name input and to
      // resolve it from a symbol into a commodity name if there is an exact match
      const commodityNameInputValue = document.getElementById('commodity-name-input').value
      if (commodityNameInputValue.length > 0 && commoditiesWithPricing?.filter(c => c.symbol.toLowerCase() === commodityNameInputValue)?.length === 1) {
        document.getElementById('commodity-name-input').value = commoditiesWithPricing?.filter(c => c.symbol.toLowerCase() === commodityNameInputValue)?.[0]?.name
      }
    })()
  }, [])

  async function updateUrlWithFilterOptions(router, newCommodityName) {
    const commoditiesWithPricing = await getCommoditiesWithAvgPricing()

    let resolveCommodityName = false
    let resolveCommodityNameInterval = null

    let commodityName = (newCommodityName ?? window.location?.pathname?.replace(/\/(importers|exporters)$/, '').replace(/.*\//, '')).toLowerCase()

    if (!commodityName) {
      commodityName = commoditiesWithPricing?.filter(c => c.name.toLowerCase() === document.getElementById('commodity-name-input').value.toLowerCase())?.[0]?.symbol.toLowerCase()
    }

    setSelectedCommodity(commodityName)

    if (commoditiesWithPricing.length > 0) {
      // If commodities have been loaded, resolve the name of the commodity to display it in the input box.
      document.getElementById('commodity-name-input').value = commoditiesWithPricing?.filter(c => c.symbol.toLowerCase() === commodityName)?.[0]?.name
    } else {
      // If commodities have NOT been loaded yet, it will be resolved in the useEffect() call when they are.
      document.getElementById('commodity-name-input').value = commodityName
    }


    const activeTab = window.location.pathname.split('/')[3]?.toLowerCase() ?? 'exporters'

    let url = `/commodity/${commodityName}/${activeTab}`

    const options = []
    if (lastUpdatedFilter && lastUpdatedFilter !== COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT) {
      options.push(`maxDaysAgo=${lastUpdatedFilter}`)
    }
    if (minVolumeFilter && minVolumeFilter !== COMMODITY_FILTER_MIN_VOLUME_DEFAULT) {
      options.push(`minVolume=${minVolumeFilter}`)
    }
    if (fleetCarrierFilter && fleetCarrierFilter !== COMMODITY_FILTER_FLEET_CARRIER_DEFAULT) {
      options.push(`fleetCarriers=${fleetCarrierFilter}`)
    }
    if (locationFilter && locationFilter !== COMMODITY_FILTER_LOCATION_DEFAULT) {
      options.push(`location=${encodeURIComponent(locationFilter)}`)
    }

    if (distanceFilter && distanceFilter !== 'Any distance') {
      options.push(`maxDistance=${distanceFilter}`)
    }

    if (options.length === 0) {
      const queryStringParams = parseQueryString()
      for (const param in queryStringParams) {
        if (param === 'location') continue
        if (param === 'maxDistance' && queryStringParams[param] === 'Any distance') continue
        options.push(`${param}=${queryStringParams[param]}`)
      }
    }

    if (options.length > 0) {
      url += `?${options.join('&')}`
    }

    window.history.pushState({ ...window.history.state, as: url, url: url }, '', url)
    dispatchEvent(new Event('getImportsAndExports'))
  }

  useEffect(() => {
    if (componentMounted.current === true) {
      updateUrlWithFilterOptions(router)
    } else {
      componentMounted.current = true
    }
  }, [lastUpdatedFilter, fleetCarrierFilter, minVolumeFilter, locationFilter, distanceFilter])
  
  useEffect(() => {COMMODITY_FILTER_DISTANCE_DEFAULT
    const commodityName = window.location?.pathname?.replace(/\/(importers|exporters)$/, '').replace(/.*\//, '')
    setSelectedCommodity(commodityName.toLowerCase())

    const maxDistance = (router.query?.maxDistance === 'Any distance')
      ? userSelectedDistanceFilter
      : router.query?.maxDistance ?? userSelectedDistanceFilter

    setLastUpdatedFilter(router.query?.maxDaysAgo ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
    setMinVolumeFilter(router.query?.minVolume ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT)
    setFleetCarrierFilter(router.query?.fleetCarriers ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
    setDistanceFilter(maxDistance)
    setLocationFilter(router.query?.location ?? COMMODITY_FILTER_LOCATION_DEFAULT)
    if (router.query?.location) { // Force UI text input to update (text inputs are a special case)
      if (isNaN(router.query.location)) {
        document.getElementById('location-input').value = router.query.location
          ; (async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/v2/system/name/${router.query.location}`)
              const system = await res.json()
              if (system) {
                setLocationFilter(system.systemAddress)
                setDistanceFilter(userSelectedDistanceFilter)
              }
            } catch (e) {
              console.error(e)
            }
          })()
      } else {
        // If the location value is a number, treat it as a system address and resolve the name
        ; (async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/v2/system/address/${router.query.location}`)
            const system = await res.json()
            if (system) {
              document.getElementById('location-input').value = system.systemName
            }
          } catch (e) {
            document.getElementById('location-input').value = COMMODITY_FILTER_LOCATION_DEFAULT
            setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
            console.error(e)
          }
        })()
      }
    } else {
      document.getElementById('location-input').value = COMMODITY_FILTER_LOCATION_DEFAULT
    }
  }, [router.query])

  return (
    <div className='sidebar__options'>
      <form
        method='GET' action='/' onSubmit={(e) => {
          e.preventDefault()
          document.activeElement.blur()
        }}
      >
        <InputWithAutoComplete
          id='commodity-name'
          name='commodity-name'
          label='Commodity'
          placeholder='Commodity name'
          defaultValue={commodities?.filter(c => c.symbol.toLowerCase() === selectedCommodity)?.[0]?.name}
          onClear={(e) => {
            document.getElementById('commodity-name-input').value = ''
          }}
          onChange={(e) => {
            const commodityName = e?.target?.value?.trim() ?? ''
            const autoCompleteResults = []
            let isExactMatch = false
            // Rank matches that "start with" first
            commodities.forEach(commodity => {
              if (commodity.name.toLowerCase() === commodityName.toLowerCase()) {
                isExactMatch = true
              }
              if (commodity.name.toLowerCase().startsWith(commodityName.toLowerCase())) {
                autoCompleteResults.push({
                  icon: 'cargo',
                  text: commodity.name,
                  value: commodity.symbol,
                  className: commodity.rare ? 'text-rare' : ''
                })
              }
            })
            // Rank matches that "contain" next
            commodities.forEach(commodity => {
              if (commodity.name.toLowerCase() !== commodityName.toLowerCase() &&
                  !commodity.name.toLowerCase().startsWith(commodityName.toLowerCase()) &&
                  commodity.name.toLowerCase().includes(commodityName.toLowerCase())
                ) {
                autoCompleteResults.push({
                  icon: 'cargo',
                  text: commodity.name,
                  value: commodity.symbol,
                  className: commodity.rare ? 'text-rare' : ''
                })
              }
            })
            if ((isExactMatch === true && autoCompleteResults.length === 1) || autoCompleteResults.length === 0) {
              if (isExactMatch === true && autoCompleteResults.length === 1) {
                autoCompleteResults.push({
                  seperator: true
                })
              } else {
                if (autoCompleteResults.length === 0) {
                  autoCompleteResults.push({
                    text: `No results for '${commodityName}'`,
                    disabled: true,
                    seperator: true
                  })
                }
              }
              commodities.forEach(commodity => autoCompleteResults.push({
                icon: 'cargo',
                text: commodity.name,
                value: commodity.symbol,
                className: commodity.rare ? 'text-rare' : ''
              }))
            }
            setCommodityAutoCompleteResults(autoCompleteResults)
          }}
          onSelect={(text, data) => {
            if (text && data) {
              updateUrlWithFilterOptions(router, data.value.toLowerCase())
            } else if (text) {
              // If the name doesn't match, fallback to checking to see if the
              // value matches the actual symbol for the commodity, in case 
              // someone has pasted that in.
              const commmodityNameMatchbySymbol = commodities?.filter(c => c.symbol.toLowerCase() === text.toLowerCase())?.[0]?.name
              if (commmodityNameMatchbySymbol) {
                document.getElementById('commodity-name-input').value = commmodityNameMatchbySymbol
                updateUrlWithFilterOptions(router, text.toLowerCase())
              } else {
                // If we can't find a match even for the symbol, reset the value
                // to whatever it was before, we don't allow invalid values.
                document.getElementById('commodity-name-input').value = commodities?.filter(c => c.symbol.toLowerCase() === selectedCommodity)?.[0]?.name
                updateUrlWithFilterOptions(router, selectedCommodity)
              }
            } else {
              // If no data, reset the value to whatever it was before, we don't
              // allow blank values for this field as there MUST be a commodity
              // selected for this view.
              document.getElementById('commodity-name-input').value = commodities?.filter(c => c.symbol.toLowerCase() === selectedCommodity)?.[0]?.name
              updateUrlWithFilterOptions(router, selectedCommodity)
            }
          }}
          autoCompleteResults={commodityAutoCompleteResults}
        />
        <InputWithAutoComplete
          id='location'
          name='location'
          label='Near'
          placeholder='System name'
          defaultValue={locationFilter}
          onClear={(e) => {
            e.preventDefault()
            setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
            setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
            document.getElementById('location-input').value = COMMODITY_FILTER_LOCATION_DEFAULT
          }}
          onChange={async (e) => {
            const systemName = e?.target?.value?.trim() ?? ''
            const autoCompleteResults = []

            autoCompleteResults.push({
              text: 'Any system',
              value: COMMODITY_FILTER_LOCATION_DEFAULT
            })
            autoCompleteResults.push({
              icon: 'system-orbits',
              text: 'Core Systems',
              value: 10477373803
            })
            autoCompleteResults.push({
              icon: 'system-orbits',
              text: 'Colonia Region',
              value: 3238296097059
            })

            let systemSearchResults = []

            try {
              const searchText = (!systemName || systemName === '') ? 'A' : systemName
              const res = await fetch(`${API_BASE_URL}/v2/search/system/name/${searchText}`)
              systemSearchResults = await res.json()
            } catch (e) {
              console.error(e)
            }

            if (systemSearchResults.length > 0) {
              autoCompleteResults.push({
                seperator: true
              })
            } else {
              autoCompleteResults.push({
                seperator: true
              })
              autoCompleteResults.push({
                text: `No results for '${systemName}'`,
                disabled: true
              })
            }

            // Rank matches that "start with" first
            systemSearchResults.forEach(system => {
              if (system.systemName.startsWith(systemName)) {
                autoCompleteResults.push({
                  icon: 'star',
                  text: system.systemName,
                  value: system.systemAddress
                })
              }
            })
            // Case insensitive "starts with" matches next
            systemSearchResults.forEach(system => {
              if (!system.systemName.startsWith(systemName) &&
                system.systemName.toLowerCase().startsWith(systemName.toLowerCase())) {
                autoCompleteResults.push({
                  icon: 'star',
                  text: system.systemName,
                  value: system.systemAddress
                })
              }
            })
            setSystemAutoCompleteResults(autoCompleteResults)
          }}
          onSelect={async (text, data) => {
            if (text === 'Core Systems') {
              setLocationFilter(data.value)
              setDistanceFilter(500)
            } else if (text === 'Colonia Region') {
              setLocationFilter(data.value)
              setDistanceFilter(100)
            } else if (text === 'Any system') {
              document.getElementById('location-input').value = COMMODITY_FILTER_LOCATION_DEFAULT
              setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
              setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
            } else if (data) {
              setLocationFilter(data.value) // Use system address
              setDistanceFilter(userSelectedDistanceFilter)
            } else if (text) {
              // If there is a text value, but it's free form and does not have metadata 
              // then 'revert' the value of the location field back
              if (text && !isNaN(text)) {
                try {
                  const res = await fetch(`${API_BASE_URL}/v2/system/address/${text}`)
                  const system = await res.json()
                  if (system) {
                    document.getElementById('location-input').value = system.systemName
                    setLocationFilter(system.systemAddress)
                    setDistanceFilter(userSelectedDistanceFilter)
                  }
                } catch (e) {
                  console.error(e)
                  // If that fails, reset it to nothing
                  setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
                  setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)

                  document.getElementById('location-input').value = COMMODITY_FILTER_LOCATION_DEFAULT
                }
              } else {
                // TODO: If it's a string, see if we can find a match for it by name
                setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
                setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
                document.getElementById('location-input').value = COMMODITY_FILTER_LOCATION_DEFAULT
              }
            } else {
              // If the field is empty then set it to nothing
              setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
              setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
              document.getElementById('location-input').value = COMMODITY_FILTER_LOCATION_DEFAULT
            }
          }}
          autoCompleteResults={systemAutoCompleteResults}
        />
        <small style={{ display: 'block', textAlign: 'right', paddingRight: '.75rem' }}>
          {(locationFilter && !isNaN(locationFilter))
            ? <><span className='muted'>System ID</span> <Link href={`/system/${locationFilter}`}>{locationFilter}</Link></>
            : <span className='muted'>...</span>}
        </small>
        <label>
          <span className='tab-options__label-text'>Distance</span>
          <select
            id='distance' name='distance'
            disabled={disabled || locationFilter === COMMODITY_FILTER_LOCATION_DEFAULT || locationFilter === ZERO_WIDTH_SPACE}
            value={distanceFilter}
            onChange={(e) => {
              ; (e.target.value === COMMODITY_FILTER_DISTANCE_DEFAULT)
                ? setDistanceFilter(undefined)
                : setDistanceFilter(e.target.value)
            }}
          >
            <option value={COMMODITY_FILTER_DISTANCE_DEFAULT}>Any distance</option>
            <option value='1'>In system</option>
            <option value='25'>&lt; 25 ly</option>
            <option value='50'>&lt; 50 ly</option>
            <option value='100'>&lt; 100 ly</option>
            <option value='500'>&lt; 500 ly</option>
            <option value='1000'>&lt; 1,000 ly</option>
            <option value='10000'>&lt; 10,000 ly</option>
          </select>
        </label>

        <label>
          <span className='tab-options__label-text'>Updated</span>
          <select
            id='last-updated-select' name='last-updated' value={lastUpdatedFilter}
            disabled={disabled}
            onChange={(e) => {
              setLastUpdatedFilter(e.target.value)
            }}
          >
            <option value='1'>Today</option>
            <option value='7'>Last week</option>
            <option value='30'>Last month</option>
            <option value='90'>Last 3 months</option>
          </select>
        </label>

        <label>
          <span className='tab-options__label-text'>Quantity</span>
          <select
            name='commodity-quantity' value={minVolumeFilter}
            disabled={disabled}
            onChange={(e) => {
              setMinVolumeFilter(e.target.value)
            }}
          >
            <option value='1'>Any quantity</option>
            <option value='10'>&gt; 10 T</option>
            <option value='100'>&gt; 100 T</option>
            <option value='1000'>&gt; 1,000 T</option>
            <option value='10000'>&gt; 10,000 T</option>
          </select>
        </label>

        <label>
          <span className='tab-options__label-text'>Carriers</span>
          <select
            name='fleet-carriers' value={fleetCarrierFilter}
            disabled={disabled}
            onChange={(e) => {
              setFleetCarrierFilter(e.target.value)
            }}
          >
            <option value='included'>Included</option>
            <option value='excluded'>Excluded</option>
            <option value='only'>Only</option>
          </select>
        </label>
        {(
          // parseInt(lastUpdatedFilter) !== parseInt(COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT) ||
          // parseInt(minVolumeFilter) !== parseInt(COMMODITY_FILTER_MIN_VOLUME_DEFAULT) ||
          // fleetCarrierFilter !== COMMODITY_FILTER_FLEET_CARRIER_DEFAULT ||
          // locationFilter !== COMMODITY_FILTER_LOCATION_DEFAULT ||
          // (locationFilter !== COMMODITY_FILTER_LOCATION_DEFAULT  && parseInt(distanceFilter) !== parseInt(COMMODITY_FILTER_DISTANCE_DEFAULT))
          false
        )
          ? (
            <button
              disabled={disabled}
              style={{ position: 'absolute', top: '.25rem', right: '.25rem' }}
              onClick={() => {
                document.getElementById('location').value = ''
                setLastUpdatedFilter(COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
                setMinVolumeFilter(COMMODITY_FILTER_MIN_VOLUME_DEFAULT)
                setFleetCarrierFilter(COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
                setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
                setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
              }}
            >
              Reset
            </button>
          )
          : ''}
      </form>
    </div>
  )
}

async function findSystemsByName(systemName) {
  if (systemName.length < 1) return []
  const res = await fetch(`${API_BASE_URL}/v2/search/system/name/${systemName}/`)
  return await res.json()
}
