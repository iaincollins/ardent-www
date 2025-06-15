import { useRef } from 'react'
import notification from 'lib/notification'

export default function CopyOnClick ({ children, prepend, append }) {
  const selectableText = useRef()
  function copyText (e) {
    try {
      e.preventDefault()
      const text = selectableText.current.innerHTML
      document.execCommand('copy')
      navigator.clipboard.writeText(text)
      notification(() => <p><span className='muted'>Copied text</span><br /><span className='text-no-transform'>{`"${text}"`}</span></p>)
      window.getSelection().removeAllRanges()
    } catch { /* don't care */ }
  }
  return (
    <span className='selectable selectable-wrapper' onClick={copyText} title='Click to copy text'>
      {prepend}
      <span ref={selectableText} className='selectable'>{children}</span>
      {append}
    </span>
  )
}
