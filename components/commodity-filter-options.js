import { useState, useEffect, useRef, useReducer } from 'react'
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
import InputWithAutoComplete from 'components/input-with-autocomplete'
import { getCommodityBySymbolOrName } from 'lib/commodities'

export default ({ disabled = false, commodities = [], commodity }) => {
  const router = useRouter()

  const commodityRef = useRef()
  const locationRef = useRef()
  const maxDistanceRef = useRef()
  const maxDaysAgoRef = useRef()
  const minVolumeRef = useRef()
  const fleetCarriersRef = useRef()

  // Force Update method to be able to force a re-render when data attrs on
  // on elements are updated (as these are used for conditional rendering).
  // It's a little unconventional but simpler than using state.
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const [selectedCommodity, setSelectedCommodity] = useState()
  const [commodityAutoCompleteResults, setCommodityAutoCompleteResults] = useState()
  const [systemAutoCompleteResults, setSystemAutoCompleteResults] = useState()

  useEffect(() => {
    if (commodity && commodity.symbol !== selectedCommodity?.symbol) {
      setSelectedCommodity(commodity)
      commodityRef.current.value = commodity.name
      commodityRef.current.dataset.value = commodity.symbol
    }
  }, [commodity])

  useEffect(() => {
    updateOptions()
  }, [router.query])

  useEffect(() => {
    updateOptions()
  }, [])

  function optionChangeHandler(e) {
    const query = {}

    if (locationRef.current?.dataset.value) {
      query.location = locationRef.current?.dataset.value
      query.maxDistance = maxDistanceRef.current.value
    }

    query.maxDaysAgo = maxDaysAgoRef.current.value
    query.minVolume = minVolumeRef.current.value
    query.fleetCarriers = fleetCarriersRef.current.value

    const urlObject = { pathname: window.location.pathname, query }
    router.push(urlObject, undefined, { shallow: true })
  }

  const updateOptions = async () => {
    // Set default values for inputs when loading, taking them from the query
    // string (if they exist) or the preset default values for each option

    // Attempt to re-populate location input
    if (router.query.location) {
      // Check if 'location' seems to be a string (system name) or number (system address)
      const queryUrl = (!isNaN(router.query.location))
        ? `${API_BASE_URL}/v2/system/address/${router.query.location}`
        : `${API_BASE_URL}/v2/system/name/${router.query.location}`
      try {
        const res = await fetch(queryUrl)
        const system = await res.json()
        if (system?.systemName && system?.systemAddress) {
          locationRef.current.value = system.systemName
          locationRef.current.dataset.value = system.systemAddress
          if (maxDistanceRef.current.value === COMMODITY_FILTER_DISTANCE_DEFAULT) {
            maxDistanceRef.current.value = COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
          }
        } else {
          locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
          delete locationRef.current.dataset.value
        }
      } catch (e) {
        console.error(e)
        locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
        delete locationRef.current.dataset.value
      }
      forceUpdate() // Force component to re-render after updating dataset
    } else {
      locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
      delete locationRef.current.dataset.value
      forceUpdate() // Force component to re-render after updating dataset
    }

    if (router.query.maxDistance) {
      maxDistanceRef.current.value = router.query.maxDistance
    } else {
      if (router.query.location) {
        maxDistanceRef.current.value = COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
      } else {
        maxDistanceRef.current.value = COMMODITY_FILTER_DISTANCE_DEFAULT
      }
    }

    if (router.query.maxDaysAgo) {
      maxDaysAgoRef.current.value = router.query.maxDaysAgo
    } else {
      maxDaysAgoRef.current.value = COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
    }

    if (router.query.minVolume) {
      minVolumeRef.current.value = router.query.minVolume
    } else {
      minVolumeRef.current.value = COMMODITY_FILTER_MIN_VOLUME_DEFAULT
    }

    if (router.query.fleetCarriers) {
      fleetCarriersRef.current.value = router.query.fleetCarriers
    } else {
      fleetCarriersRef.current.value = COMMODITY_FILTER_FLEET_CARRIER_DEFAULT
    }
  }

  return (
    <div className='sidebar__options'>
      <form
        method='GET' action='/' onSubmit={(e) => {
          e.preventDefault()
          document.activeElement.blur()
        }}
      >
        <InputWithAutoComplete
          forwardRef={commodityRef}
          id='commodity-name'
          name='commodity-name'
          label='Commodity'
          placeholder='Commodity name'
          onClear={(e) => {
            commodityRef.current.value = ''
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
          onBlur={async (e) => {
            const text = e.target.value.trim()
            if (!text) {
              commodityRef.current.value = selectedCommodity.name
            } else {
              const commodity = await getCommodityBySymbolOrName(text)
              if (commodity) {
                window.dispatchEvent(new CustomEvent('LoadCommodityEvent', { detail: commodity.symbol }))
              } else {
                commodityRef.current.value = selectedCommodity.name
              }
            }
          }}
          autoCompleteResults={commodityAutoCompleteResults}
        />
        <InputWithAutoComplete
          forwardRef={locationRef}
          id='location'
          name='location'
          label='Near'
          placeholder='System name'
          onClear={(e) => {
            e.preventDefault()
            locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
            delete locationRef.current.dataset.value
            optionChangeHandler(locationRef.current)
          }}
          onBlur={async (e) => {
            // Reset selection if value is empty
            if (!e.target.value.trim()) {
              locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
              delete locationRef.current.dataset.value
              optionChangeHandler(locationRef.current)
            }
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
              locationRef.current.value = 'Sol'
              locationRef.current.dataset.value = data.value
              maxDistanceRef.current.value = 500
            } else if (text === 'Colonia Region') {
              locationRef.current.value = 'Colonia'
              locationRef.current.dataset.value = data.value
              maxDistanceRef.current.value = 100
            } else if (text === 'Any system') {
              locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
              delete locationRef.current.dataset.value
              maxDistanceRef.current.value = COMMODITY_FILTER_DISTANCE_DEFAULT
            } else if (data) {
              locationRef.current.value = data.text
              locationRef.current.dataset.value = data.value
              if (maxDistanceRef.current.value === COMMODITY_FILTER_DISTANCE_DEFAULT) {
                maxDistanceRef.current.value = COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
              }
            } else if (text) {
              // Check if is string (system name) or number (system address)
              const queryUrl = (text && !isNaN(text))
                ? `${API_BASE_URL}/v2/system/address/${text}`
                : `${API_BASE_URL}/v2/system/name/${text}`
              try {
                const res = await fetch(queryUrl)
                const system = await res.json()
                if (system?.systemName && system?.systemAddress) {
                  locationRef.current.value = system.systemName
                  locationRef.current.dataset.value = system.systemAddress
                  if (maxDistanceRef.current.value === COMMODITY_FILTER_DISTANCE_DEFAULT) {
                    maxDistanceRef.current.value = COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
                  }
                } else {
                  locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
                  delete locationRef.current.dataset.value
                }
              } catch (e) {
                // If error, reset it to nothing
                console.error(e)
                locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
                delete locationRef.current.dataset.value
              }
            } else {
              // If the field is empty then set it to nothing
              locationRef.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
              delete locationRef.current.dataset.value
            }
            optionChangeHandler(locationRef.current)
          }}
          autoCompleteResults={systemAutoCompleteResults}
        />
        <small style={{ display: 'block', textAlign: 'right', paddingRight: '.75rem' }}>
          {locationRef.current?.dataset?.value
            ? <>
              <span className='muted'>SYS ADDR</span>
              {' '}
              <Link href={`/system/${locationRef.current?.dataset?.value}`}>{locationRef.current?.dataset?.value}</Link>
            </>
            : <span className='muted'>...</span>}
        </small>
        <label>
          <span className='form-options__label-text'>Distance</span>
          <select ref={maxDistanceRef} name='maxDistance' disabled={disabled || !locationRef.current?.dataset?.value} onChange={optionChangeHandler}>
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
          <span className='form-options__label-text'>Updated</span>
          <select ref={maxDaysAgoRef} name='max-days-ago' disabled={disabled} onChange={optionChangeHandler}>
            <option value='1'>Today</option>
            <option value='7'>Last week</option>
            <option value='30'>Last month</option>
            <option value='90'>Last 3 months</option>
          </select>
        </label>

        <label>
          <span className='form-options__label-text'>Quantity</span>
          <select ref={minVolumeRef} name='minVolume' disabled={disabled} onChange={optionChangeHandler}>
            <option value='1'>Any quantity</option>
            <option value='10'>&gt; 10 T</option>
            <option value='100'>&gt; 100 T</option>
            <option value='1000'>&gt; 1,000 T</option>
            <option value='10000'>&gt; 10,000 T</option>
          </select>
        </label>

        <label>
          <span className='form-options__label-text'>Carriers</span>
          <select ref={fleetCarriersRef} name='fleetCarriers' disabled={disabled} onChange={optionChangeHandler}>
            <option value='included'>Included</option>
            <option value='excluded'>Excluded</option>
            <option value='only'>Only</option>
          </select>
        </label>
      </form>
    </div>
  )
}
