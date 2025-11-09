'use client'
import Header from '@/app/(app)/Header'
import { useStudents } from '@/hooks/students'
import { useState } from 'react'
import Input from '@/components/Input'
import Label from '@/components/Label'
import InputError from '@/components/InputError'
import Button from '@/components/Button'
import Link from 'next/link'

const StudentsPage = () => {
    const { students, isLoading, createStudent, deleteStudent, pagination } = useStudents()

    const [form, setForm] = useState({ fullName: '', dateOfBirth: '', cpf: '' })
    const [errors, setErrors] = useState({})
    const [open, setOpen] = useState(false)

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        const res = await createStudent({ setErrors, payload: form })
        if (res.success) {
            setForm({ fullName: '', dateOfBirth: '', cpf: '' })
            setOpen(false)
        }
    }

    return (
        <>
            <Header title="Alunos" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {pagination ? (
                                    <span>
                                        Página {pagination.page + 1} de {pagination.totalPages} • {pagination.totalElements} registros
                                    </span>
                                ) : null}
                            </div>
                            <Button type="button" onClick={() => setOpen(true)}>
                                Criar aluno
                            </Button>
                        </div>

                        {isLoading && <div>Carregando...</div>}
                        {!isLoading && students.length === 0 && (
                            <div>Nenhum aluno cadastrado.</div>
                        )}
                        {!isLoading && students.length > 0 && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nascimento</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                                        <th className="px-4 py-2" />
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{s.registrationNumber}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{s.fullName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{s.dateOfBirth}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{s.cpf}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right space-x-3">
                                                <Link href={`/students/${s.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm">Editar</Link>
                                                <button
                                                    onClick={() => deleteStudent(s.id)}
                                                    className="text-red-600 hover:text-red-900 text-sm"
                                                >
                                                    Remover
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Criar aluno</h3>
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <InputError messages={errors.general} className="mt-2" />
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm">Cancelar</button>
                                <Button type="submit">Salvar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default StudentsPage
