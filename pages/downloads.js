import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { NavigationContext } from 'lib/context'
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
  const [navigationPath, setNavigationPath] = useContext(NavigationContext)
  const [databases, setDatabases] = useState()

  useEffect(() => {
    (async () => {
      setNavigationPath([{ name: 'Home', path: '/' }, { name: 'Downloads', path: '/downloads' }])
      const res = await fetch(`${API_BASE_URL}/v1/backup`)
      const databases = (await res.json()).databases
      databases.forEach(database => { database.description = databaseDescription?.[database.name] })
      setDatabases(databases.reverse())
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
        <div className='heading--with-underline' style={{ marginBottom: 0 }}>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-download' />
            Downloads
          </h2>
        </div>
        <p>
          Source code and data for Ardent Industry.
        </p>
        <p>
          <Link href='/about'>About this software.</Link>
        </p>
        <h3>Source Code</h3>
        <p>
          The software consists of three components; this website, a REST API and a service that processes the data stream from EDDN.
        </p>
        <ul>
          <li><a href='https://github.com/iaincollins/ardent-www' rel='noreferrer' target='_blank'>Ardent Website Source Code</a></li>
          <li><a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>Ardent API Source Code</a></li>
          <li><a href='https://github.com/iaincollins/ardent-collector' rel='noreferrer' target='_blank'>Ardent Collector Source Code</a></li>
        </ul>
        <p />
        <h3>Databases</h3>
        <p>
          Data downloads are compressed SQLite Database files, they are updated weekly on Thursdays from 07:00-09:00 UTC.
        </p>
        <p>
          You may wish to avoid downloading these files during that time window as that's when the files may be updated.
        </p>
        <p>
          To query for more recent data you can use the <a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>REST API</a> at any time.
        </p>
        <p>
          Sources used to originally seed the databases include <a href='https://edsm.net' rel='noreferrer' target='_blank'>ESDM</a>,
          {' '}<a href='https://spansh.co.uk' rel='noreferrer' target='_blank'>Spansh</a>,
          {' '}<a href='https://github.com/EDCD/EDDN' rel='noreferrer' target='_blank'>EDDN</a> and EDDB.io (discontinued).
        </p>
        {databases && databases.map(database =>
          <div key={database.name}>
            <h3>{database.name}</h3>
            <p>
              <em>{database.description}</em>
            </p>
            <ul>
              {Object.entries(database.tables).map(([k, v]) => <li key={`${database.name}_${k}`} style={{ textTransform: 'capitalize' }}> {k}: {v.toLocaleString()}</li>)}
              {database?.size && <li>Disk space: {byteSize(database.size).value} {byteSize(database.size).unit}</li>}
            </ul>
            <p style={{ margin: '1.5rem 0' }}>
              <Link href={database?.download?.url ?? ''} className='button' style={{ padding: '.75rem 1.25rem' }}>
                <i className='icarus-terminal-download' style={{ position: 'relative', top: '-.125rem', fontSize: '1.25rem' }} />
                {' '}
                <strong>{database.name}.gz</strong>
                {' '}
                {database?.download?.size && <span className='muted'>({byteSize(database.download.size).value} {byteSize(database.download.size).unit})</span>}
              </Link>
            </p>
          </div>)}
      </div>
    </Layout>
  )
}
