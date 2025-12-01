# 🏥 Perawatan/Kamar - Quick Reference Card

## 📌 Three Subcategories

| Subcategory | What It Contains | Access Page |
|-------------|------------------|-------------|
| **Tarif Kamar** | Base room rental (ICU, VIP, Kelas 1-3, KABER) | `/prices` → "1. PERAWATAN/KAMAR" |
| **Biaya Perawatan** | Doctor/nursing fees by room class (6 classes) | `/admin/pricing/perawatan-kamar/biaya-perawatan` |
| **Perinatologi** | NICU/baby care by unit type (Box, Couveuse, Incubator) | `/admin/pricing/perawatan-kamar/perinatologi` |

---

## 🔗 Quick Links

### Admin Pages (Admin Only)

```
http://localhost:3000/prices
→ Select "1. PERAWATAN/KAMAR" for Tarif Kamar

http://localhost:3000/admin/pricing/perawatan-kamar/biaya-perawatan
→ Matrix table for Biaya Perawatan

http://localhost:3000/admin/pricing/perawatan-kamar/perinatologi
→ Matrix table for Perinatologi
```

### Usage in Visits

```
http://localhost:3000/igd/visit/[visitId]
→ "Tindakan & Biaya" section
→ Select "1. PERAWATAN/KAMAR" category
→ See all subcategories in grouped dropdown
```

---

## 🎯 Common Tasks

### ✏️ Add Room Prices (Tarif Kamar)

1. Go to `/prices`
2. Select "1. PERAWATAN/KAMAR" from dropdown
3. Click "+ Tambah Layanan"
4. Fill: Name (e.g., "ICU"), Price, Unit ("Hari")
5. Click "Simpan"

### ✏️ Set Doctor Visit Fees (Biaya Perawatan)

1. Go to `/admin/pricing/perawatan-kamar/biaya-perawatan`
2. Enter prices in matrix cells:
   - Rows: Service types (Visite dr Spesialis, Jasa Pelayanan, etc.)
   - Columns: Room classes (Kelas 3, 2, 1, VIP, KABER, ICU)
3. Click "💾 Simpan Semua Perubahan"

### ✏️ Set NICU Fees (Perinatologi)

1. Go to `/admin/pricing/perawatan-kamar/perinatologi`
2. Enter prices in matrix cells:
   - Rows: Service types (Tarif sewa, Visite, Fototerapi, etc.)
   - Columns: Unit types (BOX, COUVEUSE, INCUBATOR)
3. Click "💾 Simpan Semua Perubahan"

### ➕ Add Service to Patient Visit

1. Open IGD visit detail page
2. In "Tindakan & Biaya" section:
   - Select "1. PERAWATAN/KAMAR" from category dropdown
   - Choose service from grouped dropdown (shows all 3 subcategories)
   - Price/unit auto-fill
3. Click "+ Tambah Tindakan"

---

## 📊 Matrix Table Layout

### Biaya Perawatan Matrix

|                              | Kelas 3 | Kelas 2 | Kelas 1 | VIP | KABER | ICU |
|------------------------------|---------|---------|---------|-----|-------|-----|
| Visite dr Spesialis          | [ ]     | [ ]     | [ ]     | [ ] | [ ]   | [ ] |
| Visite dr Umum               | [ ]     | [ ]     | [ ]     | [ ] | [ ]   | [ ] |
| Jasa Pelayanan               | [ ]     | [ ]     | [ ]     | [ ] | [ ]   | [ ] |
| Sarana Keperawatan           | [ ]     | [ ]     | [ ]     | [ ] | [ ]   | [ ] |
| Konsul dr Spesialis          | [ ]     | [ ]     | [ ]     | [ ] | [ ]   | [ ] |
| Administrasi Kelas           | [ ]     | [ ]     | [ ]     | [ ] | [ ]   | [ ] |
| Sarana UGD                   | [ ]     | [ ]     | [ ]     | [ ] | [ ]   | [ ] |
| Pemeriksaan dr Umum di UGD   | [ ]     | [ ]     | [ ]     | [ ] | [ ]   | [ ] |

**Total Cells**: 8 rows × 6 columns = 48 cells

### Perinatologi Matrix

|                           | BOX | COUVEUSE | INCUBATOR |
|---------------------------|-----|----------|-----------|
| Tarif sewa per hari       | [ ] | [ ]      | [ ]       |
| Jasa Pelayanan            | [ ] | [ ]      | [ ]       |
| Sarana Keperawatan        | [ ] | [ ]      | [ ]       |
| Visite dr Spesialis       | [ ] | [ ]      | [ ]       |
| Visite dr Umum            | [ ] | [ ]      | [ ]       |
| Konsul dr Spesialis       | [ ] | [ ]      | [ ]       |
| Fototerapi ≤ 12 jam       | [ ] | [ ]      | [ ]       |
| Fototerapi / 24 jam       | [ ] | [ ]      | [ ]       |
| Administrasi              | [ ] | [ ]      | [ ]       |

**Total Cells**: 9 rows × 3 columns = 27 cells

---

## 🎨 Dropdown Preview (IGD Visit)

When you select "1. PERAWATAN/KAMAR" in Tindakan & Biaya:

```
┌─────────────────────────────────────────────────┐
│ -- Pilih 1. PERAWATAN/KAMAR --                 │
│ ━━ Tarif Kamar ━━                              │
│    ICU - Rp 600.000/Hari                       │
│    KABER - Rp 200.000/Hari                     │
│    KELAS 1 - Rp 340.000/Hari                   │
│    KELAS 2 - Rp 150.000/Hari                   │
│    KELAS 3 - Rp 100.000/Hari                   │
│    VIP - Rp 300.000/Hari                       │
│ ━━ Biaya Perawatan ━━                          │
│    Visite dr Spesialis [KLS_1] - Rp 150.000... │
│    Visite dr Spesialis [KLS_2] - Rp 120.000... │
│    Jasa Pelayanan [VIP] - Rp 200.000/hari      │
│    ... (more services)                          │
│ ━━ Perinatologi (NICU/Baby Care) ━━            │
│    Tarif sewa per hari [INCUBATOR] - Rp 250... │
│    Jasa Pelayanan [BOX] - Rp 100.000/hari      │
│    Fototerapi ≤ 12 jam [COUVEUSE] - Rp 150...  │
│    ... (more services)                          │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Data Structure Examples

### Tarif Kamar Document

```json
{
  "id": "abc123",
  "category": "PERAWATAN_KAMAR",
  "subCategory": "TARIF_KAMAR",
  "serviceName": "ICU",
  "price": 600000,
  "unit": "Hari",
  "roomClass": "ICU",
  "isActive": true,
  "createdAt": "2025-11-28T...",
  "updatedAt": "2025-11-28T..."
}
```

### Biaya Perawatan Document

```json
{
  "id": "def456",
  "category": "PERAWATAN_KAMAR",
  "subCategory": "BIAYA_PERAWATAN",
  "serviceName": "Visite dr Spesialis",
  "price": 150000,
  "unit": "/hari",
  "roomClass": "KLS_1",
  "isActive": true,
  "code": "BIAYA-KLS_1-VISITE DR S",
  "createdAt": "2025-11-28T...",
  "updatedAt": "2025-11-28T..."
}
```

### Perinatologi Document

```json
{
  "id": "ghi789",
  "category": "PERAWATAN_KAMAR",
  "subCategory": "PERINATOLOGI",
  "serviceName": "Tarif sewa per hari",
  "price": 250000,
  "unit": "/hari",
  "roomClass": "INCUBATOR",
  "isActive": true,
  "code": "PERINATO-INCUBATOR-TARIF SEWA",
  "createdAt": "2025-11-28T...",
  "updatedAt": "2025-11-28T..."
}
```

---

## ⚠️ Important Notes

### Backward Compatibility
- ✅ Old PERAWATAN_KAMAR data works fine
- ✅ Missing `subCategory` defaults to `'TARIF_KAMAR'`
- ✅ Auto-detect `roomClass` from service name

### Matrix Editing
- 💡 Empty cells or 0 values = service not available
- 💡 All changes saved at once (bulk save)
- 💡 Auto-delete if price = 0 and document exists

### Permissions
- 🔒 Matrix pages: **Admin only**
- 🔓 Tarif Kamar: **Admin + Farmasi**
- 📝 IGD visits: **Admin + IGD** can add all subcategories

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Services not in dropdown | Check `isActive: true` and price > 0 |
| Matrix won't save | Check browser console, verify Firestore rules |
| Old data wrong subcategory | Edit and re-save to apply auto-detection |
| Dropdown not grouped | Only applies to PERAWATAN_KAMAR category |

---

## ✅ Checklist: First Time Setup

- [ ] Go to `/admin/pricing/perawatan-kamar/biaya-perawatan`
- [ ] Fill in common services (Visite, Jasa Pelayanan, etc.)
- [ ] Go to `/admin/pricing/perawatan-kamar/perinatologi`
- [ ] Fill in NICU services (Tarif sewa, Visite, etc.)
- [ ] Test in IGD visit: Select PERAWATAN_KAMAR and see grouped dropdown
- [ ] Create test visit with services from all 3 subcategories
- [ ] Verify invoice shows all services correctly

---

**Quick Help**: For detailed guide, see `PERAWATAN_KAMAR_SUBCATEGORY_GUIDE.md`

**Last Updated**: November 28, 2025

