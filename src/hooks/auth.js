import useSWR from 'swr'
import axios from '@/lib/axios'
import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter()
    const params = useParams()

    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token')
        }
        return null
    }

    const saveToken = (token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token)
        }
    }

    const removeToken = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
        }
    }

    const saveUserData = (userData) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user_data', JSON.stringify(userData))
        }
    }

    const getUserData = () => {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem('user_data')
            return data ? JSON.parse(data) : null
        }
        return null
    }

    const removeUserData = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user_data')
        }
    }

    const { data: user, error, mutate } = useSWR('/api/auth/me', () => {
        const token = getToken()

        return axios
            .get('/api/auth/me', {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            })
            .then(res => {
                saveUserData(res.data)
                return res.data
            })
            .catch(error => {
                if (error.request.status !== 409) throw error
                router.push('/verify-email')
            })
    })

    const register = async ({ setErrors, ...props }) => {
        setErrors([])
        axios
            .post('/api/auth/register', props)
            .then((response) => {
                if (response.data.token) {
                    saveToken(response.data.token)
                }
                if (response.data.user) {
                    saveUserData(response.data.user)
                }
                mutate()
            })
            .catch(error => {
                if (error.request.status !== 422) throw error
                setErrors(error.response.data.errors)
            })
    }

    const login = async ({ setErrors, setStatus, ...props }) => {
        setErrors([])
        setStatus(null)
        axios
            .post('/api/auth/login', props)
            .then((response) => {
                if (response.data.token) {
                    saveToken(response.data.token)
                }
                if (response.data.user) {
                    saveUserData(response.data.user)
                }
                mutate()
            })
            .catch(error => {
                if (error.request.status !== 422) throw error
                setErrors(error.response.data.errors)
            })
    }

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        setErrors([])
        setStatus(null)
        axios
            .post('/forgot-password', { email })
            .then(response => setStatus(response.data.status))
            .catch(error => {
                if (error.request.status !== 422) throw error
                setErrors(error.response.data.errors)
            })
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        setErrors([])
        setStatus(null)
        axios
            .post('/reset-password', { token: params.token, ...props })
            .then(response =>
                router.push('/login?reset=' + btoa(response.data.status)),
            )
            .catch(error => {
                if (error.request.status !== 422) throw error
                setErrors(error.response.data.errors)
            })
    }

    const resendEmailVerification = ({ setStatus }) => {
        const token = getToken()

        axios
            .post('/email/verification-notification', {}, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            })
            .then(response => setStatus(response.data.status))
    }

    const logout = async () => {
        if (!error) {
            const token = getToken()

            await axios.post('/logout', {}, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            }).then(() => mutate())
        }

        removeToken()
        removeUserData()

        window.location.pathname = '/login'
    }

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user)
            router.push(redirectIfAuthenticated)
        if (middleware === 'auth' && (user && !user.emailVerified))
            router.push('/verify-email')
        if (
            window.location.pathname === '/verify-email' &&
            user?.emailVerified
        )
            router.push(redirectIfAuthenticated)
        if (middleware === 'auth' && error) logout()
    }, [user, error])

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
}
