import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { hashPassword } from 'better-auth/crypto'
import { initialData } from '../demo-data'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { ferrovivaLocalDatabase?: ReturnType<typeof connect> }

async function connect() {
  const databaseName = process.env.LOCAL_DATABASE_NAME || 'postgres'
  if (!/^[a-zA-Z0-9_-]+$/.test(databaseName)) throw new Error('Nome do banco local inválido.')
  const client = new PGlite(join(process.cwd(), '.data', databaseName))
  const db = drizzle(client, { schema })

  // Prepara a instalação local antes de receber acessos, sem substituir cadastros.
  await client.exec(readFileSync(resolve('lib/db/local-schema.sql'), 'utf8'))
  await db.transaction(async (tx) => {
    for (const point of initialData.points) await tx.insert(schema.points).values({ id: point.id, data: point }).onConflictDoNothing()
    for (const campaign of initialData.campaigns) await tx.insert(schema.campaigns).values({ id: campaign.id, data: campaign }).onConflictDoNothing()
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const password = process.env.ADMIN_PASSWORD
    if (!email || !password || password.length < 8) throw new Error('Execute npm run setup:local antes de iniciar o projeto.')
    const existing = await tx.select({ id: schema.user.id }).from(schema.user).limit(1)
    if (!existing.length) {
      const id = randomUUID()
      await tx.insert(schema.user).values({ id, name: 'Iarlem Lacerda', email, role: 'admin' })
      await tx.insert(schema.account).values({ id: randomUUID(), userId: id, accountId: id, providerId: 'credential', password: await hashPassword(password) })
    }
  })
  return db
}

export function getLocalDatabase() {
  globalForDb.ferrovivaLocalDatabase ??= connect()
  return globalForDb.ferrovivaLocalDatabase
}
