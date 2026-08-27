"use client";

import { useEffect, useState, useRef } from "react";

const AMAP_TILES = [
  "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  "https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
];

// 自定义 SVG 标记图标，不依赖任何外部 CDN
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
  lat: number | null;
  lng: number | null;
  name: string;
  address: string;
  onLatLngChange: (lat: number, lng: number) => void;
  onNameChange: (name: string) => void;
  onAddressChange: (address: string) => void;
};

export default function LocationPicker({ lat, lng, name, address, onLatLngChange, onNameChange, onAddressChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // 获取当前位置
  const getCurrentPosition = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = parseFloat(pos.coords.latitude.toFixed(6));
        const newLng = parseFloat(pos.coords.longitude.toFixed(6));
        onLatLngChange(newLat, newLng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
          }
        }
        reverseGeocode(newLat, newLng);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 反向地理编码 - 使用 OpenStreetMap Nominatim，带超时保护
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh&zoom=16`,
        { signal: controller.signal, headers: { "User-Agent": "MeetEase/1.0" } }
      );
      clearTimeout(timeout);
      const data = await res.json();
      if (data.display_name) {
        onAddressChange(data.display_name);
      }
      if (data.address) {
        const parts = [data.address.city, data.address.town, data.address.village, data.address.county]
          .filter(Boolean);
        const district = data.address.suburb || data.address.city_district || "";
        const road = data.address.road || "";
        const suggestedName = [district, road].filter(Boolean).join(" ") || parts[0] || "";
        if (suggestedName && !name) {
          onNameChange(suggestedName);
        }
      }
    } catch {
      // 超时或失败时静默处理，用户可手动输入地址
    }
  };

  // 初始化地图
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = async () => {
      const L = await import("leaflet");

      if (!mapRef.current || mapInstanceRef.current) return;

      const defaultLat = lat || 39.9042;
      const defaultLng = lng || 116.4074;

      const map = L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(AMAP_TILES[0], {
        maxZoom: 18,
        minZoom: 3,
        attribution: "&copy; 高德地图",
      }).addTo(map);

      const customIcon = createMarkerIcon(L);
      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const newLat = parseFloat(pos.lat.toFixed(6));
        const newLng = parseFloat(pos.lng.toFixed(6));
        onLatLngChange(newLat, newLng);
        reverseGeocode(newLat, newLng);
      });

      map.on("click", (e: any) => {
        const newLat = parseFloat(e.latlng.lat.toFixed(6));
        const newLng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        onLatLngChange(newLat, newLng);
        reverseGeocode(newLat, newLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    };

    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // 从外部更新标记位置
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && lat && lng && mapReady) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
    }
  }, [lat, lng, mapReady]);

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="地点名称，如：朝阳公园"
          className="mac-input px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="详细地址"
            className="mac-input px-3 py-2 text-sm flex-1"
          />
          <button
            type="button"
            onClick={getCurrentPosition}
            disabled={geoLoading}
            className="px-3 py-2 rounded-xl bg-meet-100 hover:bg-meet-200 text-meet-700 text-sm transition shrink-0 flex items-center gap-1 disabled:opacity-50"
            title="获取当前位置"
          >
            {geoLoading ? (
              <div className="w-4 h-4 border-2 border-meet-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            定位
          </button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="number"
          step="any"
          value={lat ?? ""}
          onChange={(e) => {
            const v = parseFloat(e.target.value) || 0;
            onLatLngChange(v, lng || 0);
          }}
          placeholder="纬度"
          className="mac-input px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="any"
          value={lng ?? ""}
          onChange={(e) => {
            const v = parseFloat(e.target.value) || 0;
            onLatLngChange(lat || 0, v);
          }}
          placeholder="经度"
          className="mac-input px-3 py-2 text-sm"
        />
      </div>
      <div
        ref={mapRef}
        className="w-full h-56 rounded-2xl overflow-hidden border border-meet-100"
        style={{ zIndex: 1 }}
      />
      {!mapReady && (
        <div className="flex items-center gap-2 justify-center text-xs text-meet-400 py-2">
          <div className="w-3 h-3 border-2 border-meet-400 border-t-transparent rounded-full animate-spin" />
          加载地图中...
        </div>
      )}
      <p className="text-[10px] text-meet-400 text-center">地图数据 &copy; 高德地图 | 在地图上点击或拖动标记选择位置</p>
    </div>
  );
}