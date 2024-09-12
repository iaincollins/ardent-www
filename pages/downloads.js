import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
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
    <Layout
      title='About Ardent Industry for Elite Dangerous'
      description='Download bulk exports of the Elite Dangerous trade and system data from Ardent Industry.'
    >
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/downloads' />
      </Head>
      <div className='fx__fade-in'>
        <h2 className='heading--with-icon'>
          <i className='icon icarus-terminal-download' />
          Data Downloads
        </h2>
        <p className='clear'>
          Bulk exports of data from Ardent Industry as SQLite databases.
        </p>
        <p>
          Sources used to seed the data include EDDB, ESDM, Spansh and EDDN.
        </p>
        <p>
          Last updated {backupData?.completed?.replace(/\.(.*)/, '')?.replace('T', ' @ ')?.replace(/$/, ' UTC') ?? '...'}
        </p>
        <h3>systems.db</h3>
        <p className='clear'>
          <em>Name and location of all solar systems in the galaxy known to Ardent.</em>
        </p>
        <p className='clear'>
          <i className='icon icarus-terminal-download' />
          <Link href='https://downloads.ardent-industry.com/systems.db'><strong>Download systems.db</strong></Link>
          {backupData &&
            <small>
              <br />{backupData?.databases?.filter(db => db.name === 'systems.db')?.[0]?.tables?.systems?.toLocaleString()} systems
              <span style={{ opacity: 0.5 }}>{' | '}</span>
              Size: {(backupData?.databases?.filter(db => db.name === 'systems.db')?.[0]?.size / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 0 })} GB
            </small>}
        </p>

        <h3>trade.db</h3>
        <p className='clear'>
          <em>A list of all buy and sell commodity orders being tracked by Ardent.</em>
        </p>
        <p className='clear'>
          <i className='icon icarus-terminal-download' />
          <Link href='https://downloads.ardent-industry.com/trade.db'><strong>Download trade.db</strong></Link>
          {backupData &&
            <small>
              <br />{backupData?.databases?.filter(db => db.name === 'trade.db')?.[0]?.tables?.commodities?.toLocaleString()} commodities
              <span style={{ opacity: 0.5 }}>{' | '}</span>
              Size: {(backupData?.databases?.filter(db => db.name === 'trade.db')?.[0]?.size / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 0 })} GB
            </small>}
        </p>

        <h3>stations.db</h3>
        <p className='clear'>
          <em>All stations, ports, outposts, settlements, megaships and fleet carriers known to Ardent.</em>
        </p>
        <p className='clear'>
          <i className='icon icarus-terminal-download' />
          <Link href='https://downloads.ardent-industry.com/stations.db'><strong>Download stations.db</strong></Link>
          {backupData &&
            <small>
              <br />{backupData?.databases?.filter(db => db.name === 'stations.db')?.[0]?.tables?.stations?.toLocaleString()} stations
              <span style={{ opacity: 0.5 }}>{' | '}</span>
              Size: {(backupData?.databases?.filter(db => db.name === 'stations.db')?.[0]?.size / 1000000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MB
            </small>}
        </p>

        <h3>locations.db</h3>
        <p className='clear'>
          <em>Points of interest Ardent has received telemetry for.</em>
        </p>
        <p className='clear'>
          <i className='icon icarus-terminal-download' />
          <Link href='https://downloads.ardent-industry.com/locations.db'><strong>Download locations.db</strong></Link>
          {backupData &&
            <small>
              <br />{backupData?.databases?.filter(db => db.name === 'locations.db')?.[0]?.tables?.locations?.toLocaleString()} locations
              <span style={{ opacity: 0.5 }}>{' | '}</span>
              Size: {(backupData?.databases?.filter(db => db.name === 'locations.db')?.[0]?.size / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} KB
            </small>}
        </p>
      </div>
    </Layout>
  )
}
