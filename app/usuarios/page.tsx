import Link from 'next/link'
import { AccessAside } from '@/components/access-aside'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { readSession } from '@/lib/auth'

export default async function SignInPage() {
  const session = await readSession()
  if (session?.user) redirect(session.user.role === 'admin' ? '/ADM' : '/conta')
  return <main className="portal-auth-page">
    <AccessAside />
    <section className="portal-auth-main"><div className="portal-auth-card"><span className="portal-eyebrow">BEM-VINDO DE VOLTA</span><h1>Entre na sua conta</h1><p>Use seu e-mail e senha para acessar sua área da FerroViva.</p><AuthForm mode="sign-in"/><Link className="portal-auth-return" href="/app">Voltar para a página inicial</Link></div></section>
  </main>
}
