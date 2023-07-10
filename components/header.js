import { useState, useEffect } from 'react'
import Link from 'next/link'
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
      <header>
        <div className='header__logo'>
          <h1>
            <em>A</em>rdent <em>I</em>ndustry
          </h1>
          <p style={{ fontStyle: 'italic' }}>
            Trade &amp; exploration data
          </p>
        </div>
        <div className='header__navigation' style={{ display: 'none' }}>
          <Link href='/commodities'>
            <button className='button'><i className='icon icarus-terminal-cargo' /></button>
          </Link>
          <button className='button'><i className='icon icarus-terminal-system-orbits' /></button>
        </div>
        {stats &&
          <div className='is-hidden-mobile'>
            <div className='header__stats'>
              <span className='header__stats__label'>Star systems </span>
              <span className='header__stats__value'>{stats.systems.toLocaleString()}</span>
              <br />
              <span className='header__stats__label'>Trade orders </span>
              <span className='header__stats__value'>{stats.trade.tradeOrders.toLocaleString()}</span>
              <br />
              <span className='header__stats__label'>Updates today </span>
              <span className='header__stats__value'>{stats.trade.updatedInLast24Hours.toLocaleString()}</span>
              <br />
              <a style={{ textTransform: 'none' }} href='https://github.com/iaincollins/ardent-www' rel='noreferrer' target='_blank'>ArdentOS v{Package.version} (beta)</a>
            </div>
          </div>}
      </header>
    </>
  )
}
