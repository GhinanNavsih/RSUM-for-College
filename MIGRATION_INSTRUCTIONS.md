# Drug Migration - Step by Step Instructions

## 🎯 Quick Start

### Step 1: Access Migration Page

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000/admin/migrate
   ```

3. Login as **Admin** if not already logged in

### Step 2: Run Migration

1. You'll see the migration page with a big button
2. Read the warnings and information
3. Click **"▶️ Start Migration"** button
4. Wait for the migration to complete (usually takes a few seconds)
5. Watch the real-time log showing progress

### Step 3: Verify Migration

1. When complete, you'll see:
   ```
   ✅ Migration Complete!
   📊 Summary:
      Total drugs: X
      ✅ Successfully migrated: X
      ❌ Failed: 0
   ```

2. Click **"→ Go to Database Harga"** button

3. Select category **"7. BHP (OBAT & ALKES)"**

4. Verify all your drugs are listed

### Step 4: Test in Visit

1. Go to IGD → Create a new Rawat Inap visit
2. In the visit editor, select category **"7. BHP (OBAT & ALKES)"**
3. Verify dropdown shows your drugs
4. Select a drug and verify auto-fill works
5. Add to billing and verify calculation

### Step 5: Delete Migration Page ⚠️

**IMPORTANT:** After successful migration, delete the temporary page:

```bash
rm -rf app/admin/migrate
```

Or manually delete the folder:
```
app/admin/migrate/
└── page.tsx  ← DELETE THIS FOLDER
```

## What the Migration Does

### Source: `drugs` Collection
```json
{
  "drugId": "DRG-001",
  "drugName": "Paracetamol 500mg",
  "unit": "Tablet",
  "pricePerUnit": 1000,
  "stockQty": 500,
  "isActive": true,
  "description": "Obat penurun panas",
  "manufacturer": "Generic"
}
```

### Destination: `servicePrices` Collection (BHP_OBAT_ALKES)
```json
{
  "category": "BHP_OBAT_ALKES",
  "serviceName": "Paracetamol 500mg",
  "price": 1000,
  "unit": "Tablet",
  "code": "DRG-001",
  "isActive": true,
  "description": "Obat penurun panas - Generic"
}
```

### What Stays in `drugs` Collection
- ✅ `stockQty` - Stock quantity
- ✅ `minStockQty` - Minimum stock alert
- ✅ Stock tracking functionality
- ✅ Prescription integration

## Visual Guide

### Migration Page
```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 Drug Migration Utility                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ⚠️ Important Information                                    │
│ • This is a ONE-TIME operation                              │
│ • Original drugs collection will NOT be deleted             │
│ • Stock tracking continues to use drugs collection          │
│                                                             │
│ ┌─────────────┬─────────────┬─────────────┐                │
│ │   Total     │  ✅ Success  │  ❌ Failed   │                │
│ │     15      │      15     │      0      │                │
│ └─────────────┴─────────────┴─────────────┘                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │        ▶️ Start Migration                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Migration Log:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [10:30:15] 🔄 Starting migration...                     │ │
│ │ [10:30:16] 📦 Found 15 drugs in database                │ │
│ │ [10:30:17] ✅ [1/15] Migrated: Paracetamol 500mg        │ │
│ │ [10:30:17] ✅ [2/15] Migrated: Amoxicillin 500mg        │ │
│ │ ...                                                     │ │
│ │ [10:30:20] 🎉 MIGRATION COMPLETE!                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Issue: "Access Denied"
**Solution:** Make sure you're logged in as Admin

### Issue: "Failed to migrate some drugs"
**Solution:** Check the log for specific errors. Common causes:
- Network issues
- Firestore permissions
- Invalid data format

### Issue: "Duplicates created"
**Solution:** If you run migration twice, duplicates will be created. You can:
- Delete duplicates manually in Database Harga
- Or delete all BHP entries and run migration again

### Issue: Migration takes too long
**Solution:** This is normal if you have many drugs. Wait for completion.

## After Migration

### What You Can Do

1. **Manage Drug Prices in Database Harga:**
   - Go to `/prices`
   - Select "7. BHP (OBAT & ALKES)"
   - Edit prices, add new drugs, etc.

2. **Use in Rawat Inap Billing:**
   - Select category "7. BHP (OBAT & ALKES)"
   - Dropdown shows all drugs
   - Select drug → auto-fills price

3. **Prescriptions Still Work:**
   - Farmasi can still prescribe drugs
   - Stock is still tracked in `drugs` collection
   - No changes to prescription workflow

### Keeping Systems in Sync

**When adding new drugs:**
1. Add to `drugs` collection (for stock)
2. Add to `servicePrices` (for pricing)

**When updating prices:**
1. Update in Database Harga
2. Optionally update in Drug Database

**Or:** Use Database Harga as source of truth for prices

## Cleanup

### After Successful Migration

1. **Verify data:**
   - Check Database Harga → "7. BHP (OBAT & ALKES)"
   - Confirm all drugs are present

2. **Test functionality:**
   - Test Rawat Inap billing dropdown
   - Test prescriptions still work

3. **Delete migration page:**
   ```bash
   rm -rf app/admin/migrate
   ```

4. **Optional:** Update Navbar to remove migration link (if added)

## Summary

### Before Migration
- Drugs: Separate database page
- Billing: Manual entry or limited integration
- Management: Separate interface

### After Migration
- Drugs: In unified pricing system (category 7)
- Billing: Dropdown with auto-fill
- Management: Centralized pricing interface
- Stock: Still tracked separately (no changes)

## Quick Reference

| Action | Location | Purpose |
|--------|----------|---------|
| **Run Migration** | `/admin/migrate` | One-time drug copy |
| **Manage Prices** | `/prices` → Category 7 | Edit drug prices |
| **Manage Stock** | `/drugs` | Track inventory |
| **Rawat Inap Billing** | Visit editor → Category 7 | Use dropdown |
| **Prescriptions** | Visit editor → Resep | Use drugs DB |

## Status Checklist

- [ ] Access migration page
- [ ] Run migration
- [ ] Verify success (0 failed)
- [ ] Check Database Harga
- [ ] Test in Rawat Inap billing
- [ ] Test prescriptions still work
- [ ] Delete migration page
- [ ] Document any issues

---

## 🚀 Ready to Migrate!

1. Go to: `http://localhost:3000/admin/migrate`
2. Click: "▶️ Start Migration"
3. Wait for completion
4. Verify and test
5. Delete the migration page

**The migration is safe, non-destructive, and reversible!** 🎉

