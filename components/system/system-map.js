import { useRouter } from 'next/router'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import factionStates from 'lib/utils/faction-states'

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
    <div className='fx__fade-in' style={{ position: 'relative' }}>
      <div className='system-map__system-info'>
        <div className='heading--with-underline'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-system-orbits' />
            <span className='text-no-transform'>{system.systemName} System</span>
          </h2>
        </div>
        <div style={{ paddingTop: '.5rem' }}>
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
        </div>

        {stationsInSystem !== undefined && system !== undefined &&
          <div className='system-map__location'>
            <p>
            <small className='fx__animated-text' data-fx-order='1'>
            <span className='muted'>Address</span>  {system.systemAddress}
              </small>
              <br />
              <small className='fx__animated-text' data-fx-order='1'>
                <span className='muted'>Coordinates</span> {system.systemX}, {system.systemY}, {system.systemZ}
              </small>
              <br />
              <small style={{opacity: 1}} className='fx__animated-text' data-fx-order='2'>
              <span className='muted'>Location</span> {system.tradeZone}
              </small>
              {system.tradeZoneLocation !== undefined &&
                <>
                  <br />
                  <small className='fx__animated-text text-no-transform' data-fx-order='3'>
                    {system.tradeZoneLocation}
                  </small>
                </>}
            </p>
          </div>}

        {systemStatus &&
          <div className='system-map__system-status'>

            {systemStatus.faction &&
              <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='4'>
                <i className='icon icarus-terminal-system-authority' />
                {systemStatus.faction}
              </span>}

            {systemStatus.government &&
              <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='5'>
                <i className='icon icarus-terminal-power' />
                {systemStatus.allegiance}
                {(systemStatus.allegiance || systemStatus.government) && ' '}
                {systemStatus.government}
                {(systemStatus.allegiance || systemStatus.government) && ' Government'}
              </span>}

            {systemStatus.economy.primary && systemStatus.economy.primary !== 'None' &&
              <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='6'>
                <i className='icon icarus-terminal-trending-up-chart' />
                {systemStatus.economy.primary}
                {systemStatus.economy.secondary && systemStatus.economy.secondary !== 'None' && <> &amp; {systemStatus.economy.secondary}</>}
                {' '}Economy
              </span>}

            {systemStatus?.population > 0 &&
              <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='7'>
                <i className='icon icarus-terminal-engineer' />
                Population {systemStatus.population.toLocaleString()}
              </span>}

              {systemStatus.security && systemStatus.security !== 'Anarchy' && 
              <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='8'>
                <i className='icon icarus-terminal-shield' />
                {systemStatus.security} Security
              </span>}

            {systemStatus.state && systemStatus.state !== 'None' &&
              <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='9'>
                <i className='icon icarus-terminal-warning' />
                {factionStates?.[systemStatus.state.replaceAll(' ', '').toLowerCase()]?.description !== undefined
                  ? factionStates[systemStatus.state.replaceAll(' ', '').toLowerCase()].description
                  : systemStatus.state
                }
                <small> {timeBetweenTimestamps(lastUpdatedAt)} ago</small>
              </span>}

              <span style={{ display: 'block' }} className='fx__fade-in'>
                <small>Telemetry from EDSM.NET</small>
              </span>

          </div>}

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
    </div>

  )
}
