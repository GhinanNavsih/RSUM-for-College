# 🗺️ PERAWATAN/KAMAR Navigation Guide

## 📍 How to Access Each Subcategory

```
┌─────────────────────────────────────────────────────────────────┐
│                      NAVIGATION STRUCTURE                        │
└─────────────────────────────────────────────────────────────────┘

🏠 Home Page
  │
  ├─ 📊 Database Harga (/prices)
  │   │
  │   └─ 🔽 Select Category Dropdown
  │       │
  │       ├─ "1. PERAWATAN/KAMAR" ← SELECT THIS
  │       │   │
  │       │   └─ 📋 Tarif Kamar Page (Subcategory 1)
  │       │       │
  │       │       ├─ Shows: ICU, KABER, VIP, Kelas 1-3
  │       │       ├─ Action: + Tambah Layanan (modal)
  │       │       └─ Note: "Subkategori: Tarif Kamar"
  │       │
  │       ├─ "2. ALAT & TINDAKAN PARAMEDIS"
  │       ├─ "3. KAMAR OPERASI"
  │       └─ ... (other categories)
  │
  ├─ 👨‍⚕️ IGD → Kunjungan → [Visit Detail]
  │   │
  │   └─ 📝 Tindakan & Biaya Section
  │       │
  │       └─ 🔽 Category Dropdown
  │           │
  │           └─ Select "1. PERAWATAN/KAMAR"
  │               │
  │               └─ 🔽 Service Dropdown (Grouped!)
  │                   │
  │                   ├─ ━━ Tarif Kamar ━━
  │                   │   ├─ ICU - Rp 600.000/Hari
  │                   │   ├─ KABER - Rp 200.000/Hari
  │                   │   └─ ...
  │                   │
  │                   ├─ ━━ Biaya Perawatan ━━
  │                   │   ├─ Visite dr Spesialis [KLS_1]
  │                   │   ├─ Jasa Pelayanan [VIP]
  │                   │   └─ ...
  │                   │
  │                   └─ ━━ Perinatologi (NICU/Baby Care) ━━
  │                       ├─ Tarif sewa per hari [INCUBATOR]
  │                       ├─ Fototerapi ≤ 12 jam [COUVEUSE]
  │                       └─ ...
  │
  └─ ⚙️ Admin Section (Admin Only)
      │
      └─ 💰 Pricing
          │
          └─ 🏥 Perawatan-Kamar
              │
              ├─ 📊 Biaya Perawatan (Subcategory 2)
              │   │
              │   └─ /admin/pricing/perawatan-kamar/biaya-perawatan
              │       │
              │       ├─ 📋 Matrix Table (8×6 = 48 cells)
              │       ├─ Columns: KLS_3, KLS_2, KLS_1, VIP, KABER, ICU
              │       ├─ Rows: Visite dr, Jasa Pelayanan, etc.
              │       └─ 💾 Bulk Save Button
              │
              └─ 👶 Perinatologi (Subcategory 3)
                  │
                  └─ /admin/pricing/perawatan-kamar/perinatologi
                      │
                      ├─ 📋 Matrix Table (9×3 = 27 cells)
                      ├─ Columns: BOX, COUVEUSE, INCUBATOR
                      ├─ Rows: Tarif sewa, Visite, Fototerapi, etc.
                      └─ 💾 Bulk Save Button
```

---

## 🎯 Quick Access URLs

### Subcategory 1: Tarif Kamar
```
http://localhost:3000/prices
→ Select "1. PERAWATAN/KAMAR" from dropdown
```

**Who can access**: Admin, Farmasi  
**What**: Base room rental prices  
**UI**: Standard CRUD with modal  

---

### Subcategory 2: Biaya Perawatan
```
http://localhost:3000/admin/pricing/perawatan-kamar/biaya-perawatan
```

**Who can access**: Admin only  
**What**: Doctor/nursing fees by room class  
**UI**: Matrix table (Excel-like)  

---

### Subcategory 3: Perinatologi
```
http://localhost:3000/admin/pricing/perawatan-kamar/perinatologi
```

**Who can access**: Admin only  
**What**: NICU/baby care by unit type  
**UI**: Matrix table (Excel-like)  

---

## 🔀 User Flow Examples

### Flow 1: Admin Setting Up Prices

```
1. Admin logs in
   ↓
2. Go to /prices
   ↓
3. Select "1. PERAWATAN/KAMAR"
   ↓
4. See Tarif Kamar page
   ↓
5. Click breadcrumb or manually navigate to:
   /admin/pricing/perawatan-kamar/biaya-perawatan
   ↓
6. Fill matrix with doctor/nursing fees
   ↓
7. Click "💾 Simpan Semua Perubahan"
   ↓
8. Navigate to:
   /admin/pricing/perawatan-kamar/perinatologi
   ↓
9. Fill matrix with NICU prices
   ↓
10. Click "💾 Simpan Semua Perubahan"
    ↓
11. Done! All 3 subcategories configured
```

---

### Flow 2: IGD Adding Services to Visit

```
1. IGD user opens visit detail
   ↓
2. Scroll to "Tindakan & Biaya" section
   ↓
3. Select "1. PERAWATAN/KAMAR" from category dropdown
   ↓
4. See grouped service dropdown with all 3 subcategories
   ↓
5. Select service (e.g., "Visite dr Spesialis [KLS_1]")
   ↓
6. Price/unit auto-filled
   ↓
7. Click "+ Tambah Tindakan"
   ↓
8. Service added to visit
   ↓
9. Repeat for other services from any subcategory
```

---

## 🗂️ Breadcrumb Examples

### Biaya Perawatan Page
```
Database Harga › 1. PERAWATAN/KAMAR › Biaya Perawatan
```

### Perinatologi Page
```
Database Harga › 1. PERAWATAN/KAMAR › Perinatologi
```

**Navigation**: Click "Database Harga" to return to main pricing page

---

## 🎨 Visual Indicators

### In Main Pricing Page (/prices)
```
┌────────────────────────────────────────────┐
│  1. PERAWATAN/KAMAR                        │
│  ─────────────────────────────────────────│
│  Subkategori: Tarif Kamar            ← NEW │
│  6 layanan terdaftar                       │
│                                            │
│  [+ Tambah Layanan]                        │
└────────────────────────────────────────────┘
```

### In Grouped Dropdown (IGD Visit)
```
┌────────────────────────────────────────────┐
│ -- Pilih 1. PERAWATAN/KAMAR --             │
│ ━━ Tarif Kamar ━━                    ← NEW │
│    ICU - Rp 600.000/Hari                   │
│    ...                                     │
│ ━━ Biaya Perawatan ━━                ← NEW │
│    Visite dr Spesialis [KLS_1] - ...       │
│    ...                                     │
│ ━━ Perinatologi (NICU/Baby Care) ━━  ← NEW │
│    Tarif sewa per hari [INCUBATOR] - ...   │
│    ...                                     │
└────────────────────────────────────────────┘
```

---

## 📊 Page Layouts

### Tarif Kamar (Standard CRUD)
```
┌─────────────────────────────────────────────┐
│  [Category Dropdown]  [Search]              │
│                                             │
│  1. PERAWATAN/KAMAR                         │
│  Subkategori: Tarif Kamar                   │
│  6 layanan terdaftar                        │
│                        [+ Tambah Layanan]   │
│─────────────────────────────────────────────│
│  Table:                                     │
│  | Kode | Nama | Harga | Unit | Aksi |      │
│  |------|------|-------|------|------|      │
│  | ...  | ICU  | 600k  | Hari | Edit |      │
│  | ...  | VIP  | 300k  | Hari | Edit |      │
└─────────────────────────────────────────────┘
```

### Biaya Perawatan (Matrix)
```
┌─────────────────────────────────────────────┐
│  Database Harga › 1. PERAWATAN/KAMAR ›      │
│  Biaya Perawatan                            │
│─────────────────────────────────────────────│
│  [ℹ️ Info Card: How to use]                 │
│─────────────────────────────────────────────│
│  Matrix Table:                              │
│  | Service        | KLS_3 | KLS_2 | ... |   │
│  |----------------|-------|-------|-----|   │
│  | Visite dr Spes | [___] | [___] | ... |   │
│  | Jasa Pelayanan | [___] | [___] | ... |   │
│─────────────────────────────────────────────│
│  [← Kembali]      [💾 Simpan Semua]         │
│─────────────────────────────────────────────│
│  [📊 Summary Stats]                         │
└─────────────────────────────────────────────┘
```

### Perinatologi (Matrix)
```
┌─────────────────────────────────────────────┐
│  Database Harga › 1. PERAWATAN/KAMAR ›      │
│  Perinatologi                               │
│─────────────────────────────────────────────│
│  [👶 Info Card: Unit types explained]       │
│─────────────────────────────────────────────│
│  Matrix Table:                              │
│  | Service         | BOX  | COUVE | INCUB | │
│  |-----------------|------|-------|-------|  │
│  | Tarif sewa/hari | [__] | [___] | [___] |  │
│  | Fototerapi 12j  | [__] | [___] | [___] |  │
│─────────────────────────────────────────────│
│  [← Kembali]      [💾 Simpan Semua]         │
│─────────────────────────────────────────────│
│  [📊 Summary Stats]                         │
└─────────────────────────────────────────────┘
```

---

## 🔐 Access Control Matrix

| Page                    | Route                                     | Admin | IGD | Kasir | Farmasi |
|-------------------------|-------------------------------------------|-------|-----|-------|---------|
| Tarif Kamar             | `/prices` (select category)               | ✅    | ❌  | ❌    | ✅      |
| Biaya Perawatan         | `/admin/.../biaya-perawatan`              | ✅    | ❌  | ❌    | ❌      |
| Perinatologi            | `/admin/.../perinatologi`                 | ✅    | ❌  | ❌    | ❌      |
| IGD Visit (add service) | `/igd/visit/[id]`                         | ✅    | ✅  | ❌    | ❌      |
| Kasir (view only)       | `/kasir/visit/[id]`                       | ✅    | ❌  | ✅    | ❌      |

---

## 🎯 Common Navigation Paths

### Path 1: Setting Up Matrix Prices (Admin)
```
Login → Navbar "Database Harga" → Select "1. PERAWATAN/KAMAR" 
→ Manually type URL: /admin/pricing/perawatan-kamar/biaya-perawatan
→ Fill matrix → Save
→ Change URL to: .../perinatologi
→ Fill matrix → Save
```

### Path 2: Using in Patient Visit (IGD)
```
Login → Navbar "IGD" → Patient list → Select patient 
→ View visits → Open visit detail
→ Scroll to "Tindakan & Biaya"
→ Select category "1. PERAWATAN/KAMAR"
→ See all subcategories in grouped dropdown
→ Select service → Add to visit
```

### Path 3: Viewing in Payment (Kasir)
```
Login → Navbar "Kasir" → Visit list → Select visit
→ See all PERAWATAN/KAMAR services grouped together
→ Print invoice (all subcategories shown under "1. PERAWATAN/KAMAR")
```

---

## 💡 Pro Tips

### For Admin Users

1. **Bookmark These URLs**:
   - `/admin/pricing/perawatan-kamar/biaya-perawatan`
   - `/admin/pricing/perawatan-kamar/perinatologi`

2. **Use Matrix Efficiently**:
   - Tab key moves between cells
   - Enter numbers without thousand separators (e.g., `150000` not `150.000`)
   - Currency format shows automatically below input

3. **Quick Navigation**:
   - Use breadcrumbs to go back to main pricing page
   - Or use browser back button

### For IGD Users

1. **Grouped Dropdown**:
   - Services are automatically organized by subcategory
   - Look for the ━━ separators to find sections
   - Room class shown in brackets: `[KLS_1]`, `[VIP]`, etc.

2. **Quick Selection**:
   - Start typing to filter (browser autocomplete)
   - Price shown in label (no need to check separately)

---

## 📞 Need Help?

**Can't find Biaya Perawatan page?**
→ Type URL directly: `/admin/pricing/perawatan-kamar/biaya-perawatan`

**Services not showing in IGD dropdown?**
→ Check that prices are filled in admin pages and `isActive: true`

**Dropdown not grouped?**
→ Make sure you selected "1. PERAWATAN/KAMAR" category (grouping only for this category)

**Matrix won't save?**
→ Check browser console (F12), verify admin permissions

---

**Quick Reference**: See `PERAWATAN_KAMAR_QUICK_REFERENCE.md` for data structures and examples.

**Full Guide**: See `PERAWATAN_KAMAR_SUBCATEGORY_GUIDE.md` for complete technical documentation.

---

**Last Updated**: November 28, 2025

