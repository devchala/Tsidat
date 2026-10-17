import "leaflet/dist/leaflet.css";

import type * as Leaflet from "leaflet";
import { useEffect, useRef } from "react";

type Point = { latitude: number; longitude: number };
type Props = { value: Point | null; onChange: (point: Point) => void };
const DEFAULT_CENTER: [number, number] = [9.0108, 38.7613];

export default function LocationPicker({ value, onChange }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const marker = useRef<Leaflet.CircleMarker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const latitude = value?.latitude;
  const longitude = value?.longitude;

  useEffect(() => {
    let disposed = false;
    let instance: Leaflet.Map | null = null;
    void import("leaflet").then((L) => {
      if (disposed || !container.current) return;
      const center = value
        ? ([value.latitude, value.longitude] as [number, number])
        : DEFAULT_CENTER;
      instance = L.map(container.current, { zoomControl: true }).setView(center, 15);
      map.current = instance;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(instance);
      instance.on("click", (event: Leaflet.LeafletMouseEvent) => {
        onChangeRef.current({ latitude: event.latlng.lat, longitude: event.latlng.lng });
      });
      if (value) {
        marker.current = L.circleMarker(center, {
          radius: 9,
          color: "#ffffff",
          weight: 3,
          fillColor: "#23714f",
          fillOpacity: 1,
        }).addTo(instance);
      }
    });
    return () => {
      disposed = true;
      instance?.remove();
      map.current = null;
      marker.current = null;
    };
    // Initialize the map once; updates to the selected pin are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap || latitude == null || longitude == null) return;
    const point: [number, number] = [latitude, longitude];
    if (marker.current) marker.current.setLatLng(point);
    else {
      void import("leaflet").then((L) => {
        if (!map.current || marker.current) return;
        marker.current = L.circleMarker(point, {
          radius: 9,
          color: "#ffffff",
          weight: 3,
          fillColor: "#23714f",
          fillOpacity: 1,
        }).addTo(currentMap);
      });
    }
    currentMap.panTo(point);
  }, [latitude, longitude]);

  return (
    <div
      ref={container}
      role="application"
      aria-label="Tap the map to choose the waste location"
      style={{
        height: 245,
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#e7eee8",
      }}
    />
  );
}
