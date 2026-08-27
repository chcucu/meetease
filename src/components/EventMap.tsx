"use client";

import { useEffect, useRef } from "react";

const AMAP_TILES = [
  "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
];

function createMarkerIcon(L: any) {
  return L.divIcon({
    className: "",
    html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ms" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="#0284c7" filter="url(#ms)"/>
      <circle cx="14" cy="14" r="7" fill="white"/>
      <circle cx="14" cy="14" r="5" fill="#f59e0b"/>
    </svg>`,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
  });
}

type Props = {
  lat: number;
  lng: number;
  name: string;
};

export default function EventMap({ lat, lng, name }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !mapRef.current) return;
    initialized.current = true;

    const init = async () => {
      const L = await import("leaflet");

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer(AMAP_TILES[0], {
        maxZoom: 18,
        minZoom: 3,
        attribution: "&copy; 高德地图",
      }).addTo(map);

      const customIcon = createMarkerIcon(L);
      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(name)
        .openPopup();
    };

    init();
  }, [lat, lng, name]);

  return (
    <div
      ref={mapRef}
      className="w-full h-56 rounded-2xl overflow-hidden border border-meet-100"
      style={{ zIndex: 1 }}
    />
  );
}