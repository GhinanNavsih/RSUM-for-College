# Google Maps Location Picker - User Guide

## 🎯 Overview

The ambulance service now includes an **interactive Google Maps interface** where users can visually select the pickup location by searching for an address or clicking directly on the map!

---

## ✨ Features

### 1. Visual Location Selection
- 📍 **Search by address** - Type and select from dropdown
- 🖱️ **Click on map** - Drop a pin anywhere
- 🎯 **Drag marker** - Fine-tune the exact location
- 🔍 **Auto-complete** - Get address suggestions as you type

### 2. Two Ways to Enter Location

**Option A: Type Address (Original)**
```
Enter: "Jl. Sudirman No. 45, Ponorogo"
↓
Click "📍 Hitung Jarak via Google Maps"
```

**Option B: Pick from Map (NEW!)**
```
Click "🗺️ Pilih di Peta" button
↓
Interactive map opens
↓
Search or click to select location
↓
Click "✓ Gunakan Lokasi Ini"
↓
Address automatically filled
```

---

## 🎮 How to Use

### Step-by-Step Guide

**1. Open Ambulance Service Modal**
- Select "11. AMBULANCE" category
- Click "🚑 Tambah Layanan Ambulans"

**2. Choose Vehicle & Service Type**
- Select vehicle (GRANDMAX, etc.)
- Select service type (PASIEN, etc.)

**3. Select Pickup Location - Two Options:**

#### Option A: Type Address Manually
```
Type in the input box:
"Jl. Sudirman No. 45, Ponorogo"
```

#### Option B: Use Google Maps Picker
```
Click "🗺️ Pilih di Peta" button
↓
Google Maps modal opens
```

**4. In the Maps Picker Modal:**

**Method 1: Search**
```
Type in search box:
"Jl. Sudirman, Ponorogo"
↓
Select from dropdown suggestions
↓
Map centers on location
↓
Marker appears
```

**Method 2: Click on Map**
```
Navigate the map (zoom, pan)
↓
Click anywhere to drop pin
↓
Marker appears at clicked location
```

**Method 3: Drag Marker**
```
Marker already on map
↓
Click and drag to adjust
↓
Address updates automatically
```

**5. Confirm Location**
```
Review selected address at bottom
↓
Click "✓ Gunakan Lokasi Ini"
↓
Modal closes
↓
Address filled in ambulance form
```

**6. Calculate Distance**
```
Click "📍 Hitung Jarak via Google Maps"
↓
Distance calculated automatically
↓
Cost displayed
```

**7. Add to Visit**
```
Review cost
↓
Click "✓ Tambah ke Tagihan"
```

---

## 🖼️ Visual Guide

### Maps Picker Modal Layout

```
┌───────────────────────────────────────────────────────────┐
│ 🗺️ Pilih Lokasi Penjemputan                              │
│ Cari alamat atau klik langsung di peta                   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│ [Cari lokasi (contoh: Jl. Sudirman, Ponorogo)       ]   │
│ 💡 Ketik alamat dan pilih dari dropdown, atau klik      │
│    langsung di peta                                      │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│                    🗺️ GOOGLE MAPS                        │
│                                                           │
│              [Interactive Map Here]                       │
│                                                           │
│                      📍 Marker                            │
│                                                           │
│              (Click anywhere to place)                    │
│              (Drag marker to adjust)                      │
│                                                           │
├───────────────────────────────────────────────────────────┤
│ 📍 Lokasi Dipilih:                                        │
│ Jl. Sudirman No. 45, Ponorogo, Jawa Timur               │
│ Koordinat: -7.865300, 111.461900                         │
├───────────────────────────────────────────────────────────┤
│ [✓ Gunakan Lokasi Ini]  [Batal]                          │
└───────────────────────────────────────────────────────────┘
```

### Main Ambulance Form (Updated)

```
┌───────────────────────────────────────────────────────────┐
│ Lokasi Penjemputan *                                      │
│ ┌────────────────────────────────┬───────────────────┐    │
│ │ Jl. Sudirman No. 45, Ponorogo  │ 🗺️ Pilih di Peta │    │
│ └────────────────────────────────┴───────────────────┘    │
│ Ketik alamat atau klik "🗺️ Pilih di Peta" untuk          │
│ memilih lokasi secara visual                              │
└───────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### Interactive Map

**What You Can Do:**
- ✅ **Zoom In/Out** - Mouse wheel or +/- buttons
- ✅ **Pan** - Click and drag to move around
- ✅ **Search** - Type address in search box
- ✅ **Click to Place** - Click anywhere to drop pin
- ✅ **Drag Marker** - Adjust exact position
- ✅ **Street View** - See the location (if available)
- ✅ **Map/Satellite Toggle** - Switch views

### Auto-Complete Search

**Features:**
- 🔍 Real-time suggestions as you type
- 🌍 Biased to current map viewport
- 🎯 Accurate address resolution
- 📍 Automatic marker placement

### Address Display

**Shows:**
- 📍 Full formatted address
- 🌐 GPS coordinates (latitude, longitude)
- 🔄 Updates in real-time as marker moves

---

## 💡 Tips & Best Practices

### For Accurate Location

✅ **DO:**
- Use the search box for known addresses
- Zoom in before clicking on map
- Drag marker for fine-tuning
- Verify the address before confirming
- Check the coordinates if needed

❌ **DON'T:**
- Click randomly without zooming
- Skip verifying the address
- Use vague search terms
- Forget to confirm selection

### For Efficiency

✅ **Quick Method:**
```
1. Type street name in search
2. Select from dropdown
3. Drag marker if needed
4. Confirm
```

✅ **Precise Method:**
```
1. Zoom into area
2. Click exact location
3. Verify address
4. Confirm
```

---

## 🔧 Technical Details

### What Happens Behind the Scenes

**When You Select a Location:**

1. **Search Entry:**
   ```
   User types: "Jl. Sudirman"
   ↓
   Google Places API returns suggestions
   ↓
   User selects one
   ↓
   Map centers + marker placed
   ↓
   Address + coordinates captured
   ```

2. **Map Click:**
   ```
   User clicks map
   ↓
   Coordinates captured
   ↓
   Reverse geocoding via Google API
   ↓
   Address resolved
   ↓
   Display to user
   ```

3. **Marker Drag:**
   ```
   User drags marker
   ↓
   New coordinates captured
   ↓
   Reverse geocoding
   ↓
   Address updated
   ```

### Data Stored

When you select a location, the system stores:
```javascript
{
  pickupLocation: "Jl. Sudirman No. 45, Ponorogo, Jawa Timur",
  // (latitude and longitude available but not currently stored)
}
```

**Note:** Currently only the formatted address is stored. Future versions may include GPS coordinates for additional features.

---

## 🆘 Troubleshooting

### Map Not Loading

**Possible Causes:**
- API key missing
- Network issue
- Script loading error

**Solutions:**
1. Check internet connection
2. Refresh page
3. Check console for errors
4. Contact IT if persistent

### Search Not Working

**Possible Causes:**
- Places API not enabled
- API quota exceeded
- Invalid search term

**Solutions:**
1. Try clicking on map instead
2. Use more specific address
3. Check API quota in Google Console
4. Contact administrator

### Can't Find Location

**Solutions:**
1. Try searching differently:
   - "Jl. Sudirman, Ponorogo" instead of just "Sudirman"
   - Use full address
   - Include village/district name

2. Use map navigation:
   - Zoom out to see area
   - Pan to approximate location
   - Zoom in and click

3. Manual fallback:
   - Close map picker
   - Type address manually
   - Use manual distance input

### Marker Won't Move

**Solutions:**
1. Ensure you're clicking and holding
2. Try placing new marker (click elsewhere)
3. Refresh and try again
4. Use manual address input

---

## 📊 Comparison

### Old Method vs New Method

| Feature | Type Address | Pick from Map |
|---------|-------------|---------------|
| **Speed** | Fast if known | Fast once found |
| **Accuracy** | Good | Excellent |
| **Ease** | Easy | Very easy |
| **Visual** | No | Yes |
| **Verification** | Manual | Visual |
| **Precision** | Address-level | GPS-level |

### When to Use Each

**Type Address:**
- ✅ You know the exact address
- ✅ Quick entry needed
- ✅ Familiar location
- ✅ Address is complete

**Pick from Map:**
- ✅ Don't know exact address
- ✅ Need visual confirmation
- ✅ Want to see the area
- ✅ Precise location needed
- ✅ First time to location

---

## 🎓 Example Scenarios

### Scenario 1: Well-Known Address

**Task:** Patient at "Jl. Sudirman No. 45"

**Best Method:** Type address
```
1. Type "Jl. Sudirman No. 45, Ponorogo"
2. Click "📍 Hitung Jarak"
3. Done!
```
**Time:** 10 seconds

### Scenario 2: Vague Description

**Task:** "Patient near the market"

**Best Method:** Pick from map
```
1. Click "🗺️ Pilih di Peta"
2. Search "Pasar Ponorogo"
3. Navigate to nearby street
4. Click on exact location
5. Confirm
6. Calculate distance
```
**Time:** 30 seconds

### Scenario 3: Rural Area

**Task:** "Patient in Desa Kauman"

**Best Method:** Pick from map
```
1. Click "🗺️ Pilih di Peta"
2. Search "Desa Kauman, Ponorogo"
3. Zoom in to see roads
4. Click on patient's location
5. Verify address shows village name
6. Confirm
```
**Time:** 45 seconds

### Scenario 4: Verify Unfamiliar Address

**Task:** "Jl. Melati No. 12" (never been there)

**Best Method:** Combine both
```
1. Type "Jl. Melati No. 12, Ponorogo"
2. Click "🗺️ Pilih di Peta" to verify
3. Check map shows correct area
4. Adjust marker if needed
5. Confirm
```
**Time:** 20 seconds

---

## ✅ Benefits

### For Users

✅ **Visual Confirmation** - See exactly where you're sending the ambulance  
✅ **No Address Errors** - Pick directly from map  
✅ **Faster Selection** - Click instead of typing  
✅ **Better Accuracy** - GPS-level precision  
✅ **Familiar Interface** - Everyone knows Google Maps  

### For Hospital

✅ **Fewer Mistakes** - Visual selection reduces errors  
✅ **Better Documentation** - Exact coordinates available  
✅ **Faster Dispatch** - Clear location for drivers  
✅ **Professional** - Modern, user-friendly interface  
✅ **Verification** - Staff can verify location visually  

### For Patients/Family

✅ **Clear Communication** - Visual confirmation of pickup point  
✅ **Accurate Service** - Ambulance goes to exact location  
✅ **No Confusion** - Map shows precise location  
✅ **Confidence** - See the location before confirming  

---

## 🚀 Status

**Implementation:** ✅ **COMPLETE**

**Features Working:**
- ✅ Interactive Google Maps
- ✅ Search box with autocomplete
- ✅ Click to place marker
- ✅ Drag marker to adjust
- ✅ Reverse geocoding
- ✅ Address display
- ✅ Coordinate display
- ✅ Confirmation button
- ✅ Integration with ambulance form

**To Use:**
1. Ensure Firebase credentials added (for authentication)
2. Google Maps API key already configured ✅
3. Restart server if needed
4. Navigate to visit → Ambulance service
5. Click "🗺️ Pilih di Peta"
6. Enjoy the interactive map! 🎉

---

**The ambulance service now has a professional, visual location picker powered by Google Maps!** 🗺️✨

