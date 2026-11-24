import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { headers } from 'next/headers'
import { cache } from 'react'
import { getDatabase } from '@/lib/db'
import * as schema from '@/lib/db/schema'

export const getAuth = cache(async () => {
  const db = await getDatabase()
  if (process.env.FERROVIVA_CLOUDFLARE === '1') {
    if (!process.env.BETTER_AUTH_URL?.startsWith('https://')) throw new Error('Configure BETTER_AUTH_URL com a URL HTTPS do Worker.')
    if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error('Configure BETTER_AUTH_SECRET nos secrets do Worker (mínimo de 32 caracteres).')
  }
  return betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'citizen',
        input: false,
      },
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  rateLimit: { enabled: true, window: 60, max: 60 },
  })
})

export async function readSession() {
  const requestHeaders = await headers()
  const auth = await getAuth()
  return auth.api.getSession({ headers: requestHeaders })
}

export async function requireAdministrator() {
  const session = await readSession()
  if (!session?.user || session.user.role !== 'admin') throw new Error('Acesso não autorizado')
  return session.user.id
}
