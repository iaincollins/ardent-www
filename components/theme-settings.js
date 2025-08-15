import { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useDebouncedCallback } from 'use-debounce'

const MIN_CONTRAST = 0.9
const MAX_CONTRAST = 1.75

module.exports = () => {
  const hue = window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-hue')
  const saturation = window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary-saturation')
  const contrast = window.getComputedStyle(document.documentElement).getPropertyValue('--contrast')
  const lightness = 100 - convertNumberToPercentage(contrast, MIN_CONTRAST, MAX_CONTRAST)
  const hueShift = window.getComputedStyle(document.documentElement).getPropertyValue('--highlight-hue-shift')
  const currentColor = hsl2hex(hue, saturation.replace('%', ''), lightness)

  const [color, setColor] = useState(currentColor)
  const [highlightHueShift, setHighlightHueShift] = useState(hueShift)

  useEffect(() => {
    document.getElementById('highlight-color-hue-shift').value = hueShift
  }, [])

  useEffect(() => {
    saveChanges()
  }, [color, highlightHueShift])

  const onColorChange = useDebouncedCallback(
    (hexColor) => setColor(hexColor),
    100
  )

  const onChangeHighlightHueShift = useDebouncedCallback(
    (e) => setHighlightHueShift(e.target.value),
    100
  )

  const saveChanges = () => {
    const { h, s, l } = hex2hsl(color)
    document.documentElement.style.setProperty('--color-primary-hue', h)
    document.documentElement.style.setProperty('--color-primary-saturation', `${s}%`)
    const contrast = convertPercentageToRange((100 - l), MIN_CONTRAST, MAX_CONTRAST)
    document.documentElement.style.setProperty('--contrast', contrast)
    document.documentElement.style.setProperty('--highlight-hue-shift', highlightHueShift)
    window.localStorage.setItem('theme-settings', JSON.stringify({ hue: h, saturation: s, contrast, highlightHueShift, timestamp: Date.now() }))
  }

  const resetToDefaults = () => {
    const defaultHue = window.getComputedStyle(document.documentElement).getPropertyValue('--default-color-primary-hue')
    const defaultSaturation = window.getComputedStyle(document.documentElement).getPropertyValue('--default-color-primary-saturation')
    const defaultContrast = window.getComputedStyle(document.documentElement).getPropertyValue('--default-contrast')
    const defaultHilightHueShift = window.getComputedStyle(document.documentElement).getPropertyValue('--default-highlight-hue-shift')
    document.documentElement.style.setProperty('--color-primary-hue', defaultHue)
    document.documentElement.style.setProperty('--color-primary-saturation', defaultSaturation)
    document.documentElement.style.setProperty('--contrast', defaultContrast)
    document.documentElement.style.setProperty('--highlight-hue-shift', defaultHilightHueShift)
    window.localStorage.removeItem('theme-settings')
    const lightness = 100 - convertNumberToPercentage(defaultContrast, MIN_CONTRAST, MAX_CONTRAST)
    setColor(hsl2hex(defaultHue, defaultSaturation.replace('%', ''), lightness))
    setHighlightHueShift(defaultHilightHueShift)
    document.getElementById('highlight-color-hue-shift').value = defaultHilightHueShift
  }

  return (
    <div style={{ minWidth: '210px', minHeight: '10rem', paddingLeft: '.5rem' }}>
      <div style={{ marginTop: '.5rem', marginBottom: '.5rem' }}>
        <HexColorPicker color={color} onChange={onColorChange} />
      </div>
      <div style={{width: 'calc(100% - .5rem)'}}>
        {Array.from({ length: 11 }, (_, i) => i).map((number) => (
          <div key={number} style={{ aspectRatio: '1', width: '9%', background: `var(--color-primary-${number})`, display: 'inline-block' }} />
        ))}
      </div>
      <div style={{width: 'calc(100% - .5rem)'}}>
        {Array.from({ length: 11 }, (_, i) => i).map((number) => (
          <div key={number} style={{ aspectRatio: '1', width: '9%', background: `var(--color-highlight-${number})`, display: 'inline-block' }} />
        ))}
      </div>
      <p style={{ fontSize: '.8rem', marginTop: '.5rem', marginBottom: '.25rem', opacity: .75 }}>
        Highlight color shift
      </p>
      <div style={{width: 'calc(100% - .5rem)'}}>
        <input style={{ width: '99%'}} type='range' id='highlight-color-hue-shift' name='highlight-color-hue-shift' min='0' max='360' onChange={onChangeHighlightHueShift} />
      </div>
      <p className='text-center' onClick={resetToDefaults}>RESET</p>
    </div>
  )
}

const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

const rgb2hex = (r, g, b) => {
  const rgb = (r << 16) | (g << 8) | b
  return '#' + rgb.toString(16).padStart(6, 0)
}

const hex2hsl = (hex) => {
  // Convert hex to RGB first
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h; let s; let l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return { h, s, l }
}

const hsl2hex = (h, s, l) => {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function convertPercentageToRange (percentage, startOfRange, endOfRange) {
  if (percentage < 0 || percentage > 100) {
    console.error('Percentage must be between 0 and 100.')
    return null
  }
  const decimal = percentage / 100
  const convertedValue = startOfRange + (endOfRange - startOfRange) * decimal
  return convertedValue
}

function convertNumberToPercentage (number, startOfRange, endOfRange) {
  if (startOfRange === endOfRange) {
    console.error('The start and end of the range cannot be the same.')
    return null
  }
  const position = number - startOfRange
  const rangeSize = endOfRange - startOfRange
  const percentage = (position / rangeSize) * 100
  return Math.max(0, Math.min(100, percentage))
}
