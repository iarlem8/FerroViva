import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import './portal.css'
export const metadata: Metadata = {title:'FerroViva — Seu lugar. Seu lixo. Seu impacto.',description:'Encontre destinos para seus resíduos, participe de ações ambientais, acompanhe publicações e cuide de Porto Velho.',applicationName:'FerroViva',icons:{icon:'/ferroviva-logo.png',apple:'/ferroviva-logo.png'}}
export const viewport: Viewport = {colorScheme:'light',themeColor:'#f5f7f2',width:'device-width',initialScale:1,maximumScale:5}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body className="antialiased">{children}{process.env.NODE_ENV==='production'&&process.env.VERCEL==='1'&&<Analytics/>}</body></html>}
