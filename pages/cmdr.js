import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { getCsrfToken, isSignedIn } from 'lib/auth'
import { NavigationContext } from 'lib/context'
import { getCmdrInfo } from 'lib/cmdr'
import hexToAscii from 'lib/utils/hex-to-ascii'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const [signedIn, setSignedIn] = useState()
  const [csrfToken, setCsrfToken] = useState()
  const [cmdrProfile, setCmdrProfile] = useState()
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState()
  const [navigationPath, setNavigationPath] = useContext(NavigationContext)

  useEffect(() => {
    setNavigationPath([{ name: 'Home', path: '/' }, { name: 'Cmdr', path: '/cmdr' }])
    ; (async () => {
      // Perform these request in sequence
      setSignedIn(await isSignedIn())
      setCsrfToken(await getCsrfToken())

      setCmdrProfile(await getCmdrInfo('profile'))
      setCmdrFleetCarrier(await getCmdrInfo('fleetcarrier'))
    })()
  }, [])

  return (
    <Layout>
      <div className='fx__fade-in'>
        {signedIn === true &&
          <>
            <div style={{marginBottom: '0rem'}} className='heading--with-underline'><h2>Signed in</h2></div>
            {cmdrProfile?.commander &&
              <div style={{padding: '0 1rem'}}>
                {cmdrProfile?.commander?.name && <p>Welcome CMDR {cmdrProfile.commander.name}</p>}
                {cmdrProfile?.commander?.credits && <p>Your credit balance is {cmdrProfile.commander.credits.toLocaleString()} CR.</p>}
                {cmdrProfile?.lastSystem?.name && <p>Last known location <Link href={`/system/${cmdrProfile.lastSystem.name}`}>{cmdrProfile.lastSystem.name}</Link>.</p>}
                {cmdrProfile?.ship?.shipName && cmdrProfile?.ship?.shipID &&
                  <p>
                    {cmdrProfile?.ships && <>You own {Object.keys(cmdrProfile.ships).length} {Object.keys(cmdrProfile.ships).length === 1 ? 'ship' : 'ships'}. </>}
                    <>Your current ship is {cmdrProfile.ship.shipName} ({cmdrProfile.ship.shipID}).</>
                  </p>}
                {cmdrFleetCarrier?.name && cmdrFleetCarrier?.currentStarSystem && <p>Your Fleet Carrier {hexToAscii(cmdrFleetCarrier.name?.vanityName)} ({cmdrFleetCarrier.name?.callsign}) is currently located in <Link href={`/system/${cmdrFleetCarrier.currentStarSystem}`}>{cmdrFleetCarrier.currentStarSystem}</Link>.</p>}
                {csrfToken &&
                  <form method='POST' action={`${API_BASE_URL}/auth/signout`}>
                    <input type='hidden' name='csrfToken' value={csrfToken} />
                    <button className='button'>Sign out</button>
                  </form>}
              </div>}
          </>}
        {signedIn === false &&
          <>
            <div style={{marginBottom: '0rem'}} className='heading--with-underline'><h2>Signed out</h2></div>
            <div style={{padding: '0 1rem'}}>
              <p>You are not signed in.</p>
              <form method='GET' action={`${API_BASE_URL}/auth/signin`}>
                <button className='button'>Sign in</button>
              </form>
            </div>
          </>}
      </div>
    </Layout>
  )
}
