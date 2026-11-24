'use server'

import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAdministrator } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { posts } from '@/lib/db/schema'

export async function getPublishedPosts() {
  const db = await getDatabase()
  return db.select({
    id: posts.id,
    title: posts.title,
    summary: posts.summary,
    content: posts.content,
    category: posts.category,
    createdAt: posts.createdAt,
  }).from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt)).limit(50)
}

export async function getAdminPosts() {
  await requireAdministrator()
  const db = await getDatabase()
  return db.select().from(posts).orderBy(desc(posts.updatedAt)).limit(100)
}

export async function createPost(formData: FormData) {
  const userId = await requireAdministrator()
  const db = await getDatabase()
  const title = String(formData.get('title') ?? '').trim()
  const summary = String(formData.get('summary') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const category = String(formData.get('category') ?? 'Notícia').trim().slice(0, 40)
  if (title.length < 4 || title.length > 140 || summary.length < 10 || summary.length > 240 || content.length < 30 || content.length > 12000) {
    throw new Error('Revise o título, resumo e conteúdo antes de salvar.')
  }
  await db.insert(posts).values({ id: crypto.randomUUID(), title, summary, content, category, userId })
  revalidatePath('/ADM')
  revalidatePath('/conta')
  revalidatePath('/app')
}

export async function setPostPublished(id: string, published: boolean) {
  await requireAdministrator()
  const db = await getDatabase()
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Publicação inválida.')
  await db.update(posts).set({ published, updatedAt: new Date() }).where(eq(posts.id, id))
  revalidatePath('/ADM')
  revalidatePath('/conta')
  revalidatePath('/app')
}

export async function deletePost(id: string) {
  await requireAdministrator()
  const db = await getDatabase()
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Publicação inválida.')
  await db.delete(posts).where(eq(posts.id, id))
  revalidatePath('/ADM')
  revalidatePath('/conta')
  revalidatePath('/app')
}
