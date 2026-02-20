import { useState, useEffect } from 'react'

type ViewportInfo = {
  height: number
  offsetTop: number
}

export default function useViewportHeight(): ViewportInfo {
  const [info, setInfo] = useState<ViewportInfo>({
    height: window.visualViewport?.height ?? window.innerHeight,
    offsetTop: window.visualViewport?.offsetTop ?? 0,
  })

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) {
      const fallback = () =>
        setInfo({ height: window.innerHeight, offsetTop: 0 })
      window.addEventListener('resize', fallback)
      return () => window.removeEventListener('resize', fallback)
    }

    let rafId: number | null = null

    const update = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        setInfo({ height: viewport.height, offsetTop: viewport.offsetTop })
        rafId = null
      })
    }

    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return info
}
