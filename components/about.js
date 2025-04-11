import { useState, useEffect } from 'react'
import Link from 'next/link'
import Package from 'package.json'

import { API_BASE_URL } from 'lib/consts'

export default ({ toggle }) => {
  const [, setStats] = useState()
  const [version, setVersion] = useState()

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/stats`)
        const stats = await res.json()
        setStats(stats)
      } catch (e) {
        console.log(e)
      }
    })()
    ; (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/version`)
        const version = await res.json()
        setVersion(version)
      } catch (e) {
        console.log(e)
      }
    })()
  }, [])

  return (
    <>
      <p>
        ArdentOS v{Package.version} (<a href={API_BASE_URL} rel='noreferrer' target='_blank' className='muted'>API v{version?.version ?? '?.?.?'}</a>).
      </p>
      <p>
        Open trade data and system intel for <a href='https://www.elitedangerous.com/' rel='noreferrer' target='_blank'>Elite Dangerous</a>.
      </p>
      <p>
        The data feed comes from <a href='https://eddn.edcd.io' rel='noreferrer' target='_blank'>EDDN</a>, which is run by <a href='https://edcd.github.io/' rel='noreferrer' target='_blank'>EDCD</a>.
      </p>
      <p>
        Source code and data <Link href='/downloads' onClick={() => toggle && toggle(false)}>available for download</Link>.
      </p>
      <div className='heading--with-underline'>
        <h2>Legal</h2>
      </div>
      <p className='clear'>
        Source published under GNU Affero General Public License.
      </p>
      <p>
        This site uses <a href='https://github.com/EDCD/FDevIDs' rel='noreferrer' target='_blank'>metadata</a> curated
        by <a href='https://github.com/EDCD' rel='noreferrer' target='_blank'>EDCD</a> and includes text based on
        content from the <a href='https://elite-dangerous.fandom.com' rel='noreferrer' target='_blank'>Elite Dangerous Wiki</a>,
        licensed under <a href='https://www.fandom.com/licensing' rel='noreferrer' target='_blank'>CC BY-SA</a>.
      </p>
      <p>
        Elite Dangerous is copyright Frontier Developments plc.
      </p>
      <p>
        This software is not endorsed by nor reflects the views or opinions of
        Frontier Developments and no employee of Frontier Developments was
        involved in the making of it.
      </p>
    </>
  )
}
