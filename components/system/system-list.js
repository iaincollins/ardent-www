import { useState, useEffect, Fragment } from 'react'
import StationIcon from 'components/station-icon'
import SystemObjectIcon from 'components/system-object-icon'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import { parseBodiesAndStations } from 'lib/utils/sytem-map-utils'
import { kelvinToCelius, kelvinToFahrenheit } from 'lib/utils/temperature'
import CopyOnClick from 'components/copy-on-click'

const SOL_RADIUS_IN_KM = 696340

const SURFACE_PORT_TYPES = [
  'CraterOutpost',
  'CraterPort'
]

const SURFACE_STATION_TYPES = [
  'CraterOutpost',
  'CraterPort',
  'OnFootSettlement'
]

module.exports = ({
  system,
  bodiesInSystem,
  stationsInSystem,
  setInspector
}) => {
  const [objectsInSystem, setObjectsInSystem] = useState()
  const [selectedObject, setSelectedObject] = useState()

  useEffect(() => {
    if (bodiesInSystem !== undefined && stationsInSystem !== undefined) {
      const _objectsInSystem = parseBodiesAndStations(bodiesInSystem, stationsInSystem, system)
      setObjectsInSystem(_objectsInSystem)
    }
  }, [bodiesInSystem, stationsInSystem])

  const onRowClickHandler = (e) => {
    const systemObject = JSON.parse(e.currentTarget.dataset.systemObject)
    const systemObjectId = systemObject.marketId ? `MarketId-${systemObject.marketId}` : `BodyId-${systemObject.bodyId}`
    if (systemObjectId === selectedObject) {
      setSelectedObject(undefined)
      setInspector(undefined)
    } else {
      setSelectedObject(systemObjectId)
      setInspector(<Inspector systemObject={systemObject} />)
    }
  }

  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2 className='heading--with-icon'>
          <i className='icon icarus-terminal-system-orbits' />
          <span className='text-no-transform'><CopyOnClick>{system.systemName}</CopyOnClick></span>
        </h2>
      </div>
      <div className='rc-table data-table data-table--interactive data-table--striped data-table--sticky-heading data-table--animated'>
        <div className='rc-table-container'>
          <div className='rc-table-content'>
            <table>
              <colgroup>
                <col />
                <col style={{ width: '8rem' }} />
                <col style={{ width: '8rem' }} />
              </colgroup>
              <thead className='rc-table-thead'>
                <tr>
                  <th className='max-width-mobile' style={{ textAlign: 'left' }}>Location</th>
                  <th className='is-hidden-mobile' style={{ textAlign: 'right' }}>Updated</th>
                  <th className='is-hidden-mobile' style={{ textAlign: 'right' }}>Distance</th>
                </tr>
              </thead>
              <tbody className='rc-table-tbody'>
                {objectsInSystem === undefined &&
                  <tr>
                    <td colSpan={3} style={{ padding: 0 }}>
                      <div className='loading-bar' style={{ margin: 0 }} />
                    </td>
                  </tr>}
                {objectsInSystem !== undefined && objectsInSystem?.length === 0 &&
                  <tr>
                    <td colSpan={3} className='text-uppercase muted'>
                      No location data
                    </td>
                  </tr>}
                <SystemObjects objects={objectsInSystem} onRowClickHandler={onRowClickHandler} selectedObject={selectedObject} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className='text-center' style={{ marginBottom: 0 }}>
        <small className='text-center'>Station orbital locations approximate based on latest telemetry</small>
      </p>
    </div>
  )
}

function SystemObjects ({ objects, depth = 0, onRowClickHandler = () => { }, selectedObject }) {
  return objects?.map((systemObject, i) => {
    const systemObjectId = systemObject.marketId ? `MarketId-${systemObject.marketId}` : `BodyId-${systemObject.bodyId}`
    return (
      <Fragment key={`object-in-system-row-${depth}-${i}-${systemObject?.stationType ?? systemObject?.bodyType}-${systemObject?.stationName ?? systemObject?.bodyName}`}>
        <tr onClick={onRowClickHandler} className={`rc-table-row rc-table-row-level-0 data-table__row--visible ${systemObjectId === selectedObject ? 'data-table__row--selected' : ''}`} data-system-object={JSON.stringify(systemObject)}>
          <td className='max-width-mobile' style={{ paddingLeft: '.25rem' }}>
            <div style={{ display: 'inline-block', paddingLeft: `${depth}rem` }}>
              {systemObject?.bodyType === 'Null' && <>✕— </>}
              {(systemObject?.bodyType === 'Planet' || systemObject?.bodyType === 'Star') &&
                <SystemObjectIcon systemObject={systemObject}>
                  {systemObject.bodyName}
                  {systemObject?.distanceToArrival !== undefined &&
                    <small className='is-visible-mobile text-no-transform'>
                      {' '}{Math.round(systemObject?.distanceToArrival).toLocaleString()} Ls
                    </small>}
                  {systemObject?.subType !== undefined && systemObject?.subType !== null &&
                    <small><br />{systemObject.subType}</small>}
                  {systemObject?.updatedAt !== undefined &&
                    <small className='is-visible-mobile'>
                      <br />{timeBetweenTimestamps(systemObject.updatedAt)} ago
                    </small>}
                </SystemObjectIcon>}
              {systemObject?.stationType !== undefined &&
                <StationIcon station={systemObject}>
                  {systemObject.stationName}
                  {systemObject?.distanceToArrival !== undefined &&
                    <small className='is-visible-mobile text-no-transform'>
                      {' '}{Math.round(systemObject?.distanceToArrival).toLocaleString()} Ls
                    </small>}
                  <small>
                    <br />
                    {systemObject?.primaryEconomy !== undefined && systemObject?.primaryEconomy !== null &&
                      <>
                        {systemObject.primaryEconomy}
                        {systemObject?.secondaryEconomy !== undefined && systemObject?.secondaryEconomy !== null && systemObject?.secondaryEconomy !== systemObject?.primaryEconomy &&
                          <> &amp; {systemObject.secondaryEconomy}</>}
                      </>}
                    {systemObject?.stationType === 'FleetCarrier' && 'Fleet Carrier'}
                  </small>
                  {systemObject?.updatedAt !== undefined &&
                    <small className='is-visible-mobile'>
                      <br />{timeBetweenTimestamps(systemObject.updatedAt)} ago
                    </small>}
                </StationIcon>}
            </div>
          </td>
          <td style={{ textAlign: 'right', fontSize: '0.9rem' }} className='is-hidden-mobile'>
            {systemObject?.updatedAt !== undefined && <small>{timeBetweenTimestamps(systemObject.updatedAt)}</small>}
          </td>
          <td style={{ textAlign: 'right' }} className='is-hidden-mobile'>
            {systemObject?.distanceToArrival !== undefined && <>{Math.round(systemObject?.distanceToArrival).toLocaleString()} Ls</>}
          </td>
        </tr>
        {systemObject?.stations?.length > 0 && <SystemObjects objects={systemObject.stations} depth={depth + 1} onRowClickHandler={onRowClickHandler} selectedObject={selectedObject} />}
        {systemObject?.children?.length > 0 && <SystemObjects objects={systemObject.children} depth={depth + 1} onRowClickHandler={onRowClickHandler} selectedObject={selectedObject} />}
      </Fragment>
    )
  })
}

function Inspector ({ systemObject }) {
  const surfacePorts = []
  const settlements = []
  const orbitals = []
  systemObject?.stations?.forEach(station => {
    if (SURFACE_STATION_TYPES.includes(station.stationType)) {
      SURFACE_PORT_TYPES.includes(station.stationType) ? surfacePorts.push(station) : settlements.push(station)
    } else {
      orbitals.push(station)
    }
  })

  const services = []
  if (systemObject?.blackMarket === 1) services.push('Black market')
  if (systemObject?.crewLounge === 1) services.push('Crew lounge')
  if (systemObject?.materialTrader === 1) services.push('Marterial trader')
  if (systemObject?.missions === 1) services.push('Missions')
  if (systemObject?.outfitting === 1) services.push('Outfitting')
  if (systemObject?.refuel === 1) services.push('Refuel')
  if (systemObject?.repair === 1) services.push('Repair')
  if (systemObject?.restock === 1) services.push('Restock')
  if (systemObject?.searchAndRescue === 1) services.push('Search & Rescue')
  if (systemObject?.shipyard === 1) services.push('Shipyard')
  if (systemObject?.technologyBroker === 1) services.push('Technology broker')
  if (systemObject?.tuning === 1) services.push('Tuning')
  if (systemObject?.universalCartographics === 1) services.push('Universal Cartographics')

  // Show exploration only if there is intersting data to show
  let showExploration = false
  if (Object.prototype.hasOwnProperty.call(systemObject, 'mapped')) showExploration = true
  if (systemObject.isLandable) showExploration = true
  if (systemObject.volcanismType !== 'No volcanism') showExploration = true
  if (systemObject?.signals?.biological > 0) showExploration = true
  if (systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && systemObject.terraformingState !== 'Terraformed') showExploration = true

  return (
    <>
      <div className='fx-fade-in'>

        <div className='inspector__heading'>
          {(systemObject?.bodyType === 'Planet' || systemObject?.bodyType === 'Star') &&
            <SystemObjectIcon systemObject={systemObject}>
              <CopyOnClick>{systemObject.bodyName}</CopyOnClick>
              {systemObject?.subType !== undefined && systemObject?.subType !== null &&
                <small><br />{systemObject.subType}</small>}
            </SystemObjectIcon>}
          {systemObject?.stationType !== undefined &&
            <StationIcon station={systemObject}>
              <CopyOnClick>{systemObject.stationName}</CopyOnClick>
              <small>
                <br />
                {systemObject?.primaryEconomy !== undefined && systemObject?.primaryEconomy !== null &&
                  <>
                    {systemObject.primaryEconomy}
                    {systemObject?.secondaryEconomy !== undefined && systemObject?.secondaryEconomy !== null && systemObject?.secondaryEconomy !== systemObject?.primaryEconomy &&
                      <> &amp; {systemObject.secondaryEconomy}</>}
                    {' economy'}
                  </>}
                {systemObject?.stationType === 'FleetCarrier' && 'Fleet Carrier'}
              </small>
            </StationIcon>}
        </div>

        {systemObject?.updatedAt !== undefined &&
          <p className='text-center text-muted'>

            Last updated {timeBetweenTimestamps(systemObject.updatedAt)} ago

          </p>}

        {systemObject.distanceToArrival !== undefined &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Location</h3>
            </div>
            <p><span className='text-muted'>Distance from arrival</span><br />{systemObject?.distanceToArrival?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 0} Ls</p>
            {SURFACE_STATION_TYPES.includes(systemObject?.stationType) && systemObject.bodyName &&
              <p className='text-link text-no-wrap'>
                <span className='text-muted'>Planet</span><br />
                <i className='icon icarus-terminal-planet' /> <span className='text-link-text text-no-wrap'>{systemObject.bodyName}</span>
              </p>}
          </div>}

        {systemObject?.bodyType === 'Star' &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Stellar properties</h3>
            </div>
            <p>
              {systemObject.isScoopable ? <div>Main sequence (scoopable)</div> : <div className='text-muted'>Not scoopable</div>}
              {systemObject.spectralClass && <span>Spectral class {systemObject.spectralClass}, </span>}
              Luminosity {systemObject.luminosity}
            </p>
            {systemObject.solarRadius && <p><span className='text-muted'>Radius</span><br />{(systemObject.solarRadius * SOL_RADIUS_IN_KM).toLocaleString(undefined, { maximumFractionDigits: 0 })} Km</p>}
            <p><span className='text-muted'>Solar masses</span><br />{systemObject.solarMasses.toFixed(2)}</p>
            <p><span className='text-muted'>Temperature</span><br />{systemObject.surfaceTemperature} K</p>
          </div>}

        {systemObject?.bodyType === 'Planet' &&
          <>
            <div className='inspector__section'>
              <div className='heading--with-underline'>
                <h3>Environment</h3>
              </div>

              {showExploration === true &&
                <>
                  {Object.prototype.hasOwnProperty.call(systemObject, 'mapped') &&
                    <>
                      {systemObject.mapped === true
                        ? (
                          <p className='text-muted'><i className='system-object-icon icarus-terminal-scan' />Surface scanned</p>
                          )
                        : (
                          <p><i className='system-object-icon icarus-terminal-scan' />Surface scan required</p>
                          )}
                    </>}
                  {systemObject.isLandable ? <p><i className='system-object-icon icarus-terminal-planet-lander' /> Landable surface</p> : null}
                  {systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && systemObject.terraformingState !== 'Terraformed' &&
                    <p><i className='system-object-icon icarus-terminal-planet-terraformable' />Terraformable</p>}
                  {systemObject.volcanismType !== 'No volcanism' ? <p className='text-no-wrap'><i className='system-object-icon icarus-terminal-planet-volcanic' />{systemObject.volcanismType}</p> : null}
                  {systemObject?.signals?.biological > 0 && !systemObject?.biologicalGenuses &&
                    <>
                      {systemObject?.signals?.biological === 1 &&
                        <p><i className='system-object-icon icarus-terminal-plant' />{systemObject?.signals?.biological} Biological Signal</p>}
                      {systemObject?.signals?.biological > 1 &&
                        <p><i className='system-object-icon icarus-terminal-plant' />{systemObject?.signals?.biological} Biological Signals</p>}
                    </>}
                  {systemObject.biologicalGenuses &&
                    <>
                      {systemObject.biologicalGenuses.map(genus =>
                        <p key={`${systemObject.id}_bio-signal_${genus}`}><i className='system-object-icon icarus-terminal-plant' />{genus}</p>
                      )}
                    </>}
                </>}

              {systemObject.gravity
                ? (
                  <p><span className='text-muted'>Gravity</span><br />{Math.max(0.01, Number(systemObject.gravity.toFixed(2)))}g
                    {systemObject.gravity < 0.5 && ' (Low)'}
                    {systemObject.gravity > 1.5 && ' (High)'}
                  </p>
                  )
                : ''}
              {systemObject.radius && <p><span className='text-muted'>Radius</span><br />{systemObject.radius.toLocaleString(undefined, { maximumFractionDigits: 0 })} Km</p>}
              {systemObject.surfaceTemperature &&
                <p>
                  <span className='text-muted'>Temperature</span><br />{systemObject.surfaceTemperature}K
                  ({kelvinToCelius(systemObject.surfaceTemperature)}C/{kelvinToFahrenheit(systemObject.surfaceTemperature)}F)
                </p>}
              {((systemObject.atmosphereType && systemObject.atmosphereType !== 'No atmosphere') || systemObject.surfacePressure !== undefined || systemObject.atmosphereComposition !== undefined) &&
                <p>
                  <span className='text-muted'>Atmosphere</span><br />
                  {systemObject.atmosphereType && systemObject.atmosphereType !== 'No atmosphere' ? <div>{systemObject.atmosphereType}</div> : ''}
                  {systemObject.surfacePressure !== undefined ? <div>{parseFloat(systemObject.surfacePressure.toFixed(3))} atm</div> : ''}
                </p>}
              {systemObject.atmosphereComposition !== undefined &&
                <ul>
                  {Object.entries(systemObject.atmosphereComposition).map(e => <li key={`inspector_${systemObject.id}_atmosphere_${e[0]}`}>{e[0]} ({e[1]}%)</li>)}
                </ul>}
            </div>

            {surfacePorts.length > 0 &&
              <div className='inspector__section'>
                <div className='heading--with-underline'>
                  <h3>Ports</h3>
                </div>
                <div>
                  {surfacePorts.map(station => (
                    <p key={`inspector-station-${station.stationName}`} className='text-no-wrap'>
                      <StationIcon station={station}>
                        <CopyOnClick>{station.stationName}</CopyOnClick>
                        <small>
                          <br />
                          {station?.primaryEconomy !== undefined && station?.primaryEconomy !== null &&
                            <>
                              {station.primaryEconomy}
                              {station?.secondaryEconomy !== undefined && station?.secondaryEconomy !== null && station?.secondaryEconomy !== station?.primaryEconomy &&
                                <> &amp; {station.secondaryEconomy}</>}
                            </>}
                          {station?.stationType === 'FleetCarrier' && 'Fleet Carrier'}
                        </small>
                      </StationIcon>
                    </p>
                  ))}
                </div>
              </div>}

            {settlements.length > 0 &&
              <div className='inspector__section'>
                <div className='heading--with-underline'>
                  <h3>Settlements</h3>
                </div>
                <div>
                  {settlements.map(station => (
                    <p key={`inspector-station-${station.stationName}`} className='text-no-wrap'>
                      <StationIcon station={station}>
                        <CopyOnClick>{station.stationName}</CopyOnClick>
                        <small>
                          <br />
                          {station?.primaryEconomy !== undefined && station?.primaryEconomy !== null &&
                            <>
                              {station.primaryEconomy}
                              {station?.secondaryEconomy !== undefined && station?.secondaryEconomy !== null && station?.secondaryEconomy !== station?.primaryEconomy &&
                                <> &amp; {station.secondaryEconomy}</>}
                            </>}
                          {station?.stationType === 'FleetCarrier' && 'Fleet Carrier'}
                        </small>
                      </StationIcon>
                    </p>
                  ))}
                </div>
              </div>}

            {orbitals.length > 0 &&
              <div className='inspector__section'>
                <div className='heading--with-underline'>
                  <h3>In orbit</h3>
                </div>
                <div>
                  {orbitals.map(station => (
                    <p key={`inspector-station-${station.stationName}`} className='text-no-wrap'>
                      <StationIcon station={station}>
                        <CopyOnClick>{station.stationName}</CopyOnClick>
                      </StationIcon>
                    </p>
                  ))}
                </div>
              </div>}

            {systemObject.solidComposition &&
              <div className='inspector__section'>
                <div className='heading--with-underline'>
                  <h3>Material composition</h3>
                </div>
                <ul>
                  {Object.entries(systemObject.solidComposition).map(e => e[1] > 0 ? <li key={`inspector_${systemObject.id}_surface_${e[0]}`}>{e[0]} ({e[1]}%)</li> : '')}
                </ul>
              </div>}

          </>}

        {systemObject.materials &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Chemicals &amp; minerals</h3>
            </div>
            <ul>
              {Object.entries(systemObject.materials).map(e => <li key={`inspector_${systemObject.id}_material_${e[0]}}`}>{e[0]} ({e[1]}%)</li>)}
            </ul>
          </div>}

        {systemObject.rings &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Rings</h3>
            </div>
            {systemObject.reserveLevel && <p>{systemObject.reserveLevel} Reserves</p>}
            <ul>
              {systemObject.rings.map((ring, i) => <li key={`inspector_${systemObject.id}_rings_${i}}`}>{ring.name} ({ring.type})</li>)}
            </ul>
          </div>}

        {systemObject.government &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Controlling faction</h3>
            </div>
            {systemObject?.controllingFaction &&
              <p>
                <i className='system-object-icon icarus-terminal-system-authority' />
                <CopyOnClick>{systemObject.controllingFaction}</CopyOnClick>
              </p>}
            <p className='text-muted'><i className='system-object-icon icarus-terminal-power' />
              {systemObject.allegiance}
              {(systemObject.allegiance || systemObject.government) && ' '}
              {systemObject.government}
            </p>
          </div>}

        {systemObject.economy &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Economy</h3>
            </div>
            <p>
              {systemObject.economy}
            </p>
            {systemObject.secondEconomy && systemObject.secondEconomy !== systemObject.economy &&
              <p>
                {systemObject.secondEconomy}
              </p>}
          </div>}

        {services && services.length > 0 &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Services</h3>
            </div>
            <ul>
              {services.map((service, i) => <li key={`service_${service}_${i}`}>{service}</li>)}
            </ul>
          </div>}

        {Object.prototype.hasOwnProperty.call(systemObject, 'rotationalPeriod') &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Orbital properties</h3>
            </div>
            {systemObject?.rotationalPeriod !== undefined &&
              <p>
                <span className='text-muted'>Rotational period</span>
                <br />{systemObject.rotationalPeriod}
                {systemObject?.rotationalPeriodTidallyLocked && <><br />Tidally locked</>}
              </p>}
            {systemObject?.orbitalEccentricity !== undefined && <p><span className='text-muted'>Orbital eccentricity</span><br />{systemObject.orbitalEccentricity}</p>}
            {systemObject?.orbitalInclination !== undefined && <p><span className='text-muted'>Orbital inclination</span><br />{systemObject.orbitalInclination}</p>}
            {systemObject?.orbitalPeriod !== undefined && <p><span className='text-muted'>Orbital period</span><br />{systemObject.orbitalPeriod}</p>}
            {systemObject?.axialTilt !== undefined && <p><span className='text-muted'>Axial tilt</span><br />{systemObject.axialTilt}</p>}
            {systemObject?.semiMajorAxis !== undefined && <p><span className='text-muted'>Semi-major axis</span><br />{systemObject.semiMajorAxis}</p>}
            {systemObject?.argOfPeriapsis !== undefined && <p><span className='text-muted'>Argument of periapsis</span><br />{systemObject.argOfPeriapsis}</p>}
          </div>}
      </div>
    </>
  )
}
