import { useState, useEffect, Fragment } from 'react'
import StationIcon from 'components/station-icon'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import { parseBodiesAndStations } from 'lib/utils/sytem-map-utils'

module.exports = ({
  system,
  bodiesInSystem,
  stationsInSystem,
}) => {
  const [objectsInSystem, setObjectsInSystem] = useState()

  useEffect(() => {
    if (bodiesInSystem && stationsInSystem) {
      const _objectsInSystem = parseBodiesAndStations(bodiesInSystem, stationsInSystem, system)
      setObjectsInSystem(_objectsInSystem)
    }
  }, [bodiesInSystem, stationsInSystem])

  return (
    <div className='fx__fade-in'>
        <div className='heading--with-underline'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-system-orbits' />
            <span className='text-no-transform'>{system.systemName} System</span>
          </h2>
        </div>
      <div className='rc-table data-table data-table--striped Xdata-table--interactive data-table--animated'>
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
                <SystemObjects objects={objectsInSystem} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function SystemObjects({ objects, depth = 0 }) {
  return objects?.map((systemObject, i) => {

    let planetIcon = 'planet'
    if (systemObject?.bodyType === 'Planet') {
      const isLandable = systemObject?.isLandable
      const isAtmospheric = systemObject?.atmosphereComposition && !systemObject?.subType?.toLowerCase()?.includes('gas giant')
      if (isLandable) {
        if (isAtmospheric) {
          planetIcon = 'planet-atmosphere-landable text-info'
        } else {
          planetIcon = 'planet-landable text-info'
        }
      } else if (isAtmospheric) {
        planetIcon = 'planet-atmosphere'
      }
    }

    return (
      <Fragment key={`object-in-system-row-${depth}-${i}-${systemObject?.stationType ?? systemObject?.bodyType}-${systemObject?.stationName ?? systemObject?.bodyName}`}>
        <tr className='rc-table-row rc-table-row-level-0 --visible'>
          <td className='max-width-mobile'>
            <div style={{ display: 'inline-block', paddingLeft: `${depth}rem` }} >
              {systemObject?.bodyType === 'Null' && <>✕— </>}
              {systemObject?.bodyType === 'Star' && <i style={{ position: 'relative', top: '-.1rem' }} className='station-icon icarus-terminal-star' />}
              {systemObject?.bodyType === 'Planet' && <i style={{ position: 'relative', top: '-.1rem' }} className={`station-icon icarus-terminal-${planetIcon}`} />}
              {systemObject?.bodyType !== undefined && systemObject.bodyName}
              {systemObject?.stationType !== undefined && <>
                <StationIcon station={systemObject}>
                {systemObject.stationName}
                {systemObject?.distanceToArrival !== undefined > 0 &&
                  <small className='is-visible-mobile text-no-transform'>
                    {' '}{Math.round(systemObject?.distanceToArrival).toLocaleString()} Ls
                    {systemObject?.updatedAt !== undefined && <><br/>Updated {timeBetweenTimestamps(systemObject.updatedAt)} ago</>}
                  </small>}
                </StationIcon>
              </>}
            </div>
          </td>
          <td style={{ textAlign: 'right' }} className='is-hidden-mobile'>
            {systemObject?.updatedAt !== undefined && <span className='text-no-transform' style={{opacity: .5}}>{timeBetweenTimestamps(systemObject.updatedAt)}</span>}
          </td>
          <td style={{ textAlign: 'right' }} className='is-hidden-mobile'>
            {systemObject?.distanceToArrival !== undefined > 0 && <>{Math.round(systemObject?.distanceToArrival).toLocaleString()} Ls</>}
          </td>
        </tr>
        {systemObject?.stations?.length > 0 && <SystemObjects objects={systemObject.stations} depth={depth + 1} />}
        {systemObject?.children?.length > 0 && <SystemObjects objects={systemObject.children} depth={depth + 1} />}
      </Fragment>
    )
  })
}