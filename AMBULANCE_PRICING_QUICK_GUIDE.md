# Ambulance Pricing - Quick Reference

## 🎯 Quick Start

### Import and Calculate

```typescript
import { calculateAmbulanceTariff, formatAmbulanceDescription } from '@/lib/ambulancePricing';

const result = calculateAmbulanceTariff({
  vehicleType: 'GRANDMAX',
  serviceType: 'PASIEN',
  oneWayKm: 1.9,
});

console.log(result.total); // 23736
```

---

## 📊 Formula

```
1. Round Trip = One-Way × 2
2. BBA = Round Trip × Cost/km
3. Components = BBA × Percentages
4. Subtotal = Sum of all
5. Tax = Subtotal × 10%
6. TOTAL = Subtotal + Tax
```

---

## 🚗 Vehicle Types

| Vehicle | Code | Cost/km |
|---------|------|---------|
| Grandmax | `GRANDMAX` | Rp 3,120 |
| Ambulans Jenazah | `AMBULANS_JENAZAH` | Rp 3,120 |
| Pregio | `PREGIO` | Rp 3,120 |

---

## 🏥 Service Types

| Service | Code |
|---------|------|
| Pasien | `PASIEN` |
| Jenazah | `JENAZAH` |
| Non-Medis | `NON_MEDIS` |

---

## 💰 Cost Components

| Component | % of BBA |
|-----------|----------|
| BBA (Fuel) | Base |
| Driver | 16% |
| Admin | 16% |
| Maintenance | 25% |
| Hospital | 25% |
| **Subtotal** | **182%** |
| Tax (PPN) | 10% of subtotal |

---

## 📝 Example

**Input:**
- Vehicle: GRANDMAX
- Service: PASIEN  
- Distance: 1.9 km

**Output:**
```
Round Trip: 3.8 km
BBA: Rp 11,856
Driver: Rp 1,897
Admin: Rp 1,897
Maintenance: Rp 2,964
Hospital: Rp 2,964
Subtotal: Rp 21,578
Tax: Rp 2,158
TOTAL: Rp 23,736
```

---

## 🔧 Usage in Code

### Create VisitService

```typescript
import { v4 as uuidv4 } from 'uuid';

const result = calculateAmbulanceTariff({
  vehicleType: 'GRANDMAX',
  serviceType: 'PASIEN',
  oneWayKm: 5.3,
  googleMapsUrl: 'https://maps.google.com/...',
});

const ambulanceService: VisitService = {
  id: uuidv4(),
  category: 'AMBULANCE',
  nama: formatAmbulanceDescription(result.meta),
  harga: result.total,
  quantity: 1,
  total: result.total,
  ambulanceMeta: result.meta,
};
```

---

## 🎨 Helper Functions

```typescript
// Format description
formatAmbulanceDescription(meta)
// → "Ambulance GRANDMAX - PASIEN (1.9 km satu arah)"

// Get detailed breakdown
getAmbulanceBreakdown(meta)
// → Multi-line breakdown text

// Validate input
validateCalculationInput(input)
// → Throws error if invalid

// Get available types
getVehicleTypes()  // → ['GRANDMAX', ...]
getServiceTypes()  // → ['PASIEN', ...]
```

---

## ⚙️ Configuration

Edit `lib/ambulancePricing.ts`:

```typescript
export const AMBULANCE_CONFIG = {
  GRANDMAX: {
    costPerKm: 3120,      // ← Update here
    driverPct: 0.16,      // ← 16%
    adminPct: 0.16,
    maintenancePct: 0.25,
    hospitalPct: 0.25,
    taxPct: 0.10,
  },
};
```

---

## 🧪 Testing

```typescript
const result = calculateAmbulanceTariff({
  vehicleType: 'GRANDMAX',
  serviceType: 'PASIEN',
  oneWayKm: 1.9,
});

expect(result.total).toBe(23736);
expect(result.meta.bba).toBe(11856);
expect(result.meta.subtotal).toBe(21578);
```

---

## 📦 What Gets Stored

```json
{
  "ambulanceMeta": {
    "vehicleType": "GRANDMAX",
    "serviceType": "PASIEN",
    "oneWayKm": 1.9,
    "roundTripKm": 3.8,
    "costPerKm": 3120,
    "bba": 11856,
    "driverCost": 1897,
    "adminCost": 1897,
    "maintenanceCost": 2964,
    "hospitalCost": 2964,
    "subtotal": 21578,
    "taxAmount": 2158,
    "googleMapsUrl": "..."
  }
}
```

---

## ✅ Checklist

- [ ] Import calculation function
- [ ] Prepare input (vehicle, service, distance)
- [ ] Call `calculateAmbulanceTariff()`
- [ ] Get `result.total` for price
- [ ] Get `result.meta` for details
- [ ] Create VisitService with metadata
- [ ] Add to visit.services
- [ ] Save to Firestore

---

## 🚀 Quick Commands

```typescript
// Calculate
const result = calculateAmbulanceTariff({...});

// Get total
const total = result.total;

// Get breakdown
const breakdown = getAmbulanceBreakdown(result.meta);

// Format name
const name = formatAmbulanceDescription(result.meta);
```

---

**For full documentation, see:** `AMBULANCE_PRICING_SYSTEM.md`

