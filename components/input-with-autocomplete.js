import { useState, useEffect, useRef } from 'react'

export default ({
  id = 'input-with-autocomplete',
  forwardRef = useRef(),
  label = 'Input',
  name = 'input',
  placeholder = '',
  defaultValue = '',
  onChange = (e) => { },
  onSelect = (text) => { },
  autoCompleteResults,
  onClear
}) => {
  const resultsRef = useRef()
  const [focus, setFocus] = useState(false)
  const [_autoCompleteResults, _setAutoCompleteResults] = useState()

  useEffect(() => {
    _setAutoCompleteResults(autoCompleteResults)
    if (resultsRef?.current?.scrollTop) resultsRef.current.scrollTop = 0
  }, [autoCompleteResults])

  useEffect(() => {
    const onSelectResult = (e) => {
      if (e.target.dataset.autoCompleteResult) {
        e.preventDefault()
        const dataObj = JSON.parse(e.target.dataset.autoCompleteOption)
        const text = dataObj.text
        forwardRef.current.value = text
        forwardRef.current.dataset.autoCompleteOption = JSON.stringify(dataObj)
        onSelect(text, dataObj)
        document.activeElement.blur()
        setFocus(false)
      }
    }
    const resultElements = document.querySelector(`#${id}`)
    resultElements.addEventListener('click', onSelectResult)
    return () => document.removeEventListener('click', onSelectResult)
  }, [])

  function inputOnFocusHandler (e) {
    setFocus(true)
    onChange(e)
    forwardRef.current.select()
    // This seems to be required on Chrome (seems to be a known issue)
    setTimeout(() => {
      if (window?.getSelection()?.toString() !== forwardRef.current.value) {
        forwardRef.current.select()
      }
    }, 200)
  }

  function inputOnBlurHandler () {
    setTimeout(() => {
      setFocus(false)
      if (document.activeElement?.name === name) {
        document.activeElement.blur()
      }
    }, 200)
  }

  function inputOnChangeHandler (e) {
    if (focus === true) {
      onChange(e)
    }
  }

  function inputOnKeyDownHandler (e) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      setTimeout(() => {
        setFocus(false)
        if (document.activeElement?.name === name) {
          document.activeElement.blur()
        }
      }, 200)
    }
  }

  return (
    <div id={id} className='input-with-autocomplete'>
      <label className='input-with-autocomplete__label'>
        <span className='input-with-autocomplete__label-text'>{label}</span>
        <input
          id={`${id}-input`}
          ref={forwardRef}
          type='text'
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onFocus={inputOnFocusHandler}
          onBlur={inputOnBlurHandler}
          onChange={inputOnChangeHandler}
          onKeyDown={inputOnKeyDownHandler}
          autoComplete='off'
          // The use of a class for focus, rather than using :focus in CSS is to allow better control of the apperance
          // of the control and the dropdown menu to avoid flickering during interactions
          className={`input-with-autocomplete__input ${focus === true ? 'input-with-autocomplete__input--with-focus' : ''}`}
        />
        {focus === true && _autoCompleteResults?.length > 0 &&
          <div className='input-with-autocomplete__results-dropdown'>
            <div ref={resultsRef} className='input-with-autocomplete__results scrollable'>
              {_autoCompleteResults.map((result, i) =>
                <div key={`autocomplete-${name}-${result.value}-${i}`}>
                  {!result?.seperator && !result.disabled &&
                    <p
                      className={`input-with-autocomplete__result ${result?.className ?? ''} ${result?.icon ? 'input-with-autocomplete__result--with-icon' : ''}`}
                      data-auto-complete-option={JSON.stringify(result)}
                      data-auto-complete-result
                    >
                      {result?.icon && <i className={`input-with-autocomplete__result-icon icarus-terminal-${result?.icon}`} style={{ pointerEvents: 'none' }} />}
                      {result.text}
                    </p>}
                  {result?.disabled === true && <p className='input-with-autocomplete__result input-with-autocomplete__result--disabled muted'>{result?.text}</p>}
                  {result?.seperator === true && <hr key={`seperator-${i}`} style={{ margin: '.25rem 0' }} />}
                </div>
              )}
            </div>
          </div>}
        {onClear !== undefined && forwardRef?.current?.value !== '' && <div className='input-with-autocomplete__clear' onClick={onClear}>✖</div>}
      </label>
    </div>
  )
}
