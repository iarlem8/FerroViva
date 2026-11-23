import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'
import type { Report } from '@/lib/demo-data'

type Article = {
  id: string
  title: string
  summary: string
  content: string
  category: string
  createdAt: Date
}

export function CitizenAccount({ name, email, articles, reports }: { name: string; email: string; articles: Article[]; reports: Report[] }) {
  return (
    <main className="portal-page">
      <header className="portal-topbar"><Link className="portal-brand" href="/app"><span className="portal-brand-mark">F</span><span>FerroViva<small>PORTAL CIDADÃO</small></span></Link><nav><Link href="/app">Página inicial</Link><SignOutButton /></nav></header>
      <div className="portal-container">
        <section className="portal-welcome">
          <div><span className="portal-eyebrow">SUA ÁREA FERROVIVA</span><h1>Olá, {name.split(' ')[0]}.</h1><p>Acompanhe novidades, orientações e ações da comunidade.</p></div>
          <div className="portal-account-chip"><span className="portal-avatar">{name.slice(0, 1).toUpperCase()}</span><span><b>{name}</b><small>{email}</small></span></div>
        </section>
        <section className="portal-feed" aria-labelledby="reports-title">
          <div className="portal-feed-heading"><div><h2 id="reports-title">Minhas ocorrências</h2><p>Registros enviados com sua identificação. Para envios anônimos, use o protocolo e o código.</p></div><Link className="portal-button" href="/app">Registrar ocorrência</Link></div>
          {!reports.length ? <p className="portal-empty">Você ainda não enviou ocorrências identificadas.</p> : <div className="portal-article-grid">{reports.map(report => <article className="portal-article" key={report.id}><span className="portal-category">{report.status}</span><h3>{report.neighborhood}</h3><p className="portal-article-summary">{report.description}</p><p className="portal-article-content">{report.publicNote || 'Aguardando análise da equipe.'}</p><small className="report-id">{report.id}</small></article>)}</div>}
        </section>
        <section className="portal-feed" aria-labelledby="feed-title">
          <div className="portal-feed-heading"><div><span className="portal-eyebrow">DO BLOG FERROVIVA</span><h2 id="feed-title">Novidades para você</h2><p>Conteúdo publicado pela equipe para informar e inspirar.</p></div><span className="portal-feed-count">{articles.length} {articles.length === 1 ? 'publicação' : 'publicações'}</span></div>
          {!articles.length ? <div className="portal-empty"><span className="portal-empty-mark">FV</span><h3>Novas histórias em breve</h3><p>Quando a equipe publicar novidades, elas aparecerão aqui.</p><Link href="/app">Explorar a FerroViva</Link></div> :
            <div className="portal-article-grid">{articles.map((article) => (
              <article className="portal-article" key={article.id}>
                <div className="portal-article-meta"><span className="portal-category">{article.category}</span><time dateTime={article.createdAt.toISOString()}>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(article.createdAt)}</time></div>
                <h3>{article.title}</h3><p className="portal-article-summary">{article.summary}</p><details><summary>Ler publicação</summary><p className="portal-article-content">{article.content}</p></details>
              </article>
            ))}</div>}
        </section>
        <footer className="portal-footer">FerroViva <span>·</span> Seu lugar. Seu lixo. Seu impacto.</footer>
      </div>
    </main>
  )
}
