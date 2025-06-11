import { useState, useEffect, Fragment } from 'react'
import StationIcon from 'components/station-icon'
import SystemObjectIcon from 'components/system-object-icon'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import { parseBodiesAndStations } from 'lib/utils/sytem-map-utils'
import CopyOnClick from 'components/copy-on-click'

module.exports = ({
  system,
  bodiesInSystem,
  stationsInSystem
}) => {
  const [objectsInSystem, setObjectsInSystem] = useState()

  useEffect(() => {
    if (bodiesInSystem !== undefined && stationsInSystem !== undefined) {
      const _objectsInSystem = parseBodiesAndStations(bodiesInSystem, stationsInSystem, system)
      setObjectsInSystem(_objectsInSystem)
    }
  }, [bodiesInSystem, stationsInSystem])

  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2 className='heading--with-icon'>
          <i className='icon icarus-terminal-system-orbits' />
          <span className='text-no-transform'><CopyOnClick>{system.systemName}</CopyOnClick></span>
        </h2>
      </div>
      <div className='rc-table data-table data-table--striped data-table--sticky-heading data-table--animated'>
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
                <SystemObjects objects={objectsInSystem} />
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

function SystemObjects ({ objects, depth = 0 }) {
  return objects?.map((systemObject, i) => {
    return (
      <Fragment key={`object-in-system-row-${depth}-${i}-${systemObject?.stationType ?? systemObject?.bodyType}-${systemObject?.stationName ?? systemObject?.bodyName}`}>
        <tr className='rc-table-row rc-table-row-level-0 data-table__row--visible'>
          <td className='max-width-mobile' style={{ paddingLeft: '.25rem' }}>
            <div style={{ display: 'inline-block', paddingLeft: `${depth}rem` }}>
              {systemObject?.bodyType === 'Null' && <>✕— </>}
              {(systemObject?.bodyType === 'Planet' || systemObject?.bodyType === 'Star') &&
                <SystemObjectIcon systemObject={systemObject}>
                  <CopyOnClick>{systemObject.bodyName}</CopyOnClick>
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
                <>
                  <StationIcon station={systemObject}>
                    <CopyOnClick>{systemObject.stationName}</CopyOnClick>
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
                  </StationIcon>
                </>}
            </div>
          </td>
          <td style={{ textAlign: 'right', fontSize: '0.9rem' }} className='is-hidden-mobile'>
            {systemObject?.updatedAt !== undefined && <small>{timeBetweenTimestamps(systemObject.updatedAt)}</small>}
          </td>
          <td style={{ textAlign: 'right' }} className='is-hidden-mobile'>
            {systemObject?.distanceToArrival !== undefined && <>{Math.round(systemObject?.distanceToArrival).toLocaleString()} Ls</>}
          </td>
        </tr>
        {systemObject?.stations?.length > 0 && <SystemObjects objects={systemObject.stations} depth={depth + 1} />}
        {systemObject?.children?.length > 0 && <SystemObjects objects={systemObject.children} depth={depth + 1} />}
      </Fragment>
    )
  })
}
