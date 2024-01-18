import { useState, useEffect } from 'react'
import Link from 'next/link'
import AboutDialog from 'components/dialog/about-dialog'

export default () => {
  const [fullScreenState, setFullScreenState] = useState(false)
  const [aboutDialogVisible, setAboutDialogVisible] = useState(false)

  useEffect(() => {
    document.addEventListener('fullscreenchange', onFullScreenChangeHandler)
    return () => document.removeEventListener('click', onFullScreenChangeHandler)
    function onFullScreenChangeHandler (event) {
      setFullScreenState(isFullScreen())
    }
  }, [])

  return (
    <header>
      <Link href='/' className='--no-hover' style={{ border: 'none' }}>
        <div className='header__logo'>
          <h1>
            <em>A</em>rdent
            <span className='is-hidden-mobile'>
              {' '}<em>I</em>ndustry
            </span>
          </h1>
          <p style={{ fontStyle: 'italic' }}>
            Trade &amp; Exploration
          </p>
        </div>
      </Link>
      <div className='header__navigation' style={{ display: 'block' }}>
        {/* <Link href='/commodities'>
          <button className='button'><i className='icon icarus-terminal-cargo' /></button>
        </Link>
        <button className='button'><i className='icon icarus-terminal-system-orbits' /></button> */}
        <button
          className='button'
          onClick={() => setAboutDialogVisible(!aboutDialogVisible)}
        >
          <i className='icon icarus-terminal-info' />
        </button>
        <button className='button' onClick={() => toggleFullScreen()}>
          <i className={`icon ${fullScreenState === true ? 'icarus-terminal-exit' : 'icarus-terminal-fullscreen'}`} />
        </button>
      </div>
      {aboutDialogVisible && <AboutDialog toggle={setAboutDialogVisible} />}
    </header>
  )
}

function isFullScreen () {
  if (typeof document === 'undefined') return false

  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.webkitCurrentFullScreenElement) {
    return false
  } else {
    return true
  }
}

async function toggleFullScreen () {
  if (isFullScreen()) {
    if (document.cancelFullScreen) {
      document.cancelFullScreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
    return false
  } else {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen()
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen()
    }
    return true
  }
}
