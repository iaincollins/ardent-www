module.exports = () => {
  const selectors = [
    'table.data-table--animated > tbody > tr',
    '.data-table--animated > .rc-table-container > .rc-table-content > table > tbody > tr'
  ]
  const observer = new IntersectionObserver(callbackFunction, {})
  function callbackFunction (entries) {
    let shownItems = 0
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.style.animationDelay = `${shownItems++ * 0.03}s`
      }
      entries[i].target.className += ' --visible'
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
