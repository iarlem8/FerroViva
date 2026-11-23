'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Eye, EyeOff } from 'lucide-react'

function getAuthErrorMessage(code: string | undefined, isSignUp: boolean, status?: number) {
  if (status === 429) return 'Muitas tentativas em sequência. Aguarde alguns segundos e tente novamente.'
  switch (code) {
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'Este e-mail já tem cadastro. Entre na sua conta ou use outro e-mail.'
    case 'INVALID_EMAIL':
      return 'Confira o formato do e-mail e tente novamente.'
    case 'PASSWORD_TOO_SHORT':
      return 'A senha precisa ter pelo menos 8 caracteres.'
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'E-mail ou senha incorretos. Confira os dados e tente novamente.'
    default:
      return status && status >= 500
        ? 'O serviço de acesso está temporariamente indisponível. Tente novamente em instantes.'
        : isSignUp
          ? 'Não foi possível criar a conta. Confira os dados e tente novamente.'
          : 'Não foi possível entrar. Confira os dados e tente novamente.'
  }
}

export function AuthForm({ mode, administrator = false }: { mode: 'sign-in' | 'sign-up'; administrator?: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage('')
    const values = new FormData(event.currentTarget)
    const email = String(values.get('email') ?? '').trim().toLowerCase()
    const password = String(values.get('password') ?? '')

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name: String(values.get('name') ?? '').trim(),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        setMessage(getAuthErrorMessage(result.error.code, isSignUp, result.error.status))
        return
      }

      const session = await authClient.getSession()
      if (session.error || !session.data?.user) {
        setMessage('Não foi possível iniciar a sessão. Tente entrar novamente.')
        return
      }
      const role = (session.data?.user as { role?: string } | undefined)?.role
      if (administrator && role !== 'admin') {
        await authClient.signOut()
        setMessage('Esta conta não tem acesso à administração. Use a entrada do cidadão.')
        return
      }
      router.replace(role === 'admin' ? '/ADM' : '/conta')
      router.refresh()
    } catch {
      setMessage('Não foi possível conectar ao serviço de acesso. Atualize a página e tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="portal-auth-form" onSubmit={handleSubmit}>
      {isSignUp && (
        <label>
          Nome completo
          <input name="name" autoComplete="name" required minLength={2} maxLength={100} />
        </label>
      )}
      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <div className="auth-password-field">
        <label htmlFor="password">Senha</label>
        <div className="auth-password-input">
          <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button>
        </div>
        {isSignUp && <small className="auth-field-hint">Use pelo menos 8 caracteres.</small>}
      </div>
      {message && <p className="portal-form-message" role="alert">{message}</p>}
      <button className="portal-button" disabled={pending} type="submit">
        {pending ? 'Aguarde…' : isSignUp ? 'Criar minha conta' : 'Entrar'}
      </button>
      {!administrator && <p className="portal-auth-switch">
        {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem cadastro?'}{' '}
        <Link href={isSignUp ? '/usuarios' : '/cadastro'}>{isSignUp ? 'Entrar' : 'Criar conta'}</Link>
      </p>}
    </form>
  )
}
