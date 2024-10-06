import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'
import byteSize from 'byte-size'

const databaseDescription = {
  'systems.db': 'Name and location of all star systems in the known galaxy',
  'trade.db': 'Buy and sell commodity orders',
  'stations.db': 'Name and location of stations, outposts, ports, settlements, megaships and fleet carriers',
  'locations.db': 'Unusual locations and points of interest'
}
export default () => {
  const [databases, setDatabases] = useState()

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE_URL}/v1/backup`)
      const databases = (await res.json()).databases
      databases.forEach(database => database.description = databaseDescription?.[database.name])
      setDatabases(databases.reverse())
      console.log(databases)
    })()
  }, [])

  return (
    <Layout
      title='Downloads for Ardent Industry software'
      description='Download bulk exports of the Elite Dangerous trade and system data from Ardent Industry.'
    >
      <Head>
        <link rel='canonical' href='https://ardent-industry.com/downloads' />
      </Head>
      <div className='fx__fade-in'>
        <h1 className='heading--with-icon'>
          <i className='icarus-terminal-download' />
          Downloads
        </h1>
        <p className=' clear'>
          Source code and data for Ardent Industry.
        </p>
        <h2>Source Code</h2>
        <p className='clear'>
          The software consists of three components - this website, a REST API and a service that processes the data stream from EDDN.
        </p>
        <ul className='clear'>
          <li><a href='https://github.com/iaincollins/ardent-www' rel='noreferrer' target='_blank'>Ardent Website Source Code</a></li>
          <li><a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>Ardent API Source Code</a></li>
          <li><a href='https://github.com/iaincollins/ardent-collector' rel='noreferrer' target='_blank'>Ardent Collector Source Code</a></li>
        </ul>

        <h2>Databases</h2>
        <p className='clear'>
          Sources used to originally seed the databases include <a href='https://edsm.net' rel='noreferrer' target='_blank'>ESDM</a>,
          {' '}<a href='https://spansh.co.uk' rel='noreferrer' target='_blank'>Spansh</a>,
          {' '}<a href='https://github.com/EDCD/EDDN' rel='noreferrer' target='_blank'>EDDN</a> and EDDB.io (discontinued).
        </p>
        <p>
          Data downloads are in SQLite Database File Format and are updated daily, between 07:00-08:00 UTC.
        </p>
        <p>
          It is recommended to avoid downloading exports during that time window as older files may be automatically deleted.
        </p>
        <p>
          To query live data you can use the <a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>REST API</a>.
        </p>
        {databases && databases.map(database => <>
          <h3>{database.name}</h3>
          <p className='clear'>
            <em>{database.description}</em>
          </p>
          <ul className='clear'>
            {Object.entries(database.tables).map(([k, v]) => <li style={{ textTransform: 'capitalize' }}>{v.toLocaleString()} {k}</li>)}
            {database?.size && <li>Requires {byteSize(database.size).value} {byteSize(database.size).unit} of diskspace</li>}
          </ul>
          <p style={{ margin: '1.5rem 0' }}>
            <Link href={database?.download?.url ?? ''} className='button' style={{ padding: '.75rem 1.25rem' }}>
              <i className='icarus-terminal-download' style={{ position: 'relative', top: '-.125rem', fontSize: '1.25rem' }} />
              {' '}
              <strong>Download {database.name}.gz</strong>
              {' '}
              {database?.download?.size && <span className='muted'>({byteSize(database.download.size).value} {byteSize(database.download.size).unit})</span>}
            </Link>
          </p>
        </>)}
      </div>
    </Layout>
  )
}
