# Two-Tier Patient Registration System - Implementation Guide

## Overview

The system now supports a two-tier patient registration process:
1. **DataPasien Sementara** (Temporary) - Quick emergency registration by IGD staff
2. **DataPasien Lengkap** (Complete) - Full admin registration by Resepsionis staff

---

## 1. Data Model Changes

### New Types Added (`types/models.ts`)

```typescript
export type RegistrationStatus = 'TEMPORARY' | 'COMPLETE';
export type EmergencyTriageLevel = 'MERAH' | 'KUNING' | 'HIJAU' | 'HITAM';
export type JenisKelaminShort = "L" | "P";
export type AgamaType = "Islam" | "Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu" | "Lainnya";
export type JenisAsuransiType = "Umum" | "BPJS" | "BPJS TK" | "P2KS" | "KIS" | "Jasaraharja" | "Lainnya";
export type UserRole = "admin" | "igd" | "kasir" | "farmasi" | "resepsionis";
```

### Extended Patient Interface

The `Patient` interface now includes:

#### Registration Status
- `registrationStatus?: RegistrationStatus` - 'TEMPORARY' or 'COMPLETE' (undefined defaults to 'COMPLETE' for backward compatibility)

#### Temporary Fields (IGD Intake)
- `tempDoctorId`, `tempDoctorName` - Doctor information
- `tempNurseId`, `tempNurseName` - Nurse/Midwife information
- `tempFullName` - Patient name (temporary)
- `tempAge` - Patient age
- `tempWeightKg` - Weight in kg
- `tempGender` - Gender (L/P)
- `tempDomicile` - Brief location (village/city)
- `tempPhoneNumber` - Patient phone
- `tempFamilyContact` - Family contact
- `tempChiefComplaint` - Chief complaint
- `tempTriage` - Triage level (MERAH/KUNING/HIJAU/HITAM)
- `tempDischargeReason` - Discharge reason
- `tempSectioEmergency` - Sectio caesarea emergency (yes/no)

#### Complete Registration Fields (Resepsionis)
- `fullName`, `birthDate`, `gender`, `phoneNumber`
- `insuranceType`, `religion`, `maritalStatus`
- Address fields: `addressProvinceId`, `addressRegencyId`, `addressDistrictId`, `addressVillageId`, `addressDetail`
- Guarantor: `guarantorName`, `guarantorRelationship`, `guarantorPhone`
- `extraDocuments` - Array of document URLs

**Note:** Legacy fields (`nama`, `noRM`, `nik`, etc.) are kept for backward compatibility.

---

## 2. New Pages & Routes

### IGD Routes

#### `/igd/intake` - Quick Emergency Registration
- **Purpose:** Create temporary patient records during emergency situations
- **Access:** IGD staff, Admin
- **Features:**
  - Minimal required fields
  - Triage level selection
  - Auto-links to visit creation
  - Creates patient with `registrationStatus = 'TEMPORARY'`

**Key Fields:**
- Dokter (required, dropdown from database)
- Perawat/Bidan (required)
- Nama Lengkap (required)
- Umur (required)
- Jenis Kelamin (required)
- Keluhan Utama (required)
- Triase (required): 🔴 Merah / 🟡 Kuning / 🟢 Hijau / ⚫ Hitam
- Optional: Berat Badan, Domisili, No HP, Kontak Keluarga, Alasan Pulang, Sectio Emergency

### Resepsionis Routes

#### `/resepsionis/patients` - List Temporary Patients
- **Purpose:** View all patients with incomplete registration
- **Access:** Resepsionis, Admin
- **Features:**
  - Filter by "Hari Ini" or "Semua"
  - Shows temporary patient info (name, age, triage, doctor, domicile, phone)
  - Statistics cards (Today, Total Incomplete, Need Completion)
  - "Lengkapi Data" button for each patient

#### `/resepsionis/patients/[patientId]` - Complete Registration
- **Purpose:** Complete full registration for temporary patients
- **Access:** Resepsionis, Admin
- **Features:**
  - Shows temporary data summary from IGD
  - Pre-fills form with temporary data where applicable
  - Auto-generate MRN button
  - Cascading address dropdowns (Provinsi → Kabupaten → Kecamatan → Desa)
  - Updates patient to `registrationStatus = 'COMPLETE'`

**Required Fields:**
- No. RM (auto-generate available)
- Nama Lengkap
- NIK (16 digits)
- Tanggal Lahir
- Jenis Kelamin
- No. Telepon / HP
- Jenis Asuransi
- Agama
- Alamat Lengkap (cascading dropdowns + detail)
- Nama Penanggung Jawab
- Hubungan Penanggung Jawab
- Nomor HP Penanggung Jawab

---

## 3. Firestore Helper Functions

### New Functions in `lib/firestore.ts`

#### `generateMRN(): Promise<string>`
Auto-generates Medical Record Number in format: `RM-YYYY-NNNN`
- Example: `RM-2024-0001`, `RM-2024-0002`, etc.
- Increments based on current year
- Fallback to timestamp if error

#### `getTemporaryPatients(): Promise<Patient[]>`
Returns all patients with `registrationStatus = 'TEMPORARY'`, ordered by creation date (newest first)
- Includes index fallback for client-side filtering

#### `getTodayTemporaryPatients(): Promise<Patient[]>`
Returns temporary patients created today only

---

## 4. UI/UX Updates

### IGD Dashboard (`/igd/page.tsx`)
Added two buttons:
- **"+ Registrasi Cepat IGD"** (Primary) → Links to `/igd/intake`
- **"Kunjungan Baru"** (Secondary) → Links to `/igd/new-visit` (existing)

### Navbar Updates (`components/Navbar.tsx`)
- Added "Resepsionis" role support
- Resepsionis users see: Pasien, Resepsionis menu
- Admin sees all menus including Resepsionis

### Utilities (`lib/utils.ts`)
- Added `formatTime()` - Format time only (HH:MM)
- Updated `getRoleDisplayName()` to include "Resepsionis"

---

## 5. Workflow

### Step 1: IGD Emergency Intake

1. **Patient arrives at IGD**
2. IGD staff opens: `/igd/intake`
3. Fill minimal required fields (doctor, nurse, name, age, gender, complaint, triage)
4. Click "Simpan & Lanjut ke Kunjungan"
5. System creates patient with `registrationStatus = 'TEMPORARY'`
6. Redirects to `/igd/new-visit?patientId=XXX` to create visit
7. IGD can proceed with medical treatment

### Step 2: Resepsionis Completion (When Needed)

1. **Patient/family goes to registration desk**
2. Resepsionis opens: `/resepsionis/patients`
3. See list of patients with temporary registration
4. Click "Lengkapi Data" for the correct patient
5. System shows temporary data from IGD at the top
6. Fill complete registration form:
   - Auto-generate or enter No. RM
   - Complete personal information
   - Complete address (cascading dropdowns)
   - Complete guarantor information
7. Click "Simpan Data Lengkap"
8. System updates patient to `registrationStatus = 'COMPLETE'`
9. Patient record is now complete

---

## 6. Backward Compatibility

### For Existing Data

- **Old patients without `registrationStatus`:** System treats them as `'COMPLETE'`
- **Legacy fields maintained:** `nama`, `noRM`, `nik`, `tanggalLahir`, etc. are still populated
- **Existing forms still work:** `/patients/new` still creates complete patients directly

### For Visits

- Visits can be linked to patients with any registration status
- IGD can create visits for `TEMPORARY` patients
- Consider checking `registrationStatus === 'COMPLETE'` before billing/reporting (future enhancement)

---

## 7. Testing Checklist

### IGD Intake
- [ ] Can access `/igd/intake` as IGD user
- [ ] Doctor dropdown loads active doctors
- [ ] All required fields validated
- [ ] Triage dropdown shows 4 options with emojis
- [ ] Form submits and creates temporary patient
- [ ] Redirects to new-visit with patientId
- [ ] Patient has `registrationStatus = 'TEMPORARY'`

### Resepsionis List
- [ ] Can access `/resepsionis/patients` as Resepsionis user
- [ ] Shows temporary patients list
- [ ] "Hari Ini" filter works
- [ ] "Semua" filter works
- [ ] Statistics cards show correct counts
- [ ] Triage badges show with correct colors
- [ ] "Lengkapi Data" button works

### Resepsionis Complete
- [ ] Shows temporary data summary at top
- [ ] Form pre-fills with temporary data
- [ ] "Generate Otomatis" MRN button works
- [ ] Cascading address dropdowns work
- [ ] All required fields validated
- [ ] Form submits successfully
- [ ] Patient updated to `registrationStatus = 'COMPLETE'`
- [ ] Redirects back to patient list
- [ ] Completed patient no longer appears in list

### Navigation
- [ ] IGD dashboard has "Registrasi Cepat IGD" button
- [ ] Navbar shows "Resepsionis" for resepsionis role
- [ ] Navbar shows "Resepsionis" for admin role
- [ ] All role-based access controls work

---

## 8. User Roles & Permissions

| Page | Admin | IGD | Resepsionis | Kasir | Farmasi |
|------|-------|-----|-------------|-------|---------|
| `/igd/intake` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/resepsionis/patients` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/resepsionis/patients/[id]` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/patients/new` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/patients` | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 9. Future Enhancements (Optional)

1. **Document Upload:** Add file upload for KTP/BPJS photos (use `extraDocuments` field)
2. **MRN Index:** Create Firestore index for faster MRN generation
3. **Reporting:** Filter billing/reports by complete registrations only
4. **Notifications:** Alert resepsionis when new temporary patients arrive
5. **Audit Trail:** Track who completed each registration and when
6. **Batch Completion:** Allow resepsionis to complete multiple patients at once
7. **Print Forms:** Generate printable registration forms
8. **Mobile Optimization:** Improve mobile UI for IGD intake in emergency situations

---

## 10. Firebase Indexes (Recommended)

For optimal performance, create these Firestore composite indexes:

### patients collection
```
Collection: patients
Fields:
- registrationStatus (Ascending)
- createdAt (Descending)
```

This can be created automatically when you first run queries, or manually in Firebase Console.

---

## 11. Quick Reference

### Color Codes for Triage Levels
- 🔴 **MERAH** (Red) - Emergency / Immediate
- 🟡 **KUNING** (Yellow) - Urgent
- 🟢 **HIJAU** (Green) - Non-Urgent
- ⚫ **HITAM** (Black) - Deceased

### Insurance Types
- Umum (General/Private)
- BPJS (National Health Insurance)
- BPJS TK (Labor BPJS)
- P2KS (Social Security Program)
- KIS (Health Indonesia Card)
- Jasaraharja (Jasa Raharja Insurance)
- Lainnya (Other)

### Religion Options
- Islam
- Protestan
- Katolik
- Hindu
- Buddha
- Konghucu
- Lainnya

---

## Support

For questions or issues:
1. Check this guide first
2. Review the inline code comments in each file
3. Check the console for error messages
4. Verify Firestore permissions and indexes

---

**Implementation Date:** December 2, 2025  
**Status:** ✅ Complete and Ready for Testing

