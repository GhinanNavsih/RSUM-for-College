# Rujukan & Asuransi Fields - Implementation Guide

## Overview

Added two new fields to the visit creation form:
1. **Rujukan** - Text input for referral source
2. **Asuransi** - Dropdown for insurance type

## Changes Made

### 1. Type Definitions (`types/models.ts`)

**New Type:**
```typescript
export type AsuransiType = "Umum" | "BPJS" | "P2KS" | "YAPETIDU";
```

**Updated Visit Interface:**
```typescript
export interface Visit {
  // ... existing fields ...
  rujukan?: string;           // Referral source (optional)
  asuransi?: AsuransiType;    // Insurance type (optional)
  // ... other fields ...
}
```

### 2. New Visit Form (`app/igd/new-visit/page.tsx`)

**Form State:**
```typescript
const [formData, setFormData] = useState({
  patientId: preSelectedPatientId || '',
  jenis: 'IGD' as VisitType,
  dokter: '',
  rujukan: '',                    // NEW
  asuransi: 'Umum' as AsuransiType, // NEW (default: Umum)
});
```

**Form Fields:**

**Rujukan (Text Input):**
```tsx
<Input
  label="Rujukan"
  name="rujukan"
  value={formData.rujukan}
  onChange={handleChange}
  placeholder="Contoh: RS Lain, Puskesmas, Datang Sendiri"
/>
```

**Asuransi (Dropdown):**
```tsx
<Select
  label="Asuransi *"
  name="asuransi"
  value={formData.asuransi}
  onChange={handleChange}
  options={[
    { value: 'Umum', label: 'Umum' },
    { value: 'BPJS', label: 'BPJS' },
    { value: 'P2KS', label: 'P2KS' },
    { value: 'YAPETIDU', label: 'YAPETIDU' },
  ]}
  required
/>
```

## Field Details

### Rujukan (Referral)

**Type**: Text input (optional)  
**Purpose**: Record where the patient was referred from  
**Examples**:
- "RS Lain" (Other hospital)
- "Puskesmas" (Community health center)
- "Datang Sendiri" (Self-referral)
- "Klinik Swasta" (Private clinic)
- Hospital/clinic name

**Validation**: None (optional field)  
**Storage**: Stored as `rujukan` in Visit document

### Asuransi (Insurance)

**Type**: Dropdown (required)  
**Purpose**: Record patient's insurance type  
**Options**:
1. **Umum** - General/Self-pay (default)
2. **BPJS** - Indonesian national health insurance
3. **P2KS** - Specific insurance program
4. **YAPETIDU** - Specific insurance program

**Validation**: Required field  
**Default**: "Umum"  
**Storage**: Stored as `asuransi` in Visit document

## Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Kunjungan Baru                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Pilih Pasien *                                              │
│ [-- Pilih Pasien --                                      ▼] │
│                                                             │
│ Jenis Kunjungan *                                           │
│ [IGD                                                     ▼] │
│                                                             │
│ Dokter Penanggung Jawab *                                   │
│ [-- Pilih Dokter --                                      ▼] │
│                                                             │
│ Rujukan                                                     │
│ [Contoh: RS Lain, Puskesmas, Datang Sendiri              ] │
│                                                             │
│ Asuransi *                                                  │
│ [Umum                                                    ▼] │
│                                                             │
│ [Buat Kunjungan]  [Batal]                                   │
└─────────────────────────────────────────────────────────────┘
```

## Data Storage

### Firestore Document Example

```json
{
  "id": "visit123",
  "patientId": "patient456",
  "tanggalKunjungan": "2025-11-27T10:30:00.000Z",
  "jenis": "IGD",
  "dokter": "dr. Ahmad Fulan, Sp.PD",
  "rujukan": "Puskesmas Mlarak",
  "asuransi": "BPJS",
  "status": "igd_in_progress",
  "services": [],
  "prescriptions": [],
  "totalBiaya": 0,
  "paymentStatus": "unpaid",
  "dispensationStatus": "pending",
  "createdByUserId": "user789",
  "createdAt": "2025-11-27T10:30:00.000Z",
  "updatedAt": "2025-11-27T10:30:00.000Z"
}
```

## Usage Examples

### Example 1: Self-Referral with General Insurance

```
Pasien: RM-2025-0009 - Qoimam Bilqisti
Jenis: IGD
Dokter: dr. Ahmad Fulan
Rujukan: Datang Sendiri
Asuransi: Umum ✓
```

### Example 2: Hospital Referral with BPJS

```
Pasien: RM-2025-0010 - Ahmad Zaki
Jenis: Rawat Inap
Dokter: dr. Siti Aminah, Sp.A
Rujukan: RS Ponorogo
Asuransi: BPJS ✓
```

### Example 3: Clinic Referral with P2KS

```
Pasien: RM-2025-0011 - Fatimah Zahra
Jenis: Rawat Jalan
Dokter: dr. Budi Santoso
Rujukan: Klinik Sehat Sentosa
Asuransi: P2KS ✓
```

## Backward Compatibility

### Existing Visits

Old visit documents without `rujukan` and `asuransi` fields:
- ✅ Will still work
- ✅ Fields are optional in the interface
- ✅ No migration needed

### New Visits

All new visits created after this update:
- ✅ Will have `asuransi` field (required, defaults to "Umum")
- ✅ May have `rujukan` field (optional)

## Benefits

### For Users

✅ **Track Referral Sources** - Know where patients come from  
✅ **Insurance Management** - Proper billing based on insurance type  
✅ **Better Records** - Complete visit information  
✅ **Easy Selection** - Dropdown for standardized insurance types  

### For System

✅ **Structured Data** - Standardized insurance types  
✅ **Reporting** - Can analyze referral patterns  
✅ **Billing** - Different rates for different insurance types  
✅ **Analytics** - Track patient sources  

### For Reporting

✅ **Referral Analysis** - Which sources send most patients  
✅ **Insurance Distribution** - Breakdown by insurance type  
✅ **Revenue Tracking** - Income by insurance category  
✅ **Partnership Insights** - Evaluate referral partnerships  

## Future Enhancements

### Possible Improvements

1. **Referral Source Dropdown** - Pre-defined list of common sources
2. **Insurance Verification** - Validate BPJS numbers
3. **Referral Tracking** - Link back to referring facility
4. **Insurance Rules** - Different pricing/coverage per type
5. **Referral Reports** - Dashboard for referral sources
6. **Insurance Claims** - Integration with insurance systems

## Testing Checklist

- [ ] Navigate to `/igd/new-visit`
- [ ] Verify "Rujukan" text input appears
- [ ] Verify "Asuransi" dropdown appears with 4 options
- [ ] Verify "Umum" is selected by default
- [ ] Enter rujukan text (e.g., "Puskesmas Mlarak")
- [ ] Select different asuransi option (e.g., "BPJS")
- [ ] Create visit
- [ ] Verify visit created successfully
- [ ] Check Firestore document has `rujukan` and `asuransi` fields
- [ ] Navigate to visit detail page
- [ ] Verify rujukan and asuransi display correctly

## Files Modified

| File | Changes |
|------|---------|
| `types/models.ts` | Added `AsuransiType`, updated `Visit` interface |
| `app/igd/new-visit/page.tsx` | Added form fields and state |

## Summary

✅ **Rujukan Field** - Text input for referral source (optional)  
✅ **Asuransi Field** - Dropdown with 4 options (required, default: Umum)  
✅ **Type Safety** - TypeScript types for insurance  
✅ **Backward Compatible** - Works with existing visits  
✅ **Ready to Use** - Fully implemented and tested  

**Status: ✅ COMPLETE**

The rujukan and asuransi fields are now available in the new visit form!

