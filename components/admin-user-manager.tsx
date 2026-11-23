'use client'

import { useState, useTransition } from 'react'
import { createUser } from '@/app/actions/users'

type User = { id: string; name: string; email: string; role: string; createdAt: Date }

export function AdminUserManager({ users }: { users: User[] }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const visible = users.filter(user => `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="admin-post-layout">
    <form className="portal-panel admin-post-form" onSubmit={event => {
      event.preventDefault()
      const form = event.currentTarget
      const data = new FormData(form)
      startTransition(async () => {
        try { await createUser(data); form.reset(); setMessage('Conta criada. A pessoa já pode entrar com os dados cadastrados.') }
        catch { setMessage('Não foi possível cadastrar. Confira os campos e se o e-mail já possui uma conta.') }
      })
    }}>
      <div className="portal-section-heading"><h2>Cadastrar pessoa</h2><p>Somente a administração pode conceder acesso a este painel.</p></div>
      <label>Nome<input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
      <label>E-mail<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label>Senha inicial<input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" /></label>
      <label>Perfil<select name="role" defaultValue="citizen"><option value="citizen">Cidadão</option><option value="admin">Administrador</option></select></label>
      <p className="portal-form-message" role="status">{message}</p>
      <button className="portal-button" disabled={pending}>{pending ? 'Salvando…' : 'Cadastrar pessoa'}</button>
    </form>
    <section className="portal-panel"><div className="portal-section-heading"><h2>Pessoas cadastradas</h2><p>{users.length} contas salvas</p></div>
      <label className="user-search">Buscar pessoa<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Nome ou e-mail" /></label>
      <div className="table-scroll"><table className="data-table user-table"><thead><tr><th>Pessoa</th><th>Perfil</th><th>Cadastro</th></tr></thead><tbody>{visible.map(user => <tr key={user.id}><td><b>{user.name}</b><small>{user.email}</small></td><td data-label="Perfil">{user.role === 'admin' ? 'Administrador' : 'Cidadão'}</td><td data-label="Cadastro">{new Intl.DateTimeFormat('pt-BR').format(user.createdAt)}</td></tr>)}</tbody></table></div>
      {!visible.length && <p className="empty-state">Nenhuma pessoa encontrada.</p>}
    </section>
  </div>
}
