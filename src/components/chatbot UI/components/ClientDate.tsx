import moment from 'moment'
import { useEffect, useState } from 'react'

export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * A wrapper to safely render client-only date formatting without SSR hydration mismatches.
 * Renders nothing on the server, and renders the formatted date on the client.
 */
export function ClientDate({
  timestamp,
  format = 'fromNow',
  className = '',
}: {
  timestamp: string | number | Date | null | undefined
  format?: 'fromNow' | 'LT' | 'LLL' | 'LL'
  className?: string
}) {
  const isHydrated = useIsHydrated()

  if (!isHydrated || !timestamp) {
    return <span className={className}></span> // Match empty element space
  }

  const date = moment(timestamp)

  let formatted = ''
  switch (format) {
    case 'fromNow':
      formatted = date.fromNow()
      break
    case 'LT':
      formatted = date.format('LT')
      break
    case 'LLL':
      formatted = date.format('LLL')
      break
    case 'LL':
      formatted = date.format('LL')
      break
    default:
      formatted = date.format(format)
  }

  return <span className={className}>{formatted}</span>
}
