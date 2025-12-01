# Ambulance Editable System - Implementation Plan

## Overview

This document outlines the implementation of a fully editable ambulance pricing system with Google Maps integration for distance calculation.

## Requirements

### 1. Editable Pricing Configuration
- ✅ Users can edit Tarif/km and all percentages through UI
- ✅ No developer access needed for price updates
- ✅ Changes saved to Firestore (not code)
- ✅ Immediate effect after saving

### 2. Ambulance Service Selection in Visit Editor
- ✅ User selects vehicle type (GRANDMAX, AMBULANS_JENAZAH, PREGIO)
- ✅ User inputs pickup location (address or coordinates)
- ✅ Google Maps API calculates distance automatically
- ✅ System calculates total cost using Firestore configuration
- ✅ Service added to visit with full metadata

## Implementation Steps

### Phase 1: Firestore-Based Configuration (COMPLETE ✓)

**Files:**
- ✅ `types/models.ts` - AmbulanceConfig interface exists
- ✅ `lib/firestore.ts` - CRUD functions exist:
  - `createAmbulanceConfig()`
  - `getAmbulanceConfig()`
  - `getAllAmbulanceConfigs()`
  - `updateAmbulanceConfig()`
  - `deleteAmbulanceConfig()`

### Phase 2: Update Prices Page for Editing

**File: `app/prices/page.tsx`**

**Changes Needed:**
1. Load configs from Firestore instead of hardcoded values
2. Make modal editable (add input fields)
3. Add save functionality
4. Add "Edit" button instead of "Lihat Detail"
5. Remove read-only warning
6. Add success/error messages

**New Functions:**
```typescript
// Load ambulance configs from Firestore
const loadAmbulanceConfigs = async () => {
  const configs = await getAllAmbulanceConfigs();
  setAmbulanceConfigs(configs);
};

// Save ambulance config
const handleSaveAmbulanceConfig = async () => {
  await updateAmbulanceConfig(editingVehicleType, ambulanceFormData);
  alert('Konfigurasi berhasil diperbarui!');
  loadAmbulanceConfigs();
};
```

**UI Changes:**
- Input fields for all values (costPerKm, percentages)
- "Simpan" button
- Validation for percentage values (0-100%)
- Real-time calculation preview

### Phase 3: Google Maps Distance API Integration

**New File: `lib/googleMaps.ts`**

```typescript
export interface DistanceResult {
  distanceKm: number;
  distanceText: string;
  durationText: string;
  mapsUrl: string;
}

export async function calculateDistance(
  origin: string,
  destination: string
): Promise<DistanceResult> {
  // Use Google Maps Distance Matrix API
  // Return distance in km and Google Maps URL
}
```

**Environment Variables:**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Phase 4: Ambulance Service Form in Visit Editor

**File: `app/igd/visit/[visitId]/page.tsx`**

**New State:**
```typescript
const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
const [ambulanceForm, setAmbulanceForm] = useState({
  vehicleType: 'GRANDMAX',
  serviceType: 'PASIEN',
  pickupLocation: '',
  destination: 'RS UNIPDU Medika, Ponorogo',
  oneWayKm: 0,
  googleMapsUrl: '',
});
```

**New Component:**
```tsx
{/* Ambulance Service Modal */}
<Modal show={showAmbulanceModal}>
  <Select label="Jenis Kendaraan" options={vehicleTypes} />
  <Select label="Jenis Layanan" options={serviceTypes} />
  <Input label="Lokasi Penjemputan" />
  <Button onClick={calculateDistanceFromMaps}>
    📍 Hitung Jarak via Google Maps
  </Button>
  <Input label="Jarak (km)" value={ambulanceForm.oneWayKm} />
  <div>Estimasi Biaya: {formatCurrency(estimatedCost)}</div>
  <Button onClick={addAmbulanceService}>Tambah ke Tagihan</Button>
</Modal>
```

**Flow:**
1. User clicks "Tambah Layanan Ambulans" button
2. Modal opens with form
3. User selects vehicle type and service type
4. User enters pickup location
5. User clicks "Hitung Jarak via Google Maps"
6. System calls Google Maps API
7. Distance displayed, cost calculated
8. User confirms and adds to visit

### Phase 5: Integration

**Visit Editor Changes:**
- Add "Tambah Layanan Ambulans" button when category is AMBULANCE
- Or add as separate button outside category selection
- Calculate using Firestore config + Google Maps distance
- Store full metadata in VisitService.ambulanceMeta

## API Keys Required

### Google Maps Distance Matrix API

**Setup:**
1. Go to Google Cloud Console
2. Enable Distance Matrix API
3. Create API key
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
   ```

**Pricing:**
- $5 per 1000 requests
- First $200/month free credit
- Typical hospital usage: <100 requests/month = FREE

## Database Structure

### Firestore Collection: `ambulanceConfigs`

**Document ID:** Vehicle type (e.g., "GRANDMAX")

**Document Structure:**
```json
{
  "id": "GRANDMAX",
  "vehicleType": "GRANDMAX",
  "costPerKm": 3120,
  "driverPct": 0.16,
  "adminPct": 0.16,
  "maintenancePct": 0.25,
  "hospitalPct": 0.25,
  "taxPct": 0.10,
  "isActive": true,
  "createdAt": "2025-11-28T...",
  "updatedAt": "2025-11-28T..."
}
```

### Visit Service with Ambulance

```json
{
  "id": "service123",
  "category": "AMBULANCE",
  "nama": "Ambulance GRANDMAX - PASIEN (5.3 km satu arah)",
  "harga": 62462,
  "quantity": 1,
  "total": 62462,
  "ambulanceMeta": {
    "vehicleType": "GRANDMAX",
    "serviceType": "PASIEN",
    "oneWayKm": 5.3,
    "roundTripKm": 10.6,
    "costPerKm": 3120,
    "bba": 33072,
    "driverPct": 0.16,
    "driverCost": 5292,
    "adminPct": 0.16,
    "adminCost": 5292,
    "maintenancePct": 0.25,
    "maintenanceCost": 8268,
    "hospitalPct": 0.25,
    "hospitalCost": 8268,
    "subtotal": 60192,
    "taxPct": 0.10,
    "taxAmount": 6019,
    "googleMapsUrl": "https://www.google.com/maps/dir/..."
  }
}
```

## User Workflows

### Workflow 1: Update Ambulance Pricing

```
Admin → /prices
  ↓
Select "11. AMBULANCE"
  ↓
Click "Edit" on GRANDMAX
  ↓
Modal opens with editable fields
  ↓
Change Tarif/km from 3120 to 3500
  ↓
Change Driver % from 16% to 18%
  ↓
Click "Simpan"
  ↓
Success message
  ↓
Table updates immediately
  ↓
New pricing effective for all future ambulance services
```

### Workflow 2: Add Ambulance Service to Visit

```
IGD Staff → Visit Editor
  ↓
Click "Tambah Layanan Ambulans"
  ↓
Modal opens
  ↓
Select: GRANDMAX
  ↓
Select: PASIEN
  ↓
Enter: "Jl. Sudirman No. 45, Ponorogo"
  ↓
Click "📍 Hitung Jarak via Google Maps"
  ↓
System calls Google Maps API
  ↓
Distance: 5.3 km
  ↓
System fetches GRANDMAX config from Firestore
  ↓
System calculates: Rp 62,462
  ↓
Preview shows breakdown
  ↓
Click "Tambah ke Tagihan"
  ↓
Service added to visit with full metadata
  ↓
Total biaya updated
```

## Benefits

### For Users
✅ **No Developer Needed** - Update prices through UI  
✅ **Immediate Effect** - Changes apply instantly  
✅ **Accurate Distance** - Google Maps integration  
✅ **Transparent** - See calculation breakdown  
✅ **Audit Trail** - Full metadata stored  

### For Hospital
✅ **Flexible Pricing** - Easy to adjust rates  
✅ **Fair Charges** - Based on actual distance  
✅ **Professional** - Google Maps validation  
✅ **Documented** - Every calculation recorded  
✅ **Scalable** - Easy to add new vehicles  

### For System
✅ **Firestore-Based** - No code changes needed  
✅ **API Integration** - Google Maps for accuracy  
✅ **Deterministic** - Same inputs → same outputs  
✅ **Auditable** - Complete calculation history  
✅ **Maintainable** - Clean separation of concerns  

## Testing Checklist

### Configuration Editing
- [ ] Load configs from Firestore
- [ ] Edit GRANDMAX tarif/km
- [ ] Edit percentage values
- [ ] Save changes
- [ ] Verify table updates
- [ ] Verify calculation uses new values

### Google Maps Integration
- [ ] Enter pickup location
- [ ] Calculate distance
- [ ] Verify distance accuracy
- [ ] Check Google Maps URL
- [ ] Handle API errors gracefully

### Service Addition
- [ ] Select vehicle type
- [ ] Select service type
- [ ] Calculate distance
- [ ] Preview cost
- [ ] Add to visit
- [ ] Verify metadata stored
- [ ] Check invoice display

### Edge Cases
- [ ] Invalid address
- [ ] API key missing
- [ ] API quota exceeded
- [ ] Network error
- [ ] Invalid percentage (>100%)
- [ ] Zero distance
- [ ] Very long distance (>100km)

## Migration from Code-Based Config

### Step 1: Initialize Firestore

Run once to populate Firestore with default values:

```typescript
// Migration script
import { createAmbulanceConfig } from '@/lib/firestore';
import { DEFAULT_AMBULANCE_CONFIG } from '@/lib/ambulancePricing';

async function migrateAmbulanceConfig() {
  for (const [vehicleType, config] of Object.entries(DEFAULT_AMBULANCE_CONFIG)) {
    await createAmbulanceConfig({
      vehicleType,
      ...config,
      isActive: true,
    });
  }
}
```

### Step 2: Update UI

- Prices page loads from Firestore
- Visit editor uses Firestore config for calculations
- Code-based config becomes fallback only

### Step 3: Verify

- Check all vehicles have Firestore documents
- Test editing through UI
- Test ambulance service addition
- Verify calculations match

## Security Considerations

### API Key Protection
- Use environment variables
- Restrict API key to specific domains
- Enable billing alerts
- Monitor usage

### Firestore Rules
```javascript
match /ambulanceConfigs/{vehicleType} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Validation
- Validate percentage values (0-1)
- Validate costPerKm > 0
- Sanitize address input
- Rate limit API calls

## Cost Estimation

### Google Maps API
- Distance Matrix API: $5/1000 requests
- Typical usage: 50-100 requests/month
- Monthly cost: ~$0.25-$0.50 (within free tier)

### Firestore
- Reads: ~100/month (negligible cost)
- Writes: ~10/month (negligible cost)
- Storage: <1KB (free)

**Total Monthly Cost: $0 (within free tiers)**

## Future Enhancements

1. **Route Optimization** - Multiple stops
2. **Traffic Consideration** - Time-based pricing
3. **Historical Data** - Track common routes
4. **Bulk Updates** - Update all vehicles at once
5. **Scheduled Pricing** - Different rates by time/day
6. **Discount Rules** - Special rates for certain cases
7. **Approval Workflow** - Require approval for price changes
8. **Change History** - Log all configuration changes

## Status

### Current Implementation
- ✅ Data model (AmbulanceConfig)
- ✅ Firestore CRUD functions
- ✅ Calculation engine
- ✅ Read-only UI in prices page

### Next Steps
1. ⏳ Make prices page editable
2. ⏳ Add Google Maps integration
3. ⏳ Add ambulance form to visit editor
4. ⏳ Initialize Firestore with default configs
5. ⏳ Test end-to-end workflow

---

**Ready to implement!** 🚀

This plan provides a complete roadmap for making the ambulance pricing system fully editable through the UI with Google Maps integration for accurate distance-based pricing.

