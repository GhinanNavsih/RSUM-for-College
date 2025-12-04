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
  name: string;  // Alias for nama (for compatibility)
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
    
    // Map 'nama' to 'name' for compatibility
    const mappedData = data.map((item: any) => ({
      id: item.id,
      nama: item.nama,
      name: item.nama,  // Add 'name' as alias
    }));
    
    // Cache the result
    cache[path] = mappedData;
    
    return mappedData;
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
 * Get location name by type and ID
 * @param type - Type of location ('provinsi', 'kabupaten', 'kecamatan', 'desa')
 * @param id - Location ID
 */
export async function getLocationName(type: string, id: string): Promise<string> {
  if (!id) return '';
  
  try {
    let data: LocationItem[] = [];
    
    switch (type) {
      case 'provinsi':
        data = await getProvinsi();
        break;
      case 'kabupaten':
        // Need to fetch all kabupaten - this is a limitation
        // For now, return empty or we need parent ID
        return '';
      case 'kecamatan':
        return '';
      case 'desa':
        return '';
      default:
        return '';
    }
    
    const location = data.find(loc => loc.id === id);
    return location?.nama || '';
  } catch (error) {
    console.error(`Error getting location name for ${type}:`, error);
    return '';
  }
}

/**
 * Build full address string from structured data
 */
export async function buildFullAddress(params: {
  provinsiId: string;
  kabupatenId: string;
  kecamatanId: string;
  desaId: string;
  detailAlamat?: string;
}): Promise<string> {
  try {
    const { provinsiId, kabupatenId, kecamatanId, desaId, detailAlamat } = params;
    
    // Fetch location names
    const provinsiList = await getProvinsi();
    const provinsi = provinsiList.find(p => p.id === provinsiId);
    
    const kabupatenList = provinsiId ? await getKabupaten(provinsiId) : [];
    const kabupaten = kabupatenList.find(k => k.id === kabupatenId);
    
    const kecamatanList = kabupatenId ? await getKecamatan(kabupatenId) : [];
    const kecamatan = kecamatanList.find(k => k.id === kecamatanId);
    
    const desaList = kecamatanId ? await getKelurahan(kecamatanId) : [];
    const desa = desaList.find(d => d.id === desaId);
    
    // Build address parts
    const parts = [
      detailAlamat,
      desa?.nama && `Desa/Kel. ${desa.nama}`,
      kecamatan?.nama && `Kec. ${kecamatan.nama}`,
      kabupaten?.nama,
      provinsi?.nama,
    ].filter(Boolean);
    
    return parts.join(', ');
  } catch (error) {
    console.error('Error building full address:', error);
    return '';
  }
}

/**
 * Clear cache (useful for testing or if data needs refresh)
 */
export function clearLocationCache() {
  Object.keys(cache).forEach(key => delete cache[key]);
}

