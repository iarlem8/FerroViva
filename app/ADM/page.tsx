import { redirect } from 'next/navigation'
import { AdminApp } from '@/components/admin-app'
import { AdminPostManager } from '@/components/admin-post-manager'
import { AdminUserManager } from '@/components/admin-user-manager'
import { getAdminPosts } from '@/app/actions/posts'
import { getUsers } from '@/app/actions/users'
import { getAdminData } from '@/app/actions/environment'
import { readSession } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import { AccessAside } from '@/components/access-aside'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await readSession()
  if (!session?.user) return <main className="portal-auth-page"><AccessAside administrator /><section className="portal-auth-main"><div className="portal-auth-card"><span className="portal-eyebrow">ACESSO RESTRITO</span><h1>Entrar na gestão</h1><p>Acesse com a conta autorizada para acompanhar os registros e organizar as ações.</p><AuthForm mode="sign-in" administrator /><Link className="portal-auth-return" href="/app">Voltar ao portal cidadão</Link></div></section></main>
  if (session.user.role !== 'admin') redirect('/conta')
  const [posts, users, data] = await Promise.all([getAdminPosts(), getUsers(), getAdminData()])
  return <AdminApp name={session.user.name} initial={data} posts={<AdminPostManager posts={posts} />} users={<AdminUserManager users={users} />} />
}
