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

export const useStudents = () => {
    const { data, error, mutate, isLoading } = useSWR(
        '/api/students',
        () => axios.get('/api/students', { headers: authHeaders() }).then(r => r.data),
    )

    const createStudent = async ({ setErrors, payload }) => {
        try {
            setErrors && setErrors({})
            const res = await axios.post('/api/students', payload, { headers: authHeaders() })
            await mutate()
            return { success: true, data: res.data }
        } catch (err) {
            const errors = processErrors(err)
            setErrors && setErrors(errors)
            return { success: false, errors }
        }
    }

    const updateStudent = async ({ id, setErrors, payload }) => {
        try {
            setErrors && setErrors({})
            const res = await axios.put(`/api/students/${id}`, payload, { headers: authHeaders() })
            await mutate()
            return { success: true, data: res.data }
        } catch (err) {
            const errors = processErrors(err)
            setErrors && setErrors(errors)
            return { success: false, errors }
        }
    }

    const deleteStudent = async id => {
        await axios.delete(`/api/students/${id}`, { headers: authHeaders() })
        await mutate()
    }

    const students = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : []
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
        students,
        pagination,
        isLoading,
        error,
        mutate,
        createStudent,
        updateStudent,
        deleteStudent,
    }
}

export const useStudent = id => {
    const shouldFetch = !!id
    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/api/students/${id}` : null,
        () => axios.get(`/api/students/${id}`, { headers: authHeaders() }).then(r => r.data),
    )

    return { student: data, error, isLoading, mutate }
}
