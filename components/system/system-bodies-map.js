import { useState, useEffect, Fragment } from 'react'
import { parseBodiesAndStations } from 'lib/utils/sytem-map-utils'
import CopyOnClick from 'components/copy-on-click'
import SystemObjectIcon from 'components/system-object-icon'
import StationIcon from 'components/station-icon'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import { kelvinToCelius, kelvinToFahrenheit } from 'lib/utils/temperature'

const SOL_RADIUS_IN_KM = 696340
const MIN_PLANET_RADIUS = 600
const MAX_PLANET_RADIUS = 2000
const STAR_RADIUS = 2500
const PLANET_SPACING = 5000
const SVG_PADDING = 3000
const ROW_HEIGHT = 7000
const LABEL_GAP = 500
const MOON_Y_OFFSET = 4500
const MOON_Y_SPACING = 3500

function getBodyFillColor (body) {
  if (body.bodyType === 'Star') {
    const sub = (body.subType ?? '').toLowerCase()
    if (sub.includes('neutron')) return '#c8d8ff'
    if (sub.includes('white dwarf')) return '#f0f4ff'
    if (sub.includes('black hole')) return '#1a1a2e'
    if (sub.includes('brown dwarf') || sub.includes('t tauri') || sub.includes('l ')) return '#cc6633'
    if (sub.includes('class m') || sub.includes('m (')) return '#ff6030'
    if (sub.includes('class k') || sub.includes('k (')) return '#ffaa44'
    if (sub.includes('class g') || sub.includes('g (')) return '#fff060'
    if (sub.includes('class f') || sub.includes('f (')) return '#ffffcc'
    if (sub.includes('class a') || sub.includes('a (')) return '#ccddff'
    if (sub.includes('class b') || sub.includes('b (')) return '#aaccff'
    if (sub.includes('class o') || sub.includes('o (')) return '#9bb0ff'
    return '#ffcc44'
  }

  const sub = (body.subType ?? '').toLowerCase()
  if (sub.includes('earth-like')) return '#4488bb'
  if (sub.includes('water world') || sub.includes('water giant')) return '#3366aa'
  if (sub.includes('ammonia')) return '#886644'
  if (sub.includes('gas giant')) return '#cc9966'
  if (sub.includes('high metal')) return '#887766'
  if (sub.includes('metal rich')) return '#998877'
  if (sub.includes('rocky') && sub.includes('ice')) return '#99aabb'
  if (sub.includes('icy')) return '#aabbcc'
  if (sub.includes('rocky')) return '#776655'

  if (body.isLandable) return '#8899aa'
  return '#667788'
}

function getTexturePattern (body) {
  if (body.bodyType === 'Star') {
    const sub = (body.subType ?? '').toLowerCase()
    if (sub.includes('brown dwarf')) return 'svg-pattern__planet-surface--brown-dwarf'
    return 'svg-pattern__star-surface'
  }

  const sub = (body.subType ?? '').toLowerCase()
  if (sub.includes('gas giant')) return 'svg-pattern__planet-surface--gas-giant'
  if (sub.includes('ammonia')) return 'svg-pattern__planet-surface--gas-giant'
  if (sub.includes('earth-like')) return 'svg-pattern__planet-surface--clouds'
  if (sub.includes('water world') || sub.includes('water giant')) return 'svg-pattern__planet-surface--clouds'
  return 'svg-pattern__planet-surface'
}

module.exports = ({
  system,
  bodiesInSystem,
  stationsInSystem,
  setInspector
}) => {
  const [objectsInSystem, setObjectsInSystem] = useState()

  useEffect(() => {
    if (bodiesInSystem !== undefined && stationsInSystem !== undefined) {
      const _objectsInSystem = parseBodiesAndStations(bodiesInSystem, stationsInSystem, system)
      setObjectsInSystem(_objectsInSystem)
    }
  }, [bodiesInSystem, stationsInSystem])

  return (
    <div className='fx__fade-in system-bodies-map'>
      <div className='heading--with-underline'>
        <h2 className='heading--with-icon'>
          <i className='icon icarus-terminal-system-bodies' />
          <span className='text-no-transform'><CopyOnClick>{system.systemName}</CopyOnClick></span>
        </h2>
      </div>
      {objectsInSystem === undefined &&
        <div className='loading-bar' style={{ marginTop: '1rem' }} />}
      {objectsInSystem !== undefined && objectsInSystem?.length === 0 &&
        <p className='text-uppercase muted fx__fade-in'>
          <i className='icon icarus-terminal-warning' style={{ position: 'relative', top: '.1rem' }} />{' '}
          No body data available
        </p>}
      {objectsInSystem !== undefined && objectsInSystem.length > 0 &&
        objectsInSystem.map((star, starIndex) => (
          <StarSection
            key={`star-section-${star.bodyId ?? starIndex}`}
            star={star}
            setInspector={setInspector}
          />
        ))}
      <p className='text-center' style={{ marginBottom: 0 }}>
        <small className='text-center'>Stellar cartography enhanced by EDSM.NET</small>
      </p>
    </div>
  )
}

function StarSection ({ star, setInspector }) {
  const children = star.children ?? []
  const allBodies = [star, ...children]
  const layout = calculateLayout(allBodies)

  return (
    <div className='system-bodies-map__star-section'>
      <div className='system-bodies-map__star-heading' onClick={() => setInspector(<Inspector systemObject={star} />)}>
        <h3>
          <SystemObjectIcon systemObject={star}>
            {star.bodyName}
            {star.subType && <small className='text-no-transform'> — {star.subType}</small>}
          </SystemObjectIcon>
        </h3>
        {children.length > 0 &&
          <small className='muted'>
            {children.length} {children.length === 1 ? 'orbiting body' : 'orbiting bodies'}
          </small>}
      </div>
      {allBodies.length > 0 &&
        <div className='system-bodies-map__orbit-container'>
          <svg
            className='system-bodies-map__orbit-svg'
            viewBox={layout.viewBox}
            preserveAspectRatio='xMinYMid meet'
            style={{ width: `${Math.max(100, allBodies.length * 8)}%` }}
          >
            {children.length > 0 &&
              <line
                x1={layout.bodies[0].x}
                y1={layout.bodies[0].y}
                x2={layout.bodies[layout.bodies.length - 1].x}
                y2={layout.bodies[layout.bodies.length - 1].y}
                className='system-bodies-map__connector-line'
              />}
            {layout.bodies.map((item, i) => {
              const isRootStar = i === 0 && item.body.bodyType === 'Star'
              const moons = isRootStar ? [] : (item.body.children ?? [])
              return (
                <Fragment key={`body-svg-${item.body.bodyId ?? i}`}>
                  {moons.length > 0 &&
                    <line
                      x1={item.x}
                      y1={item.y + item.r}
                      x2={item.x}
                      y2={item.y + MOON_Y_OFFSET + ((moons.length - 1) * MOON_Y_SPACING)}
                      className='system-bodies-map__connector-line system-bodies-map__connector-line--secondary'
                    />}
                  <BodySvg
                    body={item.body}
                    x={item.x}
                    y={item.y}
                    r={item.r}
                    setInspector={setInspector}
                  />
                  {moons.map((child, ci) => {
                    const childR = calculateRadius(child) * 0.6
                    const childY = item.y + MOON_Y_OFFSET + (ci * MOON_Y_SPACING)
                    return (
                      <BodySvg
                        key={`child-svg-${child.bodyId ?? ci}`}
                        body={child}
                        x={item.x}
                        y={childY}
                        r={childR}
                        setInspector={setInspector}
                        small
                      />
                    )
                  })}
                </Fragment>
              )
            })}
          </svg>
        </div>}
    </div>
  )
}

function BodySvg ({ body, x, y, r, setInspector, small = false }) {
  const isStarType = body.bodyType === 'Star'
  const isPlanet = body.bodyType === 'Planet'
  const hasAtmosphere = body.atmosphereType && body.atmosphereType !== 'No atmosphere'
  const hasRings = body.rings && body.rings.length > 0
  const fillColor = getBodyFillColor(body)
  const texturePatternId = getTexturePattern(body)

  const nameLabel = truncateString(body.bodyName ?? '', small ? 8 : 14)
  const distanceLabel = body.distanceToArrival !== undefined && body.distanceToArrival > 0
    ? `${Math.round(body.distanceToArrival).toLocaleString()} Ls`
    : ''

  const textNameY = y - r - LABEL_GAP - (distanceLabel ? 400 : 0)
  const textDistanceY = y - r - LABEL_GAP

  return (
    <g
      className='system-map__system-object'
      data-system-object-type={body.bodyType}
      data-system-object-sub-type={body.subType ?? ''}
      data-system-object-landable={body.isLandable ?? false}
      data-system-object-atmosphere={hasAtmosphere ? body.atmosphereType : undefined}
      data-system-object-small={small}
      tabIndex='0'
      onFocus={() => setInspector(<Inspector systemObject={body} />)}
      onClick={() => setInspector(<Inspector systemObject={body} />)}
    >
      {hasAtmosphere && isPlanet &&
        <circle
          className='system-map__planet-atmosphere'
          cx={x}
          cy={y}
          r={r * 1.15}
          fill={fillColor}
          opacity='0.15'
        />}
      {isStarType &&
        <circle
          className='system-map__star-glow'
          cx={x}
          cy={y}
          r={r * 1.6}
          fill={fillColor}
          opacity='0.12'
        />}
      <text
        className='system-map__planet-name-text'
        x={x}
        y={textNameY}
        textAnchor='middle'
      >
        {nameLabel}
      </text>
      {distanceLabel &&
        <text
          className='system-map__planet-distance-text'
          x={x}
          y={textDistanceY}
          textAnchor='middle'
        >
          {distanceLabel}
        </text>}
      <g className='system-map__body'>
        <g className='system-map__planet'>
          <circle
            cx={x}
            cy={y}
            r={r}
          />
          <circle
            className='system-map__planet-surface'
            cx={x}
            cy={y}
            r={r}
          />
          {hasRings &&
            <>
              <defs>
                <mask id={`planet-ring-mask-${body.bodyId}`}>
                  <ellipse cx={x} cy={y} rx={r * 2.2} ry={r / 2.5} fill='white' />
                  <ellipse cx={x} cy={y - (r / 5)} rx={r * 1.1} ry={r / 2.5} fill='black' />
                  <ellipse cx={x} cy={y - (r / 15)} rx={r * 1.3} ry={r / 4} fill='black' />
                </mask>
              </defs>
              <ellipse
                className='system-map__planet-ring'
                cx={x}
                cy={y}
                rx={r * 2.2}
                ry={r / 2.5}
                mask={`url(#planet-ring-mask-${body.bodyId})`}
                fill={fillColor}
                opacity='0.5'
              />
            </>}
        </g>
      </g>
    </g>
  )
}

function calculateLayout (allBodies) {
  const bodies = []
  let currentX = SVG_PADDING
  let maxRenderedBottom = ROW_HEIGHT

  for (let i = 0; i < allBodies.length; i++) {
    const body = allBodies[i]
    const r = calculateRadius(body)
    const x = currentX + r
    const y = ROW_HEIGHT / 2
    bodies.push({ body, x, y, r })
    currentX += (r * 2) + PLANET_SPACING

    const renderedChildren = (i === 0 && body.bodyType === 'Star') ? [] : (body.children ?? [])
    if (renderedChildren.length > 0) {
      const lastChildIndex = renderedChildren.length - 1
      const maxChildRadius = renderedChildren.reduce((largestRadius, child) => {
        return Math.max(largestRadius, calculateRadius(child) * 0.6)
      }, 0)
      const renderedBottom = y + MOON_Y_OFFSET + (lastChildIndex * MOON_Y_SPACING) + maxChildRadius
      if (renderedBottom > maxRenderedBottom) maxRenderedBottom = renderedBottom
    }
  }

  const totalWidth = currentX + SVG_PADDING
  const totalHeight = Math.ceil(maxRenderedBottom)

  return {
    viewBox: `0 0 ${totalWidth} ${totalHeight}`,
    bodies
  }
}

function calculateRadius (body) {
  if (body.bodyType === 'Star') {
    if (body.solarRadius) {
      const scaled = Math.log10(Math.max(body.solarRadius, 0.1) * SOL_RADIUS_IN_KM) * 400
      return Math.min(Math.max(scaled, STAR_RADIUS * 0.8), STAR_RADIUS * 1.5)
    }
    return STAR_RADIUS
  }

  if (body.radius) {
    const logRadius = Math.log10(Math.max(body.radius, 500))
    const scaled = (logRadius - 2.5) * 1200
    return Math.min(Math.max(scaled, MIN_PLANET_RADIUS), MAX_PLANET_RADIUS)
  }
  return MIN_PLANET_RADIUS
}

function truncateString (str, maxLength) {
  if (str.length > maxLength) {
    return `${str.substring(0, maxLength - 1)}…`
  }
  return str
}

function Inspector ({ systemObject }) {
  const surfacePorts = []
  const settlements = []
  const orbitals = []
  systemObject?.stations?.forEach(station => {
    if (['CraterOutpost', 'CraterPort', 'OnFootSettlement'].includes(station.stationType)) {
      ['CraterOutpost', 'CraterPort'].includes(station.stationType) ? surfacePorts.push(station) : settlements.push(station)
    } else {
      orbitals.push(station)
    }
  })

  return (
    <>
      <div className='fx-fade-in'>
        <div className='inspector__heading'>
          {(systemObject?.bodyType === 'Planet' || systemObject?.bodyType === 'Star') &&
            <SystemObjectIcon systemObject={systemObject}>
              <CopyOnClick>{systemObject.bodyName}</CopyOnClick>
              {systemObject?.subType &&
                <small><br />{systemObject.subType}</small>}
            </SystemObjectIcon>}
        </div>

        {systemObject.distanceToArrival !== undefined &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Location</h3>
            </div>
            <p>
              <span className='text-muted'>Distance from arrival</span><br />
              {systemObject.distanceToArrival.toLocaleString(undefined, { maximumFractionDigits: 0 })} Ls
            </p>
          </div>}

        {systemObject?.bodyType === 'Star' &&
          <div className='inspector__section'>
            <div className='heading--with-underline'>
              <h3>Stellar properties</h3>
            </div>
            {systemObject.isScoopable
              ? <p><i className='system-object-icon text-warning icarus-terminal-fuel' />Main sequence (scoopable)</p>
              : <p className='text-muted'><i className='system-object-icon icarus-terminal-warning' />Not scoopable</p>}
            {systemObject.spectralClass && <p><small>Spectral class {systemObject.spectralClass}, Luminosity {systemObject.luminosity}</small></p>}
            {systemObject.solarRadius && <p><span className='text-muted'>Radius</span><br />{(systemObject.solarRadius * SOL_RADIUS_IN_KM).toLocaleString(undefined, { maximumFractionDigits: 0 })} Km</p>}
            {systemObject.solarMasses && <p><span className='text-muted'>Solar masses</span><br />{systemObject.solarMasses.toFixed(2)}</p>}
            {systemObject.surfaceTemperature && <p><span className='text-muted'>Temperature</span><br />{systemObject.surfaceTemperature} K</p>}
          </div>}

        {systemObject?.bodyType === 'Planet' &&
          <>
            <div className='inspector__section'>
              <div className='heading--with-underline'>
                <h3>Environment</h3>
              </div>
              {systemObject.isLandable && <p><i className='system-object-icon text-info icarus-terminal-planet-lander' /> Landable surface</p>}
              {systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && systemObject.terraformingState !== 'Terraformed' &&
                <p><i className='system-object-icon text-positive icarus-terminal-planet-terraformable' />Terraformable</p>}
              {systemObject.volcanismType && systemObject.volcanismType !== 'No volcanism' &&
                <p className='text-no-wrap'><i className='system-object-icon icarus-terminal-planet-volcanic' />{systemObject.volcanismType}</p>}
              {systemObject?.signals?.biological > 0 &&
                <p><i className='system-object-icon icarus-terminal-plant' />{systemObject.signals.biological} Biological {systemObject.signals.biological === 1 ? 'Signal' : 'Signals'}</p>}
              {systemObject.gravity &&
                <p><span className='text-muted'>Gravity</span><br />{Math.max(0.01, Number(systemObject.gravity.toFixed(2)))}g</p>}
              {systemObject.radius && <p><span className='text-muted'>Radius</span><br />{systemObject.radius.toLocaleString(undefined, { maximumFractionDigits: 0 })} Km</p>}
              {systemObject.surfaceTemperature &&
                <p>
                  <span className='text-muted'>Temperature</span><br />{systemObject.surfaceTemperature}K
                  ({kelvinToCelius(systemObject.surfaceTemperature)}C/{kelvinToFahrenheit(systemObject.surfaceTemperature)}F)
                </p>}
              {systemObject.atmosphereType && systemObject.atmosphereType !== 'No atmosphere' &&
                <p><span className='text-muted'>Atmosphere</span><br />{systemObject.atmosphereType}</p>}
            </div>

            {surfacePorts.length > 0 &&
              <div className='inspector__section'>
                <div className='heading--with-underline'><h3>Ports</h3></div>
                {surfacePorts.map(station => (
                  <p key={`inspector-port-${station.stationName}`} className='text-no-wrap'>
                    <StationIcon station={station}><CopyOnClick>{station.stationName}</CopyOnClick></StationIcon>
                  </p>
                ))}
              </div>}

            {settlements.length > 0 &&
              <div className='inspector__section'>
                <div className='heading--with-underline'><h3>Settlements</h3></div>
                {settlements.map(station => (
                  <p key={`inspector-settlement-${station.stationName}`} className='text-no-wrap'>
                    <StationIcon station={station}><CopyOnClick>{station.stationName}</CopyOnClick></StationIcon>
                  </p>
                ))}
              </div>}

            {orbitals.length > 0 &&
              <div className='inspector__section'>
                <div className='heading--with-underline'><h3>In orbit</h3></div>
                {orbitals.map(station => (
                  <p key={`inspector-orbital-${station.stationName}`} className='text-no-wrap'>
                    <StationIcon station={station}><CopyOnClick>{station.stationName}</CopyOnClick></StationIcon>
                  </p>
                ))}
              </div>}
          </>}

        {systemObject.rings &&
          <div className='inspector__section'>
            <div className='heading--with-underline'><h3>Rings</h3></div>
            {systemObject.reserveLevel && <p>{systemObject.reserveLevel} Reserves</p>}
            <ul>
              {systemObject.rings.map((ring, i) => <li key={`ring-${i}`}>{ring.name} ({ring.type})</li>)}
            </ul>
          </div>}

        {Object.prototype.hasOwnProperty.call(systemObject, 'rotationalPeriod') &&
          <div className='inspector__section'>
            <div className='heading--with-underline'><h3>Orbital properties</h3></div>
            {systemObject.rotationalPeriod !== undefined &&
              <p><span className='text-muted'>Rotational period</span><br />{systemObject.rotationalPeriod}</p>}
            {systemObject.orbitalPeriod !== undefined &&
              <p><span className='text-muted'>Orbital period</span><br />{systemObject.orbitalPeriod}</p>}
          </div>}

        {systemObject?.updatedAt !== undefined &&
          <p className='text-center text-muted'>
            Last updated {timeBetweenTimestamps(systemObject.updatedAt)} ago
          </p>}
      </div>
    </>
  )
}
