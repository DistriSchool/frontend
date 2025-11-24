'use client'
import Header from '@/app/(app)/Header'
import { useStudent, useStudents } from '@/hooks/students'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Input from '@/components/Input'
import Label from '@/components/Label'
import InputError from '@/components/InputError'
import Button from '@/components/Button'
import Link from 'next/link'

const EditStudentPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const { student, isLoading, error, mutate } = useStudent(id)
  const { updateStudent, deleteStudent } = useStudents() // reuse mutate after update
  const [form, setForm] = useState({ fullName: '', dateOfBirth: '', cpf: '', email: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (student) {
      setForm({
        fullName: student.fullName || '',
        dateOfBirth: student.dateOfBirth || '',
        cpf: student.cpf || '',
        email: student.email || '',
      })
    }
  }, [student])

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const res = await updateStudent({ id, setErrors, payload: form })
    if (res.success) {
      mutate()
      router.push('/students')
    }
  }

  const handleDelete = async () => {
    await deleteStudent(id)
    router.push('/students')
  }

  return (
    <>
      <Header title="Editar Aluno" />
      <div className="py-12">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {isLoading && <div>Carregando...</div>}
            {error && <div>Erro ao carregar.</div>}
            {!isLoading && student && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <Link
                    href="/students"
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

export default EditStudentPage
