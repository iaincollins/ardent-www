import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  API_BASE_URL,
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT,
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
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState(window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
  const [fleetCarrierFilter, setFleetCarrierFilter] = useState(window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
  const [minVolumeFilter, setMinVolumeFilter] = useState(window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT)
  const [locationFilter, setLocationFilter] = useState(window.localStorage?.getItem('locationFilter') ?? COMMODITY_FILTER_LOCATION_DEFAULT)
  const [distanceFilter, setDistanceFilter] = useState(window.localStorage?.getItem('distanceFilter') ?? COMMODITY_FILTER_DISTANCE_DEFAULT)

  useEffect(() => {
    if (componentMounted.current === true) {
      window.dispatchEvent(new CustomEvent('CommodityFilterChangeEvent'))
      updateUrlWithFilterOptions(router)
    } else {
      componentMounted.current = true
    }
  }, [lastUpdatedFilter, fleetCarrierFilter, minVolumeFilter, locationFilter, distanceFilter])

  useEffect(() => {
    if (router.query?.maxDaysAgo && router.query.maxDaysAgo !== lastUpdatedFilter) {
      setLastUpdatedFilter(router.query.maxDaysAgo)
      window.localStorage.setItem('lastUpdatedFilter', router.query.maxDaysAgo)
    }
    if (router.query?.fleetCarriers && router.query.fleetCarriers !== fleetCarrierFilter) {
      setFleetCarrierFilter(router.query.fleetCarriers)
      window.localStorage.setItem('fleetCarrierFilter', router.query.fleetCarriers)
    }
    if (router.query?.minVolume && router.query.minVolume !== minVolumeFilter) {
      setMinVolumeFilter(router.query.minVolume)
      window.localStorage.setItem('minVolumeFilter', router.query.minVolume)
    }
    if (router.query?.location && router.query.location !== locationFilter) {
      setLocationFilter(router.query.location.trim())
      window.localStorage.setItem('locationFilter', router.query.location.trim())
      document.getElementById('location').value = router.query.location.trim()
    }
    if (router.query?.maxDistance && router.query.maxDaysAgo !== distanceFilter) {
      setDistanceFilter(router.query.maxDistance)
      window.localStorage.setItem('distanceFilter', router.query.maxDistance)
    }
  }, [router.query])

  return (
    <div className='tab-options'>
      <form onSubmit={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('CommodityFilterChangeEvent')); document.activeElement.blur() }}>
        <label>
          <span className='tab-options__label-text'>Updated</span>
          <select
            name='last-updated' value={lastUpdatedFilter}
            disabled={disabled}
            onChange={(e) => {
              setLastUpdatedFilter(e.target.value)
              window.localStorage.setItem('lastUpdatedFilter', parseInt(e.target.value))
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
          <span className='tab-options__label-text'>Carriers</span>
          <select
            name='fleet-carriers' value={fleetCarrierFilter}
            disabled={disabled}
            onChange={(e) => {
              setFleetCarrierFilter(e.target.value)
              window.localStorage.setItem('fleetCarrierFilter', e.target.value)
            }}
          >
            <option value='included'>Included</option>
            <option value='excluded'>Excluded</option>
            <option value='only'>Only</option>
          </select>
        </label>

        <label>
          <span className='tab-options__label-text'>Quantity</span>
          <select
            name='commodity-quantity' value={minVolumeFilter}
            disabled={disabled}
            onChange={(e) => {
              setMinVolumeFilter(e.target.value)
              window.localStorage.setItem('minVolumeFilter', parseInt(e.target.value))
            }}
          >
            <option value='1'>Any quantity</option>
            <option value='100'>&gt; 100 T</option>
            <option value='1000'>&gt; 1,000 T</option>
            <option value='10000'>&gt; 10,000 T</option>
          </select>
        </label>

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
            onBlur={async (e) => {
              const value = e.target.value.replace(/\u200B/g, '').trim()
              if (e.target.value === ZERO_WIDTH_SPACE) {
                const previousValue = e.target.getAttribute('previous-value')
                e.target.value = previousValue
              } else {
                const locationValue = value
                if (locationValue === '' || locationValue === COMMODITY_FILTER_LOCATION_DEFAULT) {
                  e.target.value = ''
                  window.localStorage.removeItem('distanceFilter')
                  setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
                  setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
                  window.localStorage.removeItem('locationFilter')
                } else {
                  let newLocationValue = locationValue
                  if (locationValue === 'Core Systems') {
                    newLocationValue = 'Sol'
                    e.target.value = newLocationValue
                    window.localStorage.setItem('distanceFilter', 500)
                    setDistanceFilter(500)
                  } else if (locationValue === 'Colonia Region') {
                    newLocationValue = 'Colonia'
                    e.target.value = newLocationValue
                    window.localStorage.setItem('distanceFilter', 100)
                    setDistanceFilter(100)
                  } else {
                    e.target.value = value // trimmed value
                    if (distanceFilter === COMMODITY_FILTER_DISTANCE_DEFAULT) {
                      setDistanceFilter(COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT)
                      window.localStorage.setItem('distanceFilter', COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT)
                    }
                    document.getElementById('location-list').innerHTML = ''
                  }
                  setLocationFilter(newLocationValue)
                  window.localStorage.setItem('locationFilter', newLocationValue)
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
              setDistanceFilter(e.target.value)
              ; (e.target.value === COMMODITY_FILTER_DISTANCE_DEFAULT)
                ? window.localStorage.removeItem('distanceFilter')
                : window.localStorage.setItem('distanceFilter', parseInt(e.target.value))
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
        {(
          lastUpdatedFilter !== COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT ||
          fleetCarrierFilter !== COMMODITY_FILTER_FLEET_CARRIER_DEFAULT ||
          minVolumeFilter !== COMMODITY_FILTER_MIN_VOLUME_DEFAULT ||
          locationFilter !== COMMODITY_FILTER_LOCATION_DEFAULT ||
          distanceFilter !== COMMODITY_FILTER_DISTANCE_DEFAULT
        )
          ? (
            <button
              disabled={disabled}
              style={{ position: 'absolute', top: '.25rem', right: '.25rem' }}
              onClick={() => {
                document.getElementById('location').value = ''
                setLastUpdatedFilter(COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
                setFleetCarrierFilter(COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
                setMinVolumeFilter(COMMODITY_FILTER_MIN_VOLUME_DEFAULT)
                setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
                setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
                window.localStorage.removeItem('lastUpdatedFilter')
                window.localStorage.removeItem('fleetCarrierFilter')
                window.localStorage.removeItem('minVolumeFilter')
                window.localStorage.removeItem('locationFilter')
                window.localStorage.removeItem('distanceFilter')
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
  if (systemName.length < 3) return []
  const res = await fetch(`${API_BASE_URL}/v1/search/system/name/${systemName}/`)
  return await res.json()
}

function updateUrlWithFilterOptions (router) {
  const commodityName = window.location?.pathname?.replace(/\/(importers|exporters)$/, '').replace(/.*\//, '')

  let activeTab = 'importers'
  if (window?.location?.pathname?.endsWith('exporters')) activeTab = 'exporters'

  let url = `/commodity/${commodityName}/${activeTab}`
  const options = []

  const lastUpdatedFilterValue = window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
  const minVolumeFilterValue = window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT
  const fleetCarrierFilterValue = window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT
  const locationFilterValue = window.localStorage?.getItem('locationFilter') ?? null
  const distanceFilterValue = window.localStorage?.getItem('distanceFilter') ?? null

  options.push(`maxDaysAgo=${lastUpdatedFilterValue}`)
  options.push(`minVolume=${minVolumeFilterValue}`)
  options.push(`fleetCarriers=${fleetCarrierFilterValue}`)
  if (locationFilterValue !== null) options.push(`location=${encodeURIComponent(locationFilterValue)}`)
  if (distanceFilterValue !== null) options.push(`maxDistance=${distanceFilterValue}`)

  if (options.length > 0) {
    url += `?${options.join('&')}`
  }

  return router.push(url)
}
