# Unified Pricing System - Complete Guide

## Overview

The new **Database Harga** (Price Database) provides a unified system to manage pricing for all 12 billing categories in one place. This replaces the need for separate pricing tables and provides a consistent interface for managing all service prices.

## What's New

### 1. Unified Data Model

**New `ServicePrice` Interface:**
```typescript
export interface ServicePrice {
  id: string;              // Firestore doc id
  category: BillingCategory; // Which category (1-12)
  serviceName: string;     // Name (e.g., "ICU", "Visite Dokter")
  price: number;           // Price
  unit: string;            // Unit (e.g., "Hari", "Kali", "Paket")
  isActive: boolean;       // Active/Inactive status
  description?: string;    // Optional description
  code?: string;           // Optional service code
  createdAt: string;
  updatedAt: string;
}
```

### 2. New Page: Database Harga

**Route:** `/prices`  
**Access:** Admin, Farmasi only

**Features:**
- ✅ Category selector dropdown at the top
- ✅ Switch between all 12 billing categories
- ✅ CRUD operations for each category
- ✅ Search within category
- ✅ Active/Inactive toggle
- ✅ Service codes (optional)

### 3. Updated Navigation

**Navbar now shows:**
- **Database Harga** - Unified pricing (NEW!)
- **Database Obat** - Drug inventory (existing)
- **Database Dokter** - Doctor database (existing)

## The 12 Billing Categories

| No | Category | Label | Example Services |
|----|----------|-------|------------------|
| 1  | PERAWATAN_KAMAR | PERAWATAN/KAMAR | ICU, KABER, VIP, KLAS 1-3 |
| 2  | ALAT_TINDAKAN_PARAMEDIS | ALAT & TINDAKAN PARAMEDIS | Infus, Kateter, Nebulizer |
| 3  | KAMAR_OPERASI | KAMAR OPERASI | Operasi Besar, Sedang, Kecil |
| 4  | PEMERIKSAAN_UGD | PEMERIKSAAN DI UGD | Konsultasi IGD, Pemeriksaan |
| 5  | VISITE_DOKTER | VISITE DOKTER | Visite Spesialis, Umum |
| 6  | KONSUL_DOKTER | KONSUL DOKTER | Konsultasi Spesialis |
| 7  | BHP_OBAT_ALKES | BHP (OBAT & ALKES) | Alat Kesehatan, Supplies |
| 8  | PENUNJANG | PENUNJANG | Lab, Rontgen, USG, ECG |
| 9  | RESUME_MEDIS | RESUME MEDIS | Resume Rawat Inap/Jalan |
| 10 | VISUM_MEDIS | VISUM MEDIS | Visum et Repertum |
| 11 | AMBULANCE | AMBULANCE | Ambulance services |
| 12 | ADMINISTRASI | ADMINISTRASI | Admin fees |

## How to Use

### Step 1: Access Database Harga

1. Login as Admin or Farmasi
2. Click **"Database Harga"** in the navigation bar
3. You'll see the pricing management page

### Step 2: Select Category

At the top of the page:
```
┌─────────────────────────────────────────────────┐
│ Pilih Kategori                                  │
│ [1. PERAWATAN/KAMAR ▼]                          │
│   1. PERAWATAN/KAMAR                            │
│   2. ALAT & TINDAKAN PARAMEDIS                  │
│   3. KAMAR OPERASI                              │
│   ... (all 12 categories)                       │
└─────────────────────────────────────────────────┘
```

### Step 3: Add Services

1. Click **"+ Tambah Layanan"** button
2. Fill in the form:
   - **Kode Layanan** (optional): e.g., "ICU-001"
   - **Nama Layanan** (required): e.g., "ICU"
   - **Satuan** (required): e.g., "Hari"
   - **Harga** (required): e.g., 600000
   - **Deskripsi** (optional): Additional info
   - **Aktif** checkbox: Show in dropdown
3. Click **"Tambah Layanan"**

### Step 4: Edit/Delete Services

- Click **"Edit"** to modify a service
- Click **"Hapus"** to delete a service
- Use search box to find specific services

## Example: Setting Up Room Prices

### Category: 1. PERAWATAN/KAMAR

| Kode | Nama Layanan | Satuan | Harga | Status |
|------|--------------|--------|-------|--------|
| - | ICU | Hari | 600,000 | Aktif |
| - | KABER | Hari | 200,000 | Aktif |
| - | VIP | Hari | 390,000 | Aktif |
| - | KLAS 1 | Hari | 340,000 | Aktif |
| - | KLAS 2 | Hari | 150,000 | Aktif |
| - | KLAS 3 | Hari | 100,000 | Aktif |

### Category: 5. VISITE DOKTER

| Kode | Nama Layanan | Satuan | Harga | Status |
|------|--------------|--------|-------|--------|
| VD-01 | Visite Dokter Umum | Kali | 50,000 | Aktif |
| VD-02 | Visite Dokter Spesialis | Kali | 100,000 | Aktif |
| VD-03 | Visite Dokter Konsultan | Kali | 150,000 | Aktif |

### Category: 8. PENUNJANG

| Kode | Nama Layanan | Satuan | Harga | Status |
|------|--------------|--------|-------|--------|
| LAB-01 | Darah Lengkap | Paket | 150,000 | Aktif |
| LAB-02 | Cholesterol Total | x | 50,000 | Aktif |
| RO-01 | Rontgen Thorax | x | 200,000 | Aktif |
| USG-01 | USG Abdomen | x | 250,000 | Aktif |

## Integration with Visit Billing

### How It Works

When creating a Rawat Inap visit:

1. **Select Category** (e.g., "1. PERAWATAN/KAMAR")
2. **Dropdown Appears** with services from Database Harga
3. **Select Service** (e.g., "ICU - Rp 600,000/Hari")
4. **Auto-fills:**
   - Nama: "ICU"
   - Tarif: 600000
   - Unit: "Hari"
5. **Enter Qty** (e.g., 3 days)
6. **Subtotal Calculates** (Rp 1,800,000)

### Dynamic Dropdown Behavior

```
If servicePrices.length > 0:
  Show dropdown with prices from Database Harga
Else:
  Show text input for manual entry
```

This means:
- ✅ If prices exist in database → Use dropdown
- ✅ If no prices yet → Allow manual entry
- ✅ Flexible and backward compatible

## Firestore Structure

### Collection: `servicePrices`

```
servicePrices/
├─ doc1: {
│   category: "PERAWATAN_KAMAR",
│   serviceName: "ICU",
│   price: 600000,
│   unit: "Hari",
│   code: "",
│   isActive: true,
│   description: "",
│   createdAt: "2025-11-27...",
│   updatedAt: "2025-11-27..."
│ }
├─ doc2: {
│   category: "VISITE_DOKTER",
│   serviceName: "Visite Dokter Spesialis",
│   price: 100000,
│   unit: "Kali",
│   code: "VD-02",
│   isActive: true,
│   ...
│ }
└─ ...
```

## API Functions

### Create
```typescript
await createServicePrice({
  category: 'PERAWATAN_KAMAR',
  serviceName: 'ICU',
  price: 600000,
  unit: 'Hari',
  isActive: true
});
```

### Read
```typescript
// Get all services in a category
const services = await getServicePricesByCategory('PERAWATAN_KAMAR');

// Get only active services
const activeServices = await getActiveServicePricesByCategory('VISITE_DOKTER');

// Search within category
const results = await searchServicePrices('ICU', 'PERAWATAN_KAMAR');
```

### Update
```typescript
await updateServicePrice(serviceId, {
  price: 650000,
  isActive: false
});
```

### Delete
```typescript
await deleteServicePrice(serviceId);
```

## Benefits

### 1. Centralized Management
✅ All pricing in one place  
✅ Easy to update across the system  
✅ Consistent pricing standards  

### 2. Reduced Errors
✅ No manual typing of prices  
✅ Select from standardized list  
✅ Automatic calculations  

### 3. Flexibility
✅ Works for all 12 categories  
✅ Optional service codes  
✅ Active/Inactive toggle  
✅ Searchable and filterable  

### 4. Scalability
✅ Easy to add new services  
✅ Easy to update prices  
✅ Historical tracking (createdAt/updatedAt)  

### 5. User-Friendly
✅ Category-based organization  
✅ Visual feedback (badges, colors)  
✅ Search functionality  
✅ Modal-based editing  

## Migration Path

### For Existing Data

If you have existing room prices in the old `roomPrices` collection:

1. **Keep it for now** - The system still supports it for backward compatibility
2. **Gradually migrate** - Add services to the new `servicePrices` collection
3. **Test both** - Ensure new system works before removing old data

### Migration Script (Future)

```typescript
// Migrate old room prices to new system
const oldRooms = await getAllRoomPrices();
for (const room of oldRooms) {
  await createServicePrice({
    category: 'PERAWATAN_KAMAR',
    serviceName: room.roomType,
    price: room.pricePerDay,
    unit: 'Hari',
    isActive: room.isActive,
    description: room.description
  });
}
```

## Testing Checklist

### Database Harga Page
- [ ] Access /prices page as Admin
- [ ] Access /prices page as Farmasi
- [ ] Verify access denied for IGD/Kasir
- [ ] Select different categories from dropdown
- [ ] Add a new service
- [ ] Edit an existing service
- [ ] Delete a service
- [ ] Search for services
- [ ] Toggle active/inactive status

### Visit Integration
- [ ] Create Rawat Inap visit
- [ ] Select category with prices in database
- [ ] Verify dropdown appears
- [ ] Select service from dropdown
- [ ] Verify auto-fill works (name, price, unit)
- [ ] Enter quantity
- [ ] Verify subtotal calculates
- [ ] Save service
- [ ] Verify it appears in table

### All Categories
- [ ] Add services to all 12 categories
- [ ] Test dropdown for each category
- [ ] Verify filtering works correctly

## Future Enhancements

### Phase 1: Bulk Import
- CSV import for bulk pricing updates
- Excel template download

### Phase 2: Price History
- Track price changes over time
- View historical pricing

### Phase 3: Price Rules
- Discount rules
- Package pricing
- Time-based pricing

### Phase 4: Analytics
- Most used services
- Revenue by category
- Price comparison reports

## Summary

The unified pricing system provides a comprehensive solution for managing all service pricing across the hospital's 12 billing categories. It's:

✅ **Centralized** - One place for all prices  
✅ **Organized** - Category-based structure  
✅ **Flexible** - Works for all service types  
✅ **User-friendly** - Easy CRUD interface  
✅ **Integrated** - Auto-populates in visit billing  
✅ **Scalable** - Easy to extend and maintain  

**Next Steps:**
1. Access /prices page
2. Select a category
3. Add your first services
4. Test the dropdown in visit billing

🎉 **The unified pricing system is ready to use!**

