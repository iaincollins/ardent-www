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
        console.error(e)
      }
    })()
      ; (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/v1/version`)
          const version = await res.json()
          setVersion(version)
        } catch (e) {
          console.error(e)
        }
      })()
  }, [])

  return (
    <>
      <p>
        ArdentOS v{Package.version}
        <span className='muted'>{' | '}</span>
        <a href='https://github.com/iaincollins/ardent-api' rel='noreferrer' target='_blank'>API v{version?.version ?? '?.?.?'}</a>
      </p>
      <p>
        Ardent Insight provides open trade data and system information for the game <a href='https://www.elitedangerous.com/' rel='noreferrer' target='_blank'>Elite Dangerous</a>.
      </p>
      <p>
        The data comes from a live player-driven feed from <a href='https://eddn.edcd.io' rel='noreferrer' target='_blank'>EDDN</a>, which is run by <a href='https://edcd.github.io/' rel='noreferrer' target='_blank'>EDCD</a>.
      </p>
      <p>
        Sources used to seed the databases include <a href='https://edsm.net' rel='noreferrer' target='_blank'>ESDM</a>,
        {' '}<a href='https://spansh.co.uk' rel='noreferrer' target='_blank'>Spansh</a>,
        {' '}<a href='https://github.com/EDCD/EDDN' rel='noreferrer' target='_blank'>EDDN</a> and EDDB.io (now offline).
      </p>
      <p>
        Source code and data are <Link href='/downloads' onClick={() => toggle && toggle(false)}>available for download</Link>.
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
        This software is not endorsed by nor reflects the views or opinions of
        Frontier Developments and no employee of Frontier Developments was
        involved in the making of it.
      </p>
    </>
  )
}
