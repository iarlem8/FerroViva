import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { ensureDatabase } from '@/lib/db'

const handler = toNextJsHandler(auth)
export async function GET(request: Request) {
  await ensureDatabase()
  return handler.GET(request)
}
export async function POST(request: Request) {
  await ensureDatabase()
  return handler.POST(request)
}
