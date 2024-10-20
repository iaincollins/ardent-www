import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCsrfToken, isSignedIn } from 'lib/auth'
import { getCmdrInfo } from 'lib/cmdr'
import hexToAscii from 'lib/utils/hex-to-ascii'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const [signedIn, setSignedIn] = useState()
  const [csrfToken, setCsrfToken] = useState()
  const [cmdrProfile, setCmdrProfile] = useState()
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState()

  useEffect(() => {
    ; (async () => {
      // Perform these request in sequence
      setSignedIn(await isSignedIn())
      setCsrfToken(await getCsrfToken())

      setCmdrProfile(await getCmdrInfo('profile'))
      setCmdrFleetCarrier(await getCmdrInfo('fleetcarrier'))
    })()
  }, [])

  return (
    <Layout >
      <div className='fx__fade-in'>
        {signedIn === true &&
          <>
            <h1>Signed in</h1>
            {cmdrProfile !== undefined &&
              <div className='clear'>
                {cmdrProfile?.commander?.name && <p>Welcome CMDR {cmdrProfile.commander.name}</p>}
                {cmdrProfile?.commander?.credits && <p>Your credit balance is {cmdrProfile.commander.credits.toLocaleString()} CR.</p>}
                {cmdrProfile?.ship?.shipName && cmdrProfile?.ship?.shipID &&
                  <p>
                    {cmdrProfile?.ships && <>You own {Object.keys(cmdrProfile.ships).length} {Object.keys(cmdrProfile.ships).length == 1 ? 'ship' : 'ships'}.</>}
                    <> Your current ship is {cmdrProfile.ship.shipName} ({cmdrProfile.ship.shipID}), located in <Link href={`/system/${cmdrProfile.ship.starsystem.name}`}>{cmdrProfile.ship.starsystem.name}</Link>.</>
                  </p>
                }
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
            <h1>Signed out</h1>
            <div className='clear'>
              <p>You are signed out.</p>
              <form method='GET' action={`${API_BASE_URL}/auth/signin`}>
                <button className='button'>Sign in</button>
              </form>
            </div>
          </>}
      </div>
    </Layout>
  )
}

