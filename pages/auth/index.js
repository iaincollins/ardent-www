import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const [accessTokenExpiryTime, setAccessTokenExpiryTime] = useState()
  const [csrfToken, setCsrfToken] = useState()

  useEffect(() => {
    (async () => {
      const accessTokenRes = await fetch(`${API_BASE_URL}/auth/token`, { credentials: 'include' })
      setAccessTokenExpiryTime((await accessTokenRes.json())?.expires ?? null)
      const csrfTokenRes = await fetch(`${API_BASE_URL}/auth/csrftoken`, { credentials: 'include' })
      setCsrfToken((await csrfTokenRes.json()).csrfToken)
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
          {accessTokenExpiryTime &&
            <>
              <p>You are signed in.</p>
              <p>Your current access token from Frontier expires on {new Date(accessTokenExpiryTime).toLocaleString()} but it will auto-refresh.</p>
              <p>You will not need to approve access again until after you have been signed in for 25 days.</p>
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
