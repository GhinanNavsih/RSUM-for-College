# Testing the Generalized Billing Model

## Quick Test Steps

### Test 1: Existing IGD Visit Still Works ✅
1. Go to **IGD Dashboard** → Select any existing visit
2. Verify the visit details load correctly
3. Check that services display with correct prices
4. Verify total calculation is correct
5. Try viewing the invoice in Kasir
6. Try viewing the prescription in Farmasi

**Expected:** Everything works exactly as before

### Test 2: Add New Service in IGD ✅
1. Go to **IGD** → Create a new visit or edit an existing one
2. Add a new service (e.g., "Pemeriksaan Dokter", Rp 50,000, Qty: 1)
3. Click "Simpan Perubahan"
4. Verify the service appears in the table
5. Verify the total is calculated correctly

**Expected:** New service is saved with `category: 'PEMERIKSAAN_UGD'` automatically

### Test 3: Service Quantity Handling ✅
1. In IGD visit editor, add a service with quantity > 1
2. Example: "Konsultasi", Rp 100,000, Qty: 2
3. Verify subtotal shows Rp 200,000
4. Save and check the invoice in Kasir
5. Verify PDF invoice shows correct quantity and subtotal

**Expected:** Quantity multiplies correctly, displays in all views

### Test 4: Invoice PDF Generation ✅
1. Go to **Kasir** → Select a visit
2. Click "Cetak Nota"
3. Verify PDF downloads correctly
4. Check that services show quantity and subtotal
5. Verify grand total matches

**Expected:** PDF displays correctly with all service details

### Test 5: Check Firestore Data
1. Open Firebase Console → Firestore Database
2. Navigate to `visits` collection
3. Open a recent visit document
4. Check the `services` array

**Expected Service Object (New):**
```json
{
  "id": "abc-123",
  "nama": "Pemeriksaan Dokter",
  "harga": 50000,
  "quantity": 1,
  "category": "PEMERIKSAAN_UGD"
}
```

**Expected Service Object (Old - still valid):**
```json
{
  "id": "xyz-789",
  "nama": "Konsultasi IGD",
  "harga": 100000
}
```

## Verification Checklist

- [ ] Old IGD visits load and display correctly
- [ ] New services can be added in IGD
- [ ] New services automatically get `category: 'PEMERIKSAAN_UGD'`
- [ ] Quantity field works (default 1)
- [ ] Total calculation includes quantity (harga × qty)
- [ ] Invoice PDF shows correct details
- [ ] Prescription PDF still works
- [ ] Kasir payment page displays correctly
- [ ] Farmasi dispensation page works
- [ ] No console errors
- [ ] No TypeScript errors

## Common Issues & Solutions

### Issue: Old visits show undefined quantity
**Solution:** This is expected! The code uses `service.quantity || 1` to handle this.

### Issue: Category field missing in old visits
**Solution:** This is normal. Old visits don't have category. The system treats undefined as 'LAINNYA'.

### Issue: Total calculation seems wrong
**Solution:** Check if you're testing with an old visit. Try creating a new visit to test the new behavior.

## Next Development Steps

Once testing is complete, you can proceed with:

1. **Build Rawat Inap Page** (`/app/rawat-inap/visit/[visitId]/page.tsx`)
   - Use category dropdowns for each service
   - Group services by category for display
   - Add fields for doctor, unit, notes

2. **Update Invoice for Rawat Inap**
   - Group services by BILLING_SECTIONS
   - Show numbered sections (1. PERAWATAN/KAMAR, 2. ALAT & TINDAKAN, etc.)
   - Display doctor, unit, notes columns

3. **Create Rawat Inap List Page**
   - Similar to IGD dashboard
   - Filter by visit type "Rawat Inap"

## Technical Notes

### How Category Defaults Work
```typescript
// In IGD, all new services get:
category: 'PEMERIKSAAN_UGD'

// In future Rawat Inap page, services can have different categories:
category: 'PERAWATAN_KAMAR'
category: 'VISITE_DOKTER'
// etc.
```

### How Backward Compatibility Works
```typescript
// Old service (no quantity, no category)
const oldService = {
  id: "abc",
  nama: "Konsultasi",
  harga: 50000
};

// Calculation still works:
const total = oldService.harga * (oldService.quantity || 1); // = 50000
const cat = oldService.category || 'LAINNYA'; // = 'LAINNYA'
```

### Why This Design?
- ✅ No data migration needed
- ✅ Existing pages keep working
- ✅ New features can be added incrementally
- ✅ Type-safe with TypeScript
- ✅ Easy to extend in the future

## Summary

The billing model is now ready for complex inpatient billing while maintaining 100% backward compatibility with existing IGD workflows. All new fields are optional, and the system gracefully handles missing data from older visits.

