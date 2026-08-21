/**
 * Geospatial Haversine Proximity & Transit Time Calculation Engine
 */

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_MILES = 3958.8;

/**
 * Converts degrees to radians
 * @param {number} deg
 * @returns {number}
 */
const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Calculates Great-Circle spherical distance using the Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {'km'|'miles'} [unit='km']
 * @returns {number}
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
  const p1Lat = Number(lat1);
  const p1Lon = Number(lon1);
  const p2Lat = Number(lat2);
  const p2Lon = Number(lon2);

  if (isNaN(p1Lat) || isNaN(p1Lon) || isNaN(p2Lat) || isNaN(p2Lon)) {
    return 0;
  }

  // If identical coordinates
  if (p1Lat === p2Lat && p1Lon === p2Lon) {
    return 0;
  }

  const dLat = toRad(p2Lat - p1Lat);
  const dLon = toRad(p2Lon - p1Lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1Lat)) * Math.cos(toRad(p2Lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const radius = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM;

  const distance = radius * c;
  return Number(distance.toFixed(2));
};

/**
 * Estimates driving / transit time in minutes given a distance in kilometers
 * Includes city traffic friction factor
 * @param {number} distanceKm
 * @param {'emergency'|'standard'|'transit'} [mode='emergency']
 * @returns {number} estimated minutes
 */
export const calculateTravelTimeMinutes = (distanceKm, mode = 'emergency') => {
  const d = Math.max(0, Number(distanceKm) || 0);
  if (d === 0) return 1;

  // Speeds in km/h based on mode
  let avgSpeed = 40; // standard urban driving
  let baseFriction = 3; // minutes startup / parking

  if (mode === 'emergency') {
    avgSpeed = 55; // emergency transit
    baseFriction = 1;
  } else if (mode === 'transit') {
    avgSpeed = 25; // public bus/subway
    baseFriction = 8;
  }

  const travelMinutes = (d / avgSpeed) * 60 + baseFriction;
  return Math.max(1, Math.round(travelMinutes));
};

/**
 * Checks if target coordinates are within a specified radius
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @param {number} radiusKm
 * @returns {boolean}
 */
export const isWithinRadius = (lat1, lon1, lat2, lon2, radiusKm) => {
  const dist = calculateHaversineDistance(lat1, lon1, lat2, lon2, 'km');
  return dist <= radiusKm;
};

/**
 * Computes bounding box coordinates for geospatial index optimization
 * @param {number} centerLat
 * @param {number} centerLon
 * @param {number} radiusKm
 * @returns {{ minLat: number, maxLat: number, minLon: number, maxLon: number }}
 */
export const getBoundingBox = (centerLat, centerLon, radiusKm) => {
  const latDelta = radiusKm / 111; // ~111 km per degree latitude
  const lonDelta = radiusKm / (111 * Math.cos(toRad(centerLat)));

  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLon: centerLon - lonDelta,
    maxLon: centerLon + lonDelta,
  };
};
