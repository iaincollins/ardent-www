import { useRouter } from 'next/router'
import { formatSystemSector } from 'lib/utils/system-sectors'
import { timeBetweenTimestamps } from 'lib/utils/dates'

const SYSTEM_MAP_POINT_PLOT_MULTIPLIER = 50

module.exports = ({
  system,
  systemStatus,
  nearbySystems,
  stationsInSystem,
  settlementsInSystem,
  megashipsInSystem,
  fleetCarriersInSystem,
  lastUpdatedAt
}) => {
  const router = useRouter()

  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline' style={{ zIndex: 3}}>
        <h2 className='heading--with-icon'>
          <i className='icon icarus-terminal-system-orbits  ' />
          {system.systemName} system
        </h2>
      </div>
      <div className='system-map__station-info'>
        {stationsInSystem?.filter(s => s.stationType == 'Orbis')?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-orbis-starport' /> {stationsInSystem?.filter(s => s.stationType === 'Orbis')?.length}</p>}
        {stationsInSystem?.filter(s => s.stationType == 'Coriolis')?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-coriolis-starport' /> {stationsInSystem?.filter(s => s.stationType === 'Coriolis')?.length}</p>}
        {stationsInSystem?.filter(s => s.stationType == 'Ocellus')?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-ocellus-starport' /> {stationsInSystem?.filter(s => s.stationType === 'Ocellus')?.length}</p>}
        {stationsInSystem?.filter(s => s.stationType == 'AsteroidBase')?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-asteroid-base' /> {stationsInSystem?.filter(s => s.stationType === 'AsteroidBase')?.length}</p>}
        {stationsInSystem?.filter(s => s.stationType == 'Outpost')?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-outpost' /> {stationsInSystem?.filter(s => s.stationType === 'Outpost')?.length}</p>}
        {stationsInSystem?.filter(s => (s.stationType == 'CraterPort' || s.stationType == 'CraterOutpost'))?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-planetary-port' /> {stationsInSystem?.filter(s => (s.stationType == 'CraterPort' || s.stationType == 'CraterOutpost'))?.length}</p>}
        {settlementsInSystem?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-settlement' /> {settlementsInSystem.length}</p>}
        {megashipsInSystem?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-megaship' /> {megashipsInSystem.length}</p>}
        {fleetCarriersInSystem?.length > 0 &&
          <p className='fx__fade-in'><i className='icon icarus-terminal-fleet-carrier' /> {fleetCarriersInSystem.length}</p>}
        {stationsInSystem !== undefined &&
          <div className='system-map__system-summary'>
            <p>
              <span className='fx__animated-text' data-fx-order='1'>
                {system.tradeZone}
                {system.tradeZoneLocation !== undefined && <small style={{ textTransform: 'none' }}><br />{system.tradeZoneLocation}</small>}
              </span>
              {systemStatus &&
                <span style={{ display: 'block', fontSize: '.9rem', lineHeight: '1.1rem', marginTop: '.5rem' }}>
                  {systemStatus.allegiance && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='1'>Allegiance: {systemStatus.allegiance}</span>}
                  {systemStatus.government && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='2'>Government: {systemStatus.government}</span>}
                  {systemStatus.population && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='2'>Population: {systemStatus.population.toLocaleString()}</span>}
                  {systemStatus.economy.primary &&
                    <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='3'>
                      Economy: {systemStatus.economy.primary}
                      {systemStatus.economy.secondary && <>, {systemStatus.economy.secondary}</>}
                    </span>}
                  {systemStatus.faction && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='3'>Controlled by: {systemStatus.faction}</span>}
                  {systemStatus.security && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='4'>Security: {systemStatus.security}</span>}
                  {/*
                  {systemStatus.state && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='4'>State: {systemStatus.state}</span>}
                  {lastUpdatedAt && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='5'>Last update: {timeBetweenTimestamps(lastUpdatedAt)} ago</span>}
                  */}
                  <span style={{ display: 'block' }} className='fx__animated-text muted' data-fx-order='5'>Telemetry: EDSM</span>
                </span>}
            </p>
          </div>
        }
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
      <div className='system-map__info'>
        <div className='system-map__location'>
          <table className='properties-table'>
            <tbody>
              <tr>
                <th>Address</th>
                <td><span className='fx__animated-text' data-fx-order='3'>{system.systemAddress}</span></td>
              </tr>
              <tr>
                <th>Location</th>
                <td><span className='fx__animated-text' data-fx-order='4'>{system.systemX}, {system.systemY}, {system.systemZ}</span></td>
              </tr>
              <tr>
                <th>Sector</th>
                <td><span className='fx__animated-text' data-fx-order='5'>{formatSystemSector(system.systemSector)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  )
}
