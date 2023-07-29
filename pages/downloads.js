import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'

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
      <div className='fx__fade-in'>
        <h2 className='heading--with-icon'>
          <i className='icon icarus-terminal-download' />
          Downloads
        </h2>
        <p className='clear'>
          Bulk exports of data from Ardent Industry in SQLite databases.
        </p>
        <p>
          Sources include EDDB, ESDM, Spansh and EDDN.
        </p>
        <p>
          Last updated on {backupData?.completed?.replace(/\.(.*)/, '')?.replace('T', ' at ')?.replace(/$/, ' UTC') ?? '...'}
        </p>
        <h3>systems.db</h3>
        <p className='clear'>
          <i className='icon icarus-terminal-download' />
          <Link href='https://downloads.ardent-industry.com/systems.db'><strong>Download systems.db</strong></Link>
          {backupData &&
            <small>
              <br />{backupData?.databases?.filter(db => db.name === 'systems.db')?.[0]?.tables?.systems?.toLocaleString()} systems
              <br />{(backupData?.databases?.filter(db => db.name === 'systems.db')?.[0]?.size / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 0 })} GB
            </small>}
        </p>
        <p>
          <em>Name and location of all solar systems in the galaxy known to Ardent.</em>
        </p>
        <h3>trade.db</h3>
        <p className='clear'>
          <i className='icon icarus-terminal-download' />
          <Link href='https://downloads.ardent-industry.com/trade.db'><strong>Download trade.db</strong></Link>
          {backupData &&
            <small>
              <br />{backupData?.databases?.filter(db => db.name === 'trade.db')?.[0]?.tables?.commodities?.toLocaleString()} commodities
              <br />{(backupData?.databases?.filter(db => db.name === 'trade.db')?.[0]?.size / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 0 })} GB
            </small>}
        </p>
        <p>
          <em>A list of all buy/sell commodity orders being tracked by Ardent.</em>
        </p>
        <h3>stations.db</h3>
        <p className='clear'>
          <i className='icon icarus-terminal-download' />
          <Link href='https://downloads.ardent-industry.com/stations.db'><strong>Download stations.db</strong></Link>
          {backupData &&
            <small>
              <br />{backupData?.databases?.filter(db => db.name === 'stations.db')?.[0]?.tables?.stations?.toLocaleString()} stations
              <br />{(backupData?.databases?.filter(db => db.name === 'stations.db')?.[0]?.size / 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MB
            </small>}
        </p>
        <p>
          <em>All stations, ports, outposts, settlements, megaships and fleet carriers known to Ardent.</em>
        </p>
        <h3>locations.db</h3>
        <p className='clear'>
          <i className='icon icarus-terminal-download' />
          <Link href='https://downloads.ardent-industry.com/locations.db'><strong>Download locations.db</strong></Link>
          {backupData &&
            <small>
              <br />{backupData?.databases?.filter(db => db.name === 'locations.db')?.[0]?.tables?.locations?.toLocaleString()} locations
              <br />{(backupData?.databases?.filter(db => db.name === 'locations.db')?.[0]?.size / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} KB
            </small>}
        </p>
        <p>
          <em>Points of interest which Ardent has received telemetry for.</em>
        </p>
      </div>
    </Layout>
  )
}
