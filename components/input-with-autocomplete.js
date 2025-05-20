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
        onSelect(e.target.innerText)
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
    _autoCompleteResults.forEach(r => {
      if (r.value.toLowerCase() === inputRef.current.value.toLowerCase()) {
        inputRef.current.value = r.value
        onSelect(r.value)
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
        {/* {focus === true && inputRef?.current?.value !== '' &&
          <div className='input-with-autocomplete__clear-input'
            style={{
              position: 'absolute',
              right: '.5rem',
              top: '1.5rem'
            }}
            onClick={(e) => { inputRef.current.value = '' }}
          >X</div>
        } */}
        {focus === true && _autoCompleteResults?.length > 0 &&
          <div ref={resultsRef} className='input-with-autocomplete__results scrollable'>
            {_autoCompleteResults.map((result, i) =>
              <p key={`autocomplete-${name}-${result.value}`}
                className={`input-with-autocomplete__result ${result.className}`}
              >
                {result.value}
              </p>)}
          </div>}
      </label>
    </div>
  )
}

/*
<div
            className='header__search-results'
            style={{
              opacity: (searchResultsVisible) ? 1 : 0
            }}
          >
            {searchResults?.length > 0 && searchResults.map((result, i) =>
              <p
                onMouseEnter={() => { setHilightedSearchResult(i) }}
                className={i === hilightedSearchResult ? 'header__search-result--highlighted' : undefined}
                key={`${i}:${result.icon}:${result.name}`}
                onMouseDown={() => {
                  router.push(result.path)
                  setSearchResultsVisible(false)
                  document.getElementById('header-search').value = ''
                }}
              ><i className={result.icon} />{result.name}
                {result.description !== undefined &&
                  <div style={{ marginLeft: '1rem', overflow: 'hidden', fontSize: '.7rem', lineHeight: '.8rem', marginBottom: '.25rem' }}>
                    <small style={{ textTransform: 'none' }}>{result.description}</small>
                  </div>}
              </p>
            )}
          </div>
*/