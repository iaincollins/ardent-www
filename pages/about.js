import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from 'components/layout'
import Package from 'package.json'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const [stats, setStats] = useState()
  const [version, setVersion] = useState()

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/stats`)
      const stats = await res.json()
      setStats(stats)
    })()
    ;(async () => {
      const res = await fetch(`${API_BASE_URL}/v1/version`)
      const version = await res.json()
      setVersion(version)
    })()
  }, [])

  return (
    <Layout
      title='About Ardent Industry for Elite Dangerous'
      description='Ardent Industry is companion software for the game Elite Dangerous.'
    >
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/about' />
      </Head>
      <div className='fx__fade-in'>
        <h1 className='heading--with-icon'>
          About
        </h1>
        <p className='clear'>
          Ardent Industry is companion software for <a href='https://www.elitedangerous.com/' rel='noreferrer' target='_blank'>Elite Dangerous</a>.
        </p>
        <p>
          ArdentOS v{Package.version}
          {' '}
          {version &&
            <a style={{ textTransform: 'none' }} href={API_BASE_URL} rel='noreferrer' target='_blank' className='muted'>
              [ API v{version.version} ]
            </a>}
        </p>
        {stats &&
          <>
            <p>
              Processed {stats.updatedInLast24Hours.toLocaleString()} updates in the last 24 hours.
            </p>
            <ul className='clear'>
              <li>
                Star systems: {stats.systems.toLocaleString()}
              </li>
              <li>
                Stations/settlements: {stats.stations.stations.toLocaleString()}
              </li>
              <li>
                Fleet carriers: {stats.stations.carriers.toLocaleString()}
              </li>
              <li>
                Trade orders: {stats.trade.tradeOrders.toLocaleString()}
              </li>
              <li>
                Trade markets: {(stats.trade.stations + stats.trade.carriers).toLocaleString()}
              </li>
              <li>
                Trade systems: {stats.trade.systems.toLocaleString()}
              </li>
              <li>
                Points of interest: {stats.pointsOfInterest.toLocaleString()}
              </li>
            </ul>
          </>}
        <p>
          Data from <a href='https://eddn.edcd.io' rel='noreferrer' target='_blank'>EDDN</a>, which is run by <a href='https://edcd.github.io/' rel='noreferrer' target='_blank'>EDCD</a>.
        </p>
        <h3>Downloads</h3>
        <p className='clear'>
          Both the source for the software and the raw data for Ardent Industry are available for download.
        </p>
        <ul>
          <li><a href='https://github.com/iaincollins/ardent-www' rel='noreferrer' target='_blank'>ArdentOS</a></li>
          <li><a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>Ardent API</a></li>
          <li><a href='https://github.com/iaincollins/ardent-collector' rel='noreferrer' target='_blank'>Ardent Collector</a></li>
          <li><a href='/downloads' rel='noreferrer' target='_blank'>Download Data</a></li>
        </ul>
        <h3>Legal</h3>
        <p className='clear'>
          Released under GNU Affero General Public License.
        </p>
        <p>
          Elite Dangerous is copyright Frontier Developments plc. This software is
          not endorsed by nor reflects the views or opinions of Frontier Developments and
          no employee of Frontier Developments was involved in the making of it.
        </p>
      </div>
    </Layout>
  )
}
