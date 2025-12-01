# Generalized Billing Model - Implementation Guide

## Overview

The billing model has been generalized to support complex inpatient (rawat inap) billing while maintaining full backward compatibility with existing IGD visits.

## What Changed

### 1. New Types in `types/models.ts`

#### BillingCategory Type
```typescript
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
```

#### BILLING_SECTIONS Constant
Provides organized display labels for all billing categories:
```typescript
export const BILLING_SECTIONS = [
  { key: 'PERAWATAN_KAMAR', label: 'PERAWATAN/KAMAR', no: 1 },
  { key: 'ALAT_TINDAKAN_PARAMEDIS', label: 'ALAT & TINDAKAN PARAMEDIS', no: 2 },
  { key: 'KAMAR_OPERASI', label: 'KAMAR OPERASI', no: 3 },
  { key: 'PEMERIKSAAN_UGD', label: 'PEMERIKSAAN DI UGD', no: 4 },
  { key: 'VISITE_DOKTER', label: 'VISITE DOKTER', no: 5 },
  { key: 'KONSUL_DOKTER', label: 'KONSUL DOKTER', no: 6 },
  { key: 'BHP_OBAT_ALKES', label: 'BHP (OBAT & ALKES)', no: 7 },
  { key: 'PENUNJANG', label: 'PENUNJANG (LAB, RO, USG, ECG, dll.)', no: 8 },
  { key: 'RESUME_MEDIS', label: 'RESUME MEDIS', no: 9 },
  { key: 'VISUM_MEDIS', label: 'VISUM MEDIS', no: 10 },
  { key: 'AMBULANCE', label: 'AMBULANCE', no: 11 },
  { key: 'ADMINISTRASI', label: 'ADMINISTRASI', no: 12 },
  { key: 'LAINNYA', label: 'LAINNYA', no: 99 },
];
```

#### Extended VisitService Interface
```typescript
export interface VisitService {
  id: string;                   // local uuid inside the visit
  nama: string;                 // Description / nama layanan
  harga: number;                // Price per unit (tarif satuan)
  
  // New optional fields (backward compatible)
  quantity?: number;            // Quantity (default 1 for backward compatibility)
  category?: BillingCategory;   // Billing category (default 'LAINNYA' if missing)
  unit?: string;                // Unit description (e.g. 'hari', 'kali', 'x', 'paket')
  total?: number;               // Total price (harga × quantity), optional/computed
  dokter?: string;              // Doctor name (for VISITE_DOKTER / KONSUL_DOKTER)
  notes?: string;               // Additional notes (e.g. lab details)
}
```

### 2. Updated VisitType
Added "Rawat Inap" to the visit types:
```typescript
export type VisitType = "IGD" | "Rawat Jalan" | "Rawat Inap";
```

### 3. Updated IGD Visit Page

The IGD visit editor (`app/igd/visit/[visitId]/page.tsx`) now:
- Automatically sets `category: 'PEMERIKSAAN_UGD'` for all new services added in IGD
- Maintains full backward compatibility with existing visits
- Correctly calculates totals using the `quantity` field (with fallback to 1)

## Backward Compatibility

✅ **All existing IGD visits continue to work** because:

1. **All new fields are optional**: Old documents without `category`, `unit`, `dokter`, `notes` fields will still load correctly
2. **Smart defaults**: The code uses `service.quantity || 1` to handle old services without quantity
3. **No breaking changes**: The core fields (`id`, `nama`, `harga`) remain required and unchanged
4. **Firestore helpers unchanged**: Read/write operations work with both old and new document structures

### Example: Old vs New Service Objects

**Old Service (still works):**
```typescript
{
  id: "abc123",
  nama: "Konsultasi Dokter IGD",
  harga: 50000
}
```

**New Service (with extended fields):**
```typescript
{
  id: "def456",
  nama: "Visite Dokter Spesialis",
  harga: 100000,
  quantity: 3,
  category: "VISITE_DOKTER",
  unit: "kali",
  total: 300000,
  dokter: "dr. Ahmad Fulan, Sp.PD"
}
```

Both structures are valid and will display/calculate correctly.

## How to Use the New Model

### For IGD (Current Behavior)
No changes needed! IGD staff continue to add services normally:
- Services automatically get `category: 'PEMERIKSAAN_UGD'`
- Default `quantity` is 1
- Total is calculated as `harga × quantity`

### For Future Rawat Inap Page
When building the inpatient billing page, you can:

1. **Group services by category:**
```typescript
import { BILLING_SECTIONS } from '@/types/models';

// Group services by category
const groupedServices = BILLING_SECTIONS.map(section => ({
  ...section,
  items: visit.services.filter(s => (s.category || 'LAINNYA') === section.key)
}));
```

2. **Display organized billing table:**
```typescript
{groupedServices.map(section => (
  section.items.length > 0 && (
    <div key={section.key}>
      <h3>{section.no}. {section.label}</h3>
      <table>
        {section.items.map(service => (
          <tr>
            <td>{service.nama}</td>
            <td>{service.dokter || '-'}</td>
            <td>{service.unit || '-'}</td>
            <td>{service.quantity || 1}</td>
            <td>{formatCurrency(service.harga)}</td>
            <td>{formatCurrency(service.harga * (service.quantity || 1))}</td>
          </tr>
        ))}
      </table>
    </div>
  )
))}
```

3. **Add services with specific categories:**
```typescript
const newService: VisitService = {
  id: uuidv4(),
  nama: "Perawatan Kelas 1",
  harga: 500000,
  quantity: 3,
  category: 'PERAWATAN_KAMAR',
  unit: 'hari',
  total: 1500000,
};
```

## Data Migration

**No migration needed!** The system handles missing fields gracefully:
- Old services without `category` → treated as `'LAINNYA'`
- Old services without `quantity` → defaults to `1`
- Old services without `unit`, `dokter`, `notes` → displayed as `-` or empty

## Testing Checklist

- [x] Existing IGD visits still load and display correctly
- [x] Adding new services in IGD works (auto-sets category)
- [x] Total calculation works for both old and new services
- [x] No TypeScript/linter errors
- [ ] Invoice PDF displays correctly for old visits
- [ ] Invoice PDF displays correctly for new visits with categories
- [ ] Kasir page works with both old and new visit structures
- [ ] Farmasi page works with existing prescriptions

## Next Steps

1. **Create Rawat Inap Visit Page**: Build `/rawat-inap/visit/[visitId]/page.tsx` with:
   - Category-based service input sections
   - Excel-like billing table grouped by category
   - Support for doctor names, units, and notes

2. **Update Invoice PDF**: Modify `InvoicePDF.tsx` to:
   - Group services by category for rawat inap visits
   - Display additional fields (doctor, unit, notes) when present

3. **Add Navigation**: Create route and links for rawat inap management

## Technical Notes

- All calculations use `harga × (quantity || 1)` pattern for backward compatibility
- The `total` field in VisitService is optional and can be computed on-the-fly
- Category grouping should always handle undefined categories as `'LAINNYA'`
- Use `BILLING_SECTIONS` constant for consistent ordering across pages

## Summary

✅ **Data model is ready** for complex inpatient billing
✅ **Backward compatible** with all existing IGD visits  
✅ **No breaking changes** to current workflows  
✅ **Type-safe** with full TypeScript support  
🚧 **Ready for rawat inap page development**

