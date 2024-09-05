import { useState, useEffect } from 'react'

export default () => {
  const [lastUpdatedFilter, setLastUpdatedFilter] = useState()
  const [fleetCarrierFilter, setFleetCarrierFilter] = useState()
  const [minimumAmountFilter, setMinimumAmountFilter] = useState()

  useEffect(() => {
    // window.localStorage.setItem('item', 'value')
    // window.localStorage.removeItem('color-settings')
    // window.localStorage.getItem('color-settings')
  }, [])

  return null
  
  return (
    <div className='tab-tab_options'>
      <form>
        <label>
          Updated
          <select name='selector'>
            <option>In the last hour</option>
            <option>Today</option>
            <option>In the last week</option>
            <option>In the last month</option>
            <option>In the last 3 months</option>
            <option>Anytime</option>
          </select>
        </label>

        <label>
          Fleet Carriers
          <select name='selector'>
            <option>Include</option>
            <option>Exclude</option>
            <option>Only</option>
          </select>
        </label>

        <label>
          Min. Quantity
          <input name='text-input' type='type' size='6' placeholder='None' />
        </label>
      </form>
    </div>
  )
}