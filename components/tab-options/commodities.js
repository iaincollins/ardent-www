import { useState, useEffect, useRef } from 'react'
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

export default ({ disabled = true }) => {
  const componentMounted = useRef(false)
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState(window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
  const [fleetCarrierFilter, setFleetCarrierFilter] = useState(window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
  const [minVolumeFilter, setMinVolumeFilter] = useState(window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT)
  const [locationFilter, setLocationFilter] = useState(window.localStorage?.getItem('locationFilter') ?? COMMODITY_FILTER_LOCATION_DEFAULT)
  const [distanceFilter, setDistanceFilter] = useState(window.localStorage?.getItem('distanceFilter') ?? COMMODITY_FILTER_DISTANCE_DEFAULT)

  useEffect(() => {
    if (componentMounted.current === true) {
      window.dispatchEvent(new CustomEvent('CommodityFilterChangeEvent'))
    } else {
      componentMounted.current = true
    }
  }, [lastUpdatedFilter, fleetCarrierFilter, minVolumeFilter, locationFilter, distanceFilter])

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
              ; (e.target.value === COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
                ? window.localStorage.removeItem('lastUpdatedFilter')
                : window.localStorage.setItem('lastUpdatedFilter', e.target.value)
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
              ; (e.target.value === COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
                ? window.localStorage.removeItem('fleetCarrierFilter')
                : window.localStorage.setItem('fleetCarrierFilter', e.target.value)
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
              ; (e.target.value === COMMODITY_FILTER_MIN_VOLUME_DEFAULT)
                ? window.localStorage.removeItem('minVolumeFilter')
                : window.localStorage.setItem('minVolumeFilter', e.target.value)
            }}
          >
            <option value='1'>Any amount</option>
            <option value='100'>&gt; 100 T</option>
            <option value='1000'>&gt; 1,000 T</option>
            <option value='10000'>&gt; 10,000 T</option>
          </select>
        </label>

        <label>
          <span className='tab-options__label-text'>Near</span>
          <input
            id='locations' name='locations' type='text' list='locations-list'
            disabled={disabled}
            data-previous-value=''
            placeholder={COMMODITY_FILTER_LOCATION_DEFAULT}
            autoComplete='off'
            defaultValue={locationFilter}
            previous-value={locationFilter}
            size={15}
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
                    if (distanceFilter === COMMODITY_FILTER_DISTANCE_DEFAULT) {
                      setDistanceFilter(COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT)
                      window.localStorage.setItem('distanceFilter', COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT)
                    }
                    document.getElementById('locations-list').innerHTML = ''
                    window.dispatchEvent(new CustomEvent('CommodityFilterChangeEvent'))
                  }
                  e.target.value = value // trimmed value
                  setLocationFilter(newLocationValue)
                  window.localStorage.setItem('locationFilter', newLocationValue)
                }
              }
            }}
            onClick={(e) => {
              const value = e.target.value.replace(/\u200B/g, '').trim()
              if (value !== '') e.target.setAttribute('previous-value', value)
              e.target.value = ZERO_WIDTH_SPACE
              document.getElementById('locations-list').innerHTML = `
                ${DEFAULT_LOCATION_OPTIONS.map(location => `<option>${location}</option>`)}
              `
            }}
            onChange={async (e) => {
              const value = e.target.value.replace(/\u200B/g, '').trim()
              if ((value === COMMODITY_FILTER_LOCATION_DEFAULT) ||
                (value === 'Core Systems') ||
                (value === 'Colonia Region')) {
                e.target.blur()
              } else {
                const nearbySystems = await findSystemsByName(value)
                document.getElementById('locations-list').innerHTML = `
                  ${DEFAULT_LOCATION_OPTIONS.map(location => `<option>${location}</option>`)}
                  ${nearbySystems.slice(0, 10).map(system => `<option>${system.systemName}</option>`)}
                `
              }
            }}
          />
          <datalist id='locations-list'>
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
                : window.localStorage.setItem('distanceFilter', e.target.value)
              window.dispatchEvent(new CustomEvent('CommodityFilterChangeEvent'))
            }}
          >
            <option value={COMMODITY_FILTER_DISTANCE_DEFAULT}>Any distance</option>
            <option value='1'>In system</option>
            <option value='25'>&lt; 25 ly</option>
            <option value='50'>&lt; 50 ly</option>
            <option value='100'>&lt; 100 ly</option>
            <option value='250'>&lt; 250 ly</option>
            <option value='500'>&lt; 500 ly</option>
            <option value='1000'>&lt; 1,000 ly</option>
            <option value='10000'>&lt; 10,000 ly</option>
          </select>
        </label>
      </form>
      {(
        (lastUpdatedFilter !== COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT) ||
        (fleetCarrierFilter !== COMMODITY_FILTER_FLEET_CARRIER_DEFAULT) ||
        (minVolumeFilter !== COMMODITY_FILTER_MIN_VOLUME_DEFAULT) ||
        (locationFilter !== COMMODITY_FILTER_LOCATION_DEFAULT) ||
        (distanceFilter !== COMMODITY_FILTER_DISTANCE_DEFAULT)
      )
        ? (
          <button
            style={{ borderRadius: '.1rem', border: 'none', background: 'rgba(0,0,0,.75)', color: 'white', position: 'absolute', top: '.5rem', right: '.5rem', fontSize: '1rem', padding: '.25rem .5rem' }} onClick={() => {
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
    </div>
  )
}

async function findSystemsByName (systemName) {
  if (systemName.length < 3) return []
  const res = await fetch(`${API_BASE_URL}/v1/search/system/name/${systemName}/`)
  return await res.json()
}
