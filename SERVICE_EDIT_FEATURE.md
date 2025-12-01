# Service Edit Feature - Documentation

## Overview

Users can now edit services after adding them, eliminating the need to delete and re-create services when mistakes are made. This improves the user experience significantly.

## What's New

### Edit Button Added ✅
- Every service row now has an **"Edit"** button next to the **"Hapus"** button
- Works for both IGD/Rawat Jalan and Rawat Inap visit types
- Available only when the visit is in "igd_in_progress" status

### Edit Mode Behavior

When a user clicks **"Edit"** on a service:

1. **Form Pre-fills** - All service data loads into the form at the bottom
2. **Scroll to Form** - Page automatically scrolls to the form
3. **Visual Indicator** - Form title changes from "+ Tambah Tindakan" to "✏️ Edit Tindakan"
4. **Button Changes** - Submit button changes from "+ Tambah" to "✓ Simpan Perubahan"
5. **Cancel Option** - "Batal" button appears to exit edit mode

### User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Edit" on a service                          │
│    ↓                                                         │
│ 2. Form pre-fills with service data                         │
│    ↓                                                         │
│ 3. User modifies the fields                                 │
│    ↓                                                         │
│ 4. User clicks "✓ Simpan Perubahan"                         │
│    ↓                                                         │
│ 5. Service updates in the table                             │
│    ↓                                                         │
│ 6. Form resets to "Add" mode                                │
└─────────────────────────────────────────────────────────────┘
```

## UI Changes

### Before (Add Mode)
```
┌─────────────────────────────────────────────────────────────┐
│ + Tambah Tindakan                                           │
├─────────────────────────────────────────────────────────────┤
│ [Nama] [Harga] [Qty] [+ Tambah]                             │
└─────────────────────────────────────────────────────────────┘
```

### After Clicking "Edit" (Edit Mode)
```
┌─────────────────────────────────────────────────────────────┐
│ ✏️ Edit Tindakan                          [Batal Edit]      │
├─────────────────────────────────────────────────────────────┤
│ [Nama] [Harga] [Qty] [✓ Simpan] [Batal]                     │
│ Pre-filled with existing service data                       │
└─────────────────────────────────────────────────────────────┘
```

## Button Layout

### In Service Table
```
┌──────────────────────────────────────────────────────────┐
│ Tindakan          │ Harga    │ Qty │ Subtotal │ Aksi    │
├───────────────────┼──────────┼─────┼──────────┼─────────┤
│ Konsultasi Dokter │ Rp50,000 │ 1   │ Rp50,000 │[Edit]   │
│                   │          │     │          │[Hapus]  │
└──────────────────────────────────────────────────────────┘
```

### For Rawat Inap (Categorized View)
```
┌──────────────────────────────────────────────────────────────┐
│ 1. PERAWATAN/KAMAR                                           │
├──────────────┬────────┬──────┬─────┬─────────┬─────────────┤
│ Tindakan     │ Dokter │ Unit │ Qty │ Tarif   │ Aksi        │
├──────────────┼────────┼──────┼─────┼─────────┼─────────────┤
│ Perawatan    │ -      │ hari │  3  │ Rp500k  │ [Edit]      │
│ Kelas 1      │        │      │     │         │ [Hapus]     │
└──────────────┴────────┴──────┴─────┴─────────┴─────────────┘
```

## Features

### 1. Pre-fill All Fields ✅
When editing, the form loads:
- **Nama tindakan** - Service name
- **Harga/Tarif** - Price
- **Qty** - Quantity
- **Kategori** - Category (Rawat Inap only)
- **Unit** - Unit (Rawat Inap only)
- **Dokter** - Doctor name (Rawat Inap only)
- **Catatan** - Notes (Rawat Inap only)

### 2. Auto-scroll to Form ✅
Page automatically scrolls to the bottom where the form is located, so users don't have to manually scroll.

### 3. Visual Feedback ✅
- Form title changes to "✏️ Edit Tindakan"
- Button text changes to "✓ Simpan Perubahan" or "✓ Simpan"
- "Batal" button appears for easy cancellation

### 4. Cancel Edit ✅
Two ways to cancel:
- Click **"Batal"** button in the form
- Click **"Batal Edit"** button in the header

Both reset the form to "Add" mode and clear all fields.

### 5. Real-time Calculation ✅
Subtotal updates in real-time as you edit quantity or price.

## Example Scenarios

### Scenario 1: Fix Typo in Service Name
```
1. Service added: "Konsutasi Dokter" (typo)
2. Click "Edit" button
3. Change to: "Konsultasi Dokter"
4. Click "✓ Simpan"
5. Service updated in table
```

### Scenario 2: Adjust Quantity
```
1. Service added: Perawatan Kelas 1, 2 hari
2. Patient stays 1 more day
3. Click "Edit" button
4. Change Qty from 2 to 3
5. Subtotal updates: Rp 1,000,000 → Rp 1,500,000
6. Click "✓ Simpan Perubahan"
7. Service updated
```

### Scenario 3: Add Missing Doctor Name
```
1. Service added: Visite Dokter (no doctor name)
2. Click "Edit" button
3. Add Dokter: "dr. Ahmad Fulan, Sp.PD"
4. Click "✓ Simpan Perubahan"
5. Doctor name now appears in table
```

### Scenario 4: Change Category (Rawat Inap)
```
1. Service added to wrong category
2. Click "Edit" button
3. Change Kategori: "8. PENUNJANG" → "5. VISITE DOKTER"
4. Click "✓ Simpan Perubahan"
5. Service moves to correct category section
```

## Technical Implementation

### State Management
```typescript
const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
```

### Edit Handler
```typescript
const handleEditService = (service: VisitService) => {
  setEditingServiceId(service.id);
  setNewService({
    nama: service.nama,
    harga: service.harga.toString(),
    quantity: (service.quantity || 1).toString(),
    category: service.category || 'PEMERIKSAAN_UGD',
    unit: service.unit || '',
    dokter: service.dokter || '',
    notes: service.notes || '',
  });
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};
```

### Save Handler (Update Logic)
```typescript
if (editingServiceId) {
  // Update existing service
  const updatedServices = visit.services.map(s => 
    s.id === editingServiceId 
      ? { ...s, /* updated fields */ }
      : s
  );
  // Update visit and reset form
}
```

### Cancel Handler
```typescript
const handleCancelEdit = () => {
  setEditingServiceId(null);
  setNewService({ /* reset to defaults */ });
};
```

## Benefits

✅ **Better UX** - No need to delete and re-create services  
✅ **Faster Workflow** - Quick corrections without data loss  
✅ **Error Prevention** - Easy to fix mistakes  
✅ **Intuitive** - Clear visual feedback in edit mode  
✅ **Consistent** - Works for both IGD and Rawat Inap  
✅ **Safe** - Cancel option to abort changes  

## Testing Checklist

- [x] Click "Edit" on IGD service
- [x] Click "Edit" on Rawat Inap service
- [x] Form pre-fills correctly
- [x] Page scrolls to form
- [x] Edit service name
- [x] Edit quantity
- [x] Edit price
- [x] Edit category (Rawat Inap)
- [x] Edit doctor (Rawat Inap)
- [x] Edit unit (Rawat Inap)
- [x] Edit notes (Rawat Inap)
- [x] Subtotal recalculates
- [x] Total biaya updates
- [x] Click "Batal" to cancel
- [x] Click "Batal Edit" to cancel
- [x] Save changes successfully
- [x] Service updates in correct category

## User Instructions

### How to Edit a Service

1. **Find the service** you want to edit in the table
2. **Click "Edit"** button in the Aksi column
3. **Modify the fields** in the form that appears at the bottom
4. **Review the subtotal** to ensure it's correct
5. **Click "✓ Simpan Perubahan"** to save
6. **Or click "Batal"** to cancel without saving

### Tips

- ✅ The form will automatically scroll into view
- ✅ You can edit any field, including category
- ✅ Subtotal updates automatically as you type
- ✅ Click "Batal" anytime to exit edit mode
- ✅ After saving, the form resets to "Add" mode

## Comparison: Before vs After

### Before (Without Edit)
```
User makes typo → Must delete service → Re-enter all data → Add again
Time: ~30 seconds
Clicks: 5+ clicks
Risk: Might forget some details
```

### After (With Edit)
```
User makes typo → Click Edit → Fix typo → Save
Time: ~5 seconds
Clicks: 2 clicks
Risk: None, all data preserved
```

## Summary

The edit feature dramatically improves the user experience by allowing quick corrections without data loss. It's intuitive, fast, and works seamlessly for both simple IGD visits and complex Rawat Inap billing.

**Status:** ✅ Fully implemented and ready to use!

