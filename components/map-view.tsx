'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Point } from '@/lib/demo-data'
const pin=L.divIcon({className:'ferroviva-pin-wrap',html:'<span class="ferroviva-pin"><span></span></span>',iconSize:[30,38],iconAnchor:[15,36],popupAnchor:[0,-32]})
export default function MapView({points}:{points:Point[]}){return <MapContainer center={[-8.76,-63.895]} zoom={12} scrollWheelZoom={false} className="leaflet-map" aria-label="Mapa demonstrativo de pontos de descarte em Porto Velho"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><Marker position={[-8.76,-63.895]} icon={L.divIcon({className:'city-marker',html:'<span>Porto Velho</span>',iconSize:[90,24],iconAnchor:[45,12]})}/>{points.map(p=><Marker key={p.id} position={[p.lat,p.lng]} icon={pin}><Popup><b>{p.name}</b><br/>{p.neighborhood}<br/><small>{p.materials.join(' · ')}</small></Popup></Marker>)}</MapContainer>}
