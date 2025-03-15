import React, { useRef, useState } from 'react'
import Head from 'next/head'
import Header from 'components/header'
import { Canvas, useFrame } from '@react-three/fiber'
import { NavigationContext } from 'lib/context'
import 'css/index.css'
import 'public/fonts/icarus-terminal/icarus-terminal.css'

export default ({ Component, pageProps }) => {
  const [navigationPath, setNavigationPath] = useState([])
  return (
    <>
      <Head>
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='manifest' href='/manifest.json' />
        <meta property='og:image' content='https://ardent-industry.com/og-image.png' />
      </Head>
      <div className='layout__frame'>
        <AnimatedBackground />
        <div className='fx__background' />
        <NavigationContext.Provider value={[navigationPath, setNavigationPath]}>
          <Header />
          <Component {...pageProps} />
        </NavigationContext.Provider>
      </div>
      <div className='fx__scanlines' />
      <div className='fx__overlay' />
    </>
  )
}

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
