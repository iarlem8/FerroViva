import Link from 'next/link'
import { AccessAside } from '@/components/access-aside'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { readSession } from '@/lib/auth'

export default async function SignUpPage() {
  const session = await readSession()
  if (session?.user) redirect(session.user.role === 'admin' ? '/ADM' : '/conta')
  return <main className="portal-auth-page">
    <AccessAside />
    <section className="portal-auth-main"><div className="portal-auth-card"><span className="portal-eyebrow">CADASTRO CIDADÃO</span><h1>Faça parte</h1><p>Preencha seus dados para criar uma conta. Você poderá acompanhar seus registros e as novidades da comunidade.</p><AuthForm mode="sign-up"/><Link className="portal-auth-return" href="/app">Voltar para a página inicial</Link></div></section>
  </main>
}
