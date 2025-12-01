// Type definitions for the RSUM IGD Information System

// ============================================
// PATIENT TYPES
// ============================================

export type InsuranceType = "BPJS" | "Pribadi" | "Asuransi Lain" | "Lainnya";
export type JenisKelamin = "Laki-laki" | "Perempuan";
export type StatusPernikahan = "Belum Menikah" | "Menikah" | "Cerai Hidup" | "Cerai Mati";
export type HubunganPenanggungJawab = 
  | "Anak" 
  | "Kakek/Nenek" 
  | "Orang Tua" 
  | "Paman/Bibi" 
  | "Pasangan" 
  | "Pasien Sendiri"
  | "Pengasuh Asrama" 
  | "Pengurus Asrama" 
  | "Teman" 
  | "Tetangga"
  | "Lainnya";

// Address structure for structured location data
export interface PatientAddress {
  provinsiId?: string;
  provinsiName?: string;
  kabupatenId?: string;
  kabupatenName?: string;
  kecamatanId?: string;
  kecamatanName?: string;
  desaId?: string;
  desaName?: string;
  detailAlamat?: string;  // Street address, RT/RW, etc.
}

export interface Patient {
  id: string;                           // Firestore doc id
  noRM: string;                         // Nomor Rekam Medis - REQUIRED
  nama: string;                         // Nama lengkap - REQUIRED
  nik?: string;                         // NIK (KTP) - REQUIRED for new, optional for old data
  tanggalLahir?: string;                // Tanggal lahir (ISO date) - REQUIRED for new, optional for old data
  umur?: number;                        // Computed from tanggalLahir (optional)
  jenisKelamin?: JenisKelamin;          // Jenis kelamin - REQUIRED for new, optional for old data
  alamat?: string;                      // Alamat lengkap (legacy text field) - REQUIRED for new, optional for old data
  alamatLengkap?: PatientAddress;       // Structured address data (new)
  noTelp?: string;                      // No. telepon / HP - REQUIRED for new, optional for old data
  email?: string;                       // Email (optional)
  statusPernikahan?: StatusPernikahan;  // Status pernikahan (optional)
  pekerjaan?: string;                   // Pekerjaan (optional)
  namaPenanggungJawab?: string;         // Nama penanggung jawab - REQUIRED for new, optional for old data
  hubunganPenanggungJawab?: HubunganPenanggungJawab; // Hubungan penanggung jawab - REQUIRED for new, optional for old data
  kontakPenanggungJawab?: string;       // Kontak penanggung jawab - REQUIRED for new, optional for old data
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
}

// ============================================
// VISIT TYPES
// ============================================

export type VisitType = "IGD" | "Rawat Jalan" | "Rawat Inap";
export type AsuransiType = "Umum" | "BPJS" | "P2KS" | "YAPETIDU";

export type VisitStatus = "igd_in_progress" | "igd_done";
export type PaymentStatus = "unpaid" | "paid";
export type DispensationStatus = "pending" | "done";

// Billing categories for generalized billing line items
export type BillingCategory =
  | 'PERAWATAN_KAMAR'
  | 'ALAT_TINDAKAN_PARAMEDIS'
  | 'KAMAR_OPERASI'
  | 'PEMERIKSAAN_UGD'
  | 'VISITE_DOKTER'
  | 'KONSUL_DOKTER'
  | 'BHP_OBAT_ALKES'
  | 'PENUNJANG'
  | 'RESUME_MEDIS'
  | 'VISUM_MEDIS'
  | 'AMBULANCE'
  | 'ADMINISTRASI'
  | 'LAINNYA';

// Helper constant for organizing billing sections (primarily for Rawat Inap)
export const BILLING_SECTIONS = [
  { key: 'PERAWATAN_KAMAR' as BillingCategory, label: 'PERAWATAN/KAMAR', no: 1 },
  { key: 'ALAT_TINDAKAN_PARAMEDIS' as BillingCategory, label: 'ALAT & TINDAKAN PARAMEDIS', no: 2 },
  { key: 'KAMAR_OPERASI' as BillingCategory, label: 'KAMAR OPERASI', no: 3 },
  { key: 'PEMERIKSAAN_UGD' as BillingCategory, label: 'PEMERIKSAAN DI UGD', no: 4 },
  { key: 'VISITE_DOKTER' as BillingCategory, label: 'VISITE DOKTER', no: 5 },
  { key: 'KONSUL_DOKTER' as BillingCategory, label: 'KONSUL DOKTER', no: 6 },
  { key: 'BHP_OBAT_ALKES' as BillingCategory, label: 'BHP (OBAT & ALKES)', no: 7 },
  { key: 'PENUNJANG' as BillingCategory, label: 'PENUNJANG (LAB, RO, USG, ECG, dll.)', no: 8 },
  { key: 'RESUME_MEDIS' as BillingCategory, label: 'RESUME MEDIS', no: 9 },
  { key: 'VISUM_MEDIS' as BillingCategory, label: 'VISUM MEDIS', no: 10 },
  { key: 'AMBULANCE' as BillingCategory, label: 'AMBULANCE', no: 11 },
  { key: 'ADMINISTRASI' as BillingCategory, label: 'ADMINISTRASI', no: 12 },
  { key: 'LAINNYA' as BillingCategory, label: 'LAINNYA', no: 99 },
];

// Ambulance-specific metadata for detailed pricing breakdown
export interface AmbulanceMetadata {
  vehicleType: 'GRANDMAX' | 'AMBULANS_JENAZAH' | 'PREGIO' | string;
  serviceType: 'PASIEN' | 'JENAZAH' | 'NON_MEDIS' | string;
  oneWayKm: number;
  roundTripKm: number;
  costPerKm: number;
  bba: number;                  // Bahan Bakar Ambulans (fuel cost)
  driverPct: number;            // Driver percentage
  adminPct: number;             // Admin percentage
  maintenancePct: number;       // Maintenance percentage
  hospitalPct: number;          // Hospital service percentage
  taxPct: number;               // Tax percentage (PPN)
  driverCost: number;           // Calculated driver cost
  adminCost: number;            // Calculated admin cost
  maintenanceCost: number;      // Calculated maintenance cost
  hospitalCost: number;         // Calculated hospital service cost
  subtotal: number;             // Sum before tax
  taxAmount: number;            // Tax amount (PPN)
  googleMapsUrl?: string;       // Optional URL for audit trail
}

// Generalized billing line item (used for services/tindakan)
// All new fields are optional for backward compatibility with existing IGD visits
export interface VisitService {
  id: string;                   // local uuid inside the visit
  nama: string;                 // Description / nama layanan
  harga: number;                // Price per unit (tarif satuan)
  quantity?: number;            // Quantity (default 1 for backward compatibility)
  category?: BillingCategory;   // NEW: Billing category (default 'LAINNYA' if missing)
  unit?: string;                // NEW: Unit description (e.g. 'hari', 'kali', 'x', 'paket')
  total?: number;               // NEW: Total price (harga × quantity), optional/computed
  dokter?: string;              // NEW: Doctor name (for VISITE_DOKTER / KONSUL_DOKTER)
  notes?: string;               // NEW: Additional notes (e.g. lab details: "DL, Chol, Tg")
  ambulanceMeta?: AmbulanceMetadata; // NEW: Detailed ambulance pricing breakdown
}

export interface VisitPrescription {
  id: string;             // local uuid
  drugId?: string;        // Reference to drugs collection (for stock tracking)
  obatId?: string;        // optional internal code (legacy)
  namaObat: string;       // human readable
  qty: number;
  aturanPakai?: string;   // e.g. "3x1"
  pricePerUnit?: number;  // Price snapshot at time of prescription
  totalPrice?: number;    // qty × pricePerUnit (for billing)
}

export interface Visit {
  id: string;                 // Firestore doc id
  patientId: string;          // reference to patients.id
  tanggalKunjungan: string;   // ISO timestamp
  jenis: VisitType;
  dokter: string;
  rujukan?: string;           // Referral source (e.g., hospital name, clinic, self-referral)
  asuransi?: AsuransiType;    // Insurance type
  status: VisitStatus;        // IGD flow status
  services: VisitService[];   // list of tindakan for billing
  prescriptions: VisitPrescription[]; // list of obat for Farmasi
  totalBiaya: number;         // computed from services
  paymentStatus: PaymentStatus;
  paymentTime?: string;       // ISO timestamp when paid
  paymentMethod?: string;     // e.g. "cash", "debit", "kartu kredit"
  kasirUserId?: string;
  dispensationStatus: DispensationStatus;
  dispensationTime?: string;  // when obat given
  farmasiUserId?: string;
  createdByUserId: string;    // who created the visit (IGD user)
  createdAt: string;
  updatedAt: string;
}

// ============================================
// USER TYPES
// ============================================

export type UserRole = "admin" | "igd" | "kasir" | "farmasi";

export interface AppUser {
  id: string;           // Firebase auth uid
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DOCTOR TYPES
// ============================================

export type DoctorSpecialization =
  | 'Umum'
  | 'Sp.A'          // Spesialis Anak
  | 'Sp.PD'         // Penyakit Dalam
  | 'Sp.B'          // Bedah
  | 'Sp.OG'         // Obgyn
  | 'Sp.P'          // Paru
  | 'Sp.JP'         // Jantung
  | 'Lainnya';

export type DoctorDepartment =
  | 'IGD'
  | 'Rawat Jalan'
  | 'Rawat Inap'
  | 'Kamar Bersalin'
  | 'Poli Umum'
  | 'Poli Anak'
  | 'Poli Penyakit Dalam'
  | 'Lainnya';

export interface Doctor {
  id: string;                   // Firestore doc id
  fullName: string;             // e.g. "dr. Ahmad Fulan, Sp.PD"
  shortName?: string;           // e.g. "dr. Ahmad"
  gender?: 'Laki-laki' | 'Perempuan';
  sipNumber?: string;           // Nomor SIP (optional at first)
  specialization?: DoctorSpecialization;
  department?: DoctorDepartment;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DRUG TYPES
// ============================================

export type DrugUnit = 
  | "Tablet" 
  | "Kapsul" 
  | "Kaplet"
  | "Botol" 
  | "Ampul" 
  | "Vial" 
  | "Tube" 
  | "Strip"
  | "Box"
  | "Sachet"
  | "ml"
  | "mg"
  | "Lainnya";

export interface Drug {
  id: string;              // Firestore doc id
  drugId: string;          // Custom drug ID (e.g., "DRG-001")
  drugName: string;        // Nama obat
  unit: DrugUnit;          // Satuan (Tablet, Kapsul, dll)
  pricePerUnit: number;    // Harga per satuan
  stockQty: number;        // Stok saat ini
  minStockQty?: number;    // Minimum stock alert level (optional)
  isActive: boolean;       // Status aktif/nonaktif
  description?: string;    // Deskripsi obat (optional)
  manufacturer?: string;   // Pabrik pembuat (optional)
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}

// ============================================
// SERVICE PRICING TYPES (TARIF LAYANAN)
// ============================================

// Unified pricing model for all billing categories
// Sub-categories for PERAWATAN_KAMAR
export type ServiceSubCategory =
  | 'TARIF_KAMAR'          // Base room rental price
  | 'BIAYA_PERAWATAN'      // Doctor/nursing/admin fees by room class
  | 'PERINATOLOGI';        // NICU/baby-related services

// Room class types for PERAWATAN_KAMAR pricing
export type RoomClass =
  | 'KLS_3'      // Kelas 3
  | 'KLS_2'      // Kelas 2
  | 'KLS_1'      // Kelas 1
  | 'VIP'        // VIP
  | 'KABER'      // Kamar Bersalin
  | 'ICU'        // ICU
  | 'BOX'        // Perinatologi - Box
  | 'COUVE'      // Perinatologi - Couveuse
  | 'INCUBATOR'; // Perinatologi - Incubator

export interface ServicePrice {
  id: string;              // Firestore doc id
  category: BillingCategory; // Which billing category this belongs to
  subCategory?: ServiceSubCategory;  // NEW: Sub-category (for PERAWATAN_KAMAR)
  serviceName: string;     // Name of service/item (e.g., "ICU", "Visite Dokter Spesialis")
  price: number;           // Price (tarif)
  unit: string;            // Unit (e.g., "Hari", "Kali", "Paket", "x")
  isActive: boolean;       // Status aktif/nonaktif
  roomClass?: RoomClass;   // NEW: Room class for per-class pricing
  description?: string;    // Optional description
  code?: string;           // Optional service code (e.g., "ICU-001")
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}

// Ambulance configuration stored in Firestore (editable via UI)
export interface AmbulanceConfig {
  id: string;              // Firestore doc id (vehicleType as ID)
  vehicleType: 'GRANDMAX' | 'AMBULANS_JENAZAH' | 'PREGIO' | string;
  costPerKm: number;       // Cost per kilometer
  driverPct: number;       // Driver percentage (0-1, e.g., 0.16 = 16%)
  adminPct: number;        // Admin percentage
  maintenancePct: number;  // Maintenance percentage
  hospitalPct: number;     // Hospital service percentage
  taxPct: number;          // Tax percentage (PPN)
  isActive: boolean;       // Active status
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}

// Legacy type for backward compatibility
export interface RoomPrice {
  id: string;
  roomType: string;
  pricePerDay: number;
  unit: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

