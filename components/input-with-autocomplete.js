import { useState, useEffect, useRef } from 'react'

export default ({
  id = 'input-with-autocomplete',
  label = 'Input',
  name = 'input',
  placeholder = '',
  defaultValue = '',
  onChange = (e) => { },
  onSelect = (text) => { },
  autoCompleteResults
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
      if (e.target.className.includes('input-with-autocomplete__result')) {
        inputRef.current.value = e.target.innerText
        inputRef.current.dataset.autoCompleteOption = e.target.dataset?.autoCompleteOption
        onSelect(e.target.innerText, JSON.parse(e.target.dataset?.autoCompleteOption))
        document.activeElement.blur()
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

  function inputOnBlurHandler(e) {
    _autoCompleteResults.forEach(result => {
      if (result.text.toLowerCase() === inputRef.current.value.toLowerCase()) {
        inputRef.current.value = result.text
        onSelect(result.text, result)
      }
    })
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
    <div className='input-with-autocomplete'>
      <label id={id} className='input-with-autocomplete__label'>
        <span className='input-with-autocomplete__label-text'>{label}</span>
        <input
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
          className='input-with-autocomplete__input'
        />
        {focus === true && _autoCompleteResults?.length > 0 &&
        <div className='input-with-autocomplete__results-dropdown'>
          <div ref={resultsRef} className='input-with-autocomplete__results scrollable'>
            {_autoCompleteResults.map((result, i) =>
              <p key={`autocomplete-${name}-${result.value}`}
                className={`input-with-autocomplete__result ${result.className}`}
                data-auto-complete-option={JSON.stringify(result)}
              >
                {result.text}
              </p>)}
              </div>
          </div>}
      </label>
    </div>
  )
}