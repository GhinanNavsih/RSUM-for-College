/**
 * ═══════════════════════════════════════════════════════════════
 * GOOGLE MAPS SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Calculate distance between two locations using Google Maps API
 * Used for ambulance service distance calculation
 * ═══════════════════════════════════════════════════════════════
 */

export interface DistanceResult {
  distanceKm: number;      // Distance in kilometers
  distanceText: string;    // Formatted distance (e.g., "5.3 km")
  durationText: string;    // Estimated duration (e.g., "15 mins")
  mapsUrl: string;         // Google Maps directions URL
  status: 'success' | 'error';
  errorMessage?: string;
}

/**
 * Calculate distance between two locations using Google Maps Distance Matrix API
 * 
 * @param origin - Starting address or coordinates
 * @param destination - Destination address or coordinates
 * @returns Distance result with km, formatted text, and Maps URL
 * 
 * @example
 * const result = await calculateDistance(
 *   'Jl. Sudirman No. 45, Ponorogo',
 *   'RS UNIPDU Medika, Ponorogo'
 * );
 * console.log(result.distanceKm); // 5.3
 * console.log(result.mapsUrl); // https://www.google.com/maps/dir/...
 */
export async function calculateDistance(
  origin: string,
  destination: string
): Promise<DistanceResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key not configured');
    return {
      distanceKm: 0,
      distanceText: 'N/A',
      durationText: 'N/A',
      mapsUrl: '',
      status: 'error',
      errorMessage: 'API key tidak dikonfigurasi. Hubungi administrator.',
    };
  }

  try {
    // Build Distance Matrix API URL
    const apiUrl = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    apiUrl.searchParams.append('origins', origin);
    apiUrl.searchParams.append('destinations', destination);
    apiUrl.searchParams.append('key', apiKey);
    apiUrl.searchParams.append('units', 'metric');
    apiUrl.searchParams.append('language', 'id');

    // Call API
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check API response status
    if (data.status !== 'OK') {
      throw new Error(`API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    // Extract distance data
    const element = data.rows[0]?.elements[0];
    
    if (!element || element.status !== 'OK') {
      throw new Error('Tidak dapat menghitung jarak. Periksa alamat yang dimasukkan.');
    }

    const distanceMeters = element.distance.value;
    const distanceKm = distanceMeters / 1000;
    const distanceText = element.distance.text;
    const durationText = element.duration.text;

    // Build Google Maps directions URL
    const mapsUrl = buildMapsDirectionsUrl(origin, destination);

    return {
      distanceKm,
      distanceText,
      durationText,
      mapsUrl,
      status: 'success',
    };
  } catch (error: any) {
    console.error('Error calculating distance:', error);
    return {
      distanceKm: 0,
      distanceText: 'N/A',
      durationText: 'N/A',
      mapsUrl: '',
      status: 'error',
      errorMessage: error.message || 'Gagal menghitung jarak',
    };
  }
}

/**
 * Build Google Maps directions URL for audit trail
 * 
 * @param origin - Starting location
 * @param destination - Destination location
 * @returns Google Maps URL
 */
export function buildMapsDirectionsUrl(origin: string, destination: string): string {
  const baseUrl = 'https://www.google.com/maps/dir/';
  const encodedOrigin = encodeURIComponent(origin);
  const encodedDestination = encodeURIComponent(destination);
  return `${baseUrl}${encodedOrigin}/${encodedDestination}`;
}

/**
 * Validate address input
 * 
 * @param address - Address to validate
 * @returns true if valid, false otherwise
 */
export function validateAddress(address: string): boolean {
  if (!address || address.trim().length < 5) {
    return false;
  }
  return true;
}

/**
 * Format address for API call
 * Adds city/region if not present to improve accuracy
 * 
 * @param address - Raw address input
 * @param defaultCity - Default city to append (e.g., "Ponorogo")
 * @returns Formatted address
 */
export function formatAddressForAPI(address: string, defaultCity: string = 'Ponorogo'): string {
  const trimmed = address.trim();
  
  // If address doesn't contain the city name, append it
  if (!trimmed.toLowerCase().includes(defaultCity.toLowerCase())) {
    return `${trimmed}, ${defaultCity}`;
  }
  
  return trimmed;
}

/**
 * Get default hospital address
 */
export function getHospitalAddress(): string {
  return 'RS UNIPDU Medika, Jl. Raya Ponorogo-Trenggalek, Ronowijayan, Ponorogo, Jawa Timur';
}

// ============================================
// EXAMPLE USAGE
// ============================================

/*
Example 1: Calculate distance from patient location to hospital

const result = await calculateDistance(
  'Jl. Sudirman No. 45, Ponorogo',
  'RS UNIPDU Medika, Ponorogo'
);

if (result.status === 'success') {
  console.log(`Distance: ${result.distanceKm} km`);
  console.log(`Duration: ${result.durationText}`);
  console.log(`Maps URL: ${result.mapsUrl}`);
} else {
  console.error(result.errorMessage);
}

Example 2: With formatted address

const pickupLocation = 'Jl. Merdeka No. 10';
const formattedAddress = formatAddressForAPI(pickupLocation, 'Ponorogo');
// "Jl. Merdeka No. 10, Ponorogo"

const result = await calculateDistance(
  formattedAddress,
  getHospitalAddress()
);

Example 3: Error handling

const result = await calculateDistance('invalid', 'address');

if (result.status === 'error') {
  alert(result.errorMessage);
  // Show manual distance input as fallback
}
*/

