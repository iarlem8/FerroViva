'use server'

import { randomBytes, randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import { readSession, requireAdministrator } from '@/lib/auth'
import { db, ensureDatabase, hashReportCode } from '@/lib/db'
import { campaigns, points, reports, user } from '@/lib/db/schema'
import type { DemoData, Report } from '@/lib/demo-data'

function field(form: FormData, name: string, min = 1, max = 200) {
  const value = String(form.get(name) ?? '').trim()
  if (value.length < min || value.length > max) throw new Error(`Confira o campo ${name}.`)
  return value
}

function publicReport(report: Report): Report {
  const { internalNote: _note, code: _code, reporterName: _name, reporterEmail: _email, ...visible } = report
  return { ...visible, internalNote: '', code: '' }
}

export async function getPublicData(): Promise<DemoData> {
  await ensureDatabase()
  const [locations, actions] = await Promise.all([db.select().from(points), db.select().from(campaigns)])
  return { points: locations.map(row => row.data), campaigns: actions.map(row => row.data).filter(item => item.status !== 'Rascunho'), reports: [] }
}

export async function getAdminData(): Promise<DemoData> {
  await requireAdministrator()
  const [locations, actions, entries] = await Promise.all([
    db.select().from(points), db.select().from(campaigns),
    db.select({ data: reports.data, name: user.name, email: user.email }).from(reports)
      .leftJoin(user, eq(reports.userId, user.id)).orderBy(desc(reports.createdAt)),
  ])
  return { points: locations.map(row => row.data), campaigns: actions.map(row => row.data),
    reports: entries.map(row => ({ ...row.data, ...(!row.data.anonymous ? { reporterName: row.name ?? undefined, reporterEmail: row.email ?? undefined } : {}) })) }
}

export async function getOwnReports() {
  const session = await readSession()
  if (!session?.user) throw new Error('Entre na sua conta.')
  const entries = await db.select().from(reports).where(eq(reports.userId, session.user.id)).orderBy(desc(reports.createdAt))
  return entries.map(row => publicReport(row.data))
}

export async function createReport(form: FormData) {
  const session = await readSession()
  const anonymous = form.get('anonymous') === 'on'
  if (!anonymous && !session?.user) return { error: 'Entre na sua conta para enviar uma ocorrência identificada, ou marque a opção anônima.' }
  const image = String(form.get('image') ?? '')
  if (image && (image.length > 7_000_000 || !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(image))) return { error: 'Use uma imagem JPG ou PNG de até 5 MB.' }
  const code = randomBytes(12).toString('hex').toUpperCase()
  const id = `FV-${new Date().getFullYear()}-${randomBytes(8).toString('hex').toUpperCase()}`
  let report: Report
  try {
    report = { id, code: '', type: field(form, 'type', 1, 80), material: field(form, 'material', 1, 80),
    description: field(form, 'description', 10, 3000), neighborhood: field(form, 'neighborhood', 2, 200),
    status: 'Recebida', priority: 'Média', anonymous, created: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Porto_Velho' }).format(new Date()),
      publicNote: '', internalNote: '', history: ['Recebida'], ...(image ? { image } : {}) }
  } catch {
    return { error: 'Confira a descrição (10 a 3.000 caracteres), o bairro e os demais campos.' }
  }
  await db.insert(reports).values({ id, codeHash: hashReportCode(code), userId: anonymous ? null : session!.user.id, data: report })
  return { report: { ...publicReport(report), code } }
}

export async function lookupReport(id: string, code: string) {
  await ensureDatabase()
  if (typeof id !== 'string' || typeof code !== 'string' || id.length > 60 || !/^[a-f0-9]{24}$/i.test(code)) return null
  const [row] = await db.select().from(reports).where(and(eq(reports.id, id.toUpperCase()), eq(reports.codeHash, hashReportCode(code)))).limit(1)
  return row ? publicReport(row.data) : null
}

export async function updateReport(id: string, form: FormData) {
  await requireAdministrator()
  const status = field(form, 'status', 1, 50)
  if (!['Recebida', 'Em análise', 'Encaminhada', 'Em atendimento', 'Resolvida', 'Informações insuficientes', 'Não procedente'].includes(status)) throw new Error('Situação inválida.')
  const publicNote = field(form, 'publicNote', 0, 2000)
  const internalNote = field(form, 'internalNote', 0, 2000)
  await db.transaction(async tx => {
    const [row] = await tx.select().from(reports).where(eq(reports.id, id)).for('update')
    if (!row) throw new Error('Ocorrência não encontrada.')
    await tx.update(reports).set({ data: { ...row.data, status, publicNote, internalNote,
      history: row.data.status === status ? row.data.history : [...row.data.history, status] } }).where(eq(reports.id, id))
  })
}

export async function createPoint(form: FormData) {
  await requireAdministrator()
  const lat = Number(field(form, 'lat', 1, 20))
  const lng = Number(field(form, 'lng', 1, 20))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error('Coordenadas inválidas.')
  const id = randomUUID()
  await db.insert(points).values({ id, data: { id, name: field(form, 'name'), neighborhood: field(form, 'neighborhood'), address: field(form, 'address'),
    materials: field(form, 'materials').split(',').map(item => item.trim()).filter(Boolean), hours: field(form, 'hours'), type: field(form, 'type'), verified: false, lat, lng } })
}

export async function setPointVerified(id: string, verified: boolean) {
  await requireAdministrator()
  if (typeof verified !== 'boolean') throw new Error('Verificação inválida.')
  const [row] = await db.select().from(points).where(eq(points.id, id))
  if (!row) throw new Error('Ponto não encontrado.')
  await db.update(points).set({ data: { ...row.data, verified } }).where(eq(points.id, id))
}

export async function createCampaign(form: FormData) {
  await requireAdministrator()
  const status = field(form, 'status')
  if (!['Publicada', 'Rascunho', 'Encerrada'].includes(status)) throw new Error('Situação inválida.')
  const id = randomUUID()
  await db.insert(campaigns).values({ id, data: { id, title: field(form, 'title'), description: field(form, 'description', 10, 2000),
    neighborhood: field(form, 'neighborhood'), period: field(form, 'period'), category: field(form, 'category'), status } })
}

export async function setCampaignStatus(id: string, status: string) {
  await requireAdministrator()
  if (!['Publicada', 'Rascunho', 'Encerrada'].includes(status)) throw new Error('Situação inválida.')
  const [row] = await db.select().from(campaigns).where(eq(campaigns.id, id))
  if (!row) throw new Error('Campanha não encontrada.')
  await db.update(campaigns).set({ data: { ...row.data, status } }).where(eq(campaigns.id, id))
}
