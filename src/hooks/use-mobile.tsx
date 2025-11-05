import * as React from "react"

/**
 * @fileoverview Хук React для определения, является ли текущее устройство мобильным.
 */

const MOBILE_BREAKPOINT = 768

/**
 * Хук для определения, является ли устройство мобильным, на основе ширины окна.
 * @returns {boolean} - `true`, если ширина окна меньше `MOBILE_BREAKPOINT`, иначе `false`.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
