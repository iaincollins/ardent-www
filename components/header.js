import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Package from '../package.json'

import { API_BASE_URL } from '../lib/consts'

export default () => {
  const [stats, setStats] = useState()

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/stats`)
      let stats = await res.json()
      setStats(stats)
    })()
  }, [])

  return (
    <>
      <div className='logo'>
        <h1>
          Ardent Industry
        </h1>
        <p>
          Trade and Exploration Data
        </p>
        <br />
        <small><a style={{ textDecoration: 'none' }} href='https://github.com/iaincollins/ardent-www'>v{Package.version} (BETA)</a></small>
      </div>
      {stats &&
        <div className='stats'>
          Star Systems: {stats.systems.toLocaleString()}<br/>
          Trade Orders: {stats.trade.tradeOrders.toLocaleString()}<br/>
          Updates in last 24 hours: {stats.trade.updatedInLast24Hours.toLocaleString()}
        </div>}
      {/* {stats && JSON.stringify(stats, null, 2)} */}
    </>
  )
}