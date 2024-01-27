import { useState, useEffect } from 'react'
import Package from 'package.json'
import Dialog from 'components/dialog'

import { API_BASE_URL } from 'lib/consts'

export default ({ toggle }) => {
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
    <Dialog title='About' toggle={toggle}>
      <p>
        Trade &amp; exploration data for <a href='https://www.elitedangerous.com/' rel='noreferrer' target='_blank'>Elite Dangerous</a>.
      </p>
      <p>
        Uses data submitted to <a href='https://eddn.edcd.io' rel='noreferrer' target='_blank'>EDDN</a>, which is run by <a href='https://edcd.github.io/' rel='noreferrer' target='_blank'>EDCD</a>.
      </p>
      {stats &&
        <>
          <ul className='clear'>
            <li>
              Trade Data
              <ul>
                <li>
                  Trade Orders: {stats.trade.tradeOrders.toLocaleString()}
                </li>
                <li>
                  Markets: {(stats.trade.stations + stats.trade.carriers).toLocaleString()}
                </li>
                <li>
                  Trade Systems: {stats.trade.systems.toLocaleString()}
                </li>
              </ul>
            </li>
            <li>Location Data
              <ul>
                <li>
                  Star systems: {stats.systems.toLocaleString()}
                </li>
                <li>
                  Stations &amp; Settlements: {stats.stations.stations.toLocaleString()}
                </li>
                <li>
                  Fleet Carriers: {stats.stations.carriers.toLocaleString()}
                </li>
                <li>
                  Points of Interest: {stats.pointsOfInterest.toLocaleString()}
                </li>
              </ul>
            </li>
          </ul>
        </>}

      <h3>Version</h3>
      <ul className='clear'>
        <li>
          ArdentOS version {Package.version}
        </li>
        <li className='clear'>
          {version &&
            <a style={{ textTransform: 'none' }} href={API_BASE_URL} rel='noreferrer' target='_blank'>
              Ardent API version {version.version}
            </a>}
        </li>
      </ul>

      <h3>Downloads</h3>
      <p className='clear'>
        The software and data for Ardent Industry is open source.
      </p>
      <p>
        <a href='https://github.com/iaincollins/ardent-www' rel='noreferrer' target='_blank'>ArdentOS</a>
        <span className='muted'> | </span>
        <a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>Ardent API</a>
        <span className='muted'> | </span>
        <a href='https://github.com/iaincollins/ardent-collector' rel='noreferrer' target='_blank'>Ardent Collector</a>
        <span className='muted'> | </span>
        <a href='/downloads' rel='noreferrer' target='_blank'>Downloads</a>
      </p>


      {/* ? 'Locations:\n' +
        `* Star systems: ${stats.systems.toLocaleString()}\n` +
        `* Points of interest: ${stats.pointsOfInterest.toLocaleString()}\n` +
        'Stations:\n' +
        `* Stations: ${stats.stations.stations.toLocaleString()}\n` +
        `* Fleet Carriers: ${stats.stations.carriers.toLocaleString()}\n` +
        `* Station updates in last hour: ${stats.stations.updatedInLastHour.toLocaleString()}\n` +
        `* Station updates in last 24 hours: ${stats.stations.updatedInLast24Hours.toLocaleString()}\n` +
        `* Station updates in last 7 days: ${stats.stations.updatedInLast7Days.toLocaleString()}\n` +
        `* Station updates in last 30 days: ${stats.stations.updatedInLast30Days.toLocaleString()}\n` +
        'Trade:\n' +
        `* Station Markets: ${stats.trade.stations.toLocaleString()}\n` +
        `* Fleet Carrier Markets: ${stats.trade.carriers.toLocaleString()}\n` +
        `* Trade systems: ${stats.trade.systems.toLocaleString()}\n` +
        `* Trade orders: ${stats.trade.tradeOrders.toLocaleString()}\n` +
        `* Trade updates in last hour: ${stats.trade.updatedInLastHour.toLocaleString()}\n` +
        `* Trade updates in last 24 hours: ${stats.trade.updatedInLast24Hours.toLocaleString()}\n` +
        `* Trade updates in last 7 days: ${stats.trade.updatedInLast7Days.toLocaleString()}\n` +
        `* Trade updates in last 30 days: ${stats.trade.updatedInLast30Days.toLocaleString()}\n` +
        `* Unique commodities: ${stats.trade.uniqueCommodities.toLocaleString()}\n` +
        `Stats last updated: ${stats.timestamp}\nStats updated every 15 minutes.`
        : 'Stats not generated yet') */}
      <h3>Legal</h3>
      <p className='clear'>
        Released under GNU Affero General Public License.
      </p>
      <p>
        Elite Dangerous is copyright Frontier Developments plc. This software is
        not endorsed by nor reflects the views or opinions of Frontier Developments and
        no employee of Frontier Developments was involved in the making of it.
      </p>
      {/*
      <pre>
        {JSON.stringify(stats, 0, 2)}
      </pre>
      */}
    </Dialog>
  )
}
