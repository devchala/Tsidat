// Browser-only module: import lazily via ./Maps
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import { DEFAULT_CENTER, PRIORITY, type PriorityLevel } from "@/lib/tsidat";

const TILE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}
function Recenter({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (pos) map.setView(pos, Math.max(map.getZoom(), 16)); }, [pos, map]);
  return null;
}

export function PickerMap({ value, onChange }: { value: [number, number] | null; onChange: (lat: number, lng: number) => void }) {
  return (
    <MapContainer center={value ?? DEFAULT_CENTER} zoom={value ? 16 : 13} className="h-72 w-full">
      <TileLayer url={TILE} attribution={ATTR} />
      <ClickHandler onPick={onChange} />
      <Recenter pos={value} />
      {value && <CircleMarker center={value} radius={11} pathOptions={{ color: "oklch(0.42 0.09 158)", fillOpacity: 0.6 }} />}
    </MapContainer>
  );
}

export type MapPoint = { id: string; lat: number; lng: number; priority: string; title: string; subtitle?: string; onClick?: () => void };

export function PointsMap({ points, height = "h-96" }: { points: MapPoint[]; height?: string }) {
  const center: [number, number] = points.length ? [points[0].lat, points[0].lng] : DEFAULT_CENTER;
  return (
    <MapContainer center={center} zoom={13} className={`${height} w-full`}>
      <TileLayer url={TILE} attribution={ATTR} />
      {points.map((p) => {
        const c = PRIORITY[p.priority as PriorityLevel]?.color ?? "gray";
        return (
          <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={p.priority === "critical" ? 12 : 9} pathOptions={{ color: c, fillColor: c, fillOpacity: 0.7 }}>
            <Popup>
              <strong>{p.title}</strong>
              {p.subtitle && <div>{p.subtitle}</div>}
              {p.onClick && <button style={{ marginTop: 6, textDecoration: "underline" }} onClick={p.onClick}>Open</button>}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
