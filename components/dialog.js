import { useState, useEffect, useContext } from 'react'
import { DialogContext } from 'lib/context'

export default () => {
  const [dialogContext] = useContext(DialogContext)
  const [visible, setVisible] = useState(false)
  const [title, setTitle] = useState()
  const [contents, setContents] = useState()
  const [buttons, setButtons] = useState()

  useEffect(() => {
    if (!dialogContext) return
    ;(dialogContext?.visible === true) ? setVisible(true) : setVisible(false)
    ;(dialogContext?.title) ? setTitle(dialogContext.title) : setTitle('Dialog')
    ;(dialogContext?.contents) ? setContents(dialogContext.contents) : setContents(undefined)
    ;(dialogContext?.buttons) ? setButtons(dialogContext.buttons) : setButtons(<button className='button' onClick={() => setVisible(false)}>Close</button>)
  }, [dialogContext])

  useEffect(() => {
    setVisible(false) // Reset visibility to false if page state changes (e.g. page transition)
  }, [])

  if (!visible) return

  return (
    <>
      <div className='dialog__background fx__fade-in' onClick={() => setVisible(false)} />
      <div className='dialog fx__fade-in'>
        <h3 className='dialog__title'>{title}</h3>
        <div className='dialog__content scrollable'>
          {contents}
        </div>
        <div className='dialog__buttons'>
          {buttons}
        </div>
      </div>
    </>
  )
}
