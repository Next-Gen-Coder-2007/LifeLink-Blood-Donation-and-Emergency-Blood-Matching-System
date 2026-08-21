/**
 * Geospatial Haversine Proximity & Transit Distance Engine (Frontend)
 */

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Great-Circle Haversine distance in Kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === 0 && lon1 === 0) return 0;
  if (lat2 === 0 && lon2 === 0) return 0;
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = EARTH_RADIUS_KM * c;

  return Number(dist.toFixed(1));
}

/**
 * Estimates emergency driving travel time in minutes with urban friction
 */
export function calculateTravelTimeMinutes(
  distanceKm: number,
  mode: "emergency" | "standard" | "transit" = "emergency"
): number {
  const d = Math.max(0, distanceKm);
  if (d === 0) return 1;

  let speedKmh = 50; // emergency driving
  let baseMinutes = 2;

  if (mode === "standard") {
    speedKmh = 35;
    baseMinutes = 4;
  } else if (mode === "transit") {
    speedKmh = 22;
    baseMinutes = 8;
  }

  const travelMins = (d / speedKmh) * 60 + baseMinutes;
  return Math.max(1, Math.round(travelMins));
}

export function formatDistance(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return "Location uncalibrated";
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

export function formatTravelTime(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return "~15 mins";
  }
  if (minutes < 60) {
    return `~${minutes} mins`;
  }
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `~${hrs}h ${rem}m`;
}
