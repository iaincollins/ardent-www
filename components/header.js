import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Package from '../package.json'

import { API_BASE_URL } from '../lib/consts'

export default () => {
  const [stats, setStats] = useState()

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/stats`)
      const stats = await res.json()
      setStats(stats)
    })()
  }, [])

  return (
    <>
      <Head>
        <title>Ardent Industry – Trade & Exploration Data</title>
      </Head>
      <header>
        <div className='logo'>
          <h1>
            Ardent Industry
          </h1>
          <p>
            Trade & Exploration Data
          </p>
          <br />
          <small><a style={{ textDecoration: 'none' }} href='https://github.com/iaincollins/ardent-www'>v{Package.version} (BETA)</a></small>
        </div>
        <div className='header-navigation' style={{ display: 'none' }}>
          <Link href='/commodities'>
            <button className='button'><i className='icon icarus-terminal-cargo' /></button>
          </Link>
          <button className='button'><i className='icon icarus-terminal-system-orbits' /></button>
        </div>
        {stats &&
          <div className='is-hidden-mobile'>
            <div className='header-stats'>
              Star Systems: {stats.systems.toLocaleString()}<br />
              Trade Orders: {stats.trade.tradeOrders.toLocaleString()}<br />
              Updates today: {stats.trade.updatedInLast24Hours.toLocaleString()}<br />
            </div>
          </div>}
      </header>
    </>
  )
}
