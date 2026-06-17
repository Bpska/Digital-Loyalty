/**
 * Haversine formula — calculates the great-circle distance between two
 * GPS coordinates on the Earth's surface, in meters.
 *
 * Used by the check-in engine to validate that a customer is within
 * the configured radius of a branch.
 */

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate distance between two GPS points in meters.
 *
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lon1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lon2 - Longitude of point 2 (degrees)
 * @returns Distance in meters (float)
 */
export function haversineDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Check if a customer GPS point is within the branch acceptance radius.
 */
export function isWithinRadius(
  customerLat,
  customerLon,
  branchLat,
  branchLon,
  radiusMeters
) {
  const distance = haversineDistance(customerLat, customerLon, branchLat, branchLon);
  return distance <= radiusMeters;
}

/**
 * Detect suspicious GPS coordinates that indicate spoofing:
 * - Null Island (0, 0)
 * - Coordinates at exact integer values (common emulator default)
 * - Values outside realistic bounds
 */
export function isSuspiciousCoordinates(lat, lon) {
  if (lat === 0 && lon === 0) return true;                    // Null Island
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return true; // Out of bounds
  if (Number.isInteger(lat) && Number.isInteger(lon)) return true; // Suspiciously round
  return false;
}

/**
 * Detect impossible travel: check if a customer could realistically have
 * moved from lastLat/lastLon to currentLat/currentLon in elapsedMs.
 *
 * Maximum plausible speed = 900 km/h (plane). If their speed exceeds this,
 * the location jump is physically impossible without GPS spoofing.
 *
 * @param elapsedMs - Time elapsed in milliseconds since last known location
 * @returns true if the travel is physically impossible
 */
export function isImpossibleTravel(
  lastLat,
  lastLon,
  currentLat,
  currentLon,
  elapsedMs
) {
  if (elapsedMs <= 0) return false;
  const distanceMeters = haversineDistance(lastLat, lastLon, currentLat, currentLon);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const speedKmh = distanceMeters / 1000 / elapsedHours;
  const MAX_SPEED_KMH = 900; // Fastest commercial aircraft
  return speedKmh > MAX_SPEED_KMH;
}
