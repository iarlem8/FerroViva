import { CitizenApp } from '@/components/ferroviva-app'
import { getPublicData } from '@/app/actions/environment'
import { readSession } from '@/lib/auth'

export default async function Page() {
  const [data, session] = await Promise.all([getPublicData(), readSession()])
  return <CitizenApp initial={data} signedIn={Boolean(session?.user)} />
}
