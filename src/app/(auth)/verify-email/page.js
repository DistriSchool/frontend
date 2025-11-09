'use client'

import Button from '@/components/Button'
import { useAuth } from '@/hooks/auth'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const Page = () => {
    const { logout, resendEmailVerification, verifyEmail } = useAuth({
        middleware: 'auth',
        redirectIfAuthenticated: '/dashboard',
    })

    const searchParams = useSearchParams()
    const [status, setStatus] = useState(null)
    const [verifying, setVerifying] = useState(false)
    const [verificationError, setVerificationError] = useState(null)

    useEffect(() => {
        const token = searchParams.get('token')

        if (token && !verifying) {
            setVerifying(true)
            setVerificationError(null)

            verifyEmail(token).then(result => {
                if (result.success) {
                    setStatus('verified')
                } else {
                    setVerificationError(result.error?.message || 'Verification failed')
                    setVerifying(false)
                }
            })
        }
    }, [searchParams])

    return (
        <>
            {verifying && (
                <div className="mb-4 text-sm text-blue-600">
                    Verifying your email address...
                </div>
            )}

            {verificationError && (
                <div className="mb-4 font-medium text-sm text-red-600">
                    {verificationError}
                </div>
            )}

            <div className="mb-4 text-sm text-gray-600">
                Thanks for signing up! Before getting started, could you verify
                your email address by clicking on the link we just
                emailed to you? If you didn't receive the email, we will gladly
                send you another.
            </div>

            <div className="mt-4 flex items-center justify-between">
                <Button
                    onClick={() => resendEmailVerification({ setStatus })}
                    disabled={verifying}
                >
                    Resend Verification Email
                </Button>

                <button
                    type="button"
                    className="underline text-sm text-gray-600 hover:text-gray-900"
                    onClick={logout}
                    disabled={verifying}
                >
                    Logout
                </button>
            </div>
        </>
    )
}

export default Page
