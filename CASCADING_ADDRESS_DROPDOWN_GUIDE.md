# 🗺️ Cascading Address Dropdown Implementation Guide

## Overview

The patient registration form now uses **cascading dropdown boxes** for address input, fetching Indonesian location data (Provinsi, Kabupaten, Kecamatan, Desa/Kelurahan) directly from the GitHub repository: [ibnux/data-indonesia](https://github.com/ibnux/data-indonesia).

## ✨ Features

✅ **No Local Storage** - Data fetched directly from GitHub  
✅ **Cascading Dropdowns** - Each selection enables the next level  
✅ **Auto-Complete Address** - Builds full address automatically  
✅ **Caching** - Reduces API calls with in-memory cache  
✅ **Backward Compatible** - Works with existing patient data  
✅ **Structured Data** - Stores both IDs and names for flexibility  

---

## 📊 Data Structure

### GitHub Repository Structure

```
https://github.com/ibnux/data-indonesia/
├── provinsi.json                    # All provinces (34 items)
├── kabupaten/
│   ├── 11.json                      # Districts in Aceh
│   ├── 12.json                      # Districts in Sumatra Utara
│   └── ...
├── kecamatan/
│   ├── 1101.json                    # Subdistricts in Kab. Simeulue
│   ├── 1102.json                    # Subdistricts in Kab. Aceh Singkil
│   └── ...
└── kelurahan/
    ├── 110101.json                  # Villages in Kec. Teupah Selatan
    ├── 110102.json                  # Villages in Kec. Simeulue Timur
    └── ...
```

**Total**: 91,219 location data points

### Patient Data Model

**Before (Legacy):**
```typescript
{
  alamat: "Jl. Merdeka No. 123, Desa Sukamaju, Kec. Cikarang, Bekasi, Jawa Barat"
}
```

**After (New):**
```typescript
{
  alamat: "Jl. Merdeka No. 123, RT 02/RW 05, Desa/Kel. Sukamaju, Kec. Cikarang, Bekasi, Jawa Barat",
  alamatLengkap: {
    provinsiId: "32",
    provinsiName: "Jawa Barat",
    kabupatenId: "3216",
    kabupatenName: "Kab. Bekasi",
    kecamatanId: "321603",
    kecamatanName: "Cikarang Pusat",
    desaId: "3216032001",
    desaName: "Sukamaju",
    detailAlamat: "Jl. Merdeka No. 123, RT 02/RW 05"
  }
}
```

---

## 🔧 Implementation Details

### 1. Location Service (`lib/locationService.ts`)

**Purpose**: Fetch location data from GitHub with caching

**Key Functions:**
```typescript
getProvinsi()                    // Get all provinces
getKabupaten(provinsiId)         // Get districts by province
getKecamatan(kabupatenId)        // Get subdistricts by district
getKelurahan(kecamatanId)        // Get villages by subdistrict
getLocationName(list, id)        // Get name from ID
buildFullAddress(...)            // Build formatted address string
```

**Caching Strategy:**
- In-memory cache to reduce API calls
- Cache persists during session
- Can be cleared with `clearLocationCache()`

**Example Usage:**
```typescript
// Fetch provinces
const provinces = await getProvinsi();
// Returns: [{ id: "11", nama: "Aceh" }, { id: "12", nama: "Sumatra Utara" }, ...]

// Fetch districts for Jawa Barat (ID: 32)
const districts = await getKabupaten("32");
// Returns: [{ id: "3201", nama: "Kab. Bogor" }, { id: "3202", nama: "Kab. Sukabumi" }, ...]
```

### 2. Patient Model Update (`types/models.ts`)

**New Interface:**
```typescript
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
  // ... existing fields ...
  alamat?: string;                      // Full address text (legacy + new)
  alamatLengkap?: PatientAddress;       // Structured address data (new)
  // ... other fields ...
}
```

### 3. Form Implementation

**New Patient Form** (`app/patients/new/page.tsx`)

**State Management:**
```typescript
const [provinsiList, setProvinsiList] = useState<LocationItem[]>([]);
const [kabupatenList, setKabupatenList] = useState<LocationItem[]>([]);
const [kecamatanList, setKecamatanList] = useState<LocationItem[]>([]);
const [desaList, setDesaList] = useState<LocationItem[]>([]);
const [loadingLocation, setLoadingLocation] = useState(false);

const [formData, setFormData] = useState({
  // ... other fields ...
  provinsiId: '',
  kabupatenId: '',
  kecamatanId: '',
  desaId: '',
  detailAlamat: '',
  alamat: '',  // Auto-generated
});
```

**Cascading Logic:**
```typescript
// Load provinces on mount
useEffect(() => {
  loadProvinsi();
}, []);

// Load kabupaten when provinsi changes
useEffect(() => {
  if (formData.provinsiId) {
    loadKabupaten(formData.provinsiId);
  } else {
    setKabupatenList([]);
    setKecamatanList([]);
    setDesaList([]);
  }
}, [formData.provinsiId]);

// Similar for kecamatan and desa...

// Auto-build full address
useEffect(() => {
  if (formData.provinsiId || formData.detailAlamat) {
    const fullAddress = buildFullAddress(
      formData.detailAlamat,
      getLocationName(desaList, formData.desaId),
      getLocationName(kecamatanList, formData.kecamatanId),
      getLocationName(kabupatenList, formData.kabupatenId),
      getLocationName(provinsiList, formData.provinsiId)
    );
    setFormData(prev => ({ ...prev, alamat: fullAddress }));
  }
}, [formData.provinsiId, formData.kabupatenId, formData.kecamatanId, formData.desaId, formData.detailAlamat, ...]);
```

**Edit Patient Form** (`app/patients/[patientId]/edit/page.tsx`)

**Loading Existing Data:**
```typescript
const loadPatient = async () => {
  const patient = await getPatient(patientId);
  if (patient) {
    setFormData({
      // ... other fields ...
      provinsiId: patient.alamatLengkap?.provinsiId || '',
      kabupatenId: patient.alamatLengkap?.kabupatenId || '',
      kecamatanId: patient.alamatLengkap?.kecamatanId || '',
      desaId: patient.alamatLengkap?.desaId || '',
      detailAlamat: patient.alamatLengkap?.detailAlamat || '',
      alamat: patient.alamat || '',
    });
  }
};
```

---

## 🎨 User Interface

### Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Alamat Lengkap *                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Provinsi *                    Kabupaten/Kota *              │
│ [Jawa Barat          ▼]       [Kab. Bekasi      ▼]         │
│                                                             │
│ Kecamatan *                   Desa/Kelurahan *              │
│ [Cikarang Pusat      ▼]       [Sukamaju         ▼]         │
│                                                             │
│ Detail Alamat (Jalan, RT/RW, No. Rumah) *                  │
│ [Jl. Merdeka No. 123, RT 02/RW 05                        ] │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Alamat Lengkap:                                         │ │
│ │ Jl. Merdeka No. 123, RT 02/RW 05, Desa/Kel. Sukamaju,  │ │
│ │ Kec. Cikarang Pusat, Kab. Bekasi, Jawa Barat           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Cascading Behavior

**Step 1: Select Provinsi**
```
Provinsi: [-- Pilih Provinsi --]
Kabupaten: [-- Pilih Provinsi Dulu --] (disabled)
Kecamatan: [-- Pilih Kabupaten Dulu --] (disabled)
Desa: [-- Pilih Kecamatan Dulu --] (disabled)
```

**Step 2: After selecting Provinsi**
```
Provinsi: [Jawa Barat]
Kabupaten: [-- Pilih Kabupaten/Kota --] (enabled, loading...)
Kecamatan: [-- Pilih Kabupaten Dulu --] (disabled)
Desa: [-- Pilih Kecamatan Dulu --] (disabled)
```

**Step 3: After selecting Kabupaten**
```
Provinsi: [Jawa Barat]
Kabupaten: [Kab. Bekasi]
Kecamatan: [-- Pilih Kecamatan --] (enabled, loading...)
Desa: [-- Pilih Kecamatan Dulu --] (disabled)
```

**Step 4: After selecting Kecamatan**
```
Provinsi: [Jawa Barat]
Kabupaten: [Kab. Bekasi]
Kecamatan: [Cikarang Pusat]
Desa: [-- Pilih Desa/Kelurahan --] (enabled, loading...)
```

**Step 5: After selecting Desa + entering detail**
```
Provinsi: [Jawa Barat]
Kabupaten: [Kab. Bekasi]
Kecamatan: [Cikarang Pusat]
Desa: [Sukamaju]
Detail: [Jl. Merdeka No. 123, RT 02/RW 05]

Full Address (auto-generated):
Jl. Merdeka No. 123, RT 02/RW 05, Desa/Kel. Sukamaju, 
Kec. Cikarang Pusat, Kab. Bekasi, Jawa Barat
```

---

## 🚀 How to Use

### For New Patient Registration

1. **Navigate to**: `/patients/new`
2. **Fill in basic info**: Name, NIK, etc.
3. **Select address**:
   - Select **Provinsi** (e.g., "Jawa Barat")
   - Wait for **Kabupaten** to load, then select (e.g., "Kab. Bekasi")
   - Wait for **Kecamatan** to load, then select (e.g., "Cikarang Pusat")
   - Wait for **Desa** to load, then select (e.g., "Sukamaju")
   - Enter **Detail Alamat** (e.g., "Jl. Merdeka No. 123, RT 02/RW 05")
4. **Review** the auto-generated full address
5. **Submit** the form

### For Editing Patient

1. **Navigate to**: `/patients/:id/edit`
2. **Existing address** will be pre-filled in dropdowns (if available)
3. **Modify** any dropdown or detail as needed
4. **Full address** updates automatically
5. **Submit** changes

---

## 🔄 Data Flow

### Fetching Location Data

```
User selects Provinsi
    ↓
loadKabupaten(provinsiId)
    ↓
Check cache → if cached, return immediately
    ↓
Fetch from GitHub: https://raw.githubusercontent.com/.../kabupaten/32.json
    ↓
Parse JSON → Store in cache → Update state
    ↓
Kabupaten dropdown populated
```

### Saving Patient Data

```
User fills form
    ↓
Submit button clicked
    ↓
Build patientData object:
  - alamat: Full formatted address string
  - alamatLengkap: {
      provinsiId, provinsiName,
      kabupatenId, kabupatenName,
      kecamatanId, kecamatanName,
      desaId, desaName,
      detailAlamat
    }
    ↓
createPatient(patientData) or updatePatient(id, patientData)
    ↓
Firestore stores both alamat and alamatLengkap
```

---

## 💾 Firestore Data Examples

### New Patient (with structured address)

```json
{
  "id": "abc123",
  "noRM": "RM-2025-0001",
  "nama": "Qoimam Bilqisti",
  "alamat": "Jl. Umar Tamim No.9, Desa/Kel. Joresan, Kec. Mlarak, Kab. Ponorogo, Jawa Timur",
  "alamatLengkap": {
    "provinsiId": "35",
    "provinsiName": "Jawa Timur",
    "kabupatenId": "3502",
    "kabupatenName": "Kab. Ponorogo",
    "kecamatanId": "350215",
    "kecamatanName": "Mlarak",
    "desaId": "3502152005",
    "desaName": "Joresan",
    "detailAlamat": "Jl. Umar Tamim No.9"
  },
  "createdAt": "2025-11-27T...",
  "updatedAt": "2025-11-27T..."
}
```

### Legacy Patient (text-only address)

```json
{
  "id": "xyz789",
  "noRM": "RM-2024-0500",
  "nama": "Ahmad Fulan",
  "alamat": "Jl. Sudirman No. 45, Jakarta",
  "createdAt": "2024-01-15T...",
  "updatedAt": "2024-01-15T..."
}
```

**Note**: Legacy patients without `alamatLengkap` will still work. When editing, the form will show empty dropdowns, and the user can fill them in.

---

## 🧪 Testing Checklist

### New Patient Form

- [ ] Navigate to `/patients/new`
- [ ] Verify provinces load on page load
- [ ] Select a province → verify kabupaten loads
- [ ] Select kabupaten → verify kecamatan loads
- [ ] Select kecamatan → verify desa loads
- [ ] Enter detail address
- [ ] Verify full address auto-generates correctly
- [ ] Submit form
- [ ] Verify patient created with structured address in Firestore
- [ ] Navigate to patient detail page
- [ ] Verify address displays correctly

### Edit Patient Form

- [ ] Create a patient with structured address
- [ ] Navigate to `/patients/:id/edit`
- [ ] Verify all dropdowns pre-filled with existing data
- [ ] Change provinsi → verify kabupaten resets and reloads
- [ ] Change kabupaten → verify kecamatan resets and reloads
- [ ] Change kecamatan → verify desa resets and reloads
- [ ] Modify detail address
- [ ] Verify full address updates
- [ ] Submit changes
- [ ] Verify updated data in Firestore

### Legacy Patient

- [ ] Open edit form for legacy patient (no `alamatLengkap`)
- [ ] Verify dropdowns are empty but functional
- [ ] Fill in address using dropdowns
- [ ] Submit
- [ ] Verify patient now has structured address

### Edge Cases

- [ ] Test with slow internet (loading states)
- [ ] Test changing selections multiple times
- [ ] Test submitting without selecting all levels
- [ ] Test with very long detail addresses
- [ ] Test special characters in detail address

---

## 🐛 Troubleshooting

### Issue: Dropdowns are empty

**Cause**: Failed to fetch data from GitHub  
**Solution**:
1. Check internet connection
2. Check browser console for errors
3. Verify GitHub repository is accessible
4. Try clearing cache: `clearLocationCache()`

### Issue: "Memuat..." stuck forever

**Cause**: Network timeout or invalid ID  
**Solution**:
1. Check console for error messages
2. Verify the parent selection is valid
3. Refresh the page
4. Check if GitHub repository structure changed

### Issue: Full address not updating

**Cause**: useEffect dependencies issue  
**Solution**:
1. Check if all location lists are loaded
2. Verify formData has correct IDs
3. Check console for errors

### Issue: Edit form doesn't pre-fill dropdowns

**Cause**: Patient doesn't have `alamatLengkap` data  
**Solution**:
- This is expected for legacy patients
- User can manually select address
- After saving, structured data will be stored

---

## 📚 API Reference

### Location Service Functions

#### `getProvinsi(): Promise<LocationItem[]>`
Fetches all provinces from GitHub.

**Returns**: Array of `{ id, nama }`  
**Example**:
```typescript
const provinces = await getProvinsi();
// [{ id: "11", nama: "Aceh" }, { id: "12", nama: "Sumatra Utara" }, ...]
```

#### `getKabupaten(provinsiId: string): Promise<LocationItem[]>`
Fetches districts/cities for a province.

**Parameters**: `provinsiId` - Province ID (e.g., "32" for Jawa Barat)  
**Returns**: Array of `{ id, nama }`  
**Example**:
```typescript
const districts = await getKabupaten("32");
// [{ id: "3201", nama: "Kab. Bogor" }, { id: "3202", nama: "Kab. Sukabumi" }, ...]
```

#### `getKecamatan(kabupatenId: string): Promise<LocationItem[]>`
Fetches subdistricts for a district.

**Parameters**: `kabupatenId` - District ID (e.g., "3216" for Kab. Bekasi)  
**Returns**: Array of `{ id, nama }`

#### `getKelurahan(kecamatanId: string): Promise<LocationItem[]>`
Fetches villages for a subdistrict.

**Parameters**: `kecamatanId` - Subdistrict ID (e.g., "321603")  
**Returns**: Array of `{ id, nama }`

#### `getLocationName(locations: LocationItem[], id: string): string`
Gets location name from ID.

**Parameters**:
- `locations` - Array of location items
- `id` - Location ID to find

**Returns**: Location name or empty string  
**Example**:
```typescript
const name = getLocationName(provinsiList, "32");
// "Jawa Barat"
```

#### `buildFullAddress(...): string`
Builds formatted full address string.

**Parameters**:
- `detailAlamat` - Street address, RT/RW
- `desaName` - Village name
- `kecamatanName` - Subdistrict name
- `kabupatenName` - District name
- `provinsiName` - Province name

**Returns**: Formatted address string  
**Example**:
```typescript
const address = buildFullAddress(
  "Jl. Merdeka No. 123",
  "Sukamaju",
  "Cikarang Pusat",
  "Kab. Bekasi",
  "Jawa Barat"
);
// "Jl. Merdeka No. 123, Desa/Kel. Sukamaju, Kec. Cikarang Pusat, Kab. Bekasi, Jawa Barat"
```

---

## 🎯 Benefits

### For Users

✅ **Easier Data Entry** - No typing long addresses  
✅ **Standardized Format** - Consistent address formatting  
✅ **Reduced Errors** - No typos in location names  
✅ **Faster Input** - Select instead of type  
✅ **Visual Feedback** - See full address as you select  

### For System

✅ **Structured Data** - Enables location-based queries  
✅ **Data Quality** - Validated location data  
✅ **Flexibility** - Can query by province, district, etc.  
✅ **Scalability** - No local database needed  
✅ **Maintainability** - Data updated at source (GitHub)  

### For Reporting

✅ **Location Analytics** - Count patients by region  
✅ **Geographic Distribution** - Map patient locations  
✅ **Regional Reports** - Filter by province/district  
✅ **Demographic Insights** - Analyze by location  

---

## 🔮 Future Enhancements

### Possible Improvements

1. **Search/Autocomplete** - Add search functionality to dropdowns
2. **Map Integration** - Show location on map
3. **Postal Code** - Add postal code field
4. **Address Validation** - Validate against known addresses
5. **Recent Locations** - Remember recently used locations
6. **Bulk Import** - Import patients with address data
7. **Export** - Export patients with structured address
8. **Analytics Dashboard** - Patient distribution by location

---

## 📖 References

- **GitHub Repository**: [ibnux/data-indonesia](https://github.com/ibnux/data-indonesia)
- **Data Source**: Indonesian administrative divisions
- **Total Data Points**: 91,219 locations
- **Last Updated**: Check GitHub repository for updates

---

## ✅ Summary

### What Was Implemented

✅ **Location Service** - Fetches data from GitHub with caching  
✅ **Patient Model** - Extended with structured address fields  
✅ **New Patient Form** - Cascading dropdowns for address input  
✅ **Edit Patient Form** - Pre-fills existing address data  
✅ **Auto-Complete** - Builds full address automatically  
✅ **Backward Compatible** - Works with legacy data  

### Files Modified

- ✅ `types/models.ts` - Added `PatientAddress` interface
- ✅ `lib/locationService.ts` - Created location service (NEW)
- ✅ `app/patients/new/page.tsx` - Added cascading dropdowns
- ✅ `app/patients/[patientId]/edit/page.tsx` - Added cascading dropdowns

### Ready to Use

The cascading address dropdown system is **fully implemented and ready to use**! 🎉

Users can now register and edit patients with structured address data fetched directly from the GitHub repository, without any local storage or database setup required.

