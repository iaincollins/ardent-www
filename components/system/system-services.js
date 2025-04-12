import { Fragment } from 'react'
import Link from 'next/link'
import StationIcon from 'components/station-icon'
import { timeBetweenTimestamps } from 'lib/utils/dates'

module.exports = ({ systemName, nearestServices }) => {
  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2>Nearest Services</h2>
      </div>
      {nearestServices &&
        <div className='fx__fade-in'>
          <p className='muted'>Station services in and nearest to {systemName}</p>
          <div className='rc-table data-table data-table--striped data-table--interactive data-table--animated'>
            <div className='rc-table-container'>
              <table>
                <tbody className='rc-table-tbody'>
                  {Object.keys(nearestServices).map(service =>
                    <Fragment key={`nearest_service_${service}`}>
                      <tr><th className='text-left'>{service}</th></tr>
                      <tr>
                        <td style={{ paddingBottom: '1rem', paddingTop: 0, background: 'rgba(0,0,0,.25)' }}>
                          {nearestServices[service]?.filter(s => s.stationType !== 'FleetCarrier')?.filter(s => s.distance === 0)?.length > 0 &&
                            <small style={{ display: 'block', marginTop: '.5rem' }}>In system</small>}
                          {nearestServices[service]?.filter(s => s.stationType !== 'FleetCarrier')?.filter(s => s.distance === 0)?.map(station =>
                            <Fragment key={`in_system_service_${service}_${station}`}>
                              <p style={{ margin: '.5rem 0 0 0' }}>
                                <StationIcon station={station}>
                                  {station.stationName}
                                  {station.bodyName ? <><br /><span className='muted' style={{ fontSize: '.9rem' }}>{station.bodyName}</span></> : ''}
                                  <small className='text-no-transform'> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>
                                </StationIcon>
                              </p>
                            </Fragment>)}
                          {nearestServices[service]?.filter(s => s.stationType !== 'FleetCarrier').filter(s => s.distance > 0)?.length > 0 &&
                            <small style={{ display: 'block', marginTop: '.5rem' }}>Nearest systems</small>}
                          {nearestServices[service]?.filter(s => s.stationType !== 'FleetCarrier')?.filter(s => s.distance > 0)?.splice(0, 3)?.map(station =>
                            <Fragment key={`nearest_service_${service}_${station}`}>
                              <p style={{ margin: '.5rem 0 0 0' }}>
                                <StationIcon station={station}>
                                  {station.stationName}
                                  <br />
                                  <Link className='muted' style={{ fontSize: '.9rem' }} href={`/system/${station.systemName.replaceAll(' ', '_')}`}>{station.bodyName ? station.bodyName : station.systemName}</Link>
                                  <small className='text-no-transform'> {station.distance.toLocaleString()} ly</small>
                                </StationIcon>
                              </p>
                            </Fragment>)}
                          {nearestServices[service]?.filter(s => s.stationType === 'FleetCarrier')?.length > 0 &&
                            <small style={{ display: 'block', marginTop: '.5rem' }}>Nearest Carriers</small>}
                          {nearestServices[service]?.filter(s => s.stationType === 'FleetCarrier')?.splice(0, 3)?.map(station =>
                            <Fragment key={`nearest_service_${service}_${station}`}>
                              <p style={{ margin: '.5rem 0 0 0' }}>
                                <StationIcon station={station}>
                                  {station.stationName}
                                  <br />
                                  <Link className='muted' style={{ fontSize: '.9rem' }} href={`/system/${station.systemName.replaceAll(' ', '_')}`}>{station.bodyName ? station.bodyName : station.systemName}</Link>
                                  {station.distance > 0
                                    ? <small className='text-no-transform'> {station.distance.toLocaleString()} ly</small>
                                    : <small className='text-no-transform'> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                                    <br/>{station.updatedAt && <small>{timeBetweenTimestamps(station.updatedAt)} ago</small>}
                                </StationIcon>
                              </p>
                            </Fragment>)}
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
