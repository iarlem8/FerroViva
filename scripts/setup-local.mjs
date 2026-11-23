import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

mkdirSync('.data', { recursive: true })

if (existsSync('.env.local')) {
  console.log('A configuração .env.local já existe e foi preservada.')
} else {
  writeFileSync('.env.local', [
    'BETTER_AUTH_URL=http://localhost:3000',
    `BETTER_AUTH_SECRET=${randomBytes(32).toString('hex')}`,
    'LOCAL_DATABASE_NAME=postgres',
    'ADMIN_EMAIL=iarlemlacerda@gmail.com',
    'ADMIN_PASSWORD=12345678',
    '',
  ].join('\n'), { flag: 'wx', mode: 0o600 })
  console.log('Configuração criada. Consulte ADMIN_EMAIL e ADMIN_PASSWORD em .env.local para entrar em /ADM.')
}
