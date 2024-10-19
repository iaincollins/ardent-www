import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const [isSignedIn, setIsSignedIn] = useState()
  const [csrfToken, setCsrfToken] = useState()
  const [cmdrProfile, setCmdrProfile] = useState()
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState()

  useEffect(() => {
    ; (async () => {
      // Perform these request in sequence
      setIsSignedIn(await getAccessToken() ? true : false)
      setCsrfToken(await getCsrfToken())

      setCmdrProfile(await getCmdrInformation('profile'))
      setCmdrFleetCarrier(await getCmdrInformation('fleetcarrier'))
    })()
  }, [])

  return (
    <Layout >
      <div className='fx__fade-in'>
        {isSignedIn === true &&
          <>
            <h1>Signed in</h1>
            {cmdrProfile !== undefined &&
              <div className='clear'>
                {cmdrProfile?.commander?.name && <p>Welcome CMDR {cmdrProfile.commander.name}</p>}
                {cmdrProfile?.commander?.credits && <p>Your credit balance is {cmdrProfile.commander.credits.toLocaleString()} CR.</p>}
                {cmdrProfile?.ship?.shipName && cmdrProfile?.ship?.shipID && <p>Your current ship is {cmdrProfile.ship.shipName} ({cmdrProfile.ship.shipID}), located in <Link href={`/system/${cmdrProfile.ship.starsystem.name}`}>{cmdrProfile.ship.starsystem.name}</Link>.</p>}
                {cmdrProfile?.ships && <p>You own {Object.keys(cmdrProfile.ships).length} {Object.keys(cmdrProfile.ships).length == 1 ? 'ship' : 'ships'}.</p>}
                {cmdrFleetCarrier?.name && cmdrFleetCarrier?.currentStarSystem && <p>Your Fleet Carrier {hexToAscii(cmdrFleetCarrier.name?.vanityName)} ({cmdrFleetCarrier.name?.callsign}) is currently located in <Link href={`/system/${cmdrFleetCarrier.currentStarSystem}`}>{cmdrFleetCarrier.currentStarSystem}</Link>.</p>}
                {csrfToken &&
                  <form method='POST' action={`${API_BASE_URL}/auth/signout`}>
                    <input type='hidden' name='csrfToken' value={csrfToken} />
                    <button className='button'>Sign out</button>
                  </form>}
              </div>}
          </>}
        {isSignedIn === false &&
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

function hexToAscii(hexx) {
  var hex = hexx.toString()
  var str = ''
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  }
  return str
}

async function getAccessToken() {
  const res = await fetch(`${API_BASE_URL}/auth/token`, { credentials: 'include' })
  if (res.ok) {
    const json = await res.json()
    if (json.accessToken) return json.accessToken
  }
  return null
}

async function getCsrfToken() {
  const res = await fetch(`${API_BASE_URL}/auth/csrftoken`, { credentials: 'include' })
  if (res.ok) {
    const json = await res.json()
    if (json.csrfToken) return json.csrfToken
  }
  return null
}

async function getCmdrInformation(information) {
  const res = await fetch(`${API_BASE_URL}/auth/cmdr/${information}`, { credentials: 'include' })
  if (res.ok) return await res.json()
  return null
}