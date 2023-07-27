import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from 'components/layout'
import {API_BASE_URL} from 'lib/consts'

export default () => {
  const [backupData, setBackupData] = useState()

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/backup`)
      setBackupData(await res.json())
    })()
  }, [])
return (
  <Layout>
    <div style={{ maxWidth: '45rem' }}>
      <h2>Downloads</h2>
      <p className='clear'>
        You can download daily bulk exports of data from Ardent Industry. These are in SQLite and de-normalized for convenience and to optimize for query performance.
      </p>
      <p>
        The data comes from the live feed from EDDN, combined with data previously seeded from bulk data exports provided by EDDB, EDSM and Spansh.
      </p>
      <p>
        Last updated on {backupData?.completed?.replace(/\.(.*)/, '')?.replace('T', ' at ')?.replace(/$/, ' UTC') ?? '...'}
      </p>
      <h2>systems.db</h2>
      <p className='clear'>
        <Link href='https://downloads.ardent-industry.com/systems.db'><strong>Download systems.db</strong></Link>
        {backupData && <small>
          <br/>{backupData?.databases?.filter(db => db.name === 'systems.db')?.[0]?.tables?.systems?.toLocaleString()} systems
          <br/>{(backupData?.databases?.filter(db => db.name === 'systems.db')?.[0]?.size / 1000000000).toLocaleString(undefined, {maximumFractionDigits: 0})} GB
        </small>}
      </p>
      <p>
        <em>A list of all solar systems in the galaxy known to Ardent Industry.</em>
      </p>
      <p>
        The systems database includes the system name, address, galactic co-ordinates (X,Y,Z), the last time the system is
        known to have been visited and the proprietary Ardent Sector identifer for the sector the sytem is in (used for query optimization).
      </p>
      <h2>trade.db</h2>
      <p className='clear'>
        <Link href='https://downloads.ardent-industry.com/trade.db'><strong>Download trade.db</strong></Link>
        {backupData && <small>
          <br/>{backupData?.databases?.filter(db => db.name === 'trade.db')?.[0]?.tables?.commodities?.toLocaleString()} commodities
          <br/>{(backupData?.databases?.filter(db => db.name === 'trade.db')?.[0]?.size / 1000000000).toLocaleString(undefined, {maximumFractionDigits: 0})} GB
        </small>}
      </p>
      <p>
        <em>Contains a list of all buy/sell commodity orders being tracked by Ardent Industry.</em>
      </p>
      <p>
        The trade database includes commodity prices, stock and demand levels and location information for the relevant market for each buy / sell order.
      </p>
      <h2>stations.db</h2>
      <p className='clear'>
        <Link href='https://downloads.ardent-industry.com/stations.db'><strong>Download stations.db</strong></Link>
        {backupData && <small>
          <br/>{backupData?.databases?.filter(db => db.name === 'stations.db')?.[0]?.tables?.stations?.toLocaleString()} stations
          <br/>{(backupData?.databases?.filter(db => db.name === 'stations.db')?.[0]?.size / 1000000).toLocaleString(undefined, {maximumFractionDigits: 0})} MB
        </small>}
      </p>
      <p>
        <em>A list of all known stations, ports, outposts, settlements, megaships and fleet carriers in the galaxy known to Ardent Industry (anywhere with a docking pad).</em>
      </p>
      <p>
        This stations database includes the name, system location, services and faction affiliation and, where known, the geographic location of planetary locations.
      </p>
      <p>
        Partial data may only be avaible for some locations, depending how much telemetry has been received from the location.
      </p>
      <h2>locations.db</h2>
      <p className='clear'>
        <Link href='https://downloads.ardent-industry.com/locations.db'><strong>Download locations.db</strong></Link>
        {backupData && <small>
          <br/>{backupData?.databases?.filter(db => db.name === 'locations.db')?.[0]?.tables?.locations?.toLocaleString()} locations
          <br/>{(backupData?.databases?.filter(db => db.name === 'locations.db')?.[0]?.size / 1000).toLocaleString(undefined, {maximumFractionDigits: 0})} KB
        </small>}
      </p>
      <p>
        <em>A small but growing list of Points of interest which Ardent Industry has received telemetry for. Currently specifically contains a list of unusual planetary locations.</em>
      </p>
    </div>
  </Layout>)
}
