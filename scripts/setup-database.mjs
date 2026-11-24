import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { Pool } from 'pg'
import { hashPassword } from 'better-auth/crypto'
import { initialData } from '../lib/demo-data.ts'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
if (!process.env.DATABASE_URL) throw new Error('Preencha DATABASE_URL em .env.production.local.')
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || password.length > 128) {
  throw new Error('Configure ADMIN_EMAIL e uma ADMIN_PASSWORD com 12 a 128 caracteres.')
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10_000 })
try {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // Serializa a instalação inicial sem substituir contas ou dados existentes.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('ferroviva-setup'))")
    await client.query(readFileSync(new URL('../lib/db/local-schema.sql', import.meta.url), 'utf8'))
    for (const point of initialData.points) {
      await client.query('INSERT INTO points (id, data) VALUES ($1, $2) ON CONFLICT DO NOTHING', [point.id, point])
    }
    for (const campaign of initialData.campaigns) {
      await client.query('INSERT INTO campaigns (id, data) VALUES ($1, $2) ON CONFLICT DO NOTHING', [campaign.id, campaign])
    }
    const existing = await client.query('SELECT id, role FROM "user" WHERE email = $1', [email])
    if (existing.rows.length && existing.rows[0].role !== 'admin') {
      throw new Error('O e-mail informado pertence a um cidadão. Nenhum perfil foi alterado.')
    }
    if (!existing.rows.length) {
      const id = randomUUID()
      await client.query('INSERT INTO "user" (id, name, email, role) VALUES ($1, $2, $3, $4)', [id, 'Administração FerroViva', email, 'admin'])
      await client.query('INSERT INTO account (id, "userId", "accountId", "providerId", password) VALUES ($1, $2, $3, $4, $5)',
        [randomUUID(), id, id, 'credential', await hashPassword(password)])
    }
    await client.query('COMMIT')
    console.log('Banco preparado. Contas, senhas e registros existentes foram preservados.')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
} catch {
  console.error('Não foi possível preparar o banco. Confira a conexão, as permissões e se o e-mail já pertence a um cidadão. A transação foi cancelada.')
  process.exitCode = 1
} finally {
  await pool.end()
}
