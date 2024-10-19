import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const [accessTokenExpiryTime, setAccessTokenExpiryTime] = useState()
  const [csrfToken, setCsrfToken] = useState()
  const [cmdrProfile, setCmdrProfile] = useState()
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState()

  useEffect(() => {
    ;(async () => {
      const res = await fetch(`${API_BASE_URL}/auth/token`, { credentials: 'include' })
      setAccessTokenExpiryTime((await res.json())?.expires ?? null)
    })()
    ;(async () => {
      const res = await fetch(`${API_BASE_URL}/auth/csrftoken`, { credentials: 'include' })
      setCsrfToken((await res.json())?.csrfToken ?? null)
    })()
    ;(async () => {
      const res = await fetch(`${API_BASE_URL}/auth/cmdr/profile`, { credentials: 'include' })
      setCmdrProfile(res.ok ? await res.json() : null)
    })()
    ;(async () => {
      const res = await fetch(`${API_BASE_URL}/auth/cmdr/fleetcarrier`, { credentials: 'include' })
      setCmdrFleetCarrier(res.ok ? await res.json() : null)
    })()
  }, [])

  return (
    <Layout >
      <div className='fx__fade-in'>
        <h1>
          {accessTokenExpiryTime && 'Signed in'}
          {accessTokenExpiryTime === null && 'Signed out'}
        </h1>
        <div className='clear'>
          {accessTokenExpiryTime && cmdrProfile && 
            <>
              {cmdrProfile.commander && <p>Welcome CMDR {cmdrProfile.commander.name}, you are signed in.</p>}
              {cmdrProfile.commander && <p>Your credit balance is {cmdrProfile.commander.credits.toLocaleString()} CR.</p>}
              {cmdrProfile.ship && <p>Your current location is <Link href={`/system/${cmdrProfile.ship.starsystem.name}`}>{cmdrProfile.ship.starsystem.name}</Link>.</p>}
              {cmdrProfile.ship && cmdrProfile.ships && <p>Your current ship is {cmdrProfile.ship.shipName} ({cmdrProfile.ship.shipID}), you own {Object.keys(cmdrProfile.ships).length} {Object.keys(cmdrProfile.ships).length == 1 ? 'ship' : 'ships'} in total.</p>}
              {cmdrFleetCarrier.name && <p>You also own a Fleet Carrier {hexToAscii(cmdrFleetCarrier.name.vanityName)} ({cmdrFleetCarrier.name.callsign}), it is currently located in <Link href={`/system/${cmdrFleetCarrier.currentStarSystem}`}>{cmdrFleetCarrier.currentStarSystem}</Link>.</p>}
              {csrfToken &&
                <form method='POST' action={`${API_BASE_URL}/auth/signout`}>
                  <input type='hidden' name='csrfToken' value={csrfToken} />
                  <button className='button'>Sign out</button>
                </form>}
            </>}
          {accessTokenExpiryTime === null &&
            <>
              <p>You are signed out.</p>
              <form method='GET' action={`${API_BASE_URL}/auth/signin`}>
                <button className='button'>Sign in</button>
              </form>
            </>}
        </div>
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