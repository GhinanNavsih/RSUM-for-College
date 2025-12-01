# Ambulance Configuration UI Guide

## Overview

The Database Harga page (`/prices`) now includes a special interface for viewing and understanding ambulance pricing configuration when the **"11. AMBULANCE"** category is selected.

## What Was Implemented

### Visual Configuration Viewer

When users select "11. AMBULANCE" from the category dropdown, instead of seeing a regular service price table, they see:

1. **Configuration Table** - Shows all vehicle types with their settings
2. **Formula Display** - Shows the calculation formula
3. **Detail Modal** - Clickable details for each vehicle type
4. **Example Calculations** - Live calculation examples

---

## User Interface

### Main Ambulance View

```
┌─────────────────────────────────────────────────────────────┐
│ Database Harga                                              │
│ 11. AMBULANCE                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ℹ️ Konfigurasi Tarif Ambulans                               │
│ Tarif ambulans dihitung berdasarkan jarak (km)             │
│ menggunakan formula yang dapat dikonfigurasi per jenis      │
│ kendaraan.                                                  │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Jenis      Tarif/km  Pgmd  Admin  Pmlh  RS   PPN  Aksi │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ GRANDMAX   Rp 3,120  16%   16%    25%   25%  10%  [Detail] │
│ │ AMBULANS_  Rp 3,120  16%   16%    25%   25%  10%  [Detail] │
│ │ JENAZAH                                                 │
│ │ PREGIO     Rp 3,120  16%   16%    25%   25%  10%  [Detail] │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ 📐 Formula Perhitungan                                      │
│ 1. Jarak PP = Jarak Satu Arah × 2                          │
│ 2. BBA (Bahan Bakar) = Jarak PP × Tarif/km                 │
│ 3. Biaya Pengemudi = BBA × Pengemudi %                      │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Detail Modal

When clicking "Lihat Detail" button:

```
┌─────────────────────────────────────────────────────────────┐
│ Detail Konfigurasi: GRANDMAX                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ⚠️ Mode Read-Only                                           │
│ Konfigurasi ini tersimpan di kode aplikasi.                │
│                                                             │
│ ┌────────────────────┬────────────────────┐                 │
│ │ Tarif per Kilometer │ PPN (Tax)         │                 │
│ │ Rp 3,120           │ 10%               │                 │
│ └────────────────────┴────────────────────┘                 │
│                                                             │
│ Persentase Komponen Biaya (% dari BBA):                    │
│ ┌──────────┬──────────┐                                     │
│ │ Pengemudi│ Admin    │                                     │
│ │ 16%      │ 16%      │                                     │
│ ├──────────┼──────────┤                                     │
│ │ Pemeliharaan│ Jasa RS   │                                │
│ │ 25%      │ 25%      │                                     │
│ └──────────┴──────────┘                                     │
│                                                             │
│ 📐 Contoh Perhitungan (5 km satu arah)                      │
│ • Jarak PP: 5 km × 2 = 10 km                                │
│ • BBA: 10 km × Rp 3,120 = Rp 31,200                        │
│ • Pengemudi: Rp 31,200 × 16% = Rp 4,992                    │
│ • Admin: Rp 31,200 × 16% = Rp 4,992                        │
│ • Pemeliharaan: Rp 31,200 × 25% = Rp 7,800                 │
│ • Jasa RS: Rp 31,200 × 25% = Rp 7,800                      │
│ • Subtotal: Rp 56,784                                       │
│ • PPN (10%): Rp 5,678                                       │
│ • TOTAL: Rp 62,462                                          │
│                                                             │
│ 📝 Cara Mengubah Konfigurasi                                │
│ 1. Buka file lib/ambulancePricing.ts                        │
│ 2. Cari objek AMBULANCE_CONFIG                              │
│ 3. Edit nilai untuk GRANDMAX                                │
│ 4. Simpan file dan restart development server               │
│ 5. Refresh halaman ini untuk melihat perubahan              │
│                                                             │
│ [Tutup]                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Configuration Table

**Displays:**
- Vehicle type name (formatted)
- Cost per kilometer (Rp)
- Driver percentage (%)
- Admin percentage (%)
- Maintenance percentage (%)
- Hospital service percentage (%)
- Tax/PPN percentage (%)
- "Lihat Detail" button

**Data Source:**
- Fetched from `AMBULANCE_CONFIG` in `lib/ambulancePricing.ts`
- Real-time reflection of code configuration

### 2. Formula Display

Shows the step-by-step calculation formula:
1. Round trip distance calculation
2. BBA (fuel cost) calculation
3. Component cost calculations
4. Subtotal calculation
5. Tax calculation
6. Final total

**Purpose:**
- Educational for users
- Transparency in pricing
- Easy to understand

### 3. Detail Modal

**Features:**
- Read-only view of configuration
- Large, easy-to-read numbers
- Color-coded information boxes
- Live calculation example (5 km)
- Instructions for updating values

**Example Calculation:**
- Uses actual configuration values
- Shows every step of calculation
- Formatted currency display
- Easy to verify

### 4. Instructions

Clear step-by-step guide on how to modify configuration:
1. Where to find the file
2. What to look for
3. How to make changes
4. How to apply changes
5. How to verify changes

---

## Technical Implementation

### File Modified

**`app/prices/page.tsx`**

### Imports Added

```typescript
import { 
  AMBULANCE_CONFIG, 
  AmbulanceVehicleType,
  AmbulanceTariffConfig,
  getVehicleTypes 
} from '@/lib/ambulancePricing';
```

### State Added

```typescript
// Ambulance-specific state
const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
const [editingVehicleType, setEditingVehicleType] = useState<AmbulanceVehicleType | null>(null);
const [ambulanceFormData, setAmbulanceFormData] = useState<AmbulanceTariffConfig>({
  costPerKm: 0,
  driverPct: 0,
  adminPct: 0,
  maintenancePct: 0,
  hospitalPct: 0,
  taxPct: 0,
});
```

### Conditional Rendering

```typescript
{selectedCategory === 'AMBULANCE' ? (
  // Ambulance Configuration View
  <Card>...</Card>
) : (
  // Regular Prices Table
  <Card>...</Card>
)}
```

---

## User Workflow

### Viewing Configuration

1. **Navigate to** `/prices`
2. **Select category** "11. AMBULANCE" from dropdown
3. **See configuration table** with all vehicle types
4. **Review formula** at the bottom
5. **Click "Lihat Detail"** on any vehicle
6. **View detailed breakdown** in modal
7. **See example calculation** with actual values

### Understanding Pricing

Users can:
- ✅ See all vehicle configurations at a glance
- ✅ Compare percentages across vehicles
- ✅ Understand the calculation formula
- ✅ See live examples with real numbers
- ✅ Know exactly how tariffs are calculated

### Modifying Configuration

Users are instructed to:
1. Open `lib/ambulancePricing.ts`
2. Locate `AMBULANCE_CONFIG`
3. Edit values for specific vehicle
4. Save and restart server
5. Refresh page to see changes

**Note:** This is intentionally read-only in the UI because:
- Configuration is code-based (deterministic)
- Version controlled (Git)
- Requires server restart
- Prevents accidental changes
- Maintains auditability

---

## Benefits

### For Users

✅ **Visual Understanding** - See all configurations clearly  
✅ **Transparency** - Know exactly how prices are calculated  
✅ **Education** - Learn the formula step-by-step  
✅ **Verification** - Check calculations manually  
✅ **Documentation** - Built-in instructions  

### For Admins

✅ **Easy Review** - Quickly check all vehicle configs  
✅ **Comparison** - Compare vehicles side-by-side  
✅ **Validation** - Test examples before deployment  
✅ **Training** - Teach staff about pricing  
✅ **Audit Trail** - Configuration visible to authorized users  

### For System

✅ **Read-Only** - Prevents accidental UI changes  
✅ **Code-Based** - Configuration in version control  
✅ **Deterministic** - Always uses code values  
✅ **No Database** - No Firestore dependency  
✅ **Fast** - Direct code access  

---

## Example Usage

### Scenario 1: Check Grandmax Configuration

1. Go to `/prices`
2. Select "11. AMBULANCE"
3. See GRANDMAX row: Rp 3,120/km, 16% driver, etc.
4. Click "Lihat Detail"
5. Review all percentages
6. See example: 5 km = Rp 62,462

### Scenario 2: Verify Calculation

Admin wants to verify a 10 km ambulance charge:

1. Open GRANDMAX detail
2. Look at example (5 km × 2 = 10 km)
3. See BBA: Rp 62,400
4. See total components
5. See final: Rp 124,924
6. Confirm invoice matches

### Scenario 3: Update Pregio Rates

Admin needs to update Pregio to Rp 3,500/km:

1. Check current config (Rp 3,120)
2. Follow instructions in modal
3. Edit `lib/ambulancePricing.ts`:
   ```typescript
   PREGIO: {
     costPerKm: 3500,  // Changed from 3120
     // ... rest stays same
   }
   ```
4. Restart server
5. Refresh page
6. Verify table shows Rp 3,500
7. Check detail modal shows new calculation

---

## Data Flow

```
Code (lib/ambulancePricing.ts)
    ↓
AMBULANCE_CONFIG object
    ↓
Imported to prices page
    ↓
getVehicleTypes() → List of vehicles
    ↓
Map each vehicle → Table row
    ↓
Click "Lihat Detail"
    ↓
AMBULANCE_CONFIG[vehicleType] → Modal data
    ↓
Display configuration + live example
```

---

## Future Enhancements

### Potential Improvements

1. **Editable UI** (with caution)
   - Store config in Firestore
   - Allow UI edits by admin
   - Maintain audit trail
   - Require confirmation

2. **Historical Tracking**
   - Log configuration changes
   - Show change history
   - Compare old vs new rates
   - Date-based pricing

3. **Calculator Tool**
   - Interactive calculator
   - Input custom distance
   - See breakdown instantly
   - Export quote

4. **Multi-Rate Support**
   - Different rates by region
   - Time-based pricing
   - Emergency surcharge
   - Discount rules

5. **Batch Updates**
   - Update multiple vehicles
   - Percentage adjustment (e.g., +10% all)
   - Effective date scheduling
   - Rollback capability

---

## Summary

### What Was Built

✅ **Configuration Viewer** - Visual display of all vehicle configs  
✅ **Detail Modal** - Deep dive into each vehicle  
✅ **Formula Display** - Educational pricing formula  
✅ **Live Examples** - Real calculations with actual data  
✅ **Update Instructions** - Clear guidance for changes  
✅ **Read-Only UI** - Safe viewing without accidental edits  

### Key Points

- **Access**: Admin and Farmasi only (same as other pricing)
- **Location**: `/prices` → Select "11. AMBULANCE"
- **Data Source**: `lib/ambulancePricing.ts` (code-based)
- **Updates**: Edit code → Restart server → Refresh page
- **Safety**: Read-only prevents UI accidents
- **Transparency**: Full visibility into pricing logic

### Status

**✅ COMPLETE AND READY TO USE**

Users can now:
- View ambulance configuration visually
- Understand pricing formula
- See live calculation examples
- Know how to update values
- Verify pricing for any distance

---

**The ambulance pricing system is now fully integrated into the Database Harga UI!** 🚀

