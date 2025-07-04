import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from 'components/header'
import { Toaster } from 'react-hot-toast'
// import { Canvas, useFrame } from '@react-three/fiber'
import { NavigationContext, DialogContext } from 'lib/context'
import 'css/index.css'
import 'public/fonts/icarus-terminal/icarus-terminal.css'
import { playLoadingSound } from 'lib/sounds'

function handleOnClick (e) {
  try {
    if (e.target.nodeName === 'TD' &&
        e.target.className.includes('rc-table-cell-row-hover') &&
        e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.className.includes('data-table--interactive')
    ) {
      playLoadingSound()
    }
  } catch (e) {
    console.error(e)
  }
}

export default ({ Component, pageProps }) => {
  const [navigationPath, setNavigationPath] = useState([])
  const [dialog, setDialog] = useState()

  useEffect(() => {
    document.body.addEventListener('click', handleOnClick)
    return () => {
      document.body.removeEventListener('click', handleOnClick)
    }
  }, [])
  return (
    <>
      <Head>
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/icon-180x180.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/icons/icon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/icons/icon-16x16.png' />
        <link rel='manifest' href='/manifest.json' />
        <meta property='og:image' content='https://ardent-insight.com/og-image.png' />
      </Head>
      <div className='layout__frame'>
        {/* <AnimatedBackground /> */}
        <div className='fx__background' />
        <NavigationContext.Provider value={[navigationPath, setNavigationPath]}>
          <DialogContext.Provider value={[dialog, setDialog]}>
            <div id='notifications' style={{ transition: '1s all ease-in-out', position: 'fixed', zIndex: 9999 }}>
              <Toaster
                containerStyle={{
                  bottom: '4.5rem',
                  right: '1rem'
                }}
                gutter={10}
                position='bottom-right'
                toastOptions={{
                  duration: 4000,
                  className: 'notification text-uppercase',
                  style: {
                    borderRadius: '0',
                    border: '.2rem solid var(--color-primary-10)',
                    background: 'var(--color-background-transparent)',
                    color: 'var(--color-text)',
                    minWidth: '300px',
                    maxWidth: '600px',
                    textAlign: 'left !important',
                    margin: '0 1rem',
                    boxShadow: '0 0 1rem black',
                    padding: 0
                  }
                }}
              />
            </div>
            <Header />
            <Component {...pageProps} />
          </DialogContext.Provider>
        </NavigationContext.Provider>
      </div>
      <div className='fx__scanlines' />
      <div className='fx__overlay' />
    </>
  )
}

/*
function Sphere (props) {
  const ref1 = useRef()
  const ref2 = useRef()
  const ref3 = useRef()
  useFrame((state, delta) => (ref1.current.rotation.y -= (delta / 32)))
  useFrame((state, delta) => (ref2.current.rotation.x -= (delta / 16)))
  useFrame((state, delta) => (ref3.current.rotation.z += (delta / 64)))
  return (
    <>
      <group
        {...props}
        ref={ref1}
        position={[3, 0, 0]}
        scale={2}
        rotation={[-10, 0, 0]}
      >
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial color='#666' wireframe />
        </mesh>
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial color='#666' vertexColors flatShading />
        </mesh>
      </group>
      <group
        {...props}
        ref={ref2}
        position={[3, 0, 0]}
        scale={2}
        rotation={[-10, 0, 0]}
      >
        <mesh>
          <sphereGeometry args={[2.8, 32, 32]} />
          <meshStandardMaterial color='#999' wireframe />
        </mesh>
      </group>
      <group
        {...props}
        ref={ref3}
        position={[3, 0, 0]}
        scale={2}
        rotation={[-10, 0, 0]}
      >
        <mesh>
          <sphereGeometry args={[3, 16, 16]} />
          <meshStandardMaterial color='#ccc' wireframe />
        </mesh>
      </group>
    </>
  )
}

function AnimatedBackground () {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0,
      animation: 'fx__fade-in-animation 1s 1s',
      animationFillMode: 'forwards'
    }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.25 }}>
        <Canvas>
          <ambientLight />
          <pointLight position={[-2, 1, 2]} color='#fff' intensity={50} />
          <Sphere />
        </Canvas>
      </div>
    </div>
  )
}
*/
