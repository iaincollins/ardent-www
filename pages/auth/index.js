import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const [accessTokenExpires, setAccessTokenExpires] = useState()
  const [csrfToken, setCsrfToken] = useState()

  useEffect(() => {
    (async () => {
      const accessTokenRes = await fetch(`${API_BASE_URL}/auth/token`, { credentials: 'include' })
      setAccessTokenExpires((await accessTokenRes.json())?.expires ?? false)
      const csrfTokenRes = await fetch(`${API_BASE_URL}/auth/csrftoken`, { credentials: 'include' })
      setCsrfToken((await csrfTokenRes.json()).csrfToken)
    })()
  }, [])

  return (
    <Layout >
      <div className='fx__fade-in'>
        <h1>
          {accessTokenExpires && 'Signed in'}
          {accessTokenExpires === false && 'Signed out'}
        </h1>
        <p className='clear'>
          {accessTokenExpires && <>You are signed in. The current access token expires on {accessTokenExpires} but it will auto-refresh.</>}
          {accessTokenExpires === false && 'You are signed out.'}
        </p>
        {accessTokenExpires && csrfToken &&
          <form method='POST' action={`${API_BASE_URL}/auth/signout`}>
            <input type='hidden' name='csrfToken' value={csrfToken} />
            <button className='button'>Sign out</button>
          </form>}
        {accessTokenExpires === false &&
          <form method='GET' action={`${API_BASE_URL}/auth/signin`}>
            <button className='button'>Sign in</button>
          </form>}
      </div>
    </Layout>
  )
}
