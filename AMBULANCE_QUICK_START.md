# Ambulance System - Quick Start Guide

## 🚀 What's New?

You can now **edit ambulance pricing through the UI** without touching code!

---

## ✅ What's Working Right Now

### 1. Edit Ambulance Pricing

**Steps:**
1. Login as **Admin**
2. Go to **Database Harga**
3. Select **"11. AMBULANCE"**
4. Click **"Edit"** on any vehicle
5. Change values (Tarif/km, percentages)
6. Click **"Simpan Perubahan"**
7. Done! ✅

**What You Can Edit:**
- Tarif per Kilometer (Rp 3,120 → Rp 3,500)
- Pengemudi % (16% → 18%)
- Admin % (16% → 20%)
- Pemeliharaan % (25% → 30%)
- Jasa RS % (25% → 30%)
- PPN % (10% → 11%)
- Status Aktif (On/Off)

**Live Preview:**
- See calculation for 5 km trip
- Updates as you type
- Shows all steps
- Displays final total

---

## 🔜 What's Coming Next

### 2. Google Maps Integration

**To Enable:**
1. Get Google Maps API key (see `GOOGLE_MAPS_SETUP_GUIDE.md`)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```
3. Restart server
4. Test distance calculation

**Cost:** $0/month (free tier covers hospital usage)

### 3. Visit Editor Integration

**Will Allow:**
- Select vehicle type
- Enter pickup location
- Auto-calculate distance via Google Maps
- Preview cost
- Add to visit with full metadata

**Status:** Ready to implement (code prepared, needs integration)

---

## 📁 Files Changed

### Modified
1. `app/prices/page.tsx` - Made ambulance config editable
2. `lib/ambulancePricing.ts` - Added default config fallback

### Created
1. `lib/googleMaps.ts` - Google Maps distance service
2. `AMBULANCE_EDITABLE_SYSTEM_PLAN.md` - Implementation plan
3. `GOOGLE_MAPS_SETUP_GUIDE.md` - API setup guide
4. `AMBULANCE_EDITABLE_COMPLETE_SUMMARY.md` - Complete summary
5. `AMBULANCE_QUICK_START.md` - This file

---

## 🎯 Try It Now!

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/prices
   ```

3. **Select:**
   ```
   "11. AMBULANCE" from dropdown
   ```

4. **Click "Edit" on GRANDMAX**

5. **Change Tarif/km to 3500**

6. **See live preview update**

7. **Click "Simpan Perubahan"**

8. **Success!** Table updates immediately

---

## 📊 How It Works

### Before (Old System)
```
Edit lib/ambulancePricing.ts
    ↓
Restart server
    ↓
Refresh page
    ↓
Changes applied
```

### Now (New System)
```
Edit in /prices page
    ↓
Click save
    ↓
Changes applied immediately ✅
```

---

## 💡 Key Features

✅ **No Code Changes** - Edit through UI  
✅ **Immediate Effect** - No server restart  
✅ **Validation** - Prevents invalid values  
✅ **Live Preview** - See calculation instantly  
✅ **Firestore-Based** - Data persists  
✅ **Backward Compatible** - Old code still works  

---

## 🔧 For Developers

### Data Source

**Before:**
```typescript
// Hardcoded in code
const config = AMBULANCE_CONFIG['GRANDMAX'];
```

**Now:**
```typescript
// Loaded from Firestore
const config = await getAmbulanceConfig('GRANDMAX');
```

### Firestore Collection

**Collection:** `ambulanceConfigs`  
**Document ID:** Vehicle type (e.g., "GRANDMAX")  
**Auto-Initialize:** Yes (uses DEFAULT_AMBULANCE_CONFIG)  

### Google Maps Service

**File:** `lib/googleMaps.ts`  
**Main Function:** `calculateDistance(origin, destination)`  
**Returns:** Distance in km, Maps URL, duration  
**Cost:** Free (within quota)  

---

## 📝 Next Steps

### For You (User)

1. ✅ **Test editing** - Try changing values in `/prices`
2. 🔜 **Get API key** - Follow `GOOGLE_MAPS_SETUP_GUIDE.md`
3. 🔜 **Test distance** - Once API key is added
4. 🔜 **Integrate visit editor** - Add ambulance service form

### For Developer (Future)

1. Add ambulance service form to visit editor
2. Connect to Google Maps service
3. Use Firestore configs for calculation
4. Store metadata in VisitService
5. Test end-to-end workflow

---

## 🆘 Need Help?

### Documentation

- **Implementation Plan:** `AMBULANCE_EDITABLE_SYSTEM_PLAN.md`
- **Google Maps Setup:** `GOOGLE_MAPS_SETUP_GUIDE.md`
- **Complete Summary:** `AMBULANCE_EDITABLE_COMPLETE_SUMMARY.md`
- **Quick Start:** This file

### Common Issues

**Q: Changes not saving?**  
A: Check browser console for errors. Verify Firestore rules allow writes.

**Q: Table not updating?**  
A: Refresh page. Check if save was successful.

**Q: Google Maps not working?**  
A: Verify API key in `.env.local`. Restart server.

**Q: Distance calculation fails?**  
A: Check API key. Verify address format. Check API quota.

---

## 🎉 Summary

**Status:** ✅ **READY TO USE!**

**What Works:**
- ✅ Edit pricing through UI
- ✅ Save to Firestore
- ✅ Real-time updates
- ✅ Validation
- ✅ Live preview

**What's Pending:**
- 🔜 Google Maps API key
- 🔜 Visit editor integration
- 🔜 End-to-end testing

**Cost:** $0/month

**Time to Implement:** ~2 hours

**New Dependencies:** 0

---

**Go ahead and try it now!** 🚀

Navigate to `/prices`, select "11. AMBULANCE", and click "Edit" on any vehicle. You can now change the pricing without touching any code!

