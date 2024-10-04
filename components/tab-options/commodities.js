import { useState, useEffect, useRef } from 'react'
import {
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT,
  COMMODITY_FILTER_LOCATION_DEFAULT,
  COMMODITY_FILTER_DISTANCE_DEFAULT
} from 'lib/consts'

const ZERO_WIDTH_SPACE = '​' // Looking forward to regretting *this* later

const DEFAULT_LOCATION_OPTIONS = ['Any location', 'Core Systems', 'Colonia Region']

export default () => {
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
  }, [lastUpdatedFilter, fleetCarrierFilter, minVolumeFilter])

  return (
    <div className='tab-options'>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          <span className='tab-options__label-text'>Updated</span>
          <select name='last-updated' value={lastUpdatedFilter}
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
          <select name='fleet-carriers' value={fleetCarrierFilter}
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
          <select name='commodity-quantity' value={minVolumeFilter}
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
          <input id='locations' name='locations' type="text" list="locations-list"
            data-previous-value=''
            placeholder={COMMODITY_FILTER_LOCATION_DEFAULT}
            autoComplete='off'
            value={locationFilter}
            size={15}
            onBlur={(e) => {
              const previousValue = e.target.getAttribute('previous-value')
              if (e.target.value == ZERO_WIDTH_SPACE) {
                if (previousValue && previousValue !== '') {
                  e.target.value = previousValue
                  setLocationFilter(previousValue)
                  if (previousValue == COMMODITY_FILTER_LOCATION_DEFAULT) {
                    window.localStorage.removeItem('locationFilter')
                  } else {
                    window.localStorage.setItem('locationFilter', previousValue)
                  }
                }
              }
            }}
            onClick={(e) => {
              e.target.setAttribute('previous-value', e.target.value.replace(/\u200B/g, '').trim())
              setLocationFilter(ZERO_WIDTH_SPACE) // \u200B ZERO WIDTH SPACE (input value needs *something* in it to make a <datalist> work how I wanted to work)
              document.getElementById('locations-list').innerHTML = `
                ${DEFAULT_LOCATION_OPTIONS.map(location => `<option>${location}</option>`)}
              `
            }}
            onChange={(e) => {
              let blurOnEnd = false
              let locationValue = e.target.value.replace(/\u200B/g, '').trimStart()
              document.getElementById('locations-list').innerHTML = `
                ${DEFAULT_LOCATION_OPTIONS.map(location => `<option>${location}</option>`)}
              `

              if (locationValue.trim() == '' || locationValue.trim() == COMMODITY_FILTER_LOCATION_DEFAULT) {
                locationValue = ''
                window.localStorage.removeItem('distanceFilter')
                setDistanceFilter(COMMODITY_FILTER_DISTANCE_DEFAULT)
                blurOnEnd = true
              } else if (locationValue.trim() == 'Core Systems') {
                locationValue = 'Sol'
                window.localStorage.setItem('distanceFilter', 500)
                setDistanceFilter(500)
                blurOnEnd = true
              } else if (locationValue.trim() == 'Colonia Region') {
                locationValue = 'Colonia'
                window.localStorage.setItem('distanceFilter', 100)
                setDistanceFilter(100)
                blurOnEnd = true
              }

              if (locationValue.trim() == '' || locationValue.trim() === COMMODITY_FILTER_LOCATION_DEFAULT) {
                setLocationFilter(COMMODITY_FILTER_LOCATION_DEFAULT)
                window.localStorage.removeItem('locationFilter')
              } else {
                setLocationFilter(locationValue)
                window.localStorage.setItem('locationFilter', locationValue.trimEnd())
              }

              // Use setTimeout here allows us to hide the <datalist> popup
              // (otherwise is bugs out and sticks around in Chrome, even after
              // the target input has lost focus) 
              if (blurOnEnd) setTimeout(() => e.target.blur(), 100)
            }}
          />
          <datalist id='locations-list'>
            <option>Core Systems</option>
            <option>Colonia Region</option>
          </datalist>
        </label>
        <label>
          <span className='tab-options__label-text'>Distance</span>
          <select id='distance' name='distance'
            disabled={locationFilter == COMMODITY_FILTER_LOCATION_DEFAULT}
            value={distanceFilter}
            onChange={(e) => {
              setDistanceFilter(e.target.value)
                ; (e.target.value === COMMODITY_FILTER_DISTANCE_DEFAULT)
                  ? window.localStorage.removeItem('distanceFilter')
                  : window.localStorage.setItem('distanceFilter', e.target.value)
            }}
          >
            <option value={COMMODITY_FILTER_DISTANCE_DEFAULT}>Any distance</option>
            <option value='0'>In system</option>
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
    </div>
  )
}
