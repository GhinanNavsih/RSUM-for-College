/**
 * ═══════════════════════════════════════════════════════════════
 * LOCATION SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Fetches Indonesian location data (Provinsi, Kabupaten, Kecamatan, Desa)
 * directly from GitHub repository: https://github.com/ibnux/data-indonesia
 * 
 * Data structure:
 * - provinsi.json: All provinces
 * - kabupaten/[provinsiId].json: Districts by province
 * - kecamatan/[kabupatenId].json: Subdistricts by district
 * - kelurahan/[kecamatanId].json: Villages by subdistrict
 * ═══════════════════════════════════════════════════════════════
 */

const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com/ibnux/data-indonesia/master';

export interface LocationItem {
  id: string;
  nama: string;
}

// Cache to reduce API calls
const cache: { [key: string]: LocationItem[] } = {};

/**
 * Fetch data from GitHub with caching
 */
async function fetchFromGitHub(path: string): Promise<LocationItem[]> {
  // Check cache first
  if (cache[path]) {
    return cache[path];
  }

  try {
    const url = `${GITHUB_RAW_BASE_URL}/${path}`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache[path] = data;
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
}

/**
 * Get all provinces
 */
export async function getProvinsi(): Promise<LocationItem[]> {
  return fetchFromGitHub('provinsi.json');
}

/**
 * Get all kabupaten (districts) for a specific province
 * @param provinsiId - Province ID (e.g., "11" for Aceh)
 */
export async function getKabupaten(provinsiId: string): Promise<LocationItem[]> {
  if (!provinsiId) return [];
  return fetchFromGitHub(`kabupaten/${provinsiId}.json`);
}

/**
 * Get all kecamatan (subdistricts) for a specific kabupaten
 * @param kabupatenId - Kabupaten ID (e.g., "1101" for Kab. Simeulue)
 */
export async function getKecamatan(kabupatenId: string): Promise<LocationItem[]> {
  if (!kabupatenId) return [];
  return fetchFromGitHub(`kecamatan/${kabupatenId}.json`);
}

/**
 * Get all kelurahan/desa (villages) for a specific kecamatan
 * @param kecamatanId - Kecamatan ID (e.g., "110101" for Teupah Selatan)
 */
export async function getKelurahan(kecamatanId: string): Promise<LocationItem[]> {
  if (!kecamatanId) return [];
  return fetchFromGitHub(`kelurahan/${kecamatanId}.json`);
}

/**
 * Get location name by ID
 */
export function getLocationName(locations: LocationItem[], id: string): string {
  const location = locations.find(loc => loc.id === id);
  return location?.nama || '';
}

/**
 * Build full address string from structured data
 */
export function buildFullAddress(
  detailAlamat: string,
  desaName: string,
  kecamatanName: string,
  kabupatenName: string,
  provinsiName: string
): string {
  const parts = [
    detailAlamat,
    desaName && `Desa/Kel. ${desaName}`,
    kecamatanName && `Kec. ${kecamatanName}`,
    kabupatenName,
    provinsiName,
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Clear cache (useful for testing or if data needs refresh)
 */
export function clearLocationCache() {
  Object.keys(cache).forEach(key => delete cache[key]);
}

