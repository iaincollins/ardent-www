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
        <title>Ardent Industry – Trade &amp; exploration data</title>
      </Head>
      <header>
        <div className='logo'>
          <h1>
            <em>A</em>rdent <em>I</em>ndustry
          </h1>
          <p style={{ fontStyle: 'italic' }}>
            Trade &amp; exploration
          </p>
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
              <span className='header-stats__label'>Star Systems</span>
              <span className='header-stats__value'>{stats.systems.toLocaleString()}</span>
              <br />
              <span className='header-stats__label'>Trade Orders</span>
              <span className='header-stats__value'>{stats.trade.tradeOrders.toLocaleString()}</span>
              <br />
              <span className='header-stats__label'>Updates today</span>
              <span className='header-stats__value'>{stats.trade.updatedInLast24Hours.toLocaleString()}</span>
              <br />
              <a style={{ float: 'right', fontWeight: 'normal', opacity: 0.5, fontSize: '.7rem', textTransform: 'none' }} href='https://github.com/iaincollins/ardent-www'>ArdentOS v{Package.version}</a>
            </div>
          </div>}
      </header>
    </>
  )
}
