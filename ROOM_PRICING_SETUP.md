# Room Pricing Setup Guide

## Overview

The room pricing system allows you to manage hospital room rates and automatically populate them when creating Rawat Inap billing.

## Data Model

```typescript
export interface RoomPrice {
  id: string;              // Firestore doc id
  roomType: string;        // e.g., "ICU", "KABER", "VIP", "KLAS 1", "KLAS 2", "KLAS 3"
  pricePerDay: number;     // Tarif per hari
  unit: string;            // Always "Hari" for rooms
  isActive: boolean;       // Status aktif/nonaktif
  description?: string;    // Optional description
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

## Initial Data (Based on Your Table)

| No | Room Type | Price Per Day |
|----|-----------|---------------|
| 1  | ICU       | 600,000       |
| 2  | KABER     | 200,000       |
| 3  | VIP       | 390,000       |
| 4  | KLAS 1    | 340,000       |
| 5  | KLAS 2    | 150,000       |
| 6  | KLAS 3    | 100,000       |

## How to Add Room Prices to Firebase

### Option 1: Using Firebase Console (Recommended for Initial Setup)

1. Go to Firebase Console → Firestore Database
2. Create a new collection called `roomPrices`
3. Add documents with the following structure:

**Document 1 - ICU:**
```json
{
  "roomType": "ICU",
  "pricePerDay": 600000,
  "unit": "Hari",
  "isActive": true,
  "createdAt": "2025-11-27T10:00:00.000Z",
  "updatedAt": "2025-11-27T10:00:00.000Z"
}
```

**Document 2 - KABER:**
```json
{
  "roomType": "KABER",
  "pricePerDay": 200000,
  "unit": "Hari",
  "isActive": true,
  "createdAt": "2025-11-27T10:00:00.000Z",
  "updatedAt": "2025-11-27T10:00:00.000Z"
}
```

**Document 3 - VIP:**
```json
{
  "roomType": "VIP",
  "pricePerDay": 390000,
  "unit": "Hari",
  "isActive": true,
  "createdAt": "2025-11-27T10:00:00.000Z",
  "updatedAt": "2025-11-27T10:00:00.000Z"
}
```

**Document 4 - KLAS 1:**
```json
{
  "roomType": "KLAS 1",
  "pricePerDay": 340000,
  "unit": "Hari",
  "isActive": true,
  "createdAt": "2025-11-27T10:00:00.000Z",
  "updatedAt": "2025-11-27T10:00:00.000Z"
}
```

**Document 5 - KLAS 2:**
```json
{
  "roomType": "KLAS 2",
  "pricePerDay": 150000,
  "unit": "Hari",
  "isActive": true,
  "createdAt": "2025-11-27T10:00:00.000Z",
  "updatedAt": "2025-11-27T10:00:00.000Z"
}
```

**Document 6 - KLAS 3:**
```json
{
  "roomType": "KLAS 3",
  "pricePerDay": 100000,
  "unit": "Hari",
  "isActive": true,
  "createdAt": "2025-11-27T10:00:00.000Z",
  "updatedAt": "2025-11-27T10:00:00.000Z"
}
```

### Option 2: Using Browser Console (Quick Method)

1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Paste and run this code:

```javascript
// Import Firebase functions
import { collection, addDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

const roomPrices = [
  { roomType: "ICU", pricePerDay: 600000, unit: "Hari", isActive: true },
  { roomType: "KABER", pricePerDay: 200000, unit: "Hari", isActive: true },
  { roomType: "VIP", pricePerDay: 390000, unit: "Hari", isActive: true },
  { roomType: "KLAS 1", pricePerDay: 340000, unit: "Hari", isActive: true },
  { roomType: "KLAS 2", pricePerDay: 150000, unit: "Hari", isActive: true },
  { roomType: "KLAS 3", pricePerDay: 100000, unit: "Hari", isActive: true },
];

const now = new Date().toISOString();

for (const room of roomPrices) {
  await addDoc(collection(db, 'roomPrices'), {
    ...room,
    createdAt: now,
    updatedAt: now,
  });
}

console.log('Room prices added successfully!');
```

## How It Works in the App

### 1. When Creating Rawat Inap Visit

When you select **"1. PERAWATAN/KAMAR"** as the category:
- The "Nama tindakan" input changes to a **dropdown**
- The dropdown shows all active room types with their prices
- Example: "ICU - Rp 600,000/Hari"

### 2. When Selecting a Room

When you select a room from the dropdown:
- **Nama tindakan** auto-fills with the room type (e.g., "ICU")
- **Tarif** auto-fills with the price per day (e.g., 600000)
- **Unit** auto-fills with "Hari"
- You just need to enter the **Qty** (number of days)

### 3. Example Workflow

```
1. Select Category: "1. PERAWATAN/KAMAR"
2. Dropdown appears: "-- Pilih Jenis Kamar --"
3. Select: "KLAS 1 - Rp 340,000/Hari"
4. Form auto-fills:
   - Nama: "KLAS 1"
   - Tarif: 340000
   - Unit: "Hari"
5. Enter Qty: 3 (for 3 days)
6. Subtotal shows: Rp 1,020,000
7. Click "Tambah Tindakan"
```

## UI Behavior

### Before Selecting Category
```
[Kategori ▼] [Nama tindakan / layanan]
```

### After Selecting "PERAWATAN/KAMAR"
```
[1. PERAWATAN/KAMAR ▼] [-- Pilih Jenis Kamar -- ▼]
                        ICU - Rp 600,000/Hari
                        KABER - Rp 200,000/Hari
                        VIP - Rp 390,000/Hari
                        KLAS 1 - Rp 340,000/Hari
                        KLAS 2 - Rp 150,000/Hari
                        KLAS 3 - Rp 100,000/Hari
```

### After Selecting Room
```
[1. PERAWATAN/KAMAR ▼] [KLAS 1 - Rp 340,000/Hari ▼]
[Dokter] [Hari] [3] [340000]
                 ↑    ↑
              User   Auto-filled
              input
```

## Functions Available

### Firestore Functions

```typescript
// Create new room price
await createRoomPrice({
  roomType: "KLAS 1",
  pricePerDay: 340000,
  unit: "Hari",
  isActive: true
});

// Get all room prices
const rooms = await getAllRoomPrices();

// Get only active room prices
const activeRooms = await getActiveRoomPrices();

// Update room price
await updateRoomPrice(roomId, {
  pricePerDay: 350000
});

// Delete room price
await deleteRoomPrice(roomId);
```

## Future Enhancements

### Phase 1: Room Price Management Page (Future)
Create an admin page similar to drugs/doctors management:
- CRUD interface for room prices
- Search and filter
- Active/inactive toggle

### Phase 2: Additional Pricing Tables
Apply the same pattern to other categories:
- **ALAT & TINDAKAN PARAMEDIS** - Medical procedures pricing
- **KAMAR OPERASI** - Operating room pricing
- **PEMERIKSAAN UGD** - Emergency examination pricing
- **VISITE DOKTER** - Doctor visit pricing
- **KONSUL DOKTER** - Doctor consultation pricing
- **PENUNJANG** - Lab/imaging pricing
- etc.

## Benefits

✅ **Standardized Pricing** - Consistent room rates across the system  
✅ **No Manual Entry** - Reduces typos and errors  
✅ **Fast Data Entry** - Select from dropdown instead of typing  
✅ **Auto-calculation** - Price and unit auto-fill  
✅ **Centralized Management** - Update prices in one place  
✅ **Audit Trail** - Track price changes over time  

## Testing Checklist

- [ ] Add room prices to Firebase
- [ ] Create a Rawat Inap visit
- [ ] Select "1. PERAWATAN/KAMAR" category
- [ ] Verify dropdown appears with room types
- [ ] Select a room type
- [ ] Verify name, price, and unit auto-fill
- [ ] Enter quantity (days)
- [ ] Verify subtotal calculates correctly
- [ ] Save the service
- [ ] Verify it appears in the table

## Summary

The room pricing system is now integrated into the Rawat Inap billing workflow. When users select the "PERAWATAN/KAMAR" category, they can choose from a dropdown of predefined room types with standardized pricing, eliminating manual entry errors and speeding up the billing process.

**Next:** Add room prices to Firebase and test the dropdown! 🚀

