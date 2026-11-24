import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const adapter = dirname(require.resolve('@opennextjs/cloudflare/package.json'))
const result = spawnSync(process.execPath, [join(adapter, 'dist/cli/index.js'), 'build'], {
  stdio: 'inherit',
  env: { ...process.env, FERROVIVA_CLOUDFLARE: '1' },
})
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

// Os segredos de produção vêm do Worker, nunca do .env.local da máquina.
writeFileSync('.open-next/cloudflare/next-env.mjs',
  'export const production = {};\nexport const development = {};\nexport const test = {};\n')
