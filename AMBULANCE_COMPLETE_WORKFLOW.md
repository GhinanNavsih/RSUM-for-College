# Ambulance Service - Complete Workflow Guide

## 🎯 Complete End-to-End Workflow

This document shows the **complete ambulance service workflow** from start to finish, including the new Google Maps picker feature.

---

## 📋 Complete Workflow

### Step 1: Open Visit Editor

```
IGD Dashboard
    ↓
Click on Visit
    ↓
Scroll to "Tindakan & Biaya" section
```

### Step 2: Select Ambulance Category

```
Category Dropdown
    ↓
Select "11. AMBULANCE"
    ↓
Button appears: "🚑 Tambah Layanan Ambulans"
```

### Step 3: Open Ambulance Form

```
Click "🚑 Tambah Layanan Ambulans"
    ↓
Modal opens with form
```

### Step 4: Fill Vehicle & Service Details

```
Select "Jenis Kendaraan"
    └─ GRANDMAX / AMBULANS_JENAZAH / PREGIO
    
Select "Jenis Layanan"
    └─ PASIEN / JENAZAH / NON_MEDIS
```

### Step 5: Select Pickup Location

**You Now Have TWO Options:**

#### Option A: Type Address (Quick)

```
Type in input box:
"Jl. Sudirman No. 45, Ponorogo"
    ↓
Address entered
```

#### Option B: Pick from Map (Visual) ⭐ NEW!

```
Click "🗺️ Pilih di Peta" button
    ↓
Google Maps modal opens
    ↓
[Choose one of three methods:]
    
Method 1: Search
    Type: "Jl. Sudirman"
    Select from dropdown
    Marker placed automatically
    
Method 2: Click on Map
    Navigate to area
    Click exact location
    Marker placed
    
Method 3: Drag Marker
    Marker already on map
    Drag to fine-tune
    Address updates
    ↓
Review selected address
    ↓
Click "✓ Gunakan Lokasi Ini"
    ↓
Modal closes
    ↓
Address filled in form
```

### Step 6: Calculate Distance

```
Click "📍 Hitung Jarak via Google Maps"
    ↓
System calls Distance Matrix API
    ↓
Distance displayed:
    - One-way: 5.3 km
    - Round-trip: 10.6 km
    - Google Maps link
    ↓
Cost calculated automatically
```

### Step 7: Review & Add

```
Review information:
    Vehicle: GRANDMAX
    Service: PASIEN
    Location: Jl. Sudirman No. 45, Ponorogo
    Distance: 5.3 km
    Cost: Rp 62,462
    ↓
Click "✓ Tambah ke Tagihan"
    ↓
Service added to visit
    ↓
Total biaya updated
    ↓
Success message
```

---

## 🎨 Visual Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    VISIT EDITOR                         │
│                                                         │
│  Category: [11. AMBULANCE        ▼]                    │
│                                                         │
│  [🚑 Tambah Layanan Ambulans]  ← Click this            │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│           🚑 AMBULANCE SERVICE MODAL                    │
│                                                         │
│  Jenis Kendaraan:  [GRANDMAX        ▼]                │
│  Jenis Layanan:    [PASIEN          ▼]                │
│                                                         │
│  Lokasi Penjemputan:                                    │
│  ┌────────────────────────┬──────────────────┐         │
│  │ (address input)        │ 🗺️ Pilih di Peta │ ← NEW! │
│  └────────────────────────┴──────────────────┘         │
│                                                         │
│  [📍 Hitung Jarak via Google Maps]                     │
└─────────────────────────────────────────────────────────┘
                    ↓ (if clicked)
┌─────────────────────────────────────────────────────────┐
│        🗺️ GOOGLE MAPS PICKER MODAL                     │
│                                                         │
│  Search: [Jl. Sudirman, Ponorogo          ]            │
│  💡 Ketik alamat atau klik di peta                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │              🗺️ Interactive Map                   │ │
│  │                                                   │ │
│  │     (Click to place pin, drag to adjust)         │ │
│  │                                                   │ │
│  │                    📍                              │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  📍 Lokasi Dipilih:                                     │
│  Jl. Sudirman No. 45, Ponorogo, Jawa Timur             │
│  Koordinat: -7.865300, 111.461900                      │
│                                                         │
│  [✓ Gunakan Lokasi Ini]  [Batal]                       │
└─────────────────────────────────────────────────────────┘
                    ↓ (on confirm)
┌─────────────────────────────────────────────────────────┐
│           🚑 AMBULANCE SERVICE MODAL                    │
│                                                         │
│  Lokasi Penjemputan:                                    │
│  Jl. Sudirman No. 45, Ponorogo ✓ ← Auto-filled!       │
│                                                         │
│  [📍 Hitung Jarak via Google Maps] ← Click this        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│           DISTANCE CALCULATED                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Jarak Satu Arah:        5.3 km                  │   │
│  │ Jarak Pulang-Pergi:     10.6 km                 │   │
│  │ 🗺️ Lihat di Google Maps →                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Estimasi Biaya                                  │   │
│  │ Rp 62,462                                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [✓ Tambah ke Tagihan]  [Batal]                        │
└─────────────────────────────────────────────────────────┘
                    ↓ (on confirm)
┌─────────────────────────────────────────────────────────┐
│              SERVICE ADDED TO VISIT                     │
│                                                         │
│  11. AMBULANCE                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Ambulance GRANDMAX - PASIEN (5.3 km)             │ │
│  │ Tarif: Rp 62,462    Qty: 1    Total: Rp 62,462  │ │
│  │ [Edit] [Hapus]                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Total Biaya: Rp 62,462 (updated)                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Journey

### Journey 1: Using Map Picker (Recommended)

```
Time: ~1 minute

1. Click ambulance button (2 sec)
2. Select vehicle + service (5 sec)
3. Click "🗺️ Pilih di Peta" (1 sec)
4. Search "Jl. Sudirman" (3 sec)
5. Select from dropdown (1 sec)
6. Verify location visually (5 sec)
7. Click "✓ Gunakan Lokasi Ini" (1 sec)
8. Click "📍 Hitung Jarak" (1 sec)
9. Wait for calculation (3 sec)
10. Review cost (5 sec)
11. Click "✓ Tambah ke Tagihan" (1 sec)

Result: Service added with accurate location ✅
```

### Journey 2: Using Text Input (Quick)

```
Time: ~30 seconds

1. Click ambulance button (2 sec)
2. Select vehicle + service (5 sec)
3. Type address (8 sec)
4. Click "📍 Hitung Jarak" (1 sec)
5. Wait for calculation (3 sec)
6. Review cost (5 sec)
7. Click "✓ Tambah ke Tagihan" (1 sec)

Result: Service added ✅
```

### Journey 3: Manual Distance (Fallback)

```
Time: ~20 seconds

1. Click ambulance button (2 sec)
2. Select vehicle + service (5 sec)
3. Type address (8 sec)
4. Enter distance manually (3 sec)
5. Review auto-calculated cost (2 sec)
6. Click "✓ Tambah ke Tagihan" (1 sec)

Result: Service added ✅
(Use when Google Maps API unavailable)
```

---

## 📱 Quick Reference Card

```
┌─────────────────────────────────────────────┐
│ AMBULANCE SERVICE - COMPLETE GUIDE          │
├─────────────────────────────────────────────┤
│                                             │
│ 📍 LOCATION SELECTION (Pick One):          │
│                                             │
│ Method 1: Type Address                      │
│ └─ Quick if you know exact address         │
│                                             │
│ Method 2: Pick from Map ⭐ NEW!             │
│ ├─ Search by name                           │
│ ├─ Click on map                             │
│ └─ Drag marker to adjust                    │
│                                             │
│ 📏 DISTANCE CALCULATION (Pick One):        │
│                                             │
│ Method 1: Automatic (Google Maps)           │
│ └─ Click "📍 Hitung Jarak via Google Maps" │
│                                             │
│ Method 2: Manual Entry                      │
│ └─ Enter km in "Jarak Manual" field        │
│                                             │
│ WORKFLOW:                                   │
│ 1. Select category "11. AMBULANCE"         │
│ 2. Click "🚑 Tambah Layanan Ambulans"      │
│ 3. Choose vehicle + service                 │
│ 4. Select location (type OR map)           │
│ 5. Calculate distance (auto OR manual)     │
│ 6. Review cost                              │
│ 7. Add to visit                             │
│                                             │
│ TIP: Use map picker for unfamiliar         │
│      locations or when you need visual      │
│      confirmation!                          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎉 Summary

**New Feature:** 🗺️ **Google Maps Location Picker**

**What It Does:**
- Opens interactive Google Maps
- Search with autocomplete
- Click to drop pin
- Drag to adjust
- Visual verification
- Auto-fill address

**Benefits:**
- ✅ More accurate
- ✅ Faster for unfamiliar locations
- ✅ Visual confirmation
- ✅ Professional interface
- ✅ Reduces errors

**How to Access:**
- Click "🗺️ Pilih di Peta" button in ambulance form

**Status:**
- ✅ **FULLY IMPLEMENTED AND READY TO USE!**

---

**The ambulance service is now complete with professional Google Maps integration for both distance calculation AND location picking!** 🚑🗺️✨

**Total Features:**
1. ✅ Editable pricing configuration
2. ✅ Multiple vehicle types
3. ✅ Multiple service types
4. ✅ Text-based address input
5. ✅ **Visual map-based location picker** ⭐ NEW!
6. ✅ Automatic distance calculation
7. ✅ Manual distance override
8. ✅ Real-time cost estimation
9. ✅ Full metadata storage
10. ✅ Complete audit trail

**Everything is working!** Just make sure your Firebase credentials are configured in `.env.local`, restart your server, and start using the feature! 🎊

