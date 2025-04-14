import { Fragment } from 'react'
import { useRouter } from 'next/router'
import { formatSystemSector } from 'lib/utils/system-sectors'
import StationIcon from 'components/station-icon'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from 'components/collapsible-trigger'
import { timeBetweenTimestamps } from 'lib/utils/dates'

const SYSTEM_MAP_POINT_PLOT_MULTIPLIER = 50

module.exports = ({
  system,
  nearbySystems,
  stationsInSystem,
  settlementsInSystem,
  megashipsInSystem,
  fleetCarriersInSystem,
  importOrders,
  exportOrders,
  lastUpdatedAt
}) => {
  const router = useRouter()

  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2 className='heading--with-icon'>
          <i className='icon icarus-terminal-system-orbits  ' />
          {system.systemName} system
        </h2>
      </div>
      <div className='system-map'>
        <div className='system-map__point system-map__point--highlighted' style={{ top: '50%', left: '50%' }} data-name={system.systemName} />
        {nearbySystems && nearbySystems.map((nearbySystem, i) =>
          <div
            key={nearbySystem.systemAddress} className='system-map__point'
            onClick={() => router.push(`/system/${nearbySystem.systemName.replaceAll(' ', '_')}`)}
            data-name={nearbySystem.systemName}
            style={{
              animationDelay: `${i * 10}ms`,
              top: nearbySystem.systemZ > system.systemZ ? `calc(50% + ${(nearbySystem.systemZ - system.systemZ) * SYSTEM_MAP_POINT_PLOT_MULTIPLIER}px)` : `calc(50% - ${(system.systemZ - nearbySystem.systemZ) * SYSTEM_MAP_POINT_PLOT_MULTIPLIER}px)`, // Z
              left: nearbySystem.systemX > system.systemX ? `calc(50% + ${(nearbySystem.systemX - system.systemX) * SYSTEM_MAP_POINT_PLOT_MULTIPLIER}px)` : `calc(50% - ${(system.systemX - nearbySystem.systemX) * SYSTEM_MAP_POINT_PLOT_MULTIPLIER}px)`// X
            }}
          />
        )}
      </div>
      <table className='system-map__info properties-table' style={{ marginBottom: 0 }}>
        <tbody>
          <tr>
            <th>Address</th>
            <td><span className='fx__animated-text' data-fx-order='1'>{system.systemAddress}</span></td>
          </tr>
          <tr>
            <th>Location</th>
            <td><span className='fx__animated-text' data-fx-order='2'>{system.systemX}, {system.systemY}, {system.systemZ}</span></td>
          </tr>
          <tr>
            <th>Ardent sector</th>
            <td><span className='fx__animated-text' data-fx-order='3'>{formatSystemSector(system.systemSector)}</span></td>
          </tr>
          <tr>
            <th>Trade zone</th>
            <td>
              <span className='fx__animated-text' data-fx-order='4'>
                {system.tradeZone}
                {system.tradeZoneLocation !== undefined && <small style={{ textTransform: 'none' }}><br />{system.tradeZoneLocation}</small>}
              </span>
            </td>
          </tr>
          <tr>
            <th className='is-hidden-mobile'>Stations/Ports</th>
            <td className={stationsInSystem?.length === 0 ? 'is-hidden-mobile' : ''}>
              {stationsInSystem?.length > 0 &&
                <span className='fx__fade-in'>
                  <Collapsible
                    trigger={<CollapsibleTrigger>{stationsInSystem.length} {stationsInSystem.length === 1 ? 'station/port' : 'stations/ports'}</CollapsibleTrigger>}
                    triggerWhenOpen={<CollapsibleTrigger open>{stationsInSystem.length} {stationsInSystem.length === 1 ? 'station/port' : 'stations/ports'}</CollapsibleTrigger>}
                  >
                    {stationsInSystem.map(station =>
                      <Fragment key={`marketId_${station.marketId}`}>
                        <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }}>
                          <div className='system__entity-name'>
                            <StationIcon station={station}>{station.stationName}</StationIcon>
                          </div>
                          <div className='system__entity-information'>
                            {station.distanceToArrival !== null && <small className='text-no-transform'> {Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                          </div>
                        </div>
                      </Fragment>
                    )}
                  </Collapsible>
                </span>}
              {stationsInSystem?.length === 0 && <span className='muted-2'>No Stations/Ports</span>}
              {stationsInSystem === undefined && <span className='muted'>...</span>}
            </td>
          </tr>
          <tr>
            <th className='is-hidden-mobile'>Settlements</th>
            <td className={settlementsInSystem?.length === 0 ? 'is-hidden-mobile' : ''}>
              {settlementsInSystem?.length > 0 &&
                <span className='fx__fade-in'>
                  <Collapsible
                    trigger={<CollapsibleTrigger>{settlementsInSystem.length} {settlementsInSystem.length === 1 ? 'settlement' : 'settlements'}</CollapsibleTrigger>}
                    triggerWhenOpen={<CollapsibleTrigger open>{settlementsInSystem.length} {settlementsInSystem.length === 1 ? 'settlement' : 'settlements'}</CollapsibleTrigger>}
                  >
                    {settlementsInSystem.map(station =>
                      <Fragment key={`marketId_${station.marketId}`}>
                        <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }}>
                          <div className='system__entity-name'>
                            <StationIcon station={station}>{station.stationName}</StationIcon>
                          </div>
                          <div className='system__entity-information'>
                            {station.distanceToArrival !== null && <small className='text-no-transform'>{Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                            {station.bodyName && station.distanceToArrival !== null && <small>, </small>}
                            {station.bodyName &&
                              <small>
                                <i className='icon icarus-terminal-planet' style={{ position: 'relative', top: '-.1rem', margin: 0 }} />
                                {station.bodyName.replace(new RegExp(`^${system.systemName}`), '')}
                              </small>}
                          </div>
                        </div>
                      </Fragment>
                    )}
                  </Collapsible>
                </span>}
              {settlementsInSystem?.length === 0 && <span className='muted-2'>No Settlements</span>}
              {settlementsInSystem === undefined && <span className='muted'>...</span>}
            </td>
          </tr>
          <tr>
            <th className='is-hidden-mobile'>Megaships</th>
            <td className={megashipsInSystem?.length === 0 ? 'is-hidden-mobile' : ''}>
              {megashipsInSystem?.length > 0 &&
                <span className='fx__fade-in'>
                  <Collapsible
                    trigger={<CollapsibleTrigger>{megashipsInSystem.length} {megashipsInSystem.length === 1 ? 'megaship' : 'megaships'}</CollapsibleTrigger>}
                    triggerWhenOpen={<CollapsibleTrigger open>{megashipsInSystem.length} {megashipsInSystem.length === 1 ? 'megaship' : 'megaships'}</CollapsibleTrigger>}
                  >
                    {megashipsInSystem.map(station =>
                      <Fragment key={`marketId_${station.marketId}`}>
                        <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }}>
                          <div className='system__entity-name'>
                            <StationIcon station={station}>{station.stationName}</StationIcon>
                          </div>
                          <div className='system__entity-information'>
                            {station.distanceToArrival !== null && <small className='text-no-transform'>{Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                            {station.updatedAt && <small><span className='muted'>, </span>{timeBetweenTimestamps(station.updatedAt)} ago</small>}
                          </div>
                        </div>
                      </Fragment>
                    )}
                  </Collapsible>
                </span>}
              {megashipsInSystem?.length === 0 && <span className='muted-2'>No Megaships</span>}
              {megashipsInSystem === undefined && <span className='muted'>...</span>}
            </td>
          </tr>
          <tr>
            <th className='is-hidden-mobile'>Fleet Carriers</th>
            <td className={fleetCarriersInSystem?.length === 0 ? 'is-hidden-mobile' : ''}>
              {fleetCarriersInSystem?.length > 0 &&
                <span className='fx__fade-in'>
                  <Collapsible
                    trigger={<CollapsibleTrigger>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'Fleet carrier' : 'Fleet carriers'}</CollapsibleTrigger>}
                    triggerWhenOpen={<CollapsibleTrigger open>{fleetCarriersInSystem.length} {fleetCarriersInSystem.length === 1 ? 'Fleet carrier' : 'Fleet carriers'}</CollapsibleTrigger>}
                  >
                    {fleetCarriersInSystem.map(station =>
                      <Fragment key={`marketId_${station.marketId}`}>
                        <div style={{ margin: '.4rem 0 .1rem 0', paddingLeft: '.8rem' }}>
                          <div className='system__entity-name'>
                            <StationIcon station={station}>{station.stationName}</StationIcon>
                          </div>
                          <div className='system__entity-information'>
                            {station.distanceToArrival !== null && <small className='text-no-transform'>{Math.round(station.distanceToArrival).toLocaleString()} Ls</small>}
                            {station.updatedAt && <small><span className='muted'>, </span>{timeBetweenTimestamps(station.updatedAt)} ago</small>}
                          </div>
                        </div>
                      </Fragment>
                    )}
                  </Collapsible>
                </span>}
              {fleetCarriersInSystem?.length === 0 && <span className='muted-2'>No Fleet Carriers</span>}
              {fleetCarriersInSystem === undefined && <span className='muted'>...</span>}
            </td>
          </tr>
          <tr>
            <th>Last update</th>
            <td>
              {(system !== undefined && importOrders !== undefined && exportOrders !== undefined)
                ? `${timeBetweenTimestamps(lastUpdatedAt)} ago`
                : <span className='muted'>...</span>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  )
}
