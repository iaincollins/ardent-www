import { useEffect, useContext, useState } from 'react'
import Head from 'next/head'
import Table from 'rc-table'
import Layout from 'components/layout'
import { NavigationContext } from 'lib/context'
import { loadCache, saveCache } from 'lib/cache'
import { getCmdrInfo } from 'lib/cmdr'

export default () => {
  const [, setNavigationPath] = useContext(NavigationContext)
  const [cmdrFleetCarrier, setCmdrFleetCarrier] = useState()
  const [fleetCarrierCargo, setFleetCarrierCargo] = useState([])

  const updateFleetCarrier = async () => {
    const _cmdrFleetCarrier = await getCmdrInfo('fleetcarrier')
    setCmdrFleetCarrier(_cmdrFleetCarrier)
    saveCache('cmdrFleetCarrier', _cmdrFleetCarrier)

    const _cargo = {}
    _cmdrFleetCarrier?.cargo?.forEach(item => {
      if (!_cargo[item.locName]) {
        _cargo[item.locName] = item.qty
      } else {
        _cargo[item.locName] + item.qty
      }
    })
    setFleetCarrierCargo(Object.entries(_cargo).map(([key, value]) => { return { commodityName: key, quantity: value } }))
  }
  useEffect(() => {
    setNavigationPath([{ name: 'Fleet Carrier', path: '/fleetcarrier' }])
    setCmdrFleetCarrier(loadCache('cmdrFleetCarrier'))
    updateFleetCarrier()
  }, [])

  return (
    <Layout
      title='Ardent Insight'
      description='Ardent Insight is companion software for the game Elite Dangerous'
      navigation={
        [
          {
            name: 'About Carrier',
            icon: 'icarus-terminal-fleet-carrier',
            url: '/fleetcarrier'
          },
          {
            name: 'Cargo',
            icon: 'icarus-terminal-cargo',
            url: '/fleetcarrier/cargo',
            active: true
          }
        ]
      }
    >
      <Head>
        <link rel='canonical' href='https://ardent-insight.com/about' />
      </Head>
      <div className='fx__fade-in' onClick={updateFleetCarrier}>
        <div className='heading--with-underline'>
          <h2 className='text-uppercase'>Fleet carrier cargo</h2>
        </div>
        {cmdrFleetCarrier && <Table
          className='data-table data-table--striped data-table--interactive'
          columns={[
            {
              title: 'Commodities in cargo',
              dataIndex: 'commodityName',
              key: 'commodityName',
              align: 'left',
              render: (v, r) => <>{v}</>
            },
            {
              title: 'Quantity',
              dataIndex: 'quantity',
              key: 'quantity',
              align: 'right',
              width: 100,
              render: (v, r) => <>{v}</>
            }
          ]}
          data={fleetCarrierCargo}
          rowKey={(r) => `fleetCarrier_cargo_${r.commodityName}`}
          emptyText={<span className='muted'>No commodities in cargo hold</span>}
                             />}
      </div>
    </Layout>
  )
}
