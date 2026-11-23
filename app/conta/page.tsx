import { redirect } from 'next/navigation'
import { CitizenAccount } from '@/components/citizen-account'
import { readSession } from '@/lib/auth'
import { getPublishedPosts } from '@/app/actions/posts'
import { getOwnReports } from '@/app/actions/environment'

export default async function CitizenAccountPage() {
  const session = await readSession()
  if (!session?.user) redirect('/usuarios')
  if (session.user.role === 'admin') redirect('/ADM')
  const [articles, reports] = await Promise.all([getPublishedPosts(), getOwnReports()])
  return <CitizenAccount name={session.user.name} email={session.user.email} articles={articles} reports={reports} />
}
