import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
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
import InputWithAutoComplete from './input-with-autocomplete'

function parseQueryString() {
  const obj = {}
  console.log('window.location.href', window.location.href)
  window.location.search.replace(
    new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
    ($0, $1, $2, $3) => { obj[$1] = decodeURIComponent($3) }
  )
  return obj
}

export default ({ disabled = false, commodities = [], commodity }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const commodityInput = useRef()
  const locationInput = useRef()
  const distanceInput = useRef()
  const [selectedCommodity, setSelectedCommodity] = useState()
  const [maxDaysAgo, setMaxDaysAgo] = useState()
  const [minVolume, setMinVolume] = useState()
  const [fleetCarriers, setFleetCarriers] = useState()
  const [location, setLocation] = useState()
  const [maxDistance, setMaxDistance] = useState()
  const [commodityAutoCompleteResults, setCommodityAutoCompleteResults] = useState()
  const [systemAutoCompleteResults, setSystemAutoCompleteResults] = useState()
  
  useEffect(() => {
    console.log('query string params changed', window.location.href)
    const query = {}
    if (location) {
      query.location = location.systemAddress
      query.maxDistance = location.maxDistance
    }
    query.maxDaysAgo = (maxDaysAgo) ? maxDaysAgo :  COMMODITY_FILTER_MAX_DAYS_AGO_DEFAULT
    query.minVolume = (minVolume) ? minVolume : COMMODITY_FILTER_MIN_VOLUME_DEFAULT
    if (fleetCarriers && fleetCarriers !== COMMODITY_FILTER_FLEET_CARRIER_DEFAULT) query.fleetCarriers = fleetCarriers

    const urlObject = { pathname: window.location.pathname, query }
    //router.push(urlObject, undefined, { shallow: true })
  }, [location, maxDistance, maxDaysAgo, minVolume, fleetCarriers])

  useEffect(() => {
    if (commodity && commodity.symbol !== selectedCommodity?.symbol) {
      const urlParams = parseQueryString()
      console.log('Changed:commodity', commodity)
      console.log('Changed:router', router)
      setSelectedCommodity(commodity)
      commodityInput.current.value = commodity.name
    }
  }, [commodity])

  return (
    <div className='sidebar__options'>
      <form
        method='GET' action='/' onSubmit={(e) => {
          e.preventDefault()
          document.activeElement.blur()
        }}
      >
        <InputWithAutoComplete
          forwardRef={commodityInput}
          id='commodity-name'
          name='commodity-name'
          label='Commodity'
          placeholder='Commodity name'
          onClear={(e) => {
            commodityInput.current.value = ''
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
            console.log('onSelect Callback', text, data)
            if (text && data) {
              // If commodity changes, fire event so parent component updates
              dispatchEvent(new CustomEvent('LoadCommodityEvent', { detail: data.value }))
            } else if (text && !data) {
              // Text but not valid option
              commodityInput.current.focus()
            }
          }}
          autoCompleteResults={commodityAutoCompleteResults}
        />
        <InputWithAutoComplete
          forwardRef={locationInput}
          id='location'
          name='location'
          label='Near'
          placeholder='System name'
          onClear={(e) => {
            e.preventDefault()
            locationInput.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
            setLocation(undefined)
            setMaxDistance(undefined)
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
              setLocation({
                systemName: 'Sol',
                systemAddress: data.value,
                maxDistance: 500
              })
              setMaxDistance(500)
              locationInput.current.value = 'Sol'
            } else if (text === 'Colonia Region') {
              setLocation({
                systemName: 'Colonia',
                systemAddress: data.value,
                maxDistance: 100
              })
              setMaxDistance(100)
              locationInput.current.value = 'Colonia'
            } else if (text === 'Any system') {
              setLocation(undefined)
              setMaxDaysAgo(undefined)
              locationInput.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
            } else if (data) {
              setLocation({
                systemName: data.text,
                systemAddress: data.value,
                maxDistance: (maxDistance && maxDistance !== COMMODITY_FILTER_DISTANCE_DEFAULT) ? maxDistance : COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
              })
              if (!maxDistance || maxDistance === COMMODITY_FILTER_DISTANCE_DEFAULT) setMaxDistance(COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT)
            } else if (text) {
              // If there is a text value, but it's free form and does not have metadata 
              // then 'revert' the value of the location field back
              if (text && !isNaN(text)) {
                try {
                  const res = await fetch(`${API_BASE_URL}/v2/system/address/${text}`)
                  const system = await res.json()
                  if (system) {
                    setLocation({
                      systemName: data.text,
                      systemAddress: data.value,
                      maxDistance: (maxDistance && maxDistance !== COMMODITY_FILTER_DISTANCE_DEFAULT) ? maxDistance : COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
                    })
                    if (!maxDistance || maxDistance === COMMODITY_FILTER_DISTANCE_DEFAULT) setMaxDistance(COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT)
                  }
                } catch (e) {
                  // If error, reset it to nothing
                  console.error(e)
                  locationInput.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
                  setLocation(undefined)
                  setMaxDistance(undefined)
                }
              } else {
                // If it's a string, see if we can find a match for it by name
                try {
                  const res = await fetch(`${API_BASE_URL}/v2/system/name/${text}`)
                  const system = await res.json()
                  if (system) {
                    setLocation({
                      systemName: data.text,
                      systemAddress: data.value,
                      maxDistance: (maxDistance && maxDistance !== COMMODITY_FILTER_DISTANCE_DEFAULT) ? maxDistance : COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT
                    })
                    if (!maxDistance || maxDistance === COMMODITY_FILTER_DISTANCE_DEFAULT) setMaxDistance(COMMODITY_FILTER_DISTANCE_WITH_LOCATION_DEFAULT)
                  } else {
                    // If no match, reset location to nothing
                    locationInput.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
                    setLocation(undefined)
                    setMaxDistance(undefined)
                  }
                } catch (e) {
                  // If error, reset it to nothing
                  console.error(e)
                  locationInput.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
                  setLocation(undefined)
                  setMaxDistance(undefined)
                }
              }
            } else {
              // If the field is empty then set it to nothing
              locationInput.current.value = COMMODITY_FILTER_LOCATION_DEFAULT
              setLocation(undefined)
              setMaxDistance(undefined)
            }
          }}
          autoCompleteResults={systemAutoCompleteResults}
        />
        <small style={{ display: 'block', textAlign: 'right', paddingRight: '.75rem' }}>
          {(location && location.systemName && location.systemAddress)
            ? <><span className='muted'>System ID</span> <Link href={`/system/${location.systemAddress}`}>{location.systemName}</Link></>
            : <span className='muted'>...</span>}
        </small>
        <label>
          <span className='tab-options__label-text'>Distance</span>
          <select ref={distanceInput} name='max-distance' disabled={disabled || !location} onChange={(e) => setMaxDistance(e.target.value)}>
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
          <span className='tab-options__label-text'>Updated - {maxDaysAgo}</span>
          <select name='max-days-ago' defaultValue={maxDaysAgo} disabled={disabled} onChange={(e) => setMaxDaysAgo(e.target.value)}>
            <option value='1'>Today</option>
            <option value='7'>Last week</option>
            <option value='30'>Last month</option>
            <option value='90'>Last 3 months</option>
          </select>
        </label>

        <label>
          <span className='tab-options__label-text'>Quantity</span>
          <select name='min-volume' disabled={disabled} onChange={(e) => setMinVolume(e.target.value)}>
            <option value='1'>Any quantity</option>
            <option value='10'>&gt; 10 T</option>
            <option value='100'>&gt; 100 T</option>
            <option value='1000'>&gt; 1,000 T</option>
            <option value='10000'>&gt; 10,000 T</option>
          </select>
        </label>

        <label>
          <span className='tab-options__label-text'>Carriers</span>
          <select name='fleet-carriers' disabled={disabled} onChange={(e) => setFleetCarriers(e.target.value)}>
            <option value='included'>Included</option>
            <option value='excluded'>Excluded</option>
            <option value='only'>Only</option>
          </select>
        </label>
      </form>
    </div>
  )
}

async function findSystemsByName(systemName) {
  if (systemName.length < 1) return []
  const res = await fetch(`${API_BASE_URL}/v2/search/system/name/${systemName}/`)
  return await res.json()
}
