module.exports = () => {
  // TODO Scope this to a specfic table so that it can work when there are
  // nested animated tables (e.g. pass in a ref to the table as an argument)
  const selectors = [
    'table.data-table--animated > tbody > tr',
    '.data-table--animated > .rc-table-container > .rc-table-content > table > tbody > tr'
  ]
  const observer = new IntersectionObserver(callbackFunction, {}) // eslint-disable-line 
  function callbackFunction (entries) {
    let shownItems = 0
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.style.animationDelay = `${shownItems++ * 0.03}s`
      }
      if (!entries[i].target.className.includes(' data-table__row--visible')) {
        entries[i].target.className += ' data-table__row--visible'
      }
      observer.unobserve(entries[i].target)
    }
  }

  setTimeout(() => {
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => observer.observe(el))
    })
  }, 0)

  return () => {
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => observer.unobserve(el))
    })
  }
}
