# 🗺️ Address Dropdown - Quick Reference

## 🎯 What Changed

**Before**: Single text input for address  
**After**: 4 cascading dropdowns + detail input

```
OLD:
[Alamat Lengkap: ________________________________]

NEW:
[Provinsi ▼] [Kabupaten ▼] [Kecamatan ▼] [Desa ▼]
[Detail Alamat: Jl. ..., RT/RW ...]
```

---

## 🚀 Quick Start

### Adding New Patient

1. Go to `/patients/new`
2. Fill basic info
3. **Address section**:
   - Select Provinsi → Kabupaten → Kecamatan → Desa
   - Enter detail (Jl., RT/RW, No. Rumah)
   - Full address auto-generates
4. Submit

### Editing Patient

1. Go to `/patients/:id/edit`
2. Dropdowns pre-filled (if patient has structured data)
3. Change any dropdown as needed
4. Full address updates automatically
5. Submit

---

## 📊 Data Source

**GitHub Repository**: [ibnux/data-indonesia](https://github.com/ibnux/data-indonesia)

**No local storage needed!** Data fetched directly from GitHub.

**Coverage**: All 34 provinces, 91,219 locations total

---

## 🎨 How It Works

### Cascading Flow

```
Step 1: Select Provinsi
   ↓
Step 2: Kabupaten dropdown enables & loads
   ↓
Step 3: Select Kabupaten
   ↓
Step 4: Kecamatan dropdown enables & loads
   ↓
Step 5: Select Kecamatan
   ↓
Step 6: Desa dropdown enables & loads
   ↓
Step 7: Select Desa + enter detail
   ↓
Step 8: Full address auto-generates
```

### Example

```
Provinsi:   [Jawa Timur]
Kabupaten:  [Kab. Ponorogo]
Kecamatan:  [Mlarak]
Desa:       [Joresan]
Detail:     [Jl. Umar Tamim No.9]

Result:
"Jl. Umar Tamim No.9, Desa/Kel. Joresan, Kec. Mlarak, 
 Kab. Ponorogo, Jawa Timur"
```

---

## 💾 What Gets Saved

### In Firestore

```json
{
  "alamat": "Full formatted address string",
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
  }
}
```

**Both text and structured data saved!**

---

## 🔄 Backward Compatibility

### Legacy Patients

Patients created before this update:
- ✅ Still work
- ✅ Can be edited
- ✅ Dropdowns will be empty (user can fill)
- ✅ After editing, will have structured data

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Dropdowns empty | Check internet connection |
| "Memuat..." stuck | Refresh page |
| Can't select next level | Select parent level first |
| Full address not updating | Check all selections made |

---

## 📁 Files Changed

| File | Change |
|------|--------|
| `types/models.ts` | Added `PatientAddress` interface |
| `lib/locationService.ts` | Created location service (NEW) |
| `app/patients/new/page.tsx` | Added cascading dropdowns |
| `app/patients/[patientId]/edit/page.tsx` | Added cascading dropdowns |

---

## ✅ Benefits

### For Users
- ✅ Faster data entry
- ✅ No typos
- ✅ Standardized format
- ✅ Visual feedback

### For System
- ✅ Structured data
- ✅ Location-based queries
- ✅ Better reporting
- ✅ No local database needed

---

## 🎯 Key Features

✅ **Cascading Dropdowns** - Each selection enables next level  
✅ **Auto-Complete** - Full address builds automatically  
✅ **Caching** - Reduces API calls  
✅ **GitHub Source** - No local storage needed  
✅ **Backward Compatible** - Works with old data  
✅ **Structured Storage** - Enables advanced queries  

---

## 📚 Quick Reference

### Location Levels

1. **Provinsi** (Province) - 34 total
2. **Kabupaten/Kota** (District/City)
3. **Kecamatan** (Subdistrict)
4. **Desa/Kelurahan** (Village)
5. **Detail** (Street, RT/RW, House No.)

### Example IDs

```
Provinsi:  "35" → Jawa Timur
Kabupaten: "3502" → Kab. Ponorogo
Kecamatan: "350215" → Mlarak
Desa:      "3502152005" → Joresan
```

---

## 🚀 Ready to Use!

The cascading address dropdown system is **fully implemented**!

**Test it now:**
1. Go to `/patients/new`
2. Try selecting your location
3. See the magic happen! ✨

---

## 📖 Full Documentation

For complete details, see: `CASCADING_ADDRESS_DROPDOWN_GUIDE.md`

