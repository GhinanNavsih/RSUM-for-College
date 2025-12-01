# Rawat Inap Drug Prescription Change

## Overview

For **Rawat Inap** (Inpatient) visits, drug prescriptions are now handled differently from IGD and Rawat Jalan visits.

## What Changed

### Before
- All visit types (IGD, Rawat Jalan, Rawat Inap) had a separate "Resep Obat" section
- Drugs were added through a dedicated prescription form
- Prescriptions were stored in `visit.prescriptions` array

### After
- **IGD & Rawat Jalan**: Still use the "Resep Obat" section (unchanged)
- **Rawat Inap**: Drug prescriptions are now part of "Tindakan & Biaya" under category **"7. BHP (OBAT & ALKES)"**

## Why This Change?

### Better Integration
✅ **Unified Billing** - All billing items in one place  
✅ **Consistent Workflow** - Same process for all services and drugs  
✅ **Clearer Organization** - Drugs grouped with medical supplies  
✅ **Simplified UI** - One section instead of two for Rawat Inap  

### Real-World Alignment
In actual hospital billing for inpatient care, drugs are typically listed as line items in the overall billing statement, not as a separate prescription section. This change aligns the system with real-world practice.

## How It Works Now

### For IGD & Rawat Jalan (Unchanged)

**Separate "Resep Obat" Section:**
```
┌─────────────────────────────────────────────────┐
│ Tindakan & Biaya                                │
│ • Pemeriksaan IGD                               │
│ • Konsultasi Dokter                             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Resep Obat                                      │
│ • Paracetamol 500mg - 10 tablet                 │
│ • Amoxicillin 500mg - 15 kapsul                 │
└─────────────────────────────────────────────────┘
```

### For Rawat Inap (New)

**Drugs in "7. BHP (OBAT & ALKES)" Category:**
```
┌─────────────────────────────────────────────────┐
│ Tindakan & Biaya                                │
│                                                 │
│ 1. PERAWATAN/KAMAR                              │
│ • Kamar Kelas 2 - 3 hari                        │
│                                                 │
│ 7. BHP (OBAT & ALKES)                           │
│ • Paracetamol 500mg - 10 tablet                 │
│ • Amoxicillin 500mg - 15 kapsul                 │
│ • Infus Set - 2 set                             │
└─────────────────────────────────────────────────┘

ℹ️ Resep Obat untuk Rawat Inap
Untuk pasien Rawat Inap, obat-obatan diinput melalui 
kategori "7. BHP (OBAT & ALKES)" di bagian 
"Tindakan & Biaya" di atas.
```

## User Workflow

### Adding Drugs to Rawat Inap Visit

1. **Go to "Tindakan & Biaya" section**
2. **Select category**: "7. BHP (OBAT & ALKES)"
3. **Select drug from dropdown**: Shows drugs from unified pricing system
4. **Enter quantity**: Number of units
5. **Add to billing**: Drug appears in the BHP section

**Example:**
```
Category: 7. BHP (OBAT & ALKES)
Nama: Paracetamol 500mg
Dokter: (optional)
Unit: Tablet
Qty: 10
Tarif: Rp 1,000
Catatan: 3x1 sehari sesudah makan
```

### Visual Indicator

When editing a Rawat Inap visit, users will see an info box:

```
┌─────────────────────────────────────────────────┐
│ ℹ️ Resep Obat untuk Rawat Inap                  │
│                                                 │
│ Untuk pasien Rawat Inap, obat-obatan diinput   │
│ melalui kategori "7. BHP (OBAT & ALKES)" di     │
│ bagian "Tindakan & Biaya" di atas. Pilih       │
│ kategori tersebut, lalu pilih obat dari        │
│ dropdown untuk menambahkan ke tagihan.         │
└─────────────────────────────────────────────────┘
```

## Technical Implementation

### Code Changes

**File: `app/igd/visit/[visitId]/page.tsx`**

**Before:**
```tsx
{/* Prescriptions Section */}
<Card title="Resep Obat" className="mb-6">
  {/* Always shown for all visit types */}
</Card>
```

**After:**
```tsx
{/* Prescriptions Section - Only for IGD and Rawat Jalan */}
{visit.jenis !== 'Rawat Inap' && (
  <Card title="Resep Obat" className="mb-6">
    {/* Only shown for IGD and Rawat Jalan */}
  </Card>
)}

{/* Info message for Rawat Inap */}
{visit.jenis === 'Rawat Inap' && canEdit && (
  <Card className="mb-6 bg-blue-50 border-blue-200">
    {/* Info message explaining to use BHP category */}
  </Card>
)}
```

### Data Model

**No changes to data model:**
- `visit.prescriptions` array still exists
- For Rawat Inap, it may be empty or contain legacy data
- For IGD/Rawat Jalan, it continues to work as before

**Drug data in Rawat Inap:**
- Stored in `visit.services` array
- Category: `BHP_OBAT_ALKES`
- Contains: `nama`, `harga`, `quantity`, `unit`, `notes` (for dosage)

## Benefits

### For Users

✅ **Simpler Interface** - One section for all billing items  
✅ **Consistent Process** - Same workflow for all services  
✅ **Better Organization** - Drugs grouped with medical supplies  
✅ **Clear Guidance** - Info message explains the change  

### For System

✅ **Unified Pricing** - All items use the same pricing database  
✅ **Flexible Billing** - Easy to add any type of item  
✅ **Better Reporting** - All costs in one structure  
✅ **Backward Compatible** - IGD/Rawat Jalan unchanged  

## Migration Guide

### For Existing Rawat Inap Visits

**Old visits with prescriptions in `visit.prescriptions`:**
- Will still display correctly in Kasir and Farmasi
- No data loss
- Can continue to be processed

**New Rawat Inap visits:**
- Use "7. BHP (OBAT & ALKES)" category
- Drugs stored in `visit.services`
- Integrated with unified pricing system

### For Users

**Training points:**
1. For IGD/Rawat Jalan: Use "Resep Obat" section (no change)
2. For Rawat Inap: Use "7. BHP (OBAT & ALKES)" in "Tindakan & Biaya"
3. Info message will guide users

## Comparison Table

| Feature | IGD / Rawat Jalan | Rawat Inap |
|---------|-------------------|------------|
| **Drug Input** | Separate "Resep Obat" section | Category "7. BHP (OBAT & ALKES)" |
| **Data Storage** | `visit.prescriptions` | `visit.services` (category: BHP) |
| **Pricing Source** | `drugs` collection | `servicePrices` collection |
| **Display** | Separate table | Grouped with other BHP items |
| **Workflow** | Dedicated form | Same form as other services |

## Example: Complete Rawat Inap Billing

```
TINDAKAN & BIAYA - RAWAT INAP

1. PERAWATAN/KAMAR
   Kamar Kelas 2        3 hari    Rp 200,000    Rp 600,000

4. PEMERIKSAAN DI UGD
   Pemeriksaan Awal     1 x       Rp 150,000    Rp 150,000

5. VISITE DOKTER
   Visite Harian        3 kali    Rp  50,000    Rp 150,000
   dr. Ahmad Fulan

7. BHP (OBAT & ALKES)
   Paracetamol 500mg    10 tablet Rp   1,000    Rp  10,000
   Amoxicillin 500mg    15 kapsul Rp   2,500    Rp  37,500
   Infus Set            2 set     Rp  15,000    Rp  30,000
   Catatan: 3x1 sehari sesudah makan

8. PENUNJANG
   Rontgen Thorax       1 x       Rp 100,000    Rp 100,000
   Darah Lengkap        1 x       Rp  75,000    Rp  75,000

TOTAL BIAYA: Rp 1,152,500
```

## FAQs

**Q: What happens to existing Rawat Inap visits with prescriptions?**  
A: They will continue to work. The `prescriptions` array is preserved for backward compatibility.

**Q: Can I still add prescriptions to Rawat Inap visits?**  
A: The UI no longer shows the "Resep Obat" section for Rawat Inap. Use "7. BHP (OBAT & ALKES)" instead.

**Q: Will Farmasi still work for Rawat Inap?**  
A: Yes, but drugs will be sourced from the services array (BHP category) instead of prescriptions array.

**Q: How do I add dosage instructions?**  
A: Use the "Catatan" (Notes) field when adding drugs in the BHP category (e.g., "3x1 sehari sesudah makan").

**Q: Can I add non-drug items to BHP category?**  
A: Yes! BHP includes both drugs (obat) and medical supplies (alkes) like infus sets, bandages, etc.

**Q: Does this affect IGD or Rawat Jalan?**  
A: No, IGD and Rawat Jalan continue to use the separate "Resep Obat" section as before.

## Summary

### Key Points

✅ **Rawat Inap**: Drugs in "7. BHP (OBAT & ALKES)" category  
✅ **IGD/Rawat Jalan**: Drugs in separate "Resep Obat" section  
✅ **Unified System**: All drugs from pricing database  
✅ **Better Organization**: All billing items in one place  
✅ **Clear Guidance**: Info message for users  
✅ **Backward Compatible**: Existing data preserved  

### Visual Summary

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  IGD / Rawat Jalan    →    Resep Obat Section  │
│                                                 │
│  Rawat Inap          →    7. BHP Category      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

**Status: ✅ IMPLEMENTED**

The change has been applied to `app/igd/visit/[visitId]/page.tsx` and is ready for use!

