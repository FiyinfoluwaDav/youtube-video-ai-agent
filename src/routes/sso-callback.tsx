import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sso-callback')({
  component: SSOCallback,
})

function SSOCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <AuthenticateWithRedirectCallback />
    </div>
  )
}
