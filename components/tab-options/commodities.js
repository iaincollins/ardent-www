import { useState, useEffect, useRef } from 'react'
import { 
  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT,
  COMMODITY_FILTER_FLEET_CARRIER_DEFAULT,
  COMMODITY_FILTER_MIN_VOLUME_DEFAULT
} from 'lib/consts'

export default () => {
  const componentMounted = useRef(false);
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState(window.localStorage?.getItem('lastUpdatedFilter') ?? COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
  const [fleetCarrierFilter, setFleetCarrierFilter] = useState(window.localStorage?.getItem('fleetCarrierFilter') ?? COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
  const [minVolumeFilter, setMinVolumeFilter] = useState(window.localStorage?.getItem('minVolumeFilter') ?? COMMODITY_FILTER_MIN_VOLUME_DEFAULT)

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
          Updated
          <select name='selector' value={lastUpdatedFilter} onChange={(e) => {
            setLastUpdatedFilter(e.target.value)
            ;(e.target.value == COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT)
              ? window.localStorage.removeItem('lastUpdatedFilter')
              : window.localStorage.setItem('lastUpdatedFilter', e.target.value)
          }}>
            <option value='1'>Today</option>
            <option value='7'>In last week</option>
            <option value='30'>In last month</option>
            <option value='90'>In last 3 months</option>
            <option value='1000'>Any time</option>
          </select>
        </label>

        <label>
          Fleet Carriers
          <select name='selector' value={fleetCarrierFilter} onChange={(e) => {
            setFleetCarrierFilter(e.target.value)
            ;(e.target.value == COMMODITY_FILTER_FLEET_CARRIER_DEFAULT)
              ? window.localStorage.removeItem('fleetCarrierFilter')
              : window.localStorage.setItem('fleetCarrierFilter', e.target.value)
          }}>
            <option value='included'>Included</option>
            <option value='excluded'>Excluded</option>
            <option value='only'>Only</option>
          </select>
        </label>

        <label>
          Quantity
          <select name='selector' value={minVolumeFilter} onChange={(e) => {
            setMinVolumeFilter(e.target.value)
            ;(e.target.value == COMMODITY_FILTER_MIN_VOLUME_DEFAULT)
              ? window.localStorage.removeItem('minVolumeFilter')
              : window.localStorage.setItem('minVolumeFilter', e.target.value)
          }}>
            <option value='1'>Any amount</option>
            <option value='100'>&gt; 100 T</option>
            <option value='1000'>&gt; 1,000 T</option>
            <option value='10000'>&gt; 10,000 T</option>
          </select>
        </label>
      </form>
    </div>
  )
}