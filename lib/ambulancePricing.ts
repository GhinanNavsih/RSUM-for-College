/**
 * ═══════════════════════════════════════════════════════════════
 * AMBULANCE PRICING MODULE
 * ═══════════════════════════════════════════════════════════════
 * Distance-based ambulance pricing calculator
 * Replaces Excel-based per-desa pricing with formula-based approach
 * 
 * Features:
 * - Deterministic: Same inputs → same outputs
 * - Auditable: All intermediate values stored
 * - Config-driven: Constants per vehicle type
 * - Google Maps integration ready
 * ═══════════════════════════════════════════════════════════════
 */

import { AmbulanceMetadata } from '@/types/models';

// ============================================
// TYPES
// ============================================

export type AmbulanceVehicleType = 'GRANDMAX' | 'AMBULANS_JENAZAH' | 'PREGIO';
export type AmbulanceServiceType = 'PASIEN' | 'JENAZAH' | 'NON_MEDIS';

/**
 * Configuration for ambulance tariff calculation
 */
export interface AmbulanceTariffConfig {
  costPerKm: number;        // Cost per kilometer (BBA basis)
  driverPct: number;        // Driver cost as % of BBA (0.16 = 16%)
  adminPct: number;         // Admin cost as % of BBA
  maintenancePct: number;   // Maintenance cost as % of BBA
  hospitalPct: number;      // Hospital service cost as % of BBA
  taxPct: number;           // Tax (PPN) as % of subtotal (0.10 = 10%)
}

/**
 * Input for ambulance tariff calculation
 */
export interface AmbulanceCalculationInput {
  vehicleType: AmbulanceVehicleType;
  serviceType: AmbulanceServiceType;
  oneWayKm: number;
  googleMapsUrl?: string;
}

/**
 * Output from ambulance tariff calculation
 */
export interface AmbulanceCalculationResult {
  meta: AmbulanceMetadata;
  total: number;
}

// ============================================
// CONFIGURATION
// ============================================

/**
 * DEFAULT ambulance pricing configuration per vehicle type
 * Based on Excel sheet constants (2023)
 * 
 * These are fallback values if Firestore config is not available
 * Actual values should be managed through the UI (/prices page)
 */
export const DEFAULT_AMBULANCE_CONFIG: Record<AmbulanceVehicleType, AmbulanceTariffConfig> = {
  GRANDMAX: {
    costPerKm: 3120,        // From Excel: Grandmax - Dalam Kota
    driverPct: 0.16,        // 16% of BBA
    adminPct: 0.16,         // 16% of BBA
    maintenancePct: 0.25,   // 25% of BBA
    hospitalPct: 0.25,      // 25% of BBA
    taxPct: 0.10,           // 10% PPN
  },
  AMBULANS_JENAZAH: {
    costPerKm: 3120,
    driverPct: 0.16,
    adminPct: 0.16,
    maintenancePct: 0.25,
    hospitalPct: 0.25,
    taxPct: 0.10,
  },
  PREGIO: {
    costPerKm: 3120,
    driverPct: 0.16,
    adminPct: 0.16,
    maintenancePct: 0.25,
    hospitalPct: 0.25,
    taxPct: 0.10,
  },
};

/**
 * Legacy export for backward compatibility
 * @deprecated Use getAmbulanceConfigFromFirestore() for real-time data
 */
export const AMBULANCE_CONFIG = DEFAULT_AMBULANCE_CONFIG;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Firestore AmbulanceConfig to AmbulanceTariffConfig
 * Used to extract just the tariff calculation fields from a full config object
 */
export function configToTariffConfig(config: any): AmbulanceTariffConfig {
  return {
    costPerKm: config.costPerKm,
    driverPct: config.driverPct,
    adminPct: config.adminPct,
    maintenancePct: config.maintenancePct,
    hospitalPct: config.hospitalPct,
    taxPct: config.taxPct,
  };
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate ambulance tariff based on distance and vehicle type
 * 
 * Formula:
 * 1. roundTripKm = oneWayKm × 2
 * 2. BBA (fuel) = roundTripKm × costPerKm
 * 3. Driver cost = BBA × driverPct
 * 4. Admin cost = BBA × adminPct
 * 5. Maintenance cost = BBA × maintenancePct
 * 6. Hospital cost = BBA × hospitalPct
 * 7. Subtotal = BBA + driver + admin + maintenance + hospital
 * 8. Tax (PPN) = subtotal × taxPct
 * 9. TOTAL = subtotal + tax
 * 
 * @param input - Calculation input parameters
 * @param customConfig - Optional custom configuration (e.g., from Firestore)
 * @returns Detailed calculation result with metadata and total
 * 
 * @example
 * const result = calculateAmbulanceTariff({
 *   vehicleType: 'GRANDMAX',
 *   serviceType: 'PASIEN',
 *   oneWayKm: 1.9,
 *   googleMapsUrl: 'https://maps.google.com/...'
 * });
 * console.log(result.total); // e.g., 26104
 */
export function calculateAmbulanceTariff(
  input: AmbulanceCalculationInput,
  customConfig?: AmbulanceTariffConfig
): AmbulanceCalculationResult {
  // Use custom config if provided, otherwise fall back to default config
  const config = customConfig || AMBULANCE_CONFIG[input.vehicleType];
  
  if (!config) {
    throw new Error(`Unknown vehicle type: ${input.vehicleType}`);
  }

  // Step 1: Calculate round trip distance
  const roundTripKm = input.oneWayKm * 2;

  // Step 2: Calculate BBA (Bahan Bakar Ambulans - fuel cost)
  const bba = roundTripKm * config.costPerKm;

  // Step 3: Calculate component costs based on BBA percentages
  const driverCost = bba * config.driverPct;
  const adminCost = bba * config.adminPct;
  const maintenanceCost = bba * config.maintenancePct;
  const hospitalCost = bba * config.hospitalPct;

  // Step 4: Calculate subtotal (sum of all components)
  const subtotal = bba + driverCost + adminCost + maintenanceCost + hospitalCost;

  // Step 5: Calculate tax (PPN)
  const taxAmount = subtotal * config.taxPct;

  // Step 6: Calculate total
  const total = subtotal + taxAmount;

  // Build metadata with all intermediate values for auditability
  const meta: AmbulanceMetadata = {
    vehicleType: input.vehicleType,
    serviceType: input.serviceType,
    oneWayKm: input.oneWayKm,
    roundTripKm: roundTripKm,
    costPerKm: config.costPerKm,
    bba: bba,
    driverPct: config.driverPct,
    adminPct: config.adminPct,
    maintenancePct: config.maintenancePct,
    hospitalPct: config.hospitalPct,
    taxPct: config.taxPct,
    driverCost: driverCost,
    adminCost: adminCost,
    maintenanceCost: maintenanceCost,
    hospitalCost: hospitalCost,
    subtotal: subtotal,
    taxAmount: taxAmount,
    googleMapsUrl: input.googleMapsUrl,
  };

  return {
    meta,
    total: Math.round(total), // Round to nearest integer
  };
}

/**
 * Format ambulance service description
 * 
 * @param meta - Ambulance metadata
 * @returns Formatted service description
 * 
 * @example
 * formatAmbulanceDescription(meta)
 * // Returns: "Ambulance GRANDMAX - PASIEN (1.9 km)"
 */
export function formatAmbulanceDescription(meta: AmbulanceMetadata): string {
  return `Ambulance ${meta.vehicleType} - ${meta.serviceType} (${meta.oneWayKm} km satu arah)`;
}

/**
 * Generate detailed breakdown text for display/printing
 * 
 * @param meta - Ambulance metadata
 * @returns Formatted breakdown string
 * 
 * @example
 * console.log(getAmbulanceBreakdown(meta));
 * // Outputs:
 * // Jarak: 1.9 km (satu arah), 3.8 km (PP)
 * // BBA: Rp 11,856
 * // Pengemudi (16%): Rp 1,897
 * // ...
 */
export function getAmbulanceBreakdown(meta: AmbulanceMetadata): string {
  const lines = [
    `Jarak: ${meta.oneWayKm} km (satu arah), ${meta.roundTripKm} km (PP)`,
    `BBA (${meta.costPerKm}/km): Rp ${Math.round(meta.bba).toLocaleString('id-ID')}`,
    `Pengemudi (${(meta.driverPct * 100).toFixed(0)}%): Rp ${Math.round(meta.driverCost).toLocaleString('id-ID')}`,
    `Administrasi (${(meta.adminPct * 100).toFixed(0)}%): Rp ${Math.round(meta.adminCost).toLocaleString('id-ID')}`,
    `Pemeliharaan (${(meta.maintenancePct * 100).toFixed(0)}%): Rp ${Math.round(meta.maintenanceCost).toLocaleString('id-ID')}`,
    `Jasa RS (${(meta.hospitalPct * 100).toFixed(0)}%): Rp ${Math.round(meta.hospitalCost).toLocaleString('id-ID')}`,
    `Subtotal: Rp ${Math.round(meta.subtotal).toLocaleString('id-ID')}`,
    `PPN (${(meta.taxPct * 100).toFixed(0)}%): Rp ${Math.round(meta.taxAmount).toLocaleString('id-ID')}`,
    `TOTAL: Rp ${Math.round(meta.subtotal + meta.taxAmount).toLocaleString('id-ID')}`,
  ];
  
  return lines.join('\n');
}

/**
 * Validate calculation input
 * 
 * @param input - Input to validate
 * @throws Error if input is invalid
 */
export function validateCalculationInput(input: AmbulanceCalculationInput): void {
  if (!input.vehicleType) {
    throw new Error('Vehicle type is required');
  }
  
  if (!input.serviceType) {
    throw new Error('Service type is required');
  }
  
  if (input.oneWayKm <= 0) {
    throw new Error('Distance must be greater than 0');
  }
  
  if (!AMBULANCE_CONFIG[input.vehicleType as AmbulanceVehicleType]) {
    throw new Error(`Invalid vehicle type: ${input.vehicleType}`);
  }
}

/**
 * Get all available vehicle types
 */
export function getVehicleTypes(): AmbulanceVehicleType[] {
  return Object.keys(AMBULANCE_CONFIG) as AmbulanceVehicleType[];
}

/**
 * Get all available service types
 */
export function getServiceTypes(): AmbulanceServiceType[] {
  return ['PASIEN', 'JENAZAH', 'NON_MEDIS'];
}

/**
 * Get configuration for a specific vehicle type
 * 
 * @param vehicleType - Vehicle type
 * @returns Configuration object
 */
export function getVehicleConfig(vehicleType: AmbulanceVehicleType): AmbulanceTariffConfig {
  return AMBULANCE_CONFIG[vehicleType];
}

// ============================================
// EXAMPLE USAGE
// ============================================

/*
Example 1: Calculate tariff for Grandmax to Peterongan (1.9 km)

const result = calculateAmbulanceTariff({
  vehicleType: 'GRANDMAX',
  serviceType: 'PASIEN',
  oneWayKm: 1.9,
});

console.log(result.total);           // 26104
console.log(result.meta.bba);        // 11856 (3.8 km × 3120)
console.log(result.meta.driverCost); // 1897 (11856 × 0.16)
console.log(result.meta.subtotal);   // 23731
console.log(result.meta.taxAmount);  // 2373 (23731 × 0.10)

// Store as VisitService
const ambulanceService: VisitService = {
  id: uuidv4(),
  category: 'AMBULANCE',
  nama: formatAmbulanceDescription(result.meta),
  harga: result.total,
  quantity: 1,
  total: result.total,
  notes: getAmbulanceBreakdown(result.meta),
  ambulanceMeta: result.meta,
};

Example 2: With Google Maps URL

const result = calculateAmbulanceTariff({
  vehicleType: 'GRANDMAX',
  serviceType: 'PASIEN',
  oneWayKm: 5.3,
  googleMapsUrl: 'https://maps.google.com/directions/...',
});

// The URL is stored in meta.googleMapsUrl for audit trail
*/

