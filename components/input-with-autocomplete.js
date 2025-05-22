import { useState, useEffect, useRef } from 'react'



export default ({
  id = 'input-with-autocomplete',
  label = 'Input',
  name = 'input',
  placeholder = '',
  defaultValue = '',
  onChange = (e) => { },
  onSelect = (text) => { },
  autoCompleteResults,
  onClear
}) => {
  const inputRef = useRef()
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
        const dataObj = JSON.parse(e.target.dataset.autoCompleteOption)
        const text = dataObj.text
        inputRef.current.value = text
        inputRef.current.dataset.autoCompleteOption = dataObj
        onSelect(text, dataObj)
        document.activeElement.blur()
        setFocus(false)
      }
    }
    const resultElements = document.querySelector(`#${id}`)
    resultElements.addEventListener('click', onSelectResult)
    return () => document.removeEventListener('click', onSelectResult)
  }, [])

  function inputOnFocusHandler(e) {
    setFocus(true)
    onChange(e)
    inputRef.current.select()
    // This seems to be required on Chrome (seems to be a known issue)
    setTimeout(() => {
      if (window?.getSelection()?.toString() !== inputRef.current.value) {
        inputRef.current.select()
      }
    }, 200)
  }

  function inputOnBlurHandler() {
    let matchFound = false
    if (_autoCompleteResults) {
      for (const result of _autoCompleteResults) {
        if (inputRef.current.value.toLowerCase() === result?.text?.toLowerCase()) {
          inputRef.current.value = result.text
          onSelect(result.text, result)
          matchFound = true
          break
        }
      }
    }
    if (!matchFound) {
      if (inputRef.current.value.trim() === '') {
        onSelect(null, null)
      } else {
        onSelect(inputRef.current.value, null)
      }
    }
    setTimeout(() => {
      setFocus(false)
      if (document.activeElement?.name === name) {
        document.activeElement.blur()
      }
    }, 200)
  }

  function inputOnChangeHandler(e) {
    if (focus === true) {
      onChange(e)
    }
  }

  function inputOnKeyDownHandler(e) {
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
          ref={inputRef}
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
          <div className={`input-with-autocomplete__results-dropdown`}>
            <div ref={resultsRef} className='input-with-autocomplete__results scrollable'>
              {_autoCompleteResults.map((result, i) =>
                <div key={`autocomplete-${name}-${result.value}-${i}`}>
                  {!result?.seperator &&
                    <p
                      className={`input-with-autocomplete__result ${result?.className ?? ''} ${result?.icon ? 'input-with-autocomplete__result--with-icon' : ''}`}
                      data-auto-complete-option={JSON.stringify(result)}
                      data-auto-complete-result={true}
                    >
                      {result?.icon && <i className={`input-with-autocomplete__result-icon icarus-terminal-${result?.icon}`} style={{ pointerEvents: 'none' }} />}
                      {result.text}
                    </p>
                  }
                  {result?.seperator === true && <hr key={`seperator-${i}`} style={{ margin: '.25rem 0' }} />}
                </div>
              )}
            </div>
          </div>}
          {onClear !== undefined && inputRef?.current?.value !== '' && <div className='input-with-autocomplete__clear' onClick={onClear}>✖</div>}
      </label>
    </div>
  )
}