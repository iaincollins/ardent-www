import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { getCsrfToken } from 'lib/auth'
import { getCmdrInfo } from 'lib/cmdr'
import hexToAscii from 'lib/utils/hex-to-ascii'
import StationIcon from 'components/station-icon'
import { API_BASE_URL, SIGN_IN_URL, SIGN_OUT_URL } from 'lib/consts'

export default () => {
  const [signedIn, setSignedIn] = useState()
  const [csrfToken, setCsrfToken] = useState()
  const [cmdrProfile, setCmdrProfile] = useState()
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState()
  const [nearestServices, setNearestServices] = useState()

  const refreshCmdrProfile = async () => {
    const cmdrProfile = await getCmdrInfo('profile')
    const isSignedIn = !!(cmdrProfile?.commander?.id)
    setSignedIn(isSignedIn)
    if (isSignedIn) {
      setCmdrProfile(cmdrProfile)
      setCmdrFleetCarrier(await getCmdrInfo('fleetcarrier'))
      const [
        interstellarFactors,
        universalCartographics,
        shipyard,
        blackMarket
      ] = await Promise.all([
        getNearestService(cmdrProfile.lastSystem.name, 'interstellar-factors'),
        getNearestService(cmdrProfile.lastSystem.name, 'universal-cartographics'),
        getNearestService(cmdrProfile.lastSystem.name, 'shipyard'),
        getNearestService(cmdrProfile.lastSystem.name, 'black-market')
      ])
      setNearestServices({
        'Interstellar Factors': interstellarFactors,
        'Universal Cartographics': universalCartographics,
        Shipyard: shipyard,
        'Black Market': blackMarket
      })
    }
  }

  useEffect(() => {
    ; (async () => {
      // If we can get a profile, they are signed in
      const cmdrProfile = await getCmdrInfo('profile')
      const isSignedIn = !!(cmdrProfile?.commander?.id)
      setSignedIn(isSignedIn)
      if (isSignedIn) {
        // Set Cmdr Profile
        setCmdrProfile(cmdrProfile)

        // Check if the Cmdr has a Fleet Carrier
        setCmdrFleetCarrier(await getCmdrInfo('fleetcarrier'))

        // Get nearby services, based on current location
        const [
          interstellarFactors,
          universalCartographics,
          shipyard,
          blackMarket
        ] = await Promise.all([
          getNearestService(cmdrProfile.lastSystem.name, 'interstellar-factors'),
          getNearestService(cmdrProfile.lastSystem.name, 'universal-cartographics'),
          getNearestService(cmdrProfile.lastSystem.name, 'shipyard'),
          getNearestService(cmdrProfile.lastSystem.name, 'black-market')
        ])
        setNearestServices({
          'Interstellar Factors': interstellarFactors,
          'Universal Cartographics': universalCartographics,
          Shipyard: shipyard,
          'Black Market': blackMarket
        })
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
                  <small>Credit balance</small><br />
                  <i className='icarus-terminal-credits' />{cmdrProfile.commander.credits.toLocaleString()} CR
                </p>}
              {cmdrProfile?.lastSystem?.name &&
                <p className='fx__fade-in'>
                  <small>Location</small><br />
                  <i className='icarus-terminal-location' /><Link href={`/system/${cmdrProfile.lastSystem.name.replaceAll(' ', '_')}`}>{cmdrProfile.lastSystem.name}</Link>
                </p>}

              {cmdrFleetCarrier?.name && cmdrFleetCarrier?.currentStarSystem &&
                <p className='fx__fade-in'>
                  <small>Fleet Carrier</small><br />
                  <i className='icarus-terminal-fleet-carrier' />{hexToAscii(cmdrFleetCarrier.name?.vanityName)} {cmdrFleetCarrier.name?.callsign}<br />
                  <i className='icarus-terminal-route' /><Link href={`/system/${cmdrFleetCarrier.currentStarSystem.replaceAll(' ', '_')}`}>{cmdrFleetCarrier.currentStarSystem}</Link>
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
                                <td style={{ paddingBottom: '1rem' }}>
                                  {nearestServices[service]?.filter(s => s.distance === 0).splice(0, 1).map(station =>
                                    <Fragment key={`in_system_service_${service}_${station}`}>
                                      <small style={{ lineHeight: '1.75rem' }}>In system</small>
                                      <StationIcon station={station}>
                                        {station.stationName}
                                        {station.bodyName ? <><br />{station.bodyName}</> : ''}
                                        <small className='text-no-transform'> {station.distanceToArrival.toFixed().toLocaleString()} Ls</small>
                                      </StationIcon>
                                    </Fragment>)}
                                  {nearestServices[service]?.filter(s => s.distance > 0).splice(0, 1).map(station =>
                                    <Fragment key={`nearest_service_${service}_${station}`}>
                                      <small style={{ lineHeight: '1.75rem' }}>Next nearest</small>
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
            <p className='text-center'><small>Anonymous access protocol</small></p>
            <p className='text-center'>Sign in to access all features.</p>
            <form method='GET' action={SIGN_IN_URL}>
              <button className='button' style={{ display: 'block', width: '100%', fontSize: '1.25rem', lineHeight: '2.5rem' }}>Sign in</button>
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
