import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { getCsrfToken } from 'lib/auth'
import { getCmdrInfo } from 'lib/cmdr'
import hexToAscii from 'lib/utils/hex-to-ascii'
import StationIcon from 'components/station-icon'
import { API_BASE_URL, SIGN_IN_URL, SIGN_OUT_URL } from 'lib/consts'
import { loadCache, saveCache, deleteCache } from 'lib/cache'

export default () => {
  const [signedIn, setSignedIn] = useState()
  const [csrfToken, setCsrfToken] = useState()
  const [cmdrProfile, setCmdrProfile] = useState()
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState()
  const [nearestServices, setNearestServices] = useState()

  const updateNearestServices = async (_cmdrProfile) => {
    let _nearestServices = loadCache('cmdrNearestServices')
    if (_nearestServices) setNearestServices(_nearestServices)

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
    _nearestServices = {
      'Interstellar Factors': interstellarFactors,
      'Universal Cartographics': universalCartographics,
      Shipyard: shipyard,
      'Black Market': blackMarket
    }
    setNearestServices(_nearestServices)
    saveCache('cmdrNearestServices', _nearestServices)
  }

  const updateFleetCarrier = async () => {
    let _fleetCarrier = loadCache('cmdrFleetCarrier')
    if (_fleetCarrier) setNearestServices(_fleetCarrier)
    _fleetCarrier = await getCmdrInfo('fleetcarrier')
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
      saveCache('cmdrProfile', _cmdrProfile)
      setCmdrProfile(_cmdrProfile)
      updateFleetCarrier()
      updateNearestServices(_cmdrProfile)
    } else {
      clearCmdrCache()
    }
  }

  useEffect(() => {
    ; (async () => {
      // If we can get a profile, they are signed in
      let _cmdrProfile = loadCache('cmdrProfile')
      if (_cmdrProfile) setCmdrProfile(_cmdrProfile)
      _cmdrProfile = await getCmdrInfo('profile')
      const isSignedIn = !!(_cmdrProfile?.commander?.id)
      setSignedIn(isSignedIn)
      if (isSignedIn) {
        saveCache('cmdrProfile', _cmdrProfile)
        // Set Cmdr Profile
        setCmdrProfile(_cmdrProfile)
        updateFleetCarrier()
        updateNearestServices(_cmdrProfile)
      } else {
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
                <p className='fx__fade-in'>
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
              {cmdrProfile?.commander?.credits &&
                <p className='fx__fade-in'>
                  <small>Credit Balance</small><br />
                  <i className='icarus-terminal-credits' />{cmdrProfile.commander.credits.toLocaleString()} CR
                  {cmdrFleetCarrier?.balance && <>
                    <br />
                    <i className='icarus-terminal-credits' />{Number(cmdrFleetCarrier.balance).toLocaleString()} CR <small>(Carrier)</small>
                  </>}
                </p>}
              {cmdrProfile?.lastSystem?.name &&
                <p className='fx__fade-in'>
                  <small>Current Location</small><br />
                  <i className='icarus-terminal-location' style={{ float: 'left' }} /><Link href={`/system/${cmdrProfile.lastSystem.name.replaceAll(' ', '_')}`}>{cmdrProfile.lastSystem.name}</Link>
                </p>}

              {cmdrFleetCarrier?.name && cmdrFleetCarrier?.currentStarSystem &&
                <p className='fx__fade-in'>
                  <small>Fleet Carrier</small><br />
                  <div style={{ fontSize: '.8rem' }}>
                    <i className='icarus-terminal-fleet-carrier' style={{ float: 'left', marginRight: '.25rem' }} />{hexToAscii(cmdrFleetCarrier.name?.vanityName)} {cmdrFleetCarrier.name?.callsign}<br />
                    <i className='icarus-terminal-route' style={{ float: 'left', marginRight: '.25rem' }} /><Link href={`/system/${cmdrFleetCarrier.currentStarSystem.replaceAll(' ', '_')}`}>{cmdrFleetCarrier.currentStarSystem}</Link><br />
                    <i className='icarus-terminal-cargo' style={{ float: 'left', marginRight: '.25rem' }} />{(25000 - cmdrFleetCarrier.capacity.freeSpace).toLocaleString()} / {(25000).toLocaleString()} T<br />
                    <i className='icarus-terminal-engineer' style={{ float: 'left', marginRight: '.25rem' }} />Crew: {cmdrFleetCarrier.capacity.crew.toLocaleString()}<br />
                    <i className='icarus-terminal-ship' style={{ float: 'left', marginRight: '.25rem' }} />Docking: {cmdrFleetCarrier.dockingAccess.toUpperCase()}<br />
                  </div>
                </p>}

              {nearestServices &&
                <div className='fx__fade-in'>
                  <h3>Services</h3>
                  <div className='rc-table data-table data-table--striped data-table--interactive data-table--animated'>
                    <div className='rc-table-container'>
                      <table>
                        <tbody className='rc-table-tbody'>
                          {Object.keys(nearestServices).map(service =>
                            <Fragment key={`nearest_service_${service}`}>
                              <tr><th className='text-left'>{service}</th></tr>
                              <tr>
                                <td style={{ paddingBottom: '1rem', paddingTop: 0 }}>
                                  {nearestServices[service]?.filter(s => s.distance === 0).splice(0, 1).map(station =>
                                    <Fragment key={`in_system_service_${service}_${station}`}>
                                      <small style={{ lineHeight: '2rem' }}>In system</small>
                                      <StationIcon station={station}>
                                        {station.stationName}
                                        {station.bodyName ? <><br />{station.bodyName}</> : ''}
                                        <small className='text-no-transform'> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>
                                      </StationIcon>
                                    </Fragment>)}
                                  {nearestServices[service]?.filter(s => s.distance > 0).splice(0, 1).map(station =>
                                    <Fragment key={`nearest_service_${service}_${station}`}>
                                      <small style={{ lineHeight: '2rem' }}>Next nearest</small>
                                      <span>
                                        <StationIcon station={station}>
                                          {station.stationName}
                                          <br />
                                          <Link href={`/system/${station.systemName.replaceAll(' ', '_')}`}>{station.bodyName ? station.bodyName : station.systemName}</Link>
                                          <small className='text-no-transform'> {station.distance.toLocaleString()} ly</small>
                                        </StationIcon>
                                      </span>
                                    </Fragment>)}
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
          <div className='home__sign-in-placeholder'>
            <p className='text-center'>
              <i style={{ fontSize: '3rem' }} className='icarus-terminal-warning muted' />
              <br />
              <small>Anonymous access protocol</small>
            </p>
            <p className='text-center'>Sign in to access all services</p>
            <form method='GET' action={SIGN_IN_URL}>
              <button className='button' style={{ display: 'block', width: '100%', fontSize: '1.25rem', lineHeight: '2.5rem' }}>
                Sign in
              </button>
            </form>
          </div>
        </>}
    </div>
  )
}

async function getNearestService (systemName, service) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/nearest/${service}?minLandingPadSize=3`)
  return res.ok ? await res.json() : null
}
