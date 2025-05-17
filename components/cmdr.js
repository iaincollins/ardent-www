import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { getCsrfToken } from 'lib/auth'
import { getCmdrInfo } from 'lib/cmdr'
import hexToAscii from 'lib/utils/hex-to-ascii'
import StationIcon from 'components/station-icon'
import { API_BASE_URL, SIGN_IN_URL, SIGN_OUT_URL } from 'lib/consts'
import { loadCache, saveCache, deleteCache } from 'lib/cache'
import { timeBetweenTimestamps } from 'lib/utils/dates'

const SERVICE_STATION_TYPES = [
  'Coriolis',
  'Ocellus',
  'Orbis',
  'AsteroidBase',
  'Outpost',
  'MegaShip',
  'StrongholdCarrier',
  'CraterPort',
  'CraterOutpost'
]

export default () => {
  const [signedIn, setSignedIn] = useState()
  const [maintanceMode, setMaintanceMode] = useState()
  const [csrfToken, setCsrfToken] = useState()
  const [cmdrProfile, setCmdrProfile] = useState(loadCache('cmdrProfile'))
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState(loadCache('cmdrFleetCarrier'))
  const [nearestServices, setNearestServices] = useState(loadCache('cmdrNearestServices'))
  const updateNearestServices = async (_cmdrProfile) => {
    const [
      interstellarFactors,
      universalCartographics,
      shipyard,
      blackMarket
    ] = await Promise.all([
      getNearestService(_cmdrProfile.lastSystem.name, 'interstellar-factors'),
      getNearestService(_cmdrProfile.lastSystem.name, 'universal-cartographics'),
      getNearestService(_cmdrProfile.lastSystem.name, 'shipyard'),
      getNearestService(_cmdrProfile.lastSystem.name, 'black-market')
    ])
    const _nearestServices = {
      'Interstellar Factors': interstellarFactors,
      'Universal Cartographics': universalCartographics,
      Shipyard: shipyard,
      'Black Market': blackMarket
    }
    setNearestServices(_nearestServices)
    saveCache('cmdrNearestServices', _nearestServices)
  }

  const updateFleetCarrier = async () => {
    const _fleetCarrier = await getCmdrInfo('fleetcarrier')
    setCmdrFleetCarrier(_fleetCarrier)
    saveCache('cmdrFleetCarrier', _fleetCarrier)
  }

  function clearCmdrCache () {
    deleteCache('cmdrProfile')
    deleteCache('cmdrFleetCarrier')
    deleteCache('cmdrNearestServices')
  }

  const refreshCmdrProfile = async () => {
    const _cmdrProfile = await getCmdrInfo('profile')
    const isSignedIn = !!(_cmdrProfile?.commander?.id)
    setSignedIn(isSignedIn)
    if (isSignedIn) {
      setMaintanceMode(false)
      setCmdrProfile(_cmdrProfile)
      saveCache('cmdrProfile', _cmdrProfile)
      updateFleetCarrier()
      updateNearestServices(_cmdrProfile)
    } else {
      const _maintanceMode = _cmdrProfile?.status === 418
      setMaintanceMode(_maintanceMode)
      clearCmdrCache()
    }
  }

  useEffect(() => {
    if (cmdrProfile !== undefined) setSignedIn(true)
    ; (async () => {
      // If we can get a profile, they are signed in
      const _cmdrProfile = await getCmdrInfo('profile')
      const isSignedIn = !!(_cmdrProfile?.commander?.id)
      setSignedIn(isSignedIn)
      if (isSignedIn) {
        setMaintanceMode(false)
        setCmdrProfile(_cmdrProfile)
        saveCache('cmdrProfile', _cmdrProfile)
        updateFleetCarrier()
        updateNearestServices(_cmdrProfile)
      } else {
        const _maintanceMode = _cmdrProfile?.status === 418
        setMaintanceMode(_maintanceMode)
        clearCmdrCache()
      }
      setCsrfToken(await getCsrfToken())
    })()
  }, [])

  return (
    <div className='fx__fade-in'>
      {signedIn === true &&
        <>
          {cmdrProfile?.commander &&
            <div onClick={() => refreshCmdrProfile()}>
              {cmdrProfile?.commander?.name &&
                <p>
                  CMDR {cmdrProfile.commander.name}<br />
                  {cmdrProfile?.ship?.shipName && cmdrProfile?.ship?.shipID &&
                    <span className='text-uppercase muted'>
                      {cmdrProfile.ship.shipName} | {cmdrProfile.ship.shipID}
                    </span>}
                  {/* {Object.keys(cmdrProfile?.ships)?.length > 1 &&
                      <small className='muted'>
                        <br/>
                        {Object.keys(cmdrProfile?.ships)?.length > 1 ? ` 1 of ${Object.keys(cmdrProfile?.ships)?.length} ships in fleet` : ''}
                      </small>} */}
                </p>}
              {cmdrProfile !== undefined &&
                <p>
                  <small>Credit Balance</small><br />
                  <i className='icarus-terminal-credits' style={{ float: 'left', marginRight: '.25rem', position: 'relative', top: '.15rem' }} />{cmdrProfile.commander.credits.toLocaleString()} CR
                </p>}
              {cmdrProfile !== undefined &&
                <p>
                  <small>Current Location</small><br />
                  <i className='icarus-terminal-location-filled' style={{ float: 'left', position: 'relative', top: '.15rem' }} /><Link href={`/system/${cmdrProfile.lastSystem.name.replaceAll(' ', '_')}`}>{cmdrProfile.lastSystem.name}</Link>
                </p>}

              {cmdrFleetCarrier !== undefined && cmdrFleetCarrier?.name &&
                <p>
                  <small>Fleet Carrier</small><br />
                  <span style={{ fontSize: '.85rem', lineHeight: '1.1rem' }}>
                    <i className='icarus-terminal-fleet-carrier' style={{ float: 'left', marginRight: '.25rem', position: 'relative', top: '.15rem' }} />{hexToAscii(cmdrFleetCarrier.name.vanityName)} {cmdrFleetCarrier.name.callsign}<br />
                    <i className='icarus-terminal-star' style={{ float: 'left', marginRight: '.25rem', position: 'relative', top: '.15rem' }} /><Link href={`/system/${cmdrFleetCarrier.currentStarSystem.replaceAll(' ', '_')}`}>{cmdrFleetCarrier.currentStarSystem}</Link><br />
                    <i className='icarus-terminal-credits' style={{ float: 'left', marginRight: '.25rem', position: 'relative', top: '.15rem' }} />{Number(cmdrFleetCarrier.balance).toLocaleString()} CR<br />
                    <i className='icarus-terminal-cargo' style={{ float: 'left', marginRight: '.25rem', position: 'relative', top: '.15rem' }} />{(25000 - cmdrFleetCarrier.capacity.freeSpace).toLocaleString()} / {(25000).toLocaleString()} T<br />
                  </span>
                </p>}

              {nearestServices &&
                <div className='fx__fade-in'>
                  <div className='heading--with-underline'>
                    <h3>Nearest services</h3>
                  </div>
                  <div className='rc-table data-table data-table--striped data-table--interactive data-table--animated'>
                    <div className='rc-table-container'>
                      <table>
                        <tbody className='rc-table-tbody'>
                          {Object.keys(nearestServices).map(service =>
                            <Fragment key={`nearest_service_${service}`}>
                              <tr><th className='text-left'>{service}</th></tr>
                              <tr>
                                <td style={{ paddingBottom: '1rem', paddingTop: 0 }}>
                                  {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType))?.filter(s => s.distance === 0)?.length > 0 &&
                                    <small style={{ display: 'block', marginTop: '.5rem' }}>Station in system</small>}
                                  {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType))?.splice(0, 1)?.filter(s => s.distance === 0)?.map(station =>
                                    <Fragment key={`in_system_service_${service}_${station}`}>
                                      <p style={{ margin: '.5rem 0 0 0' }}>
                                        <StationIcon station={station}>
                                          {station.stationName}
                                          {station.bodyName ? <><br /><span style={{ fontSize: '.9rem' }}>{station.bodyName}</span></> : ''}
                                          <small className='text-no-transform'> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>
                                        </StationIcon>
                                      </p>
                                    </Fragment>)}
                                  {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType)).filter(s => s.distance > 0)?.length > 0 &&
                                    <small style={{ display: 'block', marginTop: '.5rem' }}>Next nearest station</small>}
                                  {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType))?.filter(s => s.distance > 0)?.splice(0, 1)?.map(station =>
                                    <Fragment key={`nearest_service_${service}_${station.stationName}`}>
                                      <p style={{ margin: '.5rem 0 0 0' }}>
                                        <StationIcon station={station}>
                                          {station.stationName}
                                          <br />
                                          <Link style={{ fontSize: '.9rem' }} href={`/system/${station.systemAddress}`}>{station.systemName}</Link>
                                          <small className='text-no-transform'> {station.distance.toLocaleString()} ly</small>
                                        </StationIcon>
                                      </p>
                                    </Fragment>)}
                                  {nearestServices[service]?.filter(s => s.stationType !== 'FleetCarrier').filter(s => s.distance > 0)?.length === 0 &&
                                    <>
                                      {nearestServices[service]?.filter(s => s.stationType === 'FleetCarrier')?.length > 0 &&
                                        <small style={{ display: 'block', marginTop: '.5rem' }}>Nearest Carriers</small>}
                                      {nearestServices[service]?.filter(s => s.stationType === 'FleetCarrier')?.sort((a, b) => b?.updatedAt?.localeCompare(a?.updatedAt))?.splice(0, 3)?.map(station =>
                                        <Fragment key={`nearest_service_${service}_${station.stationName}`}>
                                          <p style={{ margin: '.5rem 0 0 0' }}>
                                            <StationIcon station={station}>
                                              {station.stationName}
                                              <br />
                                              <Link style={{ fontSize: '.9rem' }} href={`/system/${station.systemAddress}`}>{station.systemName}</Link>
                                              <small className='text-no-transform'> {station.distance.toLocaleString()} ly</small>
                                              <br />{station.updatedAt && <small>{timeBetweenTimestamps(station.updatedAt)} ago</small>}
                                            </StationIcon>
                                          </p>
                                        </Fragment>)}
                                    </>}
                                </td>
                              </tr>
                            </Fragment>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>}
            </div>}
          {csrfToken &&
            <form id='signout' method='POST' action={SIGN_OUT_URL}>
              <input type='hidden' name='csrfToken' value={csrfToken} />
              <p className='text-center'>
                <small style={{ paddingBottom: '1rem' }} onClick={() => document.getElementById('signout').submit()}>Sign out</small>
              </p>
            </form>}
        </>}
      {signedIn === false &&
        <>
          {maintanceMode == true
            ? <>
              <div className='home__sign-in-placeholder'>
                <p className='text-center'>
                  <i style={{ fontSize: '3rem' }} className='icarus-terminal-warning muted' />
                  <br />
                  <small>Maintenance mode</small>
                </p>
                <p className='text-center'>Elite Dangerous is offline.</p>
                <p className='text-center'>This is usually due to scheduled weekly maintenance on a Thursday or because an update to the game is currently being deployed.</p>
                <p className='text-center'>
                  For more information refer to the offical <a target='_blank' href='https://forums.frontier.co.uk/forums/elite-dangerous-news/' rel='noreferrer'>Elite Dangerous News Forum</a>
                </p>
              </div>
            </>
            : <>
              <div className='home__sign-in-placeholder'>
                <p className='text-center'>
                  <i style={{ fontSize: '3rem' }} className='icarus-terminal-warning muted' />
                  <br />
                  <small>Anonymous access protocol</small>
                </p>
                <p className='text-center'>Sign in to access all services</p>
                <form method='GET' action={SIGN_IN_URL}>
                  <button className='button' style={{ display: 'block', width: '100%', padding: '.75rem .25rem', fontSize: '1.25rem' }}>
                    Sign in
                  </button>
                </form>
              </div>
            </>}
        </>}
    </div>
  )
}

async function getNearestService (systemName, service) {
  const res = await fetch(`${API_BASE_URL}/v2/system/name/${systemName}/nearest/${service}?minLandingPadSize=3`)
  return res.ok ? await res.json() : null
}
