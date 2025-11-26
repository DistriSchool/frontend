'use client'
import Header from '@/app/(app)/Header'
import { useTeacher, useTeachers } from '@/hooks/teachers'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Input from '@/components/Input'
import Label from '@/components/Label'
import InputError from '@/components/InputError'
import Button from '@/components/Button'
import Link from 'next/link'

const EditTeacherPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const { teacher, isLoading, error, mutate } = useTeacher(id)
  const { updateTeacher, deleteTeacher } = useTeachers() // reuse mutate after update
  const [form, setForm] = useState({ fullName: '', dateOfBirth: '', cpf: '', email: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (teacher) {
      setForm({
        fullName: teacher.fullName || '',
        dateOfBirth: teacher.dateOfBirth || '',
        cpf: teacher.cpf || '',
        email: teacher.email || '',
      })
    }
  }, [teacher])

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const res = await updateTeacher({ id, setErrors, payload: form })
    if (res.success) {
      mutate()
      router.push('/teachers')
    }
  }

  const handleDelete = async () => {
    await deleteTeacher(id)
    router.push('/teachers')
  }

  return (
    <>
      <Header title="Editar Professor" />
      <div className="py-12">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {isLoading && <div>Carregando...</div>}
            {error && <div>Erro ao carregar.</div>}
            {!isLoading && teacher && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Link
                    href="/teachers"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12l7.5-7.5M21 12H3" />
                    </svg>
                    Voltar
                  </Link>
                </div>
                <div>
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} className="mt-1 block w-full" />
                  <InputError messages={errors.fullName} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Data de nascimento</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="mt-1 block w-full" />
                  <InputError messages={errors.dateOfBirth} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} className="mt-1 block w-full" />
                  <InputError messages={errors.cpf} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full" />
                  <InputError messages={errors.email} className="mt-2" />
                </div>
                <InputError messages={errors.general} className="mt-2" />
                <div className="flex space-x-4">
                  <Button type="submit">Salvar</Button>
                  <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">Excluir</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default EditTeacherPage
