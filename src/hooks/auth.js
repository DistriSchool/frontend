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

    const processErrors = (error) => {
        const response = error.response?.data

        if (response?.validationErrors) {
            const errors = {}
            Object.keys(response.validationErrors).forEach(field => {
                const errorMessage = response.validationErrors[field]
                errors[field] = Array.isArray(errorMessage)
                    ? errorMessage
                    : [errorMessage]
            })
            return errors
        }

        if (response?.errors) {
            return response.errors
        }

        return {
            general: [response?.message || 'Ocorreu um erro. Tente novamente.']
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
                if (error.response?.status === 409) {
                    router.push('/verify-email')
                    return
                }
                throw error
            })
    })

    const register = async ({ setErrors, ...props }) => {
        setErrors({})

        try {
            const response = await axios.post('/api/auth/register', props)

            if (response.data.token) {
                saveToken(response.data.token)
            }
            if (response.data.user) {
                saveUserData(response.data.user)
            }
            mutate()
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(processErrors(error))
            } else {
                setErrors({
                    general: [error.response?.data?.message || 'Erro ao registrar. Tente novamente.']
                })
            }
        }
    }

    const login = async ({ setErrors, setStatus, ...props }) => {
        setErrors({})
        setStatus(null)

        try {
            const response = await axios.post('/api/auth/login', props)

            if (response.data.token) {
                saveToken(response.data.token)
            }
            if (response.data.user) {
                saveUserData(response.data.user)
            }
            mutate()
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(processErrors(error))
            } else {
                setErrors({
                    general: [error.response?.data?.message || 'Erro ao fazer login. Tente novamente.']
                })
            }
        }
    }

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        setErrors({})
        setStatus(null)

        try {
            const response = await axios.post('/forgot-password', { email })
            setStatus(response.data.status)
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(processErrors(error))
            } else {
                setErrors({
                    general: [error.response?.data?.message || 'Erro ao solicitar recuperação de senha.']
                })
            }
        }
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        setErrors({})
        setStatus(null)

        try {
            const response = await axios.post('/reset-password', {
                token: params.token,
                ...props
            })
            router.push('/login?reset=' + btoa(response.data.status))
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(processErrors(error))
            } else {
                setErrors({
                    general: [error.response?.data?.message || 'Erro ao redefinir senha.']
                })
            }
        }
    }

    const resendEmailVerification = async ({ setStatus, setErrors }) => {
        const token = getToken()

        try {
            const response = await axios.post('/api/auth/resend-email-verification', {}, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            })
            setStatus(response.data.message || 'verification-link-sent')
        } catch (error) {
            if (setErrors) {
                setErrors({
                    general: [error.response?.data?.message || 'Erro ao reenviar email de verificação.']
                })
            }
        }
    }

    const verifyEmail = async (token) => {
        try {
            const response = await axios.get(`/api/auth/verify-email?token=${token}`, {
                headers: getToken() ? {
                    'Authorization': `Bearer ${getToken()}`
                } : {}
            })

            mutate()

            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Falha na verificação do email'
            }
        }
    }

    const logout = async () => {
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
        verifyEmail,
        logout,
    }
}
