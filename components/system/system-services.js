import { Fragment } from 'react'
import Link from 'next/link'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from 'components/collapsible-trigger'
import StationIcon from 'components/station-icon'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import CopyOnClick from 'components/copy-on-click'

const SERVICE_STATION_TYPES = [
  'Coriolis',
  'Ocellus',
  'Orbis',
  'AsteroidBase',
  'Outpost',
  'MegaShip',
  'StrongholdCarrier',
  'CraterPort',
  'CraterOutpost'
]

module.exports = ({ system, nearestServices }) => {
  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2>Nearest Services</h2>
      </div>
      {nearestServices === undefined &&
        <p className='loading-bar' style={{ position: 'relative', top: '-.25rem', height: '1.75rem' }} />}
      {nearestServices &&
        <div className='fx__fade-in'>
          <p>Station services in <CopyOnClick>{system.systemName}</CopyOnClick> and nearest populated systems</p>
          <div className='rc-table data-table data-table--striped data-table--interactive data-table--animated'>
            <div className='rc-table-container'>
              <table>
                <tbody className='rc-table-tbody'>
                  {Object.keys(nearestServices).map(service =>
                    <Fragment key={`nearest_service_${service}`}>
                      <tr><th className='text-left'>{service}</th></tr>
                      <tr>
                        <td style={{ paddingBottom: '1rem', paddingTop: 0 }}>
                          {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType))?.filter(s => s.distance === 0)?.length === 0 &&
                            <p>
                              <small><i className='icon icarus-terminal-warning' style={{ position: 'relative', top: '.25rem' }} />No known {service} in system</small>
                            </p>}
                          {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType))?.filter(s => s.distance === 0)?.length > 0 &&
                            <Collapsible
                              open
                              trigger={<p className='muted text-uppercase' style={{ display: 'block', margin: '.5rem 0 0 0' }}><CollapsibleTrigger><span style={{ fontSize: '.8rem' }}>Stations in system</span></CollapsibleTrigger></p>}
                              triggerWhenOpen={<p className='muted text-uppercase' style={{ display: 'block', margin: '.5rem 0 0 0' }}><CollapsibleTrigger open><span style={{ fontSize: '.8rem' }}>Stations in system</span></CollapsibleTrigger></p>}
                            >
                              {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType))?.filter(s => s.distance === 0)?.map(station =>
                                <Fragment key={`in_system_service_${service}_${station.marketId}`}>
                                  <p style={{ padding: '.25rem .25rem 0 .25rem', marginBottom: '.25rem', display: 'inline-block' }}>
                                    <StationIcon station={station}>
                                      <CopyOnClick>{station.stationName}</CopyOnClick>
                                      <small className='text-no-transform'> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>
                                      <br />{station.updatedAt && <small>{timeBetweenTimestamps(station.updatedAt)} ago</small>}
                                    </StationIcon>
                                  </p>
                                </Fragment>)}
                            </Collapsible>}

                          {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType)).filter(s => s.distance > 0)?.length > 0 &&
                            <Collapsible
                              open
                              trigger={<p className='muted text-uppercase' style={{ display: 'block', margin: '.5rem 0 0 0' }}><CollapsibleTrigger><span style={{ fontSize: '.8rem' }}>Next nearest stations</span></CollapsibleTrigger></p>}
                              triggerWhenOpen={<p className='muted text-uppercase' style={{ display: 'block', margin: '.5rem 0 0 0' }}><CollapsibleTrigger open><span style={{ fontSize: '.8rem' }}>Next nearest stations</span></CollapsibleTrigger></p>}
                            >
                              {nearestServices[service]?.filter(s => SERVICE_STATION_TYPES.includes(s.stationType))?.filter(s => s.distance > 0)?.splice(0, 5)?.map(station =>
                                <Fragment key={`nearest_service_${service}_${station.marketId}`}>
                                  <p style={{ padding: '.25rem .25rem 0 .25rem', marginBottom: '.25rem', display: 'inline-block' }}>
                                    <StationIcon station={station}>
                                      <CopyOnClick>{station.stationName}</CopyOnClick>
                                      <br />
                                      <Link style={{ fontSize: '.9rem' }} href={`/system/${station.systemAddress}`}>{station.systemName}</Link>
                                      <small className='text-no-transform'> {station.distance.toLocaleString()} ly</small>
                                      <br />{station.updatedAt && <small>{timeBetweenTimestamps(station.updatedAt)} ago</small>}
                                    </StationIcon>
                                  </p>
                                </Fragment>)}
                            </Collapsible>}

                          {nearestServices[service]?.filter(s => s.stationType === 'FleetCarrier')?.length > 0 &&
                            <Collapsible
                              trigger={<p className='muted text-uppercase' style={{ display: 'block', margin: '.5rem 0 0 0' }}><CollapsibleTrigger><span style={{ fontSize: '.8rem' }}>Nearest Fleet Carriers</span></CollapsibleTrigger></p>}
                              triggerWhenOpen={<p className='muted text-uppercase' style={{ display: 'block', margin: '.5rem 0 0 0' }}><CollapsibleTrigger open><span style={{ fontSize: '.8rem' }}>Nearest Fleet Carriers</span></CollapsibleTrigger></p>}
                            >
                              {nearestServices[service]?.filter(s => s.stationType === 'FleetCarrier')?.sort((a, b) => b?.updatedAt?.localeCompare(a?.updatedAt))?.splice(0, 5)?.map(station =>
                                <Fragment key={`nearest_service_${service}_${station.marketId}`}>
                                  <p style={{ padding: '.25rem .25rem 0 .25rem', marginBottom: '.25rem', display: 'inline-block' }}>
                                    <StationIcon station={station}>
                                      <CopyOnClick>{station.stationName}</CopyOnClick>
                                      <br />
                                      <Link style={{ fontSize: '.9rem' }} href={`/system/${station.systemAddress}`}>{station.systemName}</Link>
                                      <small className='text-no-transform'> {station.distance.toLocaleString()} ly</small>
                                      <br />{station.updatedAt && <small>{timeBetweenTimestamps(station.updatedAt)} ago</small>}
                                    </StationIcon>
                                  </p>
                                </Fragment>)}
                            </Collapsible>}
                        </td>
                      </tr>
                    </Fragment>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>}
    </div>
  )
}
