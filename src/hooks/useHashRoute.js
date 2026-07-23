import { useState, useEffect, useCallback } from 'react'

export function useHashRoute(defaultPage, validPages) {
  const getPageFromHash = () => {
    const hash = window.location.hash.slice(1)
    return validPages.includes(hash) ? hash : defaultPage
  }

  const [page, setPageState] = useState(getPageFromHash)

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#${defaultPage}`)
    }
    function onHashChange() {
      setPageState(getPageFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((next) => {
    if (!validPages.includes(next) || next === window.location.hash.slice(1)) return
    window.location.hash = next
    setPageState(next)
  }, [])

  return [page, navigate]
}
