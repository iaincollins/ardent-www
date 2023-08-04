import React, { useRef } from 'react'
import App from 'next/app'
import Head from 'next/head'
import Header from 'components/header'
import { Canvas, useFrame } from '@react-three/fiber'
import 'css/index.css'
import 'public/fonts/icarus-terminal/icarus-terminal.css'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props
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
          <Header />
          <div className='layout__content scrollable'>
            <Component {...pageProps} />
          </div>
        </div>
        <div className='fx__scanlines' />
        <div className='fx__overlay' />
      </>
    )
  }
}

function Sphere (props) {
  const ref = useRef()
  useFrame((state, delta) => (ref.current.rotation.y += (delta / 32)))
  return (
    <group
      {...props}
      ref={ref}
      position={[3, 0, 0]}
      scale={2}
    >
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color='#eee' wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial color='#666' />
      </mesh>
    </group>
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
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.75 }}>
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Sphere />
        </Canvas>
      </div>
    </div>
  )
}
