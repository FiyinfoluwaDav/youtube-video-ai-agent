import { useSignIn, useSignUp } from '@clerk/clerk-react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import Blob from '../components/Login UI/Blob'
import LoginButton from '../components/Login UI/LoginButton'
import { blobs } from '../components/Login UI/constants'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn()
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp()
  const router = useRouter()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!invalid) return
    const t = window.setTimeout(() => setInvalid(false), 700)
    return () => window.clearTimeout(t)
  }, [invalid])

  const handleSubmit = async () => {
    if (!isSignInLoaded || !isSignUpLoaded) return

    try {
      if (pendingVerification) {
        // Handle OTP verification for signup
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code,
        })
        if (completeSignUp.status === 'complete') {
          setSuccess(true)
          await setSignUpActive({ session: completeSignUp.createdSessionId })
          setTimeout(() => router.history.push('/'), 1200)
        } else {
          setInvalid(false)
          window.requestAnimationFrame(() => setInvalid(true))
          setErrorMsg('Verification failed')
        }
        return
      }

      if (isSignUp) {
        const result = await signUp.create({
          emailAddress: email,
          password,
        })

        if (result.status === 'complete') {
          setSuccess(true)
          await setSignUpActive({ session: result.createdSessionId })
          setTimeout(() => router.history.push('/'), 1200)
        } else if (result.status === 'missing_requirements' || result.unverifiedFields.includes('email_address')) {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
          setPendingVerification(true)
          setErrorMsg('')
        } else {
          setInvalid(false)
          window.requestAnimationFrame(() => setInvalid(true))
          setErrorMsg('Additional steps required')
        }
      } else {
        const result = await signIn.create({
          identifier: email,
          password,
        })

        if (result.status === 'complete') {
          setSuccess(true)
          await setSignInActive({ session: result.createdSessionId })
          setTimeout(() => router.history.push('/'), 1200)
        } else {
          console.log(result)
          setInvalid(false)
          window.requestAnimationFrame(() => setInvalid(true))
          setErrorMsg('Additional steps required')
        }
      }
    } catch (err: any) {
      console.error('error', err.errors?.[0]?.longMessage)
      setErrorMsg(err.errors?.[0]?.longMessage || 'Operation failed')
      setInvalid(false)
      window.requestAnimationFrame(() => setInvalid(true))
    }
  }

  const handleOAuth = (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isSignInLoaded) return
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    })
  }

  return (
    <main className="h-[calc(100vh-80px)] bg-black text-white flex flex-col md:grid md:grid-cols-2">
      <section className="relative h-[25vh] min-h-[200px] max-h-[240px] md:max-h-none md:h-auto md:min-h-screen overflow-hidden border-b border-[#222] bg-[#111] md:border-b-0 md:border-r">
        <div className="absolute inset-x-0 bottom-[-20px] md:bottom-auto md:inset-0 flex items-end md:items-center justify-center overflow-hidden">
          <div className="relative w-full h-[550px] scale-[0.45] origin-bottom md:scale-100 md:origin-center pointer-events-none md:pointer-events-auto">
            {blobs.map((spec) => (
              <Blob
                key={spec.kind}
                spec={spec}
                showPassword={showPassword}
                focused={focused}
                invalid={invalid}
                success={success}
              />
            ))}
          </div>
        </div>
      </section>
      
      <section className="flex flex-1 flex-col justify-center items-center bg-black px-4 pt-4 pb-6 md:pt-10 md:py-10 md:px-10 overflow-y-auto">
        <div className="w-full max-w-[460px]">
          <header className="mb-4 md:mb-11 text-left pt-2 md:pt-0">
            <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-white md:text-[3.2rem]">
              {pendingVerification ? 'Verify Email' : isSignUp ? 'Create an account' : 'Welcome back!'}
            </h1>
            <p className="text-sm text-[#f5f5f5] opacity-70">
              {pendingVerification ? 'Enter the code sent to your email' : 'Please enter your details'}
            </p>
          </header>
          
          <form
            className="flex flex-col gap-3 md:gap-5"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            {/* Hidden fields for accessibility/autofill override pattern from original */}
            <input
              type="text"
              style={{ display: 'none' }}
              autoComplete="username"
              readOnly
            />
            <input
              type="password"
              style={{ display: 'none' }}
              autoComplete="password"
              readOnly
            />

            {pendingVerification ? (
              <label className="flex flex-col gap-2 relative">
                <span className="text-[0.95rem] text-[#f5f5f5]">Verification Code</span>
                <input
                  type="text"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className={`min-h-13 rounded-[10px] border border-[#222] bg-[#111] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#444] ${invalid ? 'fieldReject' : ''}`}
                />
                {errorMsg && (
                  <p className="text-red-500 text-xs absolute -bottom-5 w-full text-center truncate">
                    {errorMsg}
                  </p>
                )}
              </label>
            ) : (
              <>
                <label className="flex flex-col gap-2">
                  <span className="text-[0.95rem] text-[#f5f5f5]">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    inputMode="email"
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`min-h-13 rounded-[10px] border border-[#222] bg-[#111] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#444] ${invalid ? 'fieldReject' : ''}`}
                  />
                </label>

                <label className="flex flex-col gap-2 relative">
                  <span className="text-[0.95rem] text-[#f5f5f5]">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      className={`min-h-13 w-full rounded-[10px] border border-[#222] bg-[#111] px-3.5 py-3 pr-11 text-sm text-white outline-none transition focus:border-[#444] ${invalid ? 'fieldReject' : ''}`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center bg-transparent text-[#f5f5f5]"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errorMsg && (
                    <p className="text-red-500 text-xs absolute -bottom-5 w-full text-center truncate">
                      {errorMsg}
                    </p>
                  )}
                </label>
              </>
            )}

            <LoginButton
              invalid={invalid}
              success={success}
              onClick={handleSubmit}
              text={pendingVerification ? 'Verify' : isSignUp ? 'Create account' : 'Log In'}
              successText={isSignUp ? 'Account created!' : 'Welcome back!'}
            />
          </form>

          {!pendingVerification && (
            <p className="mt-4 text-center text-xs tracking-tight text-[#f5f5f5] opacity-70">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setErrorMsg('')
                  setEmail('')
                  setPassword('')
                }}
                className="font-semibold text-white underline cursor-pointer"
              >
                {isSignUp ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          )}

          {!pendingVerification && (
            <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-[#222] flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleOAuth('oauth_google')}
                className="w-full flex items-center justify-center gap-2 rounded-[10px] border border-[#333] bg-[#111] px-3.5 py-3 text-sm text-white outline-none transition hover:border-[#555] hover:bg-[#222]"
              >
                <img
                  className="h-4 w-4"
                  src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png"
                  alt="Google"
                />
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

