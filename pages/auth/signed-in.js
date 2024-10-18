import { useState, useEffect } from 'react'
import Layout from 'components/layout'
import { API_BASE_URL } from 'lib/consts'

export default () => {
  const [csrfToken, setCsrfToken] = useState()
  const [accessToken, setAccessToken] = useState()

  useEffect(() => {
    (async () => {
      const csrfTokenRes = await fetch(`${API_BASE_URL}/auth/csrftoken`, { credentials: 'include' })
      setCsrfToken((await csrfTokenRes.json()).csrfToken)
      const accessTokenRes = await fetch(`${API_BASE_URL}/auth/token`, { credentials: 'include' })
      setAccessToken((await accessTokenRes.json()))
    })()
  }, [])

  return (
    <Layout >
      <div className='fx__fade-in'>
        <h1>
          Signed in
        </h1>
        <p className='clear'>
          You are signed in.
        </p>
        <pre>{JSON.stringify(accessToken, null, 2)}</pre>
        {csrfToken &&
          <form method='post' action={`${API_BASE_URL}/auth/signout`}>
            <input type='hidden' name='csrfToken' value={csrfToken} />
            <button>Sign out</button>
          </form>}
      </div>
    </Layout>
  )
}
