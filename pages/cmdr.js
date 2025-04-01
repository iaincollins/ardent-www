import { useState, useEffect, useContext, Fragment } from 'react'
import Link from 'next/link'
import { getCsrfToken } from 'lib/auth'
import { NavigationContext } from 'lib/context'
import { getCmdrInfo } from 'lib/cmdr'
import hexToAscii from 'lib/utils/hex-to-ascii'
import Layout from 'components/layout'
import StationIcon from 'components/station-icon'
import { API_BASE_URL, SIGN_IN_URL, SIGN_OUT_URL } from 'lib/consts'

export default () => {
  const [signedIn, setSignedIn] = useState()
  const [csrfToken, setCsrfToken] = useState()
  const [cmdrProfile, setCmdrProfile] = useState()
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState()
  const [, setNavigationPath] = useContext(NavigationContext)
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
    setNavigationPath([{ name: 'Home', path: '/' }, { name: 'Cmdr', path: '/cmdr' }])
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
    <Layout>
      <div className='fx__fade-in'>
        {signedIn === true &&
          <>
            <div style={{ marginBottom: '0rem' }} className='heading--with-underline'><h2>CMDR</h2></div>
            {cmdrProfile?.commander &&
              <div>
                {cmdrProfile?.commander?.name &&
                  <p>
                    <i className='icarus-terminal-engineer' />CMDR {cmdrProfile.commander.name}<br />
                    {cmdrProfile?.ship?.shipName && cmdrProfile?.ship?.shipID &&
                      <span className='text-uppercase muted'>
                        <i className='icarus-terminal-ship' />{cmdrProfile.ship.shipName} | {cmdrProfile.ship.shipID}
                      </span>}
                    {/* {Object.keys(cmdrProfile?.ships)?.length > 1 &&
                      <small className='muted'>
                        <br/>
                        {Object.keys(cmdrProfile?.ships)?.length > 1 ? ` 1 of ${Object.keys(cmdrProfile?.ships)?.length} ships in fleet` : ''}
                      </small>} */}
                  </p>}
                {cmdrProfile?.commander?.credits &&
                  <p>
                    <small>Credit balance</small><br />
                    <i className='icarus-terminal-credits' />{cmdrProfile.commander.credits.toLocaleString()} CR
                  </p>}
                {cmdrProfile?.lastSystem?.name &&
                  <p>
                    <small>Location</small><br />
                    <i className='icarus-terminal-location' /><Link href={`/system/${cmdrProfile.lastSystem.name}`}>{cmdrProfile.lastSystem.name} system</Link>
                  </p>}

                {cmdrFleetCarrier?.name && cmdrFleetCarrier?.currentStarSystem &&
                  <p>
                    <small>Fleet Carrier</small><br />
                    <i className='icarus-terminal-fleet-carrier' />{hexToAscii(cmdrFleetCarrier.name?.vanityName)} {cmdrFleetCarrier.name?.callsign}<br />
                    <i className='icarus-terminal-star' /><Link href={`/system/${cmdrFleetCarrier.currentStarSystem}`}>{cmdrFleetCarrier.currentStarSystem} system</Link>
                  </p>}

                {nearestServices &&
                  <>
                    <div style={{ marginBottom: '0rem' }} className='heading--with-underline'><h2>Local Services</h2></div>
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
                                            <Link href={`/system/${station.systemName}`}>{station.bodyName ? station.bodyName : station.systemName}</Link>
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
                  </>}
                <button onClick={() => refreshCmdrProfile()} className='button'>Refresh</button>
                {csrfToken &&
                  <form method='POST' action={SIGN_OUT_URL}>
                    <input type='hidden' name='csrfToken' value={csrfToken} />
                    <button className='button'>Sign out</button>
                  </form>}
              </div>}
          </>}
        {signedIn === false &&
          <>
            <div style={{ marginBottom: '0rem' }} className='heading--with-underline'><h2>Signed out</h2></div>
            <div style={{ padding: '0 1rem' }}>
              <p>You are not signed in.</p>
              <form method='GET' action={SIGN_IN_URL}>
                <button className='button'>Sign in</button>
              </form>
            </div>
          </>}
      </div>
    </Layout>
  )
}

async function getNearestService (systemName, service) {
  const res = await fetch(`${API_BASE_URL}/v1/system/name/${systemName}/nearest/${service}?minLandingPadSize=3`)
  return res.ok ? await res.json() : null
}
