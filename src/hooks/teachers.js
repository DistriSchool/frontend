import useSWR from 'swr'
import axios from '@/lib/axios'

const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token')
    }
    return null
}

const authHeaders = () => {
    const token = getToken()
    return token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {}
}

const processErrors = error => {
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
        general: [response?.message || 'Ocorreu um erro. Tente novamente.'],
    }
}

export const useTeachers = () => {
    const { data, error, mutate, isLoading } = useSWR(
        '/api/teachers',
        () => axios.get('/api/teachers', { headers: authHeaders() }).then(r => r.data),
    )

    const createTeacher = async ({ setErrors, payload }) => {
        try {
            setErrors && setErrors({})
            const res = await axios.post('/api/teachers', payload, { headers: authHeaders() })
            await mutate()
            return { success: true, data: res.data }
        } catch (err) {
            const errors = processErrors(err)
            setErrors && setErrors(errors)
            return { success: false, errors }
        }
    }

    const updateTeacher = async ({ id, setErrors, payload }) => {
        try {
            setErrors && setErrors({})
            const res = await axios.put(`/api/teachers/${id}`, payload, { headers: authHeaders() })
            await mutate()
            return { success: true, data: res.data }
        } catch (err) {
            const errors = processErrors(err)
            setErrors && setErrors(errors)
            return { success: false, errors }
        }
    }

    const deleteTeacher = async id => {
        await axios.delete(`/api/teachers/${id}`, { headers: authHeaders() })
        await mutate()
    }

    const teachers = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
    const pagination = data && !Array.isArray(data)
        ? {
              page: data.number ?? 0,
              size: data.size ?? 0,
              totalPages: data.totalPages ?? 0,
              totalElements: data.totalElements ?? 0,
              first: data.first ?? false,
              last: data.last ?? false,
          }
        : null

    return {
        teachers,
        pagination,
        isLoading,
        error,
        mutate,
        createTeacher,
        updateTeacher,
        deleteTeacher,
    }
}

export const useTeacher = id => {
    const shouldFetch = !!id
    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/api/teachers/${id}` : null,
        () => axios.get(`/api/teachers/${id}`, { headers: authHeaders() }).then(r => r.data),
    )

    return { teacher: data, error, isLoading, mutate }
}
