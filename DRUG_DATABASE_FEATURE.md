# 💊 Database Obat (Drug Master & Inventory) - Complete Guide

## ✅ Feature Overview

A comprehensive Drug Database system that serves as both **Drug Master Data** and **Inventory Management** for RS UNIPDU Medika.

---

## 🎯 Key Features

### 1. **CRUD Operations**
- ✅ Create new drugs
- ✅ Read/View all drugs
- ✅ Update drug information
- ✅ Delete drugs
- ✅ Search drugs by name or ID

### 2. **Inventory Management**
- ✅ Track stock quantities
- ✅ Set minimum stock alerts
- ✅ Low stock warnings
- ✅ Stock update operations

### 3. **Drug Master Data**
- ✅ Drug ID management
- ✅ Pricing per unit
- ✅ Unit/measurement tracking
- ✅ Active/Inactive status
- ✅ Manufacturer information
- ✅ Drug descriptions

---

## 🔐 Access Control

**Who Can Access:**
- ✅ **Admin** - Full access (CRUD + all features)
- ✅ **Farmasi** - Full access (CRUD + all features)
- ❌ **IGD** - No access
- ❌ **Kasir** - No access

---

## 📊 Data Structure

### Drug Document Fields:

```typescript
interface Drug {
  id: string;              // Firestore auto-generated
  drugId: string;          // Custom ID (e.g., "DRG-001")
  drugName: string;        // Name (e.g., "Paracetamol 500mg")
  unit: DrugUnit;          // Unit (Tablet, Kapsul, etc.)
  pricePerUnit: number;    // Price per unit (Rp)
  stockQty: number;        // Current stock quantity
  minStockQty?: number;    // Minimum stock alert level
  isActive: boolean;       // Active/Inactive status
  description?: string;    // Drug description (optional)
  manufacturer?: string;   // Manufacturer name (optional)
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

### Supported Units (DrugUnit):

- Tablet
- Kapsul
- Kaplet
- Botol
- Ampul
- Vial
- Tube
- Strip
- Box
- Sachet
- ml
- mg
- Lainnya

---

## 🗂️ Files Created/Modified

### New Files:

1. **`app/drugs/page.tsx`** ✅
   - Main drug database page
   - CRUD interface
   - Search functionality
   - Modal for add/edit

### Modified Files:

1. **`types/models.ts`** ✅
   - Added `Drug` interface
   - Added `DrugUnit` type

2. **`lib/firestore.ts`** ✅
   - Added `createDrug()`
   - Added `getDrug()`
   - Added `getAllDrugs()`
   - Added `getActiveDrugs()`
   - Added `updateDrug()`
   - Added `deleteDrug()`
   - Added `searchDrugs()`
   - Added `updateDrugStock()`

3. **`components/Navbar.tsx`** ✅
   - Added "Database Obat" link for Admin & Farmasi

---

## 🎨 User Interface

### Main Page Layout:

```
┌─────────────────────────────────────────────────────┐
│  Database Obat                  [+ Tambah Obat Baru]│
│  Master Data & Inventory Management                 │
├─────────────────────────────────────────────────────┤
│  [Search Box]            [Cari]  [Reset]           │
├─────────────────────────────────────────────────────┤
│  ID    │ Nama Obat │ Satuan │ Harga │ Stok │ Status│
│  DRG001│ Paraceta..│ Tablet │ 5.000 │  50  │Aktif │
│  DRG002│ Amoxici.. │ Kapsul │15.000 │  10  │Aktif │
│                                    ↑ (Stok Rendah) │
└─────────────────────────────────────────────────────┘
```

### Table Columns:

1. **ID Obat** - Custom drug ID
2. **Nama Obat** - Drug name
3. **Satuan** - Unit (Tablet, Kapsul, etc.)
4. **Harga/Unit** - Price per unit (formatted currency)
5. **Stok** - Current stock (with low stock warning)
6. **Status** - Active/Inactive badge
7. **Aksi** - Edit & Delete buttons

---

## 🔄 CRUD Operations

### 1. Create Drug (Tambah Obat)

**Steps:**
1. Click **[+ Tambah Obat Baru]**
2. Modal opens with empty form
3. Fill in all required fields (*):
   - ID Obat *
   - Nama Obat *
   - Satuan *
   - Harga per Unit *
   - Jumlah Stok *
   - Minimum Stok (optional)
   - Pabrik/Manufacturer (optional)
   - Deskripsi (optional)
   - ☑️ Obat Aktif checkbox
4. Click **[Tambah Obat]**
5. Success → Modal closes, table refreshes

**Form Fields:**

```
┌────────────────────────────────────────────┐
│ ID Obat *:          [DRG-001            ] │
│ Nama Obat *:        [Paracetamol 500mg  ] │
│ Satuan *:           [Dropdown: Tablet   ] │
│ Harga per Unit *:   [5000               ] │
│ Jumlah Stok *:      [100                ] │
│ Minimum Stok:       [10                 ] │
│ Pabrik:             [PT. Pharma         ] │
│ Deskripsi:          [Obat pereda nyeri  ] │
│                                            │
│ ☑️ Obat Aktif (Tersedia untuk diresepkan)│
│                                            │
│ [Tambah Obat]  [Batal]                    │
└────────────────────────────────────────────┘
```

---

### 2. Read/View Drugs (Lihat)

**All Drugs:**
- Automatically loaded on page open
- Sorted alphabetically by drug name
- Shows all fields in table format

**Search:**
1. Enter search term in search box
2. Click **[Cari]** or press Enter
3. Results filtered by:
   - Drug name (case-insensitive)
   - Drug ID
4. Click **[Reset]** to show all drugs again

---

### 3. Update Drug (Edit)

**Steps:**
1. Click **[Edit]** button on any drug row
2. Modal opens with pre-filled form
3. Modify any fields
4. Click **[Simpan Perubahan]**
5. Success → Modal closes, table refreshes

**What You Can Edit:**
- ✅ All fields except Firestore ID
- ✅ Stock quantity
- ✅ Price
- ✅ Active/Inactive status
- ✅ Everything!

---

### 4. Delete Drug (Hapus)

**Steps:**
1. Click **[Hapus]** button on any drug row
2. Confirmation dialog appears:
   ```
   Hapus obat "Paracetamol 500mg"?
   [Cancel]  [OK]
   ```
3. Click **[OK]** to confirm
4. Drug deleted, table refreshes

**⚠️ Warning:**
- Deletion is permanent!
- Consider making drug "Inactive" instead of deleting
- Deleted drugs cannot be recovered

---

## 🔍 Search Functionality

### How It Works:

```typescript
// Search matches:
- Drug name (case-insensitive): "para" → matches "Paracetamol"
- Drug ID: "DRG-001" → matches exactly
```

### Examples:

| Search Term | Matches |
|-------------|---------|
| "para" | Paracetamol, Paracetamol Plus |
| "DRG-001" | Only drug with ID DRG-001 |
| "tablet" | All drugs with "Tablet" in name |
| "500" | Drugs with "500" in name |

---

## 📉 Low Stock Alerts

### How It Works:

```typescript
if (drug.stockQty <= drug.minStockQty) {
  // Show red text + "Stok Rendah" badge
}
```

### Visual Indicators:

**Normal Stock:**
```
Stok: 50    (black text)
```

**Low Stock:**
```
Stok: 10  [Stok Rendah]  (red text + red badge)
     ↑ Red alert
```

### Setting Alert Level:

When creating/editing drug, set **"Minimum Stok"** field:
- Default: 10 units
- Recommended: Set based on usage frequency
- Alert triggers when stock ≤ this number

---

## 💰 Integration with Patient Visits

### How Pricing Works:

**When prescribing drugs to a patient:**

1. IGD creates visit
2. Adds prescriptions with drug names and quantities
3. **Future Integration (Next Step):**
   - Link prescription to drug database
   - Auto-calculate: `quantity × pricePerUnit`
   - Total prescription cost added to nota

**Example:**
```javascript
Prescription:
- Paracetamol 500mg × 10 tablet
  
Drug Database:
- Paracetamol 500mg: Rp 5,000/tablet

Calculation:
10 × Rp 5,000 = Rp 50,000

Added to patient's bill automatically! ✅
```

---

## 🔧 Firestore Operations

### Collection Structure:

```
Firestore:
  └─ drugs/
      ├─ documentId1/
      │   ├─ drugId: "DRG-001"
      │   ├─ drugName: "Paracetamol 500mg"
      │   ├─ unit: "Tablet"
      │   ├─ pricePerUnit: 5000
      │   ├─ stockQty: 100
      │   ├─ minStockQty: 10
      │   ├─ isActive: true
      │   ├─ description: "..."
      │   ├─ manufacturer: "PT. Pharma"
      │   ├─ createdAt: "2025-11-26T..."
      │   └─ updatedAt: "2025-11-26T..."
      └─ documentId2/
          └─ ...
```

### Available Functions:

```typescript
// Create
await createDrug(drugData);

// Read
const drug = await getDrug(id);
const allDrugs = await getAllDrugs();
const activeDrugs = await getActiveDrugs();
const results = await searchDrugs("paracetamol");

// Update
await updateDrug(id, { stockQty: 50 });
await updateDrugStock(id, 10, 'add');      // Add 10 to stock
await updateDrugStock(id, 5, 'subtract');  // Subtract 5 from stock

// Delete
await deleteDrug(id);
```

---

## 🎯 Usage Scenarios

### Scenario 1: Adding New Drug

```
Admin/Farmasi receives new drug shipment
  ↓
Open Database Obat page
  ↓
Click [+ Tambah Obat Baru]
  ↓
Fill form:
  - Drug ID: DRG-099
  - Name: Amoxicillin 500mg
  - Unit: Kapsul
  - Price: Rp 15,000
  - Stock: 100
  ↓
Save → Drug added to database ✅
```

### Scenario 2: Stock Management

```
Pharmacy dispenses drugs to patients
  ↓
Check Database Obat for current stock
  ↓
After dispensing:
  - Click [Edit] on drug
  - Update stock quantity
  - Or use updateDrugStock() function
  ↓
If stock low → Red alert appears
  ↓
Order more drugs ✅
```

### Scenario 3: Price Update

```
Drug supplier changes prices
  ↓
Admin updates in Database Obat
  ↓
Click [Edit] on affected drugs
  ↓
Update "Harga per Unit"
  ↓
Save → New prices apply to future prescriptions ✅
```

### Scenario 4: Discontinue Drug

```
Drug no longer available
  ↓
Don't delete (keep records)
  ↓
Click [Edit]
  ↓
Uncheck "Obat Aktif"
  ↓
Save → Drug marked inactive
  ↓
Won't appear in prescription forms ✅
```

---

## 📱 Mobile Responsive

**The table has horizontal scrolling:**
- On mobile: Swipe left/right to see all columns
- All buttons accessible
- Modal adapts to screen size
- Touch-friendly interface

---

## 🔐 Security & Access

### Access Control Matrix:

| Action | Admin | Farmasi | IGD | Kasir |
|--------|-------|---------|-----|-------|
| View Drugs | ✅ | ✅ | ❌ | ❌ |
| Add Drug | ✅ | ✅ | ❌ | ❌ |
| Edit Drug | ✅ | ✅ | ❌ | ❌ |
| Delete Drug | ✅ | ✅ | ❌ | ❌ |
| Search Drugs | ✅ | ✅ | ❌ | ❌ |

### Route Protection:

```typescript
if (appUser.role !== 'admin' && appUser.role !== 'farmasi') {
  // Show: "Anda tidak memiliki akses ke halaman ini"
  return <AccessDenied />;
}
```

---

## 🚀 Next Steps (Future Enhancements)

### Phase 1: Integration with Prescriptions ✅ (Ready)

Link prescriptions to drug database for automatic pricing:

```typescript
// When creating prescription in visit:
const drug = await getDrug(drugId);
const prescriptionCost = quantity × drug.pricePerUnit;
visitTotal += prescriptionCost;
```

### Phase 2: Advanced Features (Optional):

- [ ] Batch stock updates
- [ ] Drug category/classification
- [ ] Expiry date tracking
- [ ] Supplier management
- [ ] Purchase order system
- [ ] Stock history/audit log
- [ ] Usage reports
- [ ] Export to Excel
- [ ] Barcode integration
- [ ] Reorder point automation

---

## 🧪 Testing Checklist

- [ ] Admin can access /drugs page
- [ ] Farmasi can access /drugs page
- [ ] IGD cannot access /drugs page
- [ ] Kasir cannot access /drugs page
- [ ] Can create new drug
- [ ] Can view all drugs
- [ ] Can search drugs by name
- [ ] Can search drugs by ID
- [ ] Can edit drug information
- [ ] Can delete drug
- [ ] Low stock alert appears correctly
- [ ] Active/Inactive status works
- [ ] Price displays in correct format
- [ ] Modal opens/closes correctly
- [ ] Form validation works
- [ ] Table scrolls horizontally on mobile

---

## 📝 Navigation

### In Navbar:

**Admin sees:**
```
[Pasien] [IGD] [Kasir] [Farmasi] [Database Obat] [Manajemen User]
                                      ↑ NEW!
```

**Farmasi sees:**
```
[Pasien] [Farmasi] [Database Obat]
                       ↑ NEW!
```

**IGD/Kasir sees:**
```
[Pasien] [IGD/Kasir]
(No Database Obat link - no access)
```

---

## ✅ Summary

**Route:** `/drugs`

**Access:** Admin, Farmasi only

**Features:**
- ✅ Full CRUD operations
- ✅ Search functionality
- ✅ Stock management
- ✅ Low stock alerts
- ✅ Active/Inactive status
- ✅ Price management
- ✅ Mobile responsive

**Integration:**
- ✅ Ready to integrate with prescription pricing
- ✅ Serves as single source of truth for drug data

**Status:** ✅ **COMPLETE AND READY TO USE**

---

**Last Updated:** November 26, 2025

**Made with ❤️ for RS UNIPDU Medika**

