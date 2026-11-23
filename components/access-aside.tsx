import Image from 'next/image'
import Link from 'next/link'
import { MapPin, MessageSquare, Sprout } from 'lucide-react'

export function AccessAside({ administrator = false }: { administrator?: boolean }) {
  return <aside className="portal-auth-aside">
    <Link href="/app" className="access-brand" aria-label="FerroViva, portal cidadão"><Image src="/ferroviva-logo.png" alt="FerroViva" width={180} height={120} priority /></Link>
    <div className="portal-auth-copy">
      <span className="portal-eyebrow">PORTO VELHO · RONDÔNIA</span>
      <h2>{administrator ? <>Da ocorrência<br/>à solução.</> : <>Seu bairro.<br/>Seu cuidado.<br/><span>Uma cidade melhor.</span></>}</h2>
      <p>{administrator ? 'Um espaço para ouvir a comunidade, acompanhar os registros e organizar cada próximo passo.' : 'Encontre um destino para seus resíduos e participe do cuidado com o lugar onde você vive.'}</p>
      <ul className="access-features">
        <li><MapPin size={22}/><span><b>{administrator ? 'Mantenha o mapa atualizado' : 'Encontre pontos de descarte'}</b><small>Consulte materiais recebidos e horários.</small></span></li>
        <li><MessageSquare size={22}/><span><b>{administrator ? 'Acompanhe cada ocorrência' : 'Faça sua parte no bairro'}</b><small>{administrator ? 'Responda com informações claras à comunidade.' : 'Registre situações e acompanhe as respostas.'}</small></span></li>
        <li><Sprout size={22}/><span><b>{administrator ? 'Aproxime a comunidade' : 'Aprenda e participe'}</b><small>Orientações e ações ambientais em um só lugar.</small></span></li>
      </ul>
    </div>
    <footer>FerroViva · Projeto acadêmico de educação ambiental</footer>
  </aside>
}
