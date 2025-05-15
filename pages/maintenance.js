import { useContext, useEffect } from 'react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import Layout from 'components/layout'
import { MaintenanceModeContext, DialogContext } from 'lib/context'

const config = getConfig()

export default () => {
  const router = useRouter()
  const [, setMaintenanceMode] = useContext(MaintenanceModeContext)
  const [, setDialog] = useContext(DialogContext)

  useEffect(() => {
    if (config?.publicRuntimeConfig?.MAINTENANCE_MODE !== 'true') {
      router.push('/')
    }
  }, [])

  if (config?.publicRuntimeConfig?.MAINTENANCE_MODE !== 'true') {
    return
  }

  setMaintenanceMode(true)

  // setDialog({
  //   title: 'System Offline',
  //   contents:
  //     <p>
  //       Ardent Insight is offline for a scheduled upgrade.
  //     </p>,
  //   buttons: [],
  //   visible: true
  // })

  return (
    <Layout maintenance={true} title='System maintenance in progress'>
      <div className='error__text' style={{ left: '3rem' }}>
        <i className='icon icarus-terminal-warning' />
        <span className='text-blink-slow muted'>System maintenance in progress</span>
      </div>
    </Layout>
  )
}
