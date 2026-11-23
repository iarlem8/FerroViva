'use client'

import { useState, useTransition } from 'react'
import { createPost, deletePost, setPostPublished } from '@/app/actions/posts'

type Post = {
  id: string
  title: string
  summary: string
  content: string
  category: string
  published: boolean
  createdAt: Date
}

export function AdminPostManager({ posts }: { posts: Post[] }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    startTransition(async () => {
      try {
        await createPost(data)
        form.reset()
        setMessage('Rascunho criado. Publique quando estiver pronto.')
      } catch {
        setMessage('Não foi possível salvar. Confira os campos e tente novamente.')
      }
    })
  }

  return (
    <div className="admin-post-layout">
      <form className="portal-panel admin-post-form" onSubmit={submit}>
        <div className="portal-section-heading">
          <span className="portal-eyebrow">NOVA PUBLICAÇÃO</span>
          <h2>Escreva para a comunidade</h2>
          <p>Os rascunhos ficam privados até você publicar.</p>
        </div>
        <label>Título<input name="title" required minLength={4} maxLength={140} placeholder="Ex.: Como separar resíduos em casa" /></label>
        <label>Categoria<select name="category" defaultValue="Notícia"><option>Notícia</option><option>Educação ambiental</option><option>Campanha</option><option>Comunicado</option></select></label>
        <label>Resumo<textarea name="summary" required minLength={10} maxLength={240} rows={2} placeholder="Uma apresentação curta para a página do cidadão" /></label>
        <label>Conteúdo<textarea name="content" required minLength={30} maxLength={12000} rows={7} placeholder="Desenvolva a publicação com informações úteis e verificadas." /></label>
        {message && <p className="portal-form-message" role="status">{message}</p>}
        <button className="portal-button" disabled={pending}>{pending ? 'Salvando…' : 'Salvar como rascunho'}</button>
      </form>
      <section className="portal-panel admin-post-list" aria-labelledby="posts-heading">
        <div className="portal-section-heading"><span className="portal-eyebrow">CONTEÚDO</span><h2 id="posts-heading">Publicações</h2><p>{posts.length} itens no painel</p></div>
        {!posts.length && <p className="portal-empty">Ainda não há publicações. Crie seu primeiro rascunho ao lado.</p>}
        {posts.map((post) => (
          <article className="admin-post-item" key={post.id}>
            <div className="admin-post-item-top"><span className="portal-category">{post.category}</span><span className={`portal-status ${post.published ? 'is-published' : ''}`}>{post.published ? 'Publicado' : 'Rascunho'}</span></div>
            <h3>{post.title}</h3><p>{post.summary}</p>
            <div className="admin-post-actions">
              <button type="button" disabled={pending} onClick={() => startTransition(async () => {
                try { await setPostPublished(post.id, !post.published) } catch { setMessage('Não foi possível atualizar a publicação.') }
              })}>{post.published ? 'Retirar do ar' : 'Publicar'}</button>
              <button className="danger-action" type="button" disabled={pending} onClick={() => {
                if (!window.confirm('Excluir esta publicação permanentemente?')) return
                startTransition(async () => {
                  try { await deletePost(post.id) } catch { setMessage('Não foi possível excluir a publicação.') }
                })
              }}>Excluir</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
