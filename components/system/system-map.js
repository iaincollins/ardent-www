import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import factionStates from 'lib/utils/faction-states'
import { scanSystemSound } from 'lib/sounds'
import CopyOnClick from 'components/copy-on-click'

const SYSTEM_MAP_DEFAULT_ZOOM_MULTIPLIER = 50
const SYSTEM_MAP_DRAG_THRESHOLD = 8
const SYSTEM_MAP_KEYBOARD_STEP = 1

module.exports = ({
  system,
  systemStatus,
  nearbySystems,
  onMapCenterChange,
  stationsInSystem,
  settlementsInSystem,
  megashipsInSystem,
  fleetCarriersInSystem,
  bodiesInSystem,
  lastUpdatedAt
}) => {
  const router = useRouter()
  const [mapZoomMultiplier, setMapZoomMultiplier] = useState(SYSTEM_MAP_DEFAULT_ZOOM_MULTIPLIER)
  const [starsVisible, setStarsVisible] = useState(false)
  const [mapCenter, setMapCenter] = useState(() => ({ x: system.systemX, z: system.systemZ }))
  const [coordinateY, setCoordinateY] = useState(system.systemY)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)
  const [cursorPosition, setCursorPosition] = useState()
  const mapElement = useRef()
  const drag = useRef()
  const suppressClick = useRef(false)

  useEffect(() => {
    setMapCenter({ x: system.systemX, z: system.systemZ })
    setCoordinateY(system.systemY)
    setHasDragged(false)
  }, [system.systemAddress])

  const handlePointerDown = event => {
    const point = event.target.closest('.system-map__point')
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      deltaY: 0,
      systemAddress: point?.dataset.systemAddress,
      isHighlighted: point?.classList.contains('system-map__point--highlighted'),
      moved: false
    }
  }

  const handlePointerMove = event => {
    const rect = mapElement.current?.getBoundingClientRect()
    if (rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
      const offset = drag.current?.pointerId === event.pointerId ? {
        x: event.clientX - drag.current.startX,
        y: event.clientY - drag.current.startY
      } : dragOffset
      setCursorPosition({
        x: mapCenter.x + (event.clientX - rect.left - rect.width / 2 - offset.x) / mapZoomMultiplier,
        y: coordinateY,
        z: mapCenter.z + (event.clientY - rect.top - rect.height / 2 - offset.y) / mapZoomMultiplier
      })
    } else {
      setCursorPosition(undefined)
    }

    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    const x = event.clientX - drag.current.startX
    const y = event.clientY - drag.current.startY
    if (Math.hypot(x, y) > SYSTEM_MAP_DRAG_THRESHOLD) {
      drag.current.moved = true
      setHasDragged(true)
    }
    drag.current.deltaX = x
    drag.current.deltaY = y
    setDragOffset({ x, y })
  }

  const handlePointerUp = event => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    const { deltaX, deltaY, moved, systemAddress, isHighlighted } = drag.current
    drag.current = undefined
    setDragOffset({ x: 0, y: 0 })
    if (!moved) {
      if (systemAddress) router.push(`/system/${systemAddress}${isHighlighted ? '/bodies' : ''}`)
      return
    }
    suppressClick.current = true
    setTimeout(() => { suppressClick.current = false }, 100)
    const center = {
      x: mapCenter.x - deltaX / mapZoomMultiplier,
      z: mapCenter.z - deltaY / mapZoomMultiplier
    }
    setMapCenter(center)
    onMapCenterChange?.({ ...center, y: coordinateY })
  }

  const handlePointerCancel = event => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    drag.current = undefined
    setDragOffset({ x: 0, y: 0 })
  }

  const updateMapCenter = center => {
    setMapCenter(center)
    setCursorPosition({ x: center.x, y: coordinateY, z: center.z })
    onMapCenterChange?.({ ...center, y: coordinateY })
  }

  const updateCoordinateY = delta => {
    const y = coordinateY + delta
    setCoordinateY(y)
    setCursorPosition(position => ({
      x: position?.x ?? mapCenter.x,
      y,
      z: position?.z ?? mapCenter.z
    }))
    onMapCenterChange?.({ x: mapCenter.x, y, z: mapCenter.z })
  }

  const handleMapWheel = event => {
    if (event.deltaY === 0) return

    event.preventDefault()
    updateCoordinateY(event.deltaY < 0 ? SYSTEM_MAP_KEYBOARD_STEP : -SYSTEM_MAP_KEYBOARD_STEP)
  }

  const handleMapKeyDown = event => {
    if (event.target !== event.currentTarget) return

    const key = event.code === 'NumpadAdd' ? '+' : event.code === 'NumpadSubtract' ? '-' : event.key
    const center = { ...mapCenter }
    switch (key) {
      case 'ArrowUp':
        center.z -= SYSTEM_MAP_KEYBOARD_STEP
        break
      case 'ArrowDown':
        center.z += SYSTEM_MAP_KEYBOARD_STEP
        break
      case 'ArrowLeft':
        center.x -= SYSTEM_MAP_KEYBOARD_STEP
        break
      case 'ArrowRight':
        center.x += SYSTEM_MAP_KEYBOARD_STEP
        break
      case '+':
        event.preventDefault()
        updateCoordinateY(SYSTEM_MAP_KEYBOARD_STEP)
        return
      case '-':
        event.preventDefault()
        updateCoordinateY(-SYSTEM_MAP_KEYBOARD_STEP)
        return
      default:
        return
    }

    event.preventDefault()
    updateMapCenter(center)
  }

  useEffect(() => {
    scanSystemSound()
    setStarsVisible(false)
    mapElement.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (nearbySystems !== undefined) {
      if (nearbySystems?.length >= 1000) {
        setMapZoomMultiplier(150)
      } else if (nearbySystems?.length >= 500) {
        setMapZoomMultiplier(100)
      } else if (nearbySystems?.length >= 100) {
        setMapZoomMultiplier(75)
      } else {
        setMapZoomMultiplier(SYSTEM_MAP_DEFAULT_ZOOM_MULTIPLIER)
      }
      setTimeout(() => setStarsVisible(true), 1000)
    }
  }, [nearbySystems])

  return (
    <div className='fx__fade-in' style={{ position: 'relative' }}>
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
          {bodiesInSystem !== undefined &&
            stationsInSystem !== undefined &&
            settlementsInSystem !== undefined &&
            megashipsInSystem !== undefined &&
            fleetCarriersInSystem !== undefined &&
              <>
                {bodiesInSystem?.length === 0 && stationsInSystem?.length === 0 &&
                  <p className='fx__fade-in text-blink-slow' style={{ height: '1.75rem' }}>
                    <i className='icon icarus-terminal-warning muted' style={{ position: 'relative', top: '.1rem', fontSize: '1.25rem' }} />
                    <small>
                      System not scanned
                    </small>
                  </p>}
                {bodiesInSystem?.filter(b => b.bodyType === 'Star')?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-star' /> {bodiesInSystem?.filter(b => b.bodyType === 'Star')?.length}</p>}
                {bodiesInSystem?.filter(b => b.bodyType === 'Planet')?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-planet' /> {bodiesInSystem?.filter(b => b.bodyType === 'Planet')?.length}</p>}
                {stationsInSystem?.filter(s => s.stationType === 'Dodec')?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-dodec-starport' /> {stationsInSystem?.filter(s => s.stationType === 'Dodec')?.length}</p>}
                {stationsInSystem?.filter(s => s.stationType === 'Orbis')?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-orbis-starport' /> {stationsInSystem?.filter(s => s.stationType === 'Orbis')?.length}</p>}
                {stationsInSystem?.filter(s => s.stationType === 'Coriolis')?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-coriolis-starport' /> {stationsInSystem?.filter(s => s.stationType === 'Coriolis')?.length}</p>}
                {stationsInSystem?.filter(s => s.stationType === 'Ocellus')?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-ocellus-starport' /> {stationsInSystem?.filter(s => s.stationType === 'Ocellus')?.length}</p>}
                {stationsInSystem?.filter(s => s.stationType === 'AsteroidBase')?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-asteroid-base' /> {stationsInSystem?.filter(s => s.stationType === 'AsteroidBase')?.length}</p>}
                {stationsInSystem?.filter(s => s.stationType === 'Outpost')?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-outpost' /> {stationsInSystem?.filter(s => s.stationType === 'Outpost')?.length}</p>}
                {stationsInSystem?.filter(s => (s.stationType === 'CraterPort' || s.stationType === 'CraterOutpost'))?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-planetary-port' /> {stationsInSystem?.filter(s => (s.stationType === 'CraterPort' || s.stationType === 'CraterOutpost'))?.length}</p>}
                {settlementsInSystem?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-settlement' /> {settlementsInSystem.length}</p>}
                {megashipsInSystem?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-megaship' /> {megashipsInSystem.length}</p>}
                {fleetCarriersInSystem?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-fleet-carrier' /> {fleetCarriersInSystem.length}</p>}
                {stationsInSystem?.filter(s => (s.stationType === 'PlanetaryConstructionDepot' || s.stationType === 'SpaceConstructionDepot' || s.stationType === 'SurfaceStation'))?.length > 0 &&
                  <p className='fx__fade-in'><i className='icon icarus-terminal-poi-empty' /> {stationsInSystem.filter(s => (s.stationType === 'PlanetaryConstructionDepot' || s.stationType === 'SpaceConstructionDepot' || s.stationType === 'SurfaceStation')).length}</p>}
              </>}
        </div>

        {system !== undefined &&
          <div className='system-map__location'>
            <p>
              <small className='fx__animated-text' data-fx-order='1'>
                <span className='muted'>SYS ADDR</span> <CopyOnClick>{system.systemAddress}</CopyOnClick>
              </small>
              <br />
              <small className='fx__animated-text' data-fx-order='1' style={{ paddingRight: '1rem' }}>
                <span className='muted'>SYS POS</span> <CopyOnClick>{system.systemX}, {system.systemY}, {system.systemZ}</CopyOnClick>
              </small>
              <br />
              <small style={{ opacity: 1 }} className='fx__animated-text' data-fx-order='2'>
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

        {systemStatus !== undefined && systemStatus !== null &&
          <div className='system-map__system-status'>

            {systemStatus.faction &&
              <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='4'>
                <i className='icon icarus-terminal-system-authority' />
                <CopyOnClick>{systemStatus.faction}</CopyOnClick>
              </span>}

            {systemStatus.government &&
              <span style={{ display: 'block' }} className='fx__animated-text' data-fx-order='5'>
                <i className='icon icarus-terminal-power' />
                {systemStatus.allegiance}
                {(systemStatus.allegiance || systemStatus.government) && ' '}
                {systemStatus.government}
              </span>}

            {systemStatus.economy && systemStatus.economy.primary && systemStatus.economy.primary !== 'None' &&
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
                  : systemStatus.state}
                <small> {timeBetweenTimestamps(lastUpdatedAt)} ago</small>
              </span>}

            <span style={{ display: 'block' }} className='fx__fade-in'>
              <small>Stellar cartography enhanced by EDSM.NET</small>
            </span>

          </div>}

      </div>
      <div
        ref={mapElement}
        className={`system-map${hasDragged ? ' system-map--no-animations' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setCursorPosition(undefined)}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleMapWheel}
        onKeyDown={handleMapKeyDown}
        tabIndex={0}
        role='region'
        aria-label='Star map. Use arrow keys to pan.'
        onClickCapture={event => {
          if (suppressClick.current) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
        style={{ touchAction: 'none' }}
      >
        {cursorPosition !== undefined &&
          <div className='system-map__cursor-position' aria-live='off'>
            <span className='muted'>
              X {cursorPosition.x.toFixed(2)}<br/>
              Y {cursorPosition.y.toFixed(2)}<br/>
              Z {cursorPosition.z.toFixed(2)}
            </span>
          </div>}
        <div className='system-map__stars' style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}>
        <div
          className='system-map__point system-map__point--highlighted'
          style={{
            top: `calc(50% + ${(system.systemZ - mapCenter.z) * mapZoomMultiplier}px)`,
            left: `calc(50% + ${(system.systemX - mapCenter.x) * mapZoomMultiplier}px)`
          }}
          data-name={system.systemName}
          data-system-address={system.systemAddress}
          role='button'
          tabIndex={0}
          aria-label={`View bodies in ${system.systemName}`}
          onClick={() => router.push(`/system/${system.systemAddress}/bodies`)}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              router.push(`/system/${system.systemAddress}/bodies`)
            }
          }}
        />
        {/* {system && nearbySystems === undefined && <div className='system-map__scanner'/>} */}
        <div className={`system-map__scanner${(!system || nearbySystems !== undefined) ? '--stopped' : ''}`} />
        {starsVisible && nearbySystems && nearbySystems.map((nearbySystem, i) =>
          <div
            key={nearbySystem.systemAddress}
            className='system-map__point fx__fade-in'
            onClick={() => router.push(`/system/${nearbySystem.systemAddress}`)}
            data-name={nearbySystem.systemName}
            data-system-address={nearbySystem.systemAddress}
            role='button'
            tabIndex={0}
            aria-label={`View ${nearbySystem.systemName}`}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                router.push(`/system/${nearbySystem.systemAddress}`)
              }
            }}
            style={{
              // animationDelay: `${distance([nearbySystem.systemX, nearbySystem.systemY, nearbySystem.systemZ],[system.systemX, system.systemY, system.systemZ]) * 1000}ms`,
              top: `calc(50% + ${(nearbySystem.systemZ - mapCenter.z) * mapZoomMultiplier}px)`,
              left: `calc(50% + ${(nearbySystem.systemX - mapCenter.x) * mapZoomMultiplier}px)`
            }}
          />
        )}
        </div>
      </div>
    </div>

  )
}
