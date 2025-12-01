# Editable Ambulance Pricing System with Google Maps Integration

## Overview

This guide describes the implementation of a fully editable ambulance pricing system stored in Firestore with Google Maps distance API integration.

## Status: FOUNDATION IMPLEMENTED ✅

**Completed:**
- ✅ `AmbulanceConfig` interface in Firestore
- ✅ CRUD functions for ambulance configuration
- ✅ Updated `calculateAmbulanceTariff` to accept custom config

**Remaining Work:**
1. Google Maps API setup
2. Update `/prices` UI for editable ambulance config
3. Add ambulance service input in visit editor (`/igd/visit/[visitId]`)
4. Initialize default configurations in Firestore

---

## Architecture

### Data Storage

**Firestore Collection:** `ambulanceConfigs`

**Document Structure:**
```typescript
{
  id: "GRANDMAX",            // Document ID = vehicleType
  vehicleType: "GRANDMAX",
  costPerKm: 3120,
  driverPct: 0.16,
  adminPct: 0.16,
  maintenancePct: 0.25,
  hospitalPct: 0.25,
  taxPct: 0.10,
  isActive: true,
  createdAt: "2025-11-28T...",
  updatedAt: "2025-11-28T..."
}
```

### Calculation Flow

```
User Input (Visit Editor)
    ↓
Select Vehicle Type → Dropdown (GRANDMAX, AMBULANS_JENAZAH, PREGIO)
    ↓
Enter Destination → Google Maps Autocomplete
    ↓
Calculate Distance → Google Maps Distance Matrix API
    ↓
Fetch Config → getAmbulanceConfig(vehicleType) from Firestore
    ↓
Calculate Tariff → calculateAmbulanceTariff(input, config)
    ↓
Create VisitService → Add to visit.services with ambulanceMeta
    ↓
Save to Firestore → Complete transaction
```

---

## Implementation Steps

### Step 1: Initialize Default Configurations

Create a script to populate Firestore with default configurations:

**File:** `scripts/initAmbulanceConfig.ts` (create this)

```typescript
import { createAmbulanceConfig } from '@/lib/firestore';

async function initializeAmbulanceConfigs() {
  const configs = [
    {
      vehicleType: 'GRANDMAX',
      costPerKm: 3120,
      driverPct: 0.16,
      adminPct: 0.16,
      maintenancePct: 0.25,
      hospitalPct: 0.25,
      taxPct: 0.10,
      isActive: true,
    },
    {
      vehicleType: 'AMBULANS_JENAZAH',
      costPerKm: 3120,
      driverPct: 0.16,
      adminPct: 0.16,
      maintenancePct: 0.25,
      hospitalPct: 0.25,
      taxPct: 0.10,
      isActive: true,
    },
    {
      vehicleType: 'PREGIO',
      costPerKm: 3120,
      driverPct: 0.16,
      adminPct: 0.16,
      maintenancePct: 0.25,
      hospitalPct: 0.25,
      taxPct: 0.10,
      isActive: true,
    },
  ];

  for (const config of configs) {
    try {
      await createAmbulanceConfig(config);
      console.log(`✓ Created config for ${config.vehicleType}`);
    } catch (error) {
      console.error(`✗ Failed to create ${config.vehicleType}:`, error);
    }
  }
}

// Run: node scripts/initAmbulanceConfig.ts
initializeAmbulanceConfigs();
```

**Run once to populate Firestore:**
```bash
npx ts-node scripts/initAmbulanceConfig.ts
```

---

### Step 2: Google Maps API Setup

#### 2.1 Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Distance Matrix API**
   - **Geocoding API**
4. Create API Key
5. Restrict API key to your domain

#### 2.2 Add to Environment Variables

**File:** `.env.local`

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### 2.3 Install Google Maps Library

```bash
npm install @googlemaps/js-api-loader
```

---

### Step 3: Update `/prices` Page for Editable Configuration

**File:** `app/prices/page.tsx`

**Changes Needed:**

1. **Replace static config display with Firestore data:**

```typescript
// Current: Uses AMBULANCE_CONFIG from code
const [ambulanceConfigs, setAmbulanceConfigs] = useState<AmbulanceConfig[]>([]);

useEffect(() => {
  if (selectedCategory === 'AMBULANCE') {
    loadAmbulanceConfigs();
  }
}, [selectedCategory]);

const loadAmbulanceConfigs = async () => {
  try {
    const configs = await getAllAmbulanceConfigs();
    setAmbulanceConfigs(configs);
  } catch (error) {
    console.error('Error loading ambulance configs:', error);
  }
};
```

2. **Make modal editable:**

```typescript
const handleSubmitAmbulanceConfig = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);

  try {
    if (editingVehicleType) {
      // Update existing
      await updateAmbulanceConfig(editingVehicleType, ambulanceFormData);
      alert('Konfigurasi ambulans berhasil diperbarui!');
    } else {
      // Create new
      await createAmbulanceConfig({
        ...ambulanceFormData,
        vehicleType: newVehicleType, // from form
        isActive: true,
      });
      alert('Konfigurasi ambulans berhasil ditambahkan!');
    }
    handleCloseAmbulanceModal();
    loadAmbulanceConfigs();
  } catch (error) {
    console.error('Error saving ambulance config:', error);
    alert('Gagal menyimpan konfigurasi ambulans');
  } finally {
    setSaving(false);
  }
};
```

3. **Update modal UI to have editable inputs:**

```tsx
<Input
  label="Tarif per Kilometer *"
  type="number"
  value={ambulanceFormData.costPerKm}
  onChange={(e) =>
    setAmbulanceFormData({ ...ambulanceFormData, costPerKm: parseFloat(e.target.value) || 0 })
  }
  required
/>

<Input
  label="Pengemudi (%) *"
  type="number"
  step="0.01"
  value={ambulanceFormData.driverPct * 100}
  onChange={(e) =>
    setAmbulanceFormData({ ...ambulanceFormData, driverPct: parseFloat(e.target.value) / 100 || 0 })
  }
  required
/>

// Repeat for other percentages...
```

---

### Step 4: Create Google Maps Distance Helper

**File:** `lib/googleMaps.ts` (create this)

```typescript
import { Loader } from '@googlemaps/js-api-loader';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

let loader: Loader | null = null;

export function getGoogleMapsLoader() {
  if (!loader) {
    loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }
  return loader;
}

export interface DistanceResult {
  distanceKm: number;
  distanceText: string;
  durationText: string;
  origin: string;
  destination: string;
  googleMapsUrl: string;
}

/**
 * Calculate distance between two addresses using Google Maps Distance Matrix API
 */
export async function calculateDistance(
  origin: string,
  destination: string
): Promise<DistanceResult> {
  try {
    const loader = getGoogleMapsLoader();
    const google = await loader.load();

    return new Promise((resolve, reject) => {
      const service = new google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK' && response) {
            const element = response.rows[0].elements[0];
            
            if (element.status === 'OK') {
              const distanceKm = element.distance.value / 1000; // Convert meters to km
              
              // Generate Google Maps URL
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
              
              resolve({
                distanceKm,
                distanceText: element.distance.text,
                durationText: element.duration.text,
                origin: response.originAddresses[0],
                destination: response.destinationAddresses[0],
                googleMapsUrl: mapsUrl,
              });
            } else {
              reject(new Error(`Distance calculation failed: ${element.status}`));
            }
          } else {
            reject(new Error(`Google Maps API error: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw error;
  }
}

/**
 * Initialize Google Maps Autocomplete for an input element
 */
export async function initAutocomplete(
  inputElement: HTMLInputElement,
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
): Promise<google.maps.places.Autocomplete> {
  const loader = getGoogleMapsLoader();
  const google = await loader.load();

  const autocomplete = new google.maps.places.Autocomplete(inputElement, {
    componentRestrictions: { country: 'id' }, // Indonesia only
    fields: ['formatted_address', 'geometry', 'name'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    onPlaceSelected(place);
  });

  return autocomplete;
}
```

---

### Step 5: Add Ambulance Service Input in Visit Editor

**File:** `app/igd/visit/[visitId]/page.tsx`

**Add state for ambulance service:**

```typescript
const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
const [ambulanceForm, setAmbulanceForm] = useState({
  vehicleType: 'GRANDMAX',
  serviceType: 'PASIEN',
  origin: 'RS UNIPDU Medika, Ponorogo',
  destination: '',
  oneWayKm: 0,
  googleMapsUrl: '',
  calculating: false,
});
const [ambulanceConfigs, setAmbulanceConfigs] = useState<AmbulanceConfig[]>([]);
```

**Add button to open ambulance modal when category is AMBULANCE:**

```tsx
{currentSection?.key === 'AMBULANCE' && (
  <Button onClick={() => setShowAmbulanceModal(true)} className="mb-4">
    🚑 Hitung Tarif Ambulans
  </Button>
)}
```

**Create Ambulance Modal Component:**

```tsx
{showAmbulanceModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Hitung Tarif Ambulans</h2>

        <div className="space-y-4">
          <Select
            label="Jenis Kendaraan *"
            value={ambulanceForm.vehicleType}
            onChange={(e) => setAmbulanceForm({ ...ambulanceForm, vehicleType: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Kendaraan --' },
              ...ambulanceConfigs
                .filter(c => c.isActive)
                .map(c => ({
                  value: c.vehicleType,
                  label: c.vehicleType.replace(/_/g, ' '),
                })),
            ]}
            required
          />

          <Select
            label="Jenis Layanan *"
            value={ambulanceForm.serviceType}
            onChange={(e) => setAmbulanceForm({ ...ambulanceForm, serviceType: e.target.value })}
            options={[
              { value: 'PASIEN', label: 'Pasien' },
              { value: 'JENAZAH', label: 'Jenazah' },
              { value: 'NON_MEDIS', label: 'Non-Medis' },
            ]}
            required
          />

          <Input
            label="Lokasi Asal *"
            value={ambulanceForm.origin}
            onChange={(e) => setAmbulanceForm({ ...ambulanceForm, origin: e.target.value })}
            placeholder="RS UNIPDU Medika, Ponorogo"
            required
          />

          <div>
            <Input
              label="Lokasi Tujuan *"
              id="ambulance-destination"
              value={ambulanceForm.destination}
              onChange={(e) => setAmbulanceForm({ ...ambulanceForm, destination: e.target.value })}
              placeholder="Mulai ketik alamat..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan Google Maps autocomplete untuk hasil terbaik
            </p>
          </div>

          <Button
            onClick={handleCalculateDistance}
            disabled={ambulanceForm.calculating || !ambulanceForm.destination}
            className="w-full"
          >
            {ambulanceForm.calculating ? '⏳ Menghitung...' : '📍 Hitung Jarak'}
          </Button>

          {ambulanceForm.oneWayKm > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Hasil Perhitungan</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Jarak: {ambulanceForm.oneWayKm.toFixed(2)} km (satu arah)</p>
                <p>• Jarak PP: {(ambulanceForm.oneWayKm * 2).toFixed(2)} km</p>
                {ambulanceForm.googleMapsUrl && (
                  <p>
                    •{' '}
                    <a
                      href={ambulanceForm.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Lihat di Google Maps
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleAddAmbulanceService}
            disabled={!ambulanceForm.vehicleType || ambulanceForm.oneWayKm === 0}
          >
            ✓ Tambahkan ke Tagihan
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowAmbulanceModal(false)}
          >
            Batal
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
```

**Handler functions:**

```typescript
const handleCalculateDistance = async () => {
  setAmbulanceForm({ ...ambulanceForm, calculating: true });

  try {
    const result = await calculateDistance(
      ambulanceForm.origin,
      ambulanceForm.destination
    );

    setAmbulanceForm({
      ...ambulanceForm,
      oneWayKm: result.distanceKm,
      googleMapsUrl: result.googleMapsUrl,
      calculating: false,
    });

    alert(`Jarak berhasil dihitung: ${result.distanceText}`);
  } catch (error) {
    console.error('Error calculating distance:', error);
    alert('Gagal menghitung jarak. Pastikan alamat valid dan koneksi internet stabil.');
    setAmbulanceForm({ ...ambulanceForm, calculating: false });
  }
};

const handleAddAmbulanceService = async () => {
  if (!ambulanceForm.vehicleType || ambulanceForm.oneWayKm === 0) {
    alert('Mohon lengkapi semua data');
    return;
  }

  try {
    // Fetch config from Firestore
    const config = await getAmbulanceConfig(ambulanceForm.vehicleType);
    
    if (!config) {
      alert('Konfigurasi kendaraan tidak ditemukan');
      return;
    }

    // Calculate tariff
    const result = calculateAmbulanceTariff(
      {
        vehicleType: ambulanceForm.vehicleType as AmbulanceVehicleType,
        serviceType: ambulanceForm.serviceType,
        oneWayKm: ambulanceForm.oneWayKm,
        googleMapsUrl: ambulanceForm.googleMapsUrl,
      },
      {
        costPerKm: config.costPerKm,
        driverPct: config.driverPct,
        adminPct: config.adminPct,
        maintenancePct: config.maintenancePct,
        hospitalPct: config.hospitalPct,
        taxPct: config.taxPct,
      }
    );

    // Create VisitService
    const ambulanceService: VisitService = {
      id: uuidv4(),
      category: 'AMBULANCE',
      nama: formatAmbulanceDescription(result.meta),
      harga: result.total,
      quantity: 1,
      total: result.total,
      notes: getAmbulanceBreakdown(result.meta),
      ambulanceMeta: result.meta,
    };

    // Add to visit
    const updatedServices = [...visit.services, ambulanceService];
    const updatedVisit = {
      ...visit,
      services: updatedServices,
      totalBiaya: calculateTotal(updatedServices, visit.prescriptions),
    };

    setVisit(updatedVisit);
    setShowAmbulanceModal(false);
    alert('Layanan ambulans berhasil ditambahkan!');
  } catch (error) {
    console.error('Error adding ambulance service:', error);
    alert('Gagal menambahkan layanan ambulans');
  }
};
```

**Initialize Google Maps Autocomplete:**

```typescript
useEffect(() => {
  if (showAmbulanceModal) {
    // Load ambulance configs
    loadAmbulanceConfigs();

    // Initialize autocomplete after modal is rendered
    setTimeout(() => {
      const input = document.getElementById('ambulance-destination') as HTMLInputElement;
      if (input) {
        initAutocomplete(input, (place) => {
          if (place.formatted_address) {
            setAmbulanceForm({
              ...ambulanceForm,
              destination: place.formatted_address,
            });
          }
        });
      }
    }, 100);
  }
}, [showAmbulanceModal]);

const loadAmbulanceConfigs = async () => {
  try {
    const configs = await getActiveAmbulanceConfigs();
    setAmbulanceConfigs(configs);
  } catch (error) {
    console.error('Error loading ambulance configs:', error);
  }
};
```

---

## Testing Checklist

### Configuration Management

- [ ] Navigate to `/prices`
- [ ] Select "11. AMBULANCE"
- [ ] Click "Edit" on GRANDMAX
- [ ] Change "Tarif per Kilometer" to 3500
- [ ] Save
- [ ] Verify table shows updated value
- [ ] Verify Firestore document updated

### Distance Calculation

- [ ] Create/edit a visit
- [ ] Click "🚑 Hitung Tarif Ambulans"
- [ ] Select "GRANDMAX"
- [ ] Enter destination "Peterongan, Ponorogo"
- [ ] Click "📍 Hitung Jarak"
- [ ] Verify distance calculated (~1.9 km)
- [ ] Verify Google Maps link works

### Tariff Calculation

- [ ] After calculating distance
- [ ] Click "✓ Tambahkan ke Tagihan"
- [ ] Verify service added to table
- [ ] Verify price calculated correctly
- [ ] Verify all metadata stored
- [ ] Check Firestore has `ambulanceMeta`

### Invoice Display

- [ ] Go to Kasir for the visit
- [ ] Verify ambulance service shows
- [ ] Verify price correct
- [ ] Generate PDF
- [ ] Verify breakdown included

---

## Google Maps API Costs

**Free Tier:**
- $200 credit per month
- Distance Matrix: $0.005 per element
- Geocoding: $0.005 per request
- Autocomplete: $0.00283 per session

**Estimated Usage:**
- ~500 ambulance trips/month
- ~$3-5/month (well within free tier)

---

## Security Considerations

### API Key Restrictions

In Google Cloud Console:

1. **Application Restrictions:**
   - HTTP referrers
   - Add: `yourdomain.com/*`
   - Add: `localhost:3000/*` (for development)

2. **API Restrictions:**
   - Restrict to: Maps JavaScript API, Places API, Distance Matrix API, Geocoding API

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ambulanceConfigs/{vehicleType} {
      // Only admin can write
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Summary

### What's Implemented

✅ **Firestore Structure** - AmbulanceConfig interface  
✅ **CRUD Functions** - Complete Firestore operations  
✅ **Calculation Update** - Supports custom config  

### What's Needed

🔲 **Environment Setup** - Google Maps API key  
🔲 **Initialize Configs** - Run init script  
🔲 **Update /prices UI** - Editable inputs  
🔲 **Google Maps Helper** - Distance calculation  
🔲 **Visit Editor Integration** - Ambulance modal  

### Estimated Implementation Time

- Google Maps Setup: 30 minutes
- Initialize Configs: 5 minutes
- Update /prices UI: 2-3 hours
- Create Google Maps Helper: 1-2 hours
- Visit Editor Integration: 3-4 hours

**Total: 6-10 hours**

---

## Next Steps

1. **Get Google Maps API Key** (30 min)
2. **Add to .env.local** (1 min)
3. **Run init script** (5 min)
4. **Test basic config CRUD** (15 min)
5. **Implement remaining UI changes** (6-8 hours)

---

**Ready for implementation!** 🚀

All foundation code is in place. The remaining work is primarily UI integration and Google Maps API setup.

