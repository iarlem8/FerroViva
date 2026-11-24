import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { createHash } from 'node:crypto'
import { cache } from 'react'
import { connection } from 'next/server'
import * as schema from './schema'

// Conexões PostgreSQL não podem ser compartilhadas entre requisições do Worker.
export const getDatabase = cache(async () => {
  await connection()
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      maxUses: 1,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 1_000,
    })
    return drizzle(pool, { schema })
  }
  if (process.env.FERROVIVA_CLOUDFLARE === '1') {
    throw new Error('Configure DATABASE_URL nos secrets do Worker antes de acessar o FerroViva.')
  } else {
    const { getLocalDatabase } = await import('./local')
    return getLocalDatabase()
  }
})

export const hashReportCode = (code: string) => createHash('sha256').update(code.toUpperCase()).digest('hex')
