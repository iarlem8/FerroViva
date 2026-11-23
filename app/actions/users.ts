'use server'

import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdministrator } from '@/lib/auth'
import { db } from '@/lib/db'
import { account, user } from '@/lib/db/schema'

export async function getUsers() {
  await requireAdministrator()
  return db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
    .from(user).orderBy(desc(user.createdAt))
}

export async function createUser(form: FormData) {
  await requireAdministrator()
  const name = String(form.get('name') ?? '').trim()
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')
  const role = String(form.get('role') ?? 'citizen')
  if (name.length < 2 || name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128 || !['citizen', 'admin'].includes(role)) {
    throw new Error('Confira os dados. A senha precisa ter entre 12 e 128 caracteres.')
  }
  const id = randomUUID()
  const passwordHash = await hashPassword(password)
  await db.transaction(async (tx) => {
    await tx.insert(user).values({ id, name, email, role })
    await tx.insert(account).values({ id: randomUUID(), accountId: id, userId: id, providerId: 'credential', password: passwordHash })
  })
  revalidatePath('/ADM')
}
