import { useState, useEffect, useRef } from 'react'

export default ({
  id = 'inputWithAutocomplete',
  forwardRef = useRef(),
  label = 'Input',
  name = 'input',
  placeholder = '',
  defaultValue = '',
  onChange = (e) => { },
  onSelect = (text) => { },
  onFocus = (e) => { },
  onBlur = (e) => { },
  autoCompleteResults,
  onClear
}) => {
  const containerRef = useRef()
  const resultsRef = useRef()
  const [focus, setFocus] = useState(false)
  const [_autoCompleteResults, _setAutoCompleteResults] = useState()
  const [highlightedResult, setHighlightedResult] = useState(-1)

  useEffect(() => {
    _setAutoCompleteResults(autoCompleteResults)
    setHighlightedResult(-1)
    if (resultsRef?.current?.scrollTop) resultsRef.current.scrollTop = 0
  }, [autoCompleteResults])

  function isSelectableResult (index) {
    const result = _autoCompleteResults?.[index]
    return Boolean(result && !result.disabled && !result.seperator)
  }

  function selectResult (result) {
    const text = result.text
    forwardRef.current.value = text
    forwardRef.current.dataset.autoCompleteOption = JSON.stringify(result)
    onSelect(text, result)
    forwardRef.current.blur()
    setFocus(false)
  }

  useEffect(() => {
    const onSelectResult = (e) => {
      const resultElement = e.target.closest?.('[data-auto-complete-result]')
      if (resultElement && containerRef.current.contains(resultElement)) {
        e.preventDefault()
        selectResult(JSON.parse(resultElement.dataset.autoCompleteOption))
      }
    }
    const resultElements = containerRef.current
    if (!resultElements) return
    resultElements.addEventListener('click', onSelectResult)
    return () => resultElements.removeEventListener('click', onSelectResult)
  }, [forwardRef, onSelect])

  function inputOnFocusHandler (e) {
    setFocus(true)
    onFocus(e)
    onChange(e)
    forwardRef.current.select()
    // This seems to be required on Chrome (seems to be a known issue)
    setTimeout(() => {
      if (forwardRef.current.ownerDocument.defaultView?.getSelection()?.toString() !== forwardRef.current.value) {
        forwardRef.current.select()
      }
    }, 200)
  }

  function inputOnBlurHandler (e) {
    setTimeout(() => {
      setFocus(false)
      const activeElement = forwardRef.current.ownerDocument.activeElement
      if (activeElement?.name === name) {
        activeElement.blur()
      }
      onBlur(e)
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
      if (e.key === 'Enter') e.stopPropagation()
      if (e.key === 'Enter') {
        const firstSelectableResult = (_autoCompleteResults ?? []).findIndex((result, index) => isSelectableResult(index))
        const resultIndex = isSelectableResult(highlightedResult) ? highlightedResult : firstSelectableResult
        if (resultIndex !== -1) {
          selectResult(_autoCompleteResults[resultIndex])
        } else {
          onSelect(e.target.value)
        }
      }
      setTimeout(() => {
        setFocus(false)
        const activeElement = forwardRef.current.ownerDocument.activeElement
        if (activeElement?.name === name) {
          activeElement.blur()
        }
      }, 200)
    } else if (e.key === 'ArrowDown') {
      const results = _autoCompleteResults ?? []
      const nextResult = results.findIndex((result, index) => index > highlightedResult && !result?.disabled && !result?.seperator)
      if (results.some(result => !result?.disabled && !result?.seperator)) e.preventDefault()
      if (nextResult !== -1) {
        setHighlightedResult(nextResult)
      }
    } else if (e.key === 'ArrowUp') {
      const results = _autoCompleteResults ?? []
      let previousResult = -1
      const startIndex = highlightedResult < 0 ? results.length - 1 : highlightedResult - 1
      if (results.some(result => !result?.disabled && !result?.seperator)) e.preventDefault()
      for (let index = Math.min(startIndex, results.length - 1); index >= 0; index--) {
        if (!results[index]?.disabled && !results[index]?.seperator) {
          previousResult = index
          break
        }
      }
      if (previousResult !== -1) {
        setHighlightedResult(previousResult)
      }
    }
  }

  return (
    <div id={id} ref={containerRef} className='input-with-autocomplete'>
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
                      onMouseEnter={() => setHighlightedResult(i)}
                      className={`input-with-autocomplete__result ${highlightedResult === i ? 'input-with-autocomplete__result-highlighted' : ''} ${result?.className ?? ''} ${result?.icon ? 'input-with-autocomplete__result--with-icon' : ''}`}
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
