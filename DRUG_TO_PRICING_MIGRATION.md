# Drug Database Migration to Unified Pricing System

## Overview

This guide explains how to migrate your drug database from the separate `drugs` collection into the unified pricing system under **"7. BHP (OBAT & ALKES)"** category.

## Why Migrate?

### Benefits of Unified System
✅ **One Place for All Pricing** - Drugs alongside other services  
✅ **Consistent Interface** - Same CRUD operations  
✅ **Simplified Management** - No need for separate drug page  
✅ **Better Organization** - Drugs grouped with medical supplies  

### What Stays in Drugs Collection
⚠️ **Stock Management** - The `drugs` collection will remain for:
- Stock quantity tracking (`stockQty`)
- Minimum stock alerts (`minStockQty`)
- Manufacturer information
- Prescription integration (linking drugs to visits)

### What Moves to Pricing System
✅ **Pricing Information** - Migrated to `servicePrices`:
- Drug name
- Unit (Tablet, Kapsul, etc.)
- Price per unit
- Active/Inactive status
- Drug code/ID

## Migration Strategy

### Option 1: Dual System (Recommended)

**Keep both systems running:**
- **`drugs` collection** - For stock management and prescriptions
- **`servicePrices` (BHP category)** - For pricing in billing

**Why this works:**
- Prescriptions still use `drugs` collection (for stock tracking)
- Billing uses `servicePrices` (for standardized pricing)
- No breaking changes to existing functionality

### Option 2: Full Migration

**Move everything to unified system:**
- Extend `ServicePrice` to include stock fields
- Update prescription system to use `servicePrices`
- Deprecate `drugs` collection

**⚠️ Not recommended** - Requires extensive refactoring

## Implementation: Dual System

### Step 1: Add Drugs to Pricing System

Go to **Database Harga** → Select **"7. BHP (OBAT & ALKES)"**

For each drug in your database, add it as a service:

**Example: Paracetamol**
```
Kode Layanan: DRG-001
Nama Layanan: Paracetamol 500mg
Satuan: Tablet
Harga: 1000
Deskripsi: Obat penurun panas dan pereda nyeri
Status: Aktif
```

**Example: Amoxicillin**
```
Kode Layanan: DRG-002
Nama Layanan: Amoxicillin 500mg
Satuan: Kapsul
Harga: 2500
Deskripsi: Antibiotik
Status: Aktif
```

### Step 2: Automated Migration Script

Create a script to migrate existing drugs:

```typescript
// Migration script (run once)
import { getAllDrugs } from '@/lib/firestore';
import { createServicePrice } from '@/lib/firestore';

async function migrateDrugsToPricing() {
  try {
    // Get all drugs from drugs collection
    const drugs = await getAllDrugs();
    
    console.log(`Migrating ${drugs.length} drugs to pricing system...`);
    
    for (const drug of drugs) {
      // Create corresponding service price
      await createServicePrice({
        category: 'BHP_OBAT_ALKES',
        serviceName: `${drug.drugName} (${drug.unit})`,
        price: drug.pricePerUnit,
        unit: drug.unit,
        code: drug.drugId,
        isActive: drug.isActive,
        description: drug.description || `${drug.manufacturer || 'Generic'}`,
      });
      
      console.log(`✓ Migrated: ${drug.drugName}`);
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run migration
migrateDrugsToPricing();
```

### Step 3: Update Prescription System

**Current behavior (keep as is):**
- Prescriptions link to `drugs` collection via `drugId`
- Stock is reduced from `drugs` collection
- This ensures stock tracking continues to work

**New behavior (add):**
- When prescribing, also check `servicePrices` for current pricing
- Use price from `servicePrices` for billing
- Use `drugs` collection for stock management

### Step 4: Sync Prices

When drug prices change, update both:

**In Drug Database:**
```typescript
await updateDrug(drugId, {
  pricePerUnit: 1500
});
```

**In Pricing Database:**
```typescript
await updateServicePrice(servicePriceId, {
  price: 1500
});
```

## Manual Migration Steps

### Step 1: Export Current Drugs

1. Go to Firebase Console → Firestore
2. Navigate to `drugs` collection
3. Export to JSON (or note down all drugs)

### Step 2: Add to Pricing System

1. Go to `/prices` page
2. Select **"7. BHP (OBAT & ALKES)"**
3. For each drug, click **"+ Tambah Layanan"**
4. Fill in:
   - **Kode**: Drug ID (e.g., DRG-001)
   - **Nama**: Drug name + unit (e.g., "Paracetamol 500mg")
   - **Satuan**: Unit (Tablet, Kapsul, etc.)
   - **Harga**: Price per unit
   - **Deskripsi**: Description/manufacturer
   - **Aktif**: Check if active

### Step 3: Verify

1. Go to a Rawat Inap visit
2. Select category **"7. BHP (OBAT & ALKES)"**
3. Verify dropdown shows your drugs
4. Select a drug and verify auto-fill works

## Data Mapping

### From Drug to ServicePrice

| Drug Field | ServicePrice Field | Notes |
|------------|-------------------|-------|
| `drugId` | `code` | Drug code/ID |
| `drugName` + `unit` | `serviceName` | Combined name |
| `pricePerUnit` | `price` | Price |
| `unit` | `unit` | Unit (Tablet, etc.) |
| `isActive` | `isActive` | Active status |
| `description` | `description` | Description |
| `manufacturer` | `description` | Can include in description |

### Fields NOT Migrated

These stay in `drugs` collection:
- `stockQty` - Current stock
- `minStockQty` - Minimum stock alert
- Stock tracking functionality

## Usage After Migration

### For Billing (Rawat Inap)

**Use Pricing System:**
1. Select category: "7. BHP (OBAT & ALKES)"
2. Dropdown shows drugs from `servicePrices`
3. Select drug → auto-fills price
4. Enter quantity
5. Add to billing

### For Prescriptions (Farmasi)

**Use Drug Database:**
1. In prescription section
2. Select drug from `drugs` collection
3. Stock is tracked and reduced
4. Price comes from `drugs.pricePerUnit`

### For Price Management

**Update in Pricing System:**
1. Go to `/prices`
2. Select "7. BHP (OBAT & ALKES)"
3. Edit drug price
4. Price updates for billing

**Optionally sync to Drug Database:**
- Keep `drugs` collection prices in sync
- Or use pricing system as source of truth

## Example: Complete Drug Entry

### In Pricing System (servicePrices)

```json
{
  "category": "BHP_OBAT_ALKES",
  "serviceName": "Paracetamol 500mg",
  "price": 1000,
  "unit": "Tablet",
  "code": "DRG-001",
  "isActive": true,
  "description": "Obat penurun panas - Generic",
  "createdAt": "2025-11-27...",
  "updatedAt": "2025-11-27..."
}
```

### In Drug Database (drugs)

```json
{
  "drugId": "DRG-001",
  "drugName": "Paracetamol 500mg",
  "unit": "Tablet",
  "pricePerUnit": 1000,
  "stockQty": 500,
  "minStockQty": 100,
  "isActive": true,
  "description": "Obat penurun panas",
  "manufacturer": "Generic",
  "createdAt": "2025-11-27...",
  "updatedAt": "2025-11-27..."
}
```

## Recommended Workflow

### Phase 1: Dual System (Now)
1. ✅ Add drugs to pricing system manually
2. ✅ Keep drug database for stock management
3. ✅ Use pricing system for Rawat Inap billing
4. ✅ Use drug database for prescriptions

### Phase 2: Sync Prices (Future)
1. Create sync function
2. When drug price changes, update both systems
3. Or designate pricing system as source of truth

### Phase 3: Consider Full Integration (Optional)
1. Extend `ServicePrice` with stock fields
2. Migrate prescription system
3. Deprecate separate drug database

## Quick Start: Add Your First Drug

1. **Go to Database Harga**
   - Navigate to `/prices`

2. **Select Category**
   - Choose "7. BHP (OBAT & ALKES)"

3. **Add Drug**
   - Click "+ Tambah Layanan"
   - Kode: DRG-001
   - Nama: Paracetamol 500mg
   - Satuan: Tablet
   - Harga: 1000
   - Click "Tambah Layanan"

4. **Test in Visit**
   - Create Rawat Inap visit
   - Select "7. BHP (OBAT & ALKES)"
   - See drug in dropdown
   - Select and verify auto-fill

## Benefits Summary

### Before Migration
```
Drugs: Separate page, separate management
Billing: Manual entry or limited integration
Pricing: Scattered across different systems
```

### After Migration
```
Drugs: In unified pricing system
Billing: Dropdown selection with auto-fill
Pricing: Centralized, consistent, easy to update
Stock: Still tracked in drug database
```

## FAQs

**Q: Will prescriptions still work?**  
A: Yes! Prescriptions continue to use the `drugs` collection for stock tracking.

**Q: Do I need to delete the drug database?**  
A: No! Keep it for stock management and prescriptions.

**Q: What if prices differ between systems?**  
A: You can choose which system is the source of truth. Recommended: pricing system for billing, drug database for stock.

**Q: Can I add non-drug items to BHP category?**  
A: Yes! Add medical supplies, equipment, etc. That's why it's called "BHP (OBAT & ALKES)".

**Q: How do I keep prices in sync?**  
A: Update both systems when prices change, or create a sync function.

## Summary

✅ **Dual system recommended** - Best of both worlds  
✅ **Pricing system** - For billing and price management  
✅ **Drug database** - For stock tracking and prescriptions  
✅ **Easy migration** - Manual or automated  
✅ **No breaking changes** - Existing functionality preserved  
✅ **Better organization** - All pricing in one place  

**Next Steps:**
1. Add your first drug to pricing system
2. Test in Rawat Inap billing
3. Gradually add more drugs
4. Keep both systems in sync

🎉 **Your drugs are now part of the unified pricing system!**

