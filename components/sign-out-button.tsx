'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'

export function SignOutButton({ redirectTo = '/usuarios' }: { redirectTo?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  async function signOut() {
    setPending(true)
    setMessage('')
    try {
      const result = await authClient.signOut()
      if (result.error) throw new Error('Falha ao sair')
      router.replace(redirectTo)
      router.refresh()
    } catch {
      setMessage('Não foi possível sair. Tente novamente.')
    } finally {
      setPending(false)
    }
  }
  return <><button className="portal-quiet-button" type="button" disabled={pending} onClick={signOut}>{pending ? 'Saindo…' : 'Sair da conta'}</button>{message && <span role="alert">{message}</span>}</>
}
