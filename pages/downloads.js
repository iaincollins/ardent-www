import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'
import byteSize from 'byte-size'

const databaseDescription = {
  'systems.db': 'Name and location of all star systems in the known galaxy',
  'trade.db':  'Buy and sell commodity orders',
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

        <h1 className='heading--with-icon'>
          <i className='icarus-terminal-download' />
          Downloads
        </h1>
        <p className=' clear'>
          The source code and data for Ardent Industry can be downloaded.
        </p>
        <p>
          Full database downloads are updated daily, between 07:00-08:00 UTC.
        </p>
        <p>
          For live data <a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>use the REST API</a>.
        </p>

        <h2>Source Code</h2>
        <ul className='clear'>
          <li><a href='https://github.com/iaincollins/ardent-www' rel='noreferrer' target='_blank'>Ardent Website Source Code</a></li>
          <li><a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>Ardent API Source Code</a></li>
          <li><a href='https://github.com/iaincollins/ardent-collector' rel='noreferrer' target='_blank'>Ardent Collector Source Code</a></li>
        </ul>

        <h2>Databases</h2>
        <p className='clear'>
          Data downloads are in SQLite Database File Format and are updated daily.
        </p>
        <p className='muted'>
          Sources used to originally seed the databases include EDDB, ESDM, Spansh and EDDN.
        </p>

        {databases && databases.map(database => <>
          <h3>{database.name}</h3>
          <p className='clear'>
            <em>{database.description}</em>
          </p>
          <ul className='clear'>
            {Object.entries(database.tables).map(([k,v]) => <li>{v.toLocaleString()} {k.toUpperCase()}</li>)}
          </ul>
          <p style={{margin: '1.5rem 0'}}>
            <Link href={database?.download?.url ?? ''} className='button' style={{padding: '.75rem 1.25rem'}}>
              <i className='icarus-terminal-download' style={{fontSize: '1.25rem'}}/>
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
