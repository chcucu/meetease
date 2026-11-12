export type GeoPoint = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;
const CITY_SPEED_KMH = 22;
const WALK_MINUTES = 8;

function isValidPoint(point: GeoPoint): boolean {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

/** 两点间大圆距离（公里）。 */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 按 22km/h 城市平均速度加 8 分钟步行接驳估算通勤分钟数，向上取整。 */
export function estimateCommuteMinutes(km: number): number {
  return Math.ceil((km / CITY_SPEED_KMH) * 60 + WALK_MINUTES);
}

/** 所有带坐标地点的等权几何中心；无合法坐标时返回 null。 */
export function fairPoint(points: GeoPoint[]): GeoPoint | null {
  const valid = points.filter(isValidPoint);
  if (valid.length === 0) return null;
  const total = valid.reduce(
    (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: Math.round((total.lat / valid.length) * 1e6) / 1e6,
    lng: Math.round((total.lng / valid.length) * 1e6) / 1e6,
  };
}

/** 距离格式化：不足 1 公里显示米，否则保留一位小数公里。 */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
