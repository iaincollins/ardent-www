import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  API_BASE_URL,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_LOCATION_DEFAULT,
  COMMODITY_FILTER_DISTANCE_DEFAULT,
  COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
} from 'lib/consts'

const ZERO_WIDTH_SPACE = '​' // Looking forward to regretting *this* later

const DEFAULT_LOCATION_OPTIONS = ['Any location', 'Core Systems', 'Colonia Region']

// FIXME This code is *especially* an absolute garbage fire 🗑️🔥

export default ({ disabled = false }) => {
  const router = useRouter()
  const componentMounted = useRef(false)
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState()
  const [minVolumeFilter, setMinVolumeFilter] = useState()
  const [fleetCarrierFilter, setFleetCarrierFilter] = useState()
  const [locationFilter, setLocationFilter] = useState()
  const [distanceFilter, setDistanceFilter] = useState()

  function updateUrlWithFilterOptions (router) {
    const commodityName = window.location?.pathname?.replace(/\/(importers|exporters)$/, '').replace(/.*\//, '')

    let activeTab = ''
    if (window?.location?.pathname?.endsWith('exporters')) activeTab = 'exporters'
    if (window?.location?.pathname?.endsWith('importers')) activeTab = 'importers'

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
      if (distanceFilter) {
        options.push(`maxDistance=${distanceFilter}`)
      }
    }

    if (options.length > 0) {
      url += `?${options.join('&')}`
    }

    router.push(url)
  }

  useEffect(() => {
    if (componentMounted.current === true) {
      updateUrlWithFilterOptions(router)
    } else {
      componentMounted.current = true
    }
  }, [lastUpdatedFilter, fleetCarrierFilter, minVolumeFilter, locationFilter, distanceFilter])

  useEffect(() => {
    setLastUpdatedFilter(router.query?.maxDaysAgo ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
    setMinVolumeFilter(router.query?.minVolume ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT)
    setFleetCarrierFilter(router.query?.fleetCarriers ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
    setLocationFilter(router.query?.location ?? COMMODITY_FILTER_LOCATION_DEFAULT)
    setDistanceFilter(router.query?.maxDistance ?? COMMODITY_FILTER_DISTANCE_DEFAULT)
    if (router.query?.location) { // Force UI text input to update (text inputs are a special case)
      document.getElementById('location').value = router.query.location
    }
  }, [router.query])

  return (
    <div className='tab-options'>
      <form
        method='GET' action='/' onSubmit={(e) => {
          e.preventDefault()
          document.activeElement.blur()
        }}
      >
        <label>
          <span className='tab-options__label-text'>Near</span>
          <input
            id='location' name='location' type='text' list='location-list'
            disabled={disabled}
            data-previous-value=''
            placeholder={COMMODITY_FILTER_LOCATION_DEFAULT}
            autoComplete='off'
            defaultValue={locationFilter}
            previous-value={locationFilter}
            size={12}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                document.activeElement.blur()
              }
            }}
            onBlur={async (e) => {
              const value = e.target.value.replace(/\u200B/g, '').trim()
              if (e.target.value === ZERO_WIDTH_SPACE) {
                const previousValue = e.target.getAttribute('previous-value')
                e.target.value = previousValue
              } else {
                const locationValue = value
                if (locationValue === '' || locationValue === COMMODITY_FILTER_LOCATION_DEFAULT) {
                  e.target.value = ''
                  setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
                  setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
                } else {
                  let newLocationValue = locationValue
                  if (locationValue === 'Core Systems') {
                    newLocationValue = 'Sol'
                    e.target.value = newLocationValue
                    setDistanceFilter(500)
                  } else if (locationValue === 'Colonia Region') {
                    newLocationValue = 'Colonia'
                    e.target.value = newLocationValue
                    setDistanceFilter(100)
                  } else {
                    e.target.value = value // trimmed value
                    if (distanceFilter === COMMODITY_FILTER_DISTANCE_DEFAULT) {
                      setDistanceFilter(COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT)
                    }
                    document.getElementById('location-list').innerHTML = ''
                  }
                  setLocationFilter(newLocationValue)
                }
              }
            }}
            onClick={(e) => {
              const value = e.target.value.replace(/\u200B/g, '').trim()
              if (value !== '') e.target.setAttribute('previous-value', value)
              e.target.value = ZERO_WIDTH_SPACE
              document.getElementById('location-list').innerHTML = `
                ${DEFAULT_LOCATION_OPTIONS.map(location => `<option>${location}</option>`)}
              `
            }}
            onChange={async (e) => {
              const value = e.target.value.replace(/\u200B/g, '').trim()
              // We add a ZERO_WIDTH_SPACE to the end of the auto-complete option,
              // if there is a string that is more than 0 chars and ends in a ZERO_WIDTH_SPACE
              // then treat it as if the user is done with entering text in the input
              if (e.target.value.length > 1 && e.target.value.endsWith(ZERO_WIDTH_SPACE)) {
                e.target.value = value
                e.target.blur()
              } else if ((value === COMMODITY_FILTER_LOCATION_DEFAULT) ||
                (value === 'Core Systems') ||
                (value === 'Colonia Region')) {
                e.target.blur()
              } else {
                const nearbySystems = await findSystemsByName(value)
                document.getElementById('location-list').innerHTML = `
                  ${DEFAULT_LOCATION_OPTIONS.map(location => `<option>${location}</option>`)}
                  ${nearbySystems.slice(0, 10).map(system => `<option>${system.systemName}${ZERO_WIDTH_SPACE}</option>`)}
                `
              }
            }}
          />
          <datalist id='location-list'>
            <option>Core Systems</option>
            <option>Colonia Region</option>
          </datalist>
        </label>
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
            name='last-updated' value={lastUpdatedFilter}
            disabled={disabled}
            onChange={(e) => {
              setLastUpdatedFilter(e.target.value)
            }}
          >
            <option value='1'>Today</option>
            <option value='7'>Last week</option>
            <option value='30'>Last month</option>
            <option value='90'>Last 3 months</option>
            <option value='356'>Last year</option>
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
          parseInt(lastUpdatedFilter) !== parseInt(COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT) ||
          parseInt(minVolumeFilter) !== parseInt(COMMODITY_FILTER_MIN_VOLUME_DEFAULT) ||
          fleetCarrierFilter !== COMMODITY_FILTER_FLEET_CARRIER_DEFAULT ||
          locationFilter !== COMMODITY_FILTER_LOCATION_DEFAULT ||
          (locationFilter !== COMMODITY_FILTER_LOCATION_DEFAULT  && parseInt(distanceFilter) !== parseInt(COMMODITY_FILTER_DISTANCE_DEFAULT))
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

async function findSystemsByName (systemName) {
  if (systemName.length < 1) return []
  const res = await fetch(`${API_BASE_URL}/v1/search/system/name/${systemName}/`)
  return await res.json()
}
