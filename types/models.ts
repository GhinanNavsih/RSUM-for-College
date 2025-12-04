// Type definitions for the RSUM IGD Information System

// ============================================
// PATIENT TYPES
// ============================================

export type RegistrationStatus = 'TEMPORARY' | 'COMPLETE';
export type EmergencyTriageLevel = 'MERAH' | 'KUNING' | 'HIJAU' | 'HITAM';

export type InsuranceType = "BPJS" | "Pribadi" | "Asuransi Lain" | "Lainnya";
export type JenisKelamin = "Laki-laki" | "Perempuan";
export type JenisKelaminShort = "L" | "P";  // Short version for IGD intake
export type StatusPernikahan = 
  | "Belum Kawin"
  | "Cerai Hidup"
  | "Cerai Mati"
  | "Kawin"
  | "Lainnya";
export type HubunganPenanggungJawab = 
  | "Anak" 
  | "Kakek/Nenek" 
  | "Orang Tua" 
  | "Paman/Bibi" 
  | "Pasien Sendiri"
  | "Pengasuh Asrama" 
  | "Pengurus Asrama" 
  | "Suami/Istri"
  | "Teman" 
  | "Tetangga"
  | "Lainnya";

export type AgamaType = 
  | "Islam"
  | "Protestan"
  | "Katolik"
  | "Hindu"
  | "Buddha"
  | "Konghucu"
  | "Lainnya";

export type JenisAsuransiType =
  | "Umum"
  | "BPJS"
  | "BPJS TK"
  | "P2KS"
  | "KIS"
  | "Jasaraharja"
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
  
  // REGISTRATION STATUS (NEW)
  registrationStatus?: RegistrationStatus;  // 'TEMPORARY' or 'COMPLETE' (undefined = 'COMPLETE' for old data)
  
  // Legacy fields (kept for backward compatibility)
  noRM?: string;                        // Nomor Rekam Medis (may exist only after full registration)
  nama?: string;                        // Nama lengkap (legacy)
  nik?: string;                         // NIK (KTP)
  tanggalLahir?: string;                // Tanggal lahir (ISO date)
  umur?: number;                        // Computed from tanggalLahir (optional)
  jenisKelamin?: JenisKelamin;          // Jenis kelamin (legacy format)
  alamat?: string;                      // Alamat lengkap (legacy text field)
  alamatLengkap?: PatientAddress;       // Structured address data
  noTelp?: string;                      // No. telepon / HP
  email?: string;                       // Email (optional)
  statusPernikahan?: StatusPernikahan;  // Status pernikahan (optional)
  pekerjaan?: string;                   // Pekerjaan (optional)
  namaPenanggungJawab?: string;         // Nama penanggung jawab
  hubunganPenanggungJawab?: HubunganPenanggungJawab; // Hubungan penanggung jawab
  kontakPenanggungJawab?: string;       // Kontak penanggung jawab
  
  // --- DataPasien Sementara (IGD) ---
  tempDoctorId?: string;                // Dokter ID (reference to doctors collection)
  tempDoctorName?: string;              // Dokter name (for display)
  tempNurseId?: string;                 // Perawat/Bidan ID (could be string or reference)
  tempNurseName?: string;               // Perawat/Bidan name (for display)
  tempFullName?: string;                // Nama Lengkap (temporary)
  tempAge?: number;                     // Umur
  tempWeightKg?: number;                // Berat badan (kg)
  tempGender?: JenisKelaminShort;       // Jenis kelamin (L/P)
  tempDomicile?: string;                // Domisili singkat (desa/kota)
  tempPhoneNumber?: string;             // No HP Pasien
  tempFamilyContact?: string;           // Kontak keluarga
  tempChiefComplaint?: string;          // Keluhan Utama
  tempTriage?: EmergencyTriageLevel;    // Triase (Merah/Kuning/Hijau/Hitam)
  tempDischargeReason?: string;         // Alasan Pulang (Pulang, Rujuk, Meninggal, etc.)
  tempSectioEmergency?: boolean;        // Sectio Caesarea Emergency (yes/no)
  
  // --- DataPasien Lengkap (Resepsionis) ---
  fullName?: string;                    // Nama Lengkap (full registration)
  birthDate?: string;                   // Tanggal Lahir (ISO date)
  gender?: JenisKelaminShort;           // Jenis kelamin (L/P)
  phoneNumber?: string;                 // No Telp utama
  insuranceType?: JenisAsuransiType;    // Jenis Asuransi
  religion?: AgamaType;                 // Agama
  maritalStatus?: string;               // Status Pernikahan
  addressProvinceId?: string;           // ID Provinsi
  addressProvinceName?: string;         // Nama Provinsi
  addressRegencyId?: string;            // ID Kabupaten
  addressRegencyName?: string;          // Nama Kabupaten
  addressDistrictId?: string;           // ID Kecamatan
  addressDistrictName?: string;         // Nama Kecamatan
  addressVillageId?: string;            // ID Desa
  addressVillageName?: string;          // Nama Desa
  addressDetail?: string;               // Detail alamat (RT/RW, no rumah, dll)
  guarantorName?: string;               // Nama penanggung jawab
  guarantorRelationship?: string;       // Hubungan penanggung jawab
  guarantorPhone?: string;              // Nomor HP penanggung jawab
  extraDocuments?: string[];            // URLs to uploaded documents (KTP/BPJS, etc.)
  
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

// ============================================
// VISIT EXAMINATION TYPES
// ============================================

export type ConsciousnessLevel =
  | 'COMPOS_MENTIS'
  | 'APATIS'
  | 'DELIRIUM'
  | 'SOMNOLEN'
  | 'SOPOR'
  | 'SEMI_KOMA'
  | 'KOMA';

export interface VisitExam {
  // Meta
  examDate: string;        // ISO date-time; default = now when first created
  doctorId: string;        // Dokter yang memeriksa
  nurseId: string;         // Perawat/Bidan yang memeriksa

  // Vital signs
  tempC?: number;          // Suhu (°C)
  respiratoryRate?: number; // RR (breaths/min)
  bloodPressureSys?: number; // Sistolik
  bloodPressureDia?: number; // Diastolik
  spo2?: number;           // Saturasi O2 (%)
  heartRate?: number;      // Nadi (beats/min)

  // GCS – Glasgow Coma Scale
  gcsEye?: 1 | 2 | 3 | 4;             // E
  gcsVerbal?: 1 | 2 | 3 | 4 | 5;      // V
  gcsMotor?: 1 | 2 | 3 | 4 | 5 | 6;   // M
  gcsTotal?: number;                  // auto-computed: E+V+M

  // Anthropometrics & allergies
  heightCm?: number;       // Tinggi badan (cm)
  weightKg?: number;       // Berat badan (kg)
  allergies?: string;      // Alergi

  // Level of consciousness (descriptive)
  consciousnessLevel?: ConsciousnessLevel;

  // SOAP + KIE
  subjective?: string;     // Subject
  objective?: string;      // Object
  assessment?: string;     // Asesmen
  plan?: string;           // Plan
  kie?: string;            // KIE

  // Penunjang (supporting investigations)
  penunjangLabRequested?: boolean;      // Laboratorium
  penunjangRadioRequested?: boolean;    // Radiologi
  penunjangOtherRequested?: boolean;    // Lainnya
  penunjangOtherText?: string;          // Keterangan Lainnya

  // Diagnosis
  diagnosis?: string;            // Diagnosa Utama (required in form)
  diagnosisSecondary?: string;   // Diagnosa Tambahan (optional)
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
  exam?: VisitExam;           // NEW: Data Pemeriksaan for this visit
  createdAt: string;
  updatedAt: string;
}

// ============================================
// USER TYPES
// ============================================

export type UserRole = "admin" | "igd" | "kasir" | "farmasi" | "resepsionis" | "lab" | "radiologi";

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
// DRUG PURCHASE TYPES (PEMBELIAN OBAT)
// ============================================

export interface DrugPurchaseItem {
  drugId: string;          // Firestore doc id of drug
  drugCode: string;        // Custom drug ID (e.g., "DRG-001")
  drugName: string;        // Nama obat
  quantity: number;        // Jumlah yang dibeli
  unit: string;            // Satuan (Tablet, Kapsul, dll)
  unitPrice: number;       // Harga satuan saat pembelian
  subtotal: number;        // quantity * unitPrice
}

export interface DrugPurchase {
  id: string;              // Firestore doc id
  supplierName: string;    // Nama supplier
  purchaseDate: string;    // Tanggal pembelian (ISO string)
  invoiceUrl: string;      // Firebase Storage URL of uploaded nota
  invoiceFileName?: string;// Original filename for display
  items: DrugPurchaseItem[];
  totalAmount: number;     // Sum of all subtotals
  notes?: string;          // Catatan tambahan (optional)
  createdAt: string;       // ISO timestamp
  createdBy: string;       // UID of user who created
  updatedAt?: string;      // ISO timestamp
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

// ============================================
// LAB ORDER TYPES
// ============================================

import type { LabTestGroupId, LabTestId } from "./lab-tests";

export type LabOrderStatus = "REQUESTED" | "COMPLETED";

export interface LabTestSelection {
  testId: LabTestId;
  groupId: LabTestGroupId;
  label: string;
}

export interface LabOrder {
  id: string;              // use visitId as id (1 lab order per visit)
  visitId: string;
  patientId: string;
  createdAt: string;
  createdBy?: string;      // uid of lab user (optional for now)
  updatedAt?: string;      // ISO timestamp when last updated
  updatedBy?: string;      // uid of user who last updated
  status: LabOrderStatus;
  tests: LabTestSelection[]; // only the checked tests
}

// ============================================
// RADIOLOGY ORDER TYPES
// ============================================

import type { RadiologyTestGroupId, RadiologyTestId } from "./radiology-tests";

export type RadiologyOrderStatus = "REQUESTED" | "COMPLETED";

export interface RadiologyTestSelection {
  testId: RadiologyTestId;
  groupId: RadiologyTestGroupId;
  label: string;
  side?: "R" | "L";       // for items that have R / L option (hasSide: true)
}

export interface RadiologyOrder {
  id: string;              // use visitId as id (1 radiology order per visit)
  visitId: string;
  patientId: string;
  createdAt: string;
  createdBy?: string;      // uid of radiologi user (optional for now)
  updatedAt?: string;      // ISO timestamp when last updated
  updatedBy?: string;      // uid of user who last updated
  status: RadiologyOrderStatus;
  tests: RadiologyTestSelection[]; // only the checked tests
}

