import { useState, useEffect, useRef, Fragment } from 'react'
import { parseBodiesAndStations } from 'lib/utils/sytem-map-utils'
import CopyOnClick from 'components/copy-on-click'
import SystemObjectIcon from 'components/system-object-icon'
import StationIcon from 'components/station-icon'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import { kelvinToCelius, kelvinToFahrenheit } from 'lib/utils/temperature'
import factionStates from 'lib/utils/faction-states'

const SOL_RADIUS_IN_KM = 696340
const MIN_PLANET_RADIUS = 800
const MAX_PLANET_RADIUS = 2000
const MAIN_STAR_RADIUS = 4000
const STAR_RADIUS = 3000
const SMALL_STAR_RADIUS = 1000
const PLANET_SPACING = 3500
const STAR_CLUSTER_GAP = 2500
const SVG_PADDING = 1000
const STARTING_Y_OFFSET = 3000
const ROW_HEIGHT = 9000
const LABEL_GAP = 500
const MOON_Y_OFFSET = 6000
const MOON_Y_SPACING = 3500

function getBodyFillColor (body) {
  if (body.isBarycentre) return '#ffffff'
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
  if (body.bodyType === 'Planet') return '#5aa6ff'
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

module.exports = ({
  system,
  systemStatus,
  bodiesInSystem,
  stationsInSystem,
  settlementsInSystem,
  megashipsInSystem,
  fleetCarriersInSystem,
  lastUpdatedAt,
  setInspector
}) => {
  const [objectsInSystem, setObjectsInSystem] = useState()

  useEffect(() => {
    if (bodiesInSystem !== undefined && stationsInSystem !== undefined) {
      const _objectsInSystem = parseBodiesAndStations(bodiesInSystem, stationsInSystem, system) //?.[0]?.children ?? []
      setObjectsInSystem(_objectsInSystem)
      setInspector(<Inspector systemObject={_objectsInSystem[0]} />)
    }
  }, [bodiesInSystem, stationsInSystem])

  return (
    <div className='fx__fade-in system-bodies-map'>
      <div className='system-map__system-info'>
        <div className='heading--with-underline'>
          <h2 className='heading--with-icon'>
            <i className='icon icarus-terminal-system-orbits' />
            <span className='text-no-transform'><CopyOnClick>{system.systemName}</CopyOnClick></span>
          </h2>
        </div>

        <div className='system-map__system-objects'>
          {(stationsInSystem === undefined || bodiesInSystem === undefined) &&
            <p className='loading-bar' style={{ position: 'relative', top: '-.25rem', height: '1.75rem' }} />}
          {bodiesInSystem !== undefined && stationsInSystem !== undefined && settlementsInSystem !== undefined && megashipsInSystem !== undefined && fleetCarriersInSystem !== undefined &&
            <>
              {bodiesInSystem.length === 0 && stationsInSystem.length === 0 &&
                <p className='fx__fade-in text-blink-slow' style={{ height: '1.75rem' }}>
                  <i className='icon icarus-terminal-warning muted' style={{ position: 'relative', top: '.1rem', fontSize: '1.25rem' }} />
                  <small>System not scanned</small>
                </p>}
              {bodiesInSystem.filter(b => b.bodyType === 'Star').length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-star' /> {bodiesInSystem.filter(b => b.bodyType === 'Star').length}</p>}
              {bodiesInSystem.filter(b => b.bodyType === 'Planet').length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-planet' /> {bodiesInSystem.filter(b => b.bodyType === 'Planet').length}</p>}
              {stationsInSystem.filter(s => s.stationType === 'Dodec').length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-dodec-starport' /> {stationsInSystem.filter(s => s.stationType === 'Dodec').length}</p>}
              {stationsInSystem.filter(s => s.stationType === 'Orbis').length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-orbis-starport' /> {stationsInSystem.filter(s => s.stationType === 'Orbis').length}</p>}
              {stationsInSystem.filter(s => s.stationType === 'Coriolis').length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-coriolis-starport' /> {stationsInSystem.filter(s => s.stationType === 'Coriolis').length}</p>}
              {stationsInSystem.filter(s => s.stationType === 'Ocellus').length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-ocellus-starport' /> {stationsInSystem.filter(s => s.stationType === 'Ocellus').length}</p>}
              {stationsInSystem.filter(s => s.stationType === 'AsteroidBase').length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-asteroid-base' /> {stationsInSystem.filter(s => s.stationType === 'AsteroidBase').length}</p>}
              {stationsInSystem.filter(s => s.stationType === 'Outpost').length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-outpost' /> {stationsInSystem.filter(s => s.stationType === 'Outpost').length}</p>}
              {stationsInSystem.filter(s => ['CraterPort', 'CraterOutpost'].includes(s.stationType)).length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-planetary-port' /> {stationsInSystem.filter(s => ['CraterPort', 'CraterOutpost'].includes(s.stationType)).length}</p>}
              {settlementsInSystem.length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-settlement' /> {settlementsInSystem.length}</p>}
              {megashipsInSystem.length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-megaship' /> {megashipsInSystem.length}</p>}
              {fleetCarriersInSystem.length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-fleet-carrier' /> {fleetCarriersInSystem.length}</p>}
              {stationsInSystem.filter(s => ['PlanetaryConstructionDepot', 'SpaceConstructionDepot', 'SurfaceStation'].includes(s.stationType)).length > 0 && <p className='fx__fade-in'><i className='icon icarus-terminal-poi-empty' /> {stationsInSystem.filter(s => ['PlanetaryConstructionDepot', 'SpaceConstructionDepot', 'SurfaceStation'].includes(s.stationType)).length}</p>}
            </>}
        </div>

        <div className='system-map__location'>
          <p>
            <small className='fx__animated-text' data-fx-order='1'><span className='muted'>SYS ADDR</span> <CopyOnClick>{system.systemAddress}</CopyOnClick></small><br />
            <small className='fx__animated-text' data-fx-order='1' style={{ paddingRight: '1rem' }}><span className='muted'>SYS POS</span> <CopyOnClick>{system.systemX}, {system.systemY}, {system.systemZ}</CopyOnClick></small><br />
            <small style={{ opacity: 1 }} className='fx__animated-text' data-fx-order='2'><span className='muted'>Location</span> {system.tradeZone}</small>
            {system.tradeZoneLocation !== undefined && <><br /><small className='fx__animated-text text-no-transform' data-fx-order='3'>{system.tradeZoneLocation}</small></>}
          </p>
        </div>

        {systemStatus != null &&
          <div className='system-map__system-status'>
            {systemStatus.faction && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='4'><i className='icon icarus-terminal-system-authority' /> <CopyOnClick>{systemStatus.faction}</CopyOnClick></span>}
            {systemStatus.government && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='5'><i className='icon icarus-terminal-power' />{systemStatus.allegiance}{(systemStatus.allegiance || systemStatus.government) && ' '}{systemStatus.government}</span>}
            {systemStatus.economy?.primary && systemStatus.economy.primary !== 'None' && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='6'><i className='icon icarus-terminal-trending-up-chart' />{systemStatus.economy.primary}{systemStatus.economy.secondary && systemStatus.economy.secondary !== 'None' && <> &amp; {systemStatus.economy.secondary}</>} Economy</span>}
            {systemStatus.population > 0 && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='7'><i className='icon icarus-terminal-engineer' />Population {systemStatus.population.toLocaleString()}</span>}
            {systemStatus.security && systemStatus.security !== 'Anarchy' && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='8'><i className='icon icarus-terminal-shield' />{systemStatus.security} Security</span>}
            {systemStatus.state && systemStatus.state !== 'None' && <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='9'><i className='icon icarus-terminal-warning' />{factionStates?.[systemStatus.state.replaceAll(' ', '').toLowerCase()]?.description ?? systemStatus.state} <small>{timeBetweenTimestamps(lastUpdatedAt)} ago</small></span>}
            <span style={{ display: 'block' }} className='fx__fade-in'><small>Stellar cartography enhanced by EDSM.NET</small></span>
          </div>}
      </div>
      {objectsInSystem === undefined &&
        <div className='loading-bar' style={{ marginTop: '1rem' }} />}
      {objectsInSystem !== undefined && objectsInSystem?.length === 0 &&
        <p className='text-uppercase muted fx__fade-in'>
          <i className='icon icarus-terminal-warning' style={{ position: 'relative', top: '.1rem' }} />{' '}
          No body data available
        </p>}
      {objectsInSystem !== undefined && objectsInSystem.length > 0 && (
        <>
          {/* {objectsInSystem.map((star, starIndex) => (
            <StarSection
              key={`star-section-${star.bodyId ?? starIndex}`}
              star={star}
              setInspector={setInspector}
            />
          ))} */}
          <SystemCanvas
            system={system}
            stars={objectsInSystem}
            setInspector={setInspector}
          />
        </>
      )}
    </div>
  )
}

function StarSection ({ star, setInspector }) {
  const children = star.children ?? []

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
    </div>
  )
}

function SystemCanvas ({ system, stars, setInspector }) {
  const layout = calculateSystemLayout(stars)
  const initialViewBox = layout.viewBox.split(/[ ,]+/).map(Number)
  const [viewBox, setViewBox] = useState(initialViewBox)
  const viewBoxRef = useRef(initialViewBox)
  const pointers = useRef(new Map())
  const gesture = useRef(null)
  const dragged = useRef(false)
  const suppressClick = useRef(false)
  const mapElement = useRef()

  const updateViewBox = nextViewBox => {
    viewBoxRef.current = nextViewBox
    setViewBox(nextViewBox)
  }

  useEffect(() => {
    updateViewBox(initialViewBox)
  }, [layout.viewBox])

  useEffect(() => {
    mapElement.current?.focus({ preventScroll: true })
  }, [])

  const handleKeyDown = event => {
    const [x, y, width, height] = viewBoxRef.current
    const panX = width * 0.1
    const panY = height * 0.1

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        updateViewBox([x, y - panY, width, height])
        break
      case 'ArrowDown':
        event.preventDefault()
        updateViewBox([x, y + panY, width, height])
        break
      case 'ArrowLeft':
        event.preventDefault()
        updateViewBox([x - panX, y, width, height])
        break
      case 'ArrowRight':
        event.preventDefault()
        updateViewBox([x + panX, y, width, height])
        break
      case '+':
      case '=':
      case 'Add':
        event.preventDefault()
        zoomViewBox(0.8)
        break
      case '-':
      case '_':
      case 'Subtract':
        event.preventDefault()
        zoomViewBox(1.25)
        break
      default:
        break
    }
  }

  const zoomViewBox = factor => {
    const [x, y, width, height] = viewBoxRef.current
    const nextWidth = Math.max(initialViewBox[2] * 0.05, Math.min(initialViewBox[2] * 20, width * factor))
    const nextHeight = height * (nextWidth / width)
    updateViewBox([x + (width - nextWidth) / 2, y + (height - nextHeight) / 2, nextWidth, nextHeight])
  }

  const handleWheel = event => {
    event.preventDefault()
    const point = getSvgPoint(event.currentTarget, event.clientX, event.clientY)
    const [x, y, width, height] = viewBoxRef.current
    const factor = Math.exp(Math.max(-1, Math.min(1, event.deltaY * 0.0015)))
    const nextWidth = Math.max(initialViewBox[2] * 0.05, Math.min(initialViewBox[2] * 20, width * factor))
    const nextHeight = height * (nextWidth / width)
    const ratio = nextWidth / width
    updateViewBox([
      point.x - (point.x - x) * ratio,
      point.y - (point.y - y) * ratio,
      nextWidth,
      nextHeight
    ])
  }

  const handlePointerDown = event => {
    if (pointers.current.size === 0) {
      dragged.current = false
    } else {
      dragged.current = true
      pointers.current.forEach((pointer, pointerId) => event.currentTarget.setPointerCapture(pointerId))
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    gesture.current = null
  }

  const handlePointerMove = event => {
    if (!pointers.current.has(event.pointerId)) return
    const previous = pointers.current.get(event.pointerId)
    const current = { x: event.clientX, y: event.clientY }
    pointers.current.set(event.pointerId, current)
    const [x, y, width, height] = viewBoxRef.current

    if (pointers.current.size >= 2) {
      const [first, second] = [...pointers.current.values()]
      const distance = Math.hypot(second.x - first.x, second.y - first.y)
      const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
      if (gesture.current && distance > 0) {
        const old = gesture.current
        const ratio = old.distance / distance
        const nextWidth = Math.max(initialViewBox[2] * 0.05, Math.min(initialViewBox[2] * 20, width * ratio))
        const nextHeight = height * (nextWidth / width)
        const anchor = getSvgPoint(event.currentTarget, old.midpoint.x, old.midpoint.y)
        const nextMidpoint = getSvgPoint(event.currentTarget, midpoint.x, midpoint.y)
        updateViewBox([
          anchor.x - (nextMidpoint.x - x) * (nextWidth / width),
          anchor.y - (nextMidpoint.y - y) * (nextHeight / height),
          nextWidth,
          nextHeight
        ])
        if (!dragged.current) event.currentTarget.setPointerCapture(event.pointerId)
        dragged.current = true
      }
      gesture.current = { distance, midpoint }
      return
    }

    if (Math.hypot(current.x - previous.x, current.y - previous.y) > 3 && !dragged.current) {
      dragged.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    if (dragged.current) {
      const previousPoint = getSvgPoint(event.currentTarget, previous.x, previous.y)
      const currentPoint = getSvgPoint(event.currentTarget, current.x, current.y)
      updateViewBox([
        x - (currentPoint.x - previousPoint.x),
        y - (currentPoint.y - previousPoint.y),
        width,
        height
      ])
    }
  }

  const handlePointerUp = event => {
    pointers.current.delete(event.pointerId)
    gesture.current = null
    if (dragged.current) {
      suppressClick.current = true
      setTimeout(() => { suppressClick.current = false }, 0)
    }
  }

  return (
    <div className='system-bodies-map__orbit-container'>
      <svg
        ref={mapElement}
        className='system-bodies-map__orbit-svg'
        tabIndex={0}
        role='img'
        aria-label='System bodies map. Use arrow keys to pan and plus or minus to zoom.'
        viewBox={viewBox.join(' ')}
        preserveAspectRatio='xMidYMid meet'
        style={{ width: '100%' }}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={event => {
          if (suppressClick.current) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
      >
        {layout.stars.map(({ star, xOffset, yOffset }) => (
          <StarCanvasCluster
            key={`star-canvas-${star.isBarycentre ? 'barycentre' : star.bodyType}-${star.bodyId ?? star.bodyName ?? `${xOffset}-${yOffset}`}`}
            system={system}
            star={star}
            xOffset={xOffset}
            yOffset={yOffset}
            setInspector={setInspector}
          />
        ))}
      </svg>
    </div>
  )
}

function getSvgPoint (svg, clientX, clientY) {
  const point = svg.createSVGPoint()
  point.x = clientX
  point.y = clientY
  return point.matrixTransform(svg.getScreenCTM().inverse())
}

function StarCanvasCluster ({ system, star, xOffset, yOffset, setInspector }) {
  const children = getRenderableChildren(star)
  const allBodies = [star, ...children]
  const layout = calculateLayout(allBodies)

  return (
    <g transform={`translate(${xOffset}, ${yOffset})`}>
      {children.length > 0 &&
        <line
          x1={layout.bodies[0].x}
          y1={layout.bodies[0].y}
          x2={layout.bodies[layout.bodies.length - 1].x}
          y2={layout.bodies[layout.bodies.length - 1].y}
          className='system-bodies-map__connector-line'
        />}
      {layout.bodies.map((item, i) => {
        const isRootNode = i === 0 && (item.body.bodyType === 'Star' || item.body.isBarycentre)
        const moons = isRootNode ? [] : getRenderableChildren(item.body)
        return (
          <Fragment key={`body-svg-${item.body.bodyId ?? `${star.bodyId ?? 'star'}-${i}`}`}>
            <BodySvg
              system={system}
              body={item.body}
              x={item.x}
              y={item.y}
              r={item.r}
              setInspector={setInspector}
            />
            <NestedBodiesSvg
              system={system}
              parent={item.body}
              parentX={item.x}
              parentY={item.y}
              parentRadius={item.r}
              children={moons}
              setInspector={setInspector}
            />
          </Fragment>
        )
      })}
    </g>
  )
}

function NestedBodiesSvg ({ system, parent, parentX, parentY, parentRadius, children, setInspector }) {
  if (!children.length) return null
  let nextY = parentY + MOON_Y_OFFSET
  const positions = children.map(child => {
    const branchRows = getDescendantRows(child)
    const y = nextY
    nextY += branchRows * MOON_Y_SPACING
    return { child, y }
  })

  return (
    <>
      <line
        x1={parentX}
        y1={parentY + (parent?.bodyType === 'Barycentre' ? 0 : parentRadius)}
        x2={parentX}
        y2={positions[positions.length - 1].y}
        className='system-bodies-map__connector-line system-bodies-map__connector-line--secondary'
      />
      {positions.map(({ child, y }) => {
        const radius = calculateRadius(child) * 0.6
        return (
          <Fragment key={`nested-body-${child.bodyType}-${child.bodyId ?? child.bodyName}-${y}`}>
            <BodySvg system={system} body={child} x={parentX} y={y} r={radius} setInspector={setInspector} small />
            <NestedBodiesSvg
              system={system}
              parent={child}
              parentX={parentX}
              parentY={y}
              parentRadius={radius}
              children={getRenderableChildren(child)}
              setInspector={setInspector}
            />
          </Fragment>
        )
      })}
    </>
  )
}

function getDescendantRows (body) {
  const children = getRenderableChildren(body)
  if (children.length === 0) return 1
  return 2 + children.reduce((total, child) => total + getDescendantRows(child), 0)
}

function getRenderableChildren (body) {
  const children = body.children ?? []
  if (body?.bodyType !== 'Planet') return children

  // Hide only the barycentre directly orbiting this planet. Keep any nested
  // barycentres visible alongside the other bodies orbiting that point.
  return children.flatMap(child => (
    child?.isBarycentre ? (child.children ?? []) : [child]
  ))
}

function BodySvg ({ system, body, x, y, r, setInspector, small = false }) {
  if (body.isBarycentre) r = Math.min(r, 900)
  const isPlanet = body.bodyType === 'Planet'
  const hasAtmosphere = body.atmosphereType && body.atmosphereType !== 'No atmosphere'
  const hasRings = body.rings && body.rings.length > 0
  const fillColor = getBodyFillColor(body)

  let nameLabel = truncateString((body.bodyName ?? '').replace(new RegExp(`^${system?.systemName}`), ''), small ? 8 : 14)
  if (body.isBarycentre) nameLabel = '' // Don't display labels for barycentres
  const distanceLabel = body.distanceToArrival !== undefined && body.distanceToArrival > 0
    ? `${Math.round(body.distanceToArrival).toLocaleString()} Ls`
    : ''

  const textNameY = y - r - LABEL_GAP - (distanceLabel ? 400 : 0)
  const textDistanceY = y - r - LABEL_GAP

  return (
    <g
      className='system-map__system-object'
      data-system-object-type={body.isBarycentre ? 'Barycentre' : body.bodyType}
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
      {/* {isStarType &&
        <circle
          className='system-map__star-glow'
          cx={x}
          cy={y}
          r={r * 1.6}
          fill={fillColor}
          opacity='0.12'
        />} */}
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
        <g className={isPlanet ? 'system-map__planet' : 'system-map__star'} fill={fillColor}>
          <circle
            cx={x}
            cy={y}
            r={r}
          />
          <circle
            className={isPlanet ? 'system-map__planet-surface' : 'system-map__star-surface'}
            cx={x}
            cy={y}
            r={body.isBarycentre ? r * 0.25 : r}
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
    const isRootNode = i === 0 && (body.bodyType === 'Star' || body.isBarycentre)
    const r = calculateRadius(body, i === 0 && body.bodyType === 'Star')
    const x = currentX + r
    const y = ROW_HEIGHT / 2
    bodies.push({ body, x, y, r })
    currentX += (r * 2) + PLANET_SPACING 

    const renderedChildren = isRootNode ? [] : getRenderableChildren(body)
    if (renderedChildren.length > 0) {
      const rows = renderedChildren.reduce((total, child) => total + getDescendantRows(child), 0)
      const renderedBottom = y + MOON_Y_OFFSET + (rows * MOON_Y_SPACING)
      if (renderedBottom > maxRenderedBottom) maxRenderedBottom = renderedBottom
    }
  }

  const totalWidth = currentX + SVG_PADDING
  const totalHeight = Math.ceil(maxRenderedBottom)

  return {
    viewBox: `0 0 ${totalWidth} ${totalHeight}`,
    totalWidth,
    totalHeight,
    bodies
  }
}

function calculateSystemLayout (stars = []) {
  const starLayouts = []
  let currentY = SVG_PADDING + STARTING_Y_OFFSET
  let maxRenderedWidth = SVG_PADDING * 2

  for (const star of stars) {
    if (star?.isBarycentre && Number(star.bodyId) === 0 && (star.children ?? []).length === 0) continue

    const children = getRenderableChildren(star)
    const allBodies = [star, ...children]
    const layout = calculateLayout(allBodies)

    starLayouts.push({
      star,
      xOffset: SVG_PADDING,
      yOffset: currentY,
      totalWidth: layout.totalWidth,
      totalHeight: layout.totalHeight
    })

    if (layout.totalWidth > maxRenderedWidth) maxRenderedWidth = layout.totalWidth
    currentY += layout.totalHeight + STAR_CLUSTER_GAP
  }

  const totalWidth = Math.ceil(maxRenderedWidth + SVG_PADDING)
  const totalHeight = Math.ceil(currentY + SVG_PADDING)

  return {
    viewBox: `0 0 ${totalWidth} ${totalHeight}`,
    totalWidth,
    totalHeight,
    stars: starLayouts
  }
}

function calculateRadius (body, isRootStar = false) {
  if (body.isBarycentre) return 1200
  if (body.bodyType === 'Star') {
    const subType = (body.subType ?? '').toLowerCase()
    if (['black hole', 'neutron', 'white dwarf'].some(type => subType.includes(type))) return SMALL_STAR_RADIUS
    if (isRootStar) return MAIN_STAR_RADIUS
    if (body.solarRadius) {
      const scaled = Math.log10(Math.max(body.solarRadius, 0.1) * SOL_RADIUS_IN_KM) * 400
      return Math.min(Math.max(scaled, STAR_RADIUS * .5), STAR_RADIUS * 3)
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
          {systemObject?.isBarycentre && <h3>{systemObject.bodyName}</h3>}
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
