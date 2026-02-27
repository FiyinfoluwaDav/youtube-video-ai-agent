import { Link } from '@tanstack/react-router'
import { forwardRef } from 'react'

const NavLink = forwardRef<HTMLAnchorElement, any>(
  ({ className, activeClassName, pendingClassName, ...props }, ref) => {
    return (
      <Link
        to="/"
        ref={ref}
        className={className}
        activeProps={{
          className: activeClassName ? activeClassName : undefined,
        }}
        {...props}
      />
    )
  },
)

NavLink.displayName = 'NavLink'

export { NavLink }
