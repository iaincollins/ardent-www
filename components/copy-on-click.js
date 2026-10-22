import { useRef } from 'react'
import notification from 'lib/notification'

export default function CopyOnClick ({ children, prepend, append }) {
  const selectableText = useRef()
  async function copyText (e) {
    e.preventDefault()

    const element = selectableText.current
    const ownerDocument = e.currentTarget.ownerDocument
    const ownerWindow = ownerDocument.defaultView
    const text = element.textContent

    try {
      const clipboard = ownerWindow?.navigator.clipboard
      if (clipboard?.writeText) {
        try {
          await clipboard.writeText(text)
        } catch {
          if (!copyFromSelection(ownerDocument, element)) return
        }
      } else if (!copyFromSelection(ownerDocument, element)) {
        return
      }

      notification(() => <p><span className='muted'>Copied text</span><br /><span className='text-no-transform'>{`"${text}"`}</span></p>)
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

function copyFromSelection (ownerDocument, element) {
  const selection = ownerDocument.getSelection()
  if (!selection || !ownerDocument.execCommand) return false

  const range = ownerDocument.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
  const copied = ownerDocument.execCommand('copy')
  selection.removeAllRanges()
  return copied
}
