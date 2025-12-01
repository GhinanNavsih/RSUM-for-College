# 🔍 Drug Dropdown Troubleshooting Guide

## Issue: Dropdown shows no drugs

The dropdown shows "-- Pilih Obat dari Database --" but no drugs appear when clicked, even though drugs exist in the database.

---

## ✅ Quick Fix Steps

### Step 1: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**Why:** Code changes might not have hot-reloaded properly.

---

### Step 2: Check Browser Console

1. Open the IGD visit page
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Look for these messages:

**Expected (Good):**
```
Loading active drugs...
Active drugs loaded: 2 [{...}, {...}]
```

**If you see errors:**
```
FirebaseError: The query requires an index
```
→ **Solution:** See "Fix Firestore Index Error" below

```
Error loading drugs: [error message]
```
→ **Solution:** See error-specific fix below

---

### Step 3: Check Drug Count Display

On the IGD visit page, under "Tambah Resep" heading, you should see:

**Good:**
```
Tambah Resep (2 obat tersedia)
```

**Bad:**
```
Tambah Resep (Tidak ada obat di database)
```

If you see "Tidak ada obat di database", drugs are not loading.

---

## 🔧 Detailed Troubleshooting

### Verify Drugs Exist in Firebase

1. **Check Firebase Console:**
   ```
   Go to: Firebase Console → Firestore Database
   Collection: drugs
   
   Verify:
   ✅ Documents exist (OB0001, OB0002)
   ✅ Each has: drugName, unit, pricePerUnit, stockQty
   ✅ isActive: true
   ```

2. **Check Database Obat Page:**
   ```
   Go to: http://localhost:3000/drugs
   
   Should show:
   ✅ 2 drugs in table
   ✅ Both marked "Aktif"
   ✅ Prices and stock visible
   ```

If drugs show on `/drugs` page but NOT in dropdown, continue below.

---

### Fix Firestore Index Error

**Symptom:** Console shows:
```
FirebaseError: The query requires an index
```

**Cause:** Firestore needs a compound index for `isActive + drugName` query.

**Solution Option 1: Click the Index Link**

1. Look for error message with link like:
   ```
   https://console.firebase.google.com/v1/r/project/rsum-xxxxx/firestore/indexes?create_composite=...
   ```

2. **Click the link** → Firebase opens

3. Click **Create Index**

4. Wait 1-2 minutes for index to build

5. Refresh your app page

6. ✅ Should work now!

**Solution Option 2: Wait for Fallback**

The code now has a fallback that loads all drugs and filters client-side. This should work automatically.

If fallback is working, you'll see in console:
```
Firestore index not found for active drugs, using client-side filtering
```

---

### Check Drug Data Structure

**Verify each drug document has ALL required fields:**

```javascript
// Example: OB0001 document in Firestore
{
  drugId: "OB0001",
  drugName: "Paracetamol 500mg tablet",
  unit: "Tablet",
  pricePerUnit: 750,
  stockQty: 112,
  isActive: true,          // ← MUST be true
  createdAt: "2025-11-26...",
  updatedAt: "2025-11-26..."
}
```

**Common Issues:**

❌ `isActive: false` → Drug won't show (intentional)
❌ `isActive` field missing → Drug won't show
❌ `drugName` missing → Error
❌ `pricePerUnit` missing → Will show but price won't work

**Fix:** Edit drug in Database Obat page, ensure all fields filled.

---

### Verify Import Statements

Check if `app/igd/visit/[visitId]/page.tsx` has correct imports:

```typescript
import { getVisit, getPatient, updateVisit, getActiveDrugs } from '@/lib/firestore';
//                                               ↑ This must be present
```

If missing, the function can't load drugs.

---

### Check Network Tab

1. Open Developer Tools → **Network** tab
2. Reload page
3. Look for Firestore requests
4. Check if any failed (red color)

**If requests are failing:**
- Check Firebase authentication
- Verify Firestore rules allow read access
- Check internet connection

---

## 🧪 Manual Test

Run this test to verify drugs load:

```typescript
// Paste in Browser Console:

// Test 1: Check if drugs state has data
console.log('Current drugs:', drugs);
// Should show array with 2+ items

// Test 2: Manually call loadDrugs (if exposed)
// This depends on your setup

// Test 3: Check drug options
console.log('Drug options:', [
  { value: '', label: '-- Pilih Obat dari Database --' },
  ...drugs.map(drug => ({
    value: drug.id,
    label: `${drug.drugName} (${drug.unit}) - Rp ${drug.pricePerUnit}`
  }))
]);
// Should show array with 3+ items (1 placeholder + 2 drugs)
```

---

## 🎯 Expected Behavior

### When Working Correctly:

**1. Page Load:**
```
Console:
→ Loading active drugs...
→ Active drugs loaded: 2 [...]
```

**2. UI Display:**
```
Tambah Resep (2 obat tersedia)
```

**3. Dropdown Click:**
```
-- Pilih Obat dari Database --
Paracetamol 500mg tablet (Tablet) - Rp 750
Ibuprofen 200mg tablet (Tablet) - Rp 800
```

**4. After Selection:**
```
Qty: [input]
Total: Rp 7,500 (if qty = 10)
```

---

## 🔍 Debug Checklist

Run through this checklist:

- [ ] Restarted dev server
- [ ] Hard refreshed browser (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Checked browser console for errors
- [ ] Verified drugs exist in Firebase Console
- [ ] Verified drugs show on `/drugs` page
- [ ] Verified drugs have `isActive: true`
- [ ] Checked drug count display shows number > 0
- [ ] Checked Network tab for failed requests
- [ ] Created Firestore index if needed
- [ ] Waited 2 minutes after creating index
- [ ] Cleared browser cache

---

## 🚨 Common Issues & Solutions

### Issue 1: "Tidak ada obat di database"

**Cause:** `getActiveDrugs()` returning empty array

**Solutions:**
1. Check Firestore index (see above)
2. Verify `isActive: true` on drugs
3. Check console for errors
4. Verify Firebase connection

### Issue 2: Dropdown shows "--" but nothing below

**Cause:** Same as Issue 1 - drugs array is empty

**Solution:** Same as Issue 1

### Issue 3: Console shows "Loading active drugs..." but no "Active drugs loaded"

**Cause:** Function is hanging or erroring

**Solutions:**
1. Check for JavaScript errors in console
2. Verify Firebase initialization
3. Check Firestore security rules:
   ```
   match /drugs/{drugId} {
     allow read: if request.auth != null;
   }
   ```

### Issue 4: Drugs load on page refresh but not on first load

**Cause:** `useEffect` timing issue or race condition

**Solution:** 
1. Check if `loadDrugs()` is being called in useEffect
2. Verify useEffect dependencies
3. Hard refresh browser

---

## 📝 Temporary Workaround

If drugs still won't load, you can temporarily add a manual drug entry option:

1. User can type drug name manually
2. Enter price manually
3. This won't link to database (no stock tracking)
4. Fix the dropdown issue later

**Not recommended long-term** - lose automatic stock tracking!

---

## 🔧 Code Verification

Verify this code is present in `app/igd/visit/[visitId]/page.tsx`:

```typescript
// 1. State for drugs
const [drugs, setDrugs] = useState<Drug[]>([]);

// 2. Load function
const loadDrugs = async () => {
  try {
    console.log('Loading active drugs...');
    const activeDrugs = await getActiveDrugs();
    console.log('Active drugs loaded:', activeDrugs.length, activeDrugs);
    setDrugs(activeDrugs);
  } catch (error) {
    console.error('Error loading drugs:', error);
    alert('Gagal memuat database obat. Silakan refresh halaman.');
  }
};

// 3. Call in useEffect
useEffect(() => {
  loadVisitData();
  loadDrugs();  // ← This must be here
}, [visitId]);

// 4. Dropdown with drugs
<Select
  options={[
    { value: '', label: '-- Pilih Obat dari Database --' },
    ...drugs.map(drug => ({  // ← Using drugs state
      value: drug.id,
      label: `${drug.drugName} (${drug.unit}) - ${formatCurrency(drug.pricePerUnit)}`
    }))
  ]}
/>
```

If any part is missing, that's the problem!

---

## 🎯 Next Steps

**1. Open browser console RIGHT NOW**
   - Go to IGD visit page
   - Press F12
   - Look at Console tab
   - **Tell me what you see!**

**2. Check the drug count display**
   - Does it say "(2 obat tersedia)" or "(Tidak ada obat di database)"?
   - **Tell me what it shows!**

**3. Look for errors**
   - Any red error messages in console?
   - Copy and paste them here

**4. Check Network tab**
   - Any failed Firestore requests?
   - What's the status code?

**With this information, I can pinpoint the exact issue!**

---

## 📊 Test Results Template

Copy this and fill in what you see:

```
=== DRUG DROPDOWN DEBUG REPORT ===

1. Browser Console Messages:
   [Paste console output here]

2. Drug Count Display:
   Shows: [e.g., "2 obat tersedia" or "Tidak ada obat"]

3. Console Errors:
   [Paste any red errors here, or write "No errors"]

4. Drugs on /drugs page:
   [ ] Yes, I can see 2 drugs
   [ ] No drugs showing

5. Network Tab:
   [ ] All requests successful (green)
   [ ] Some requests failed (red) - Details: [paste here]

6. Firebase Console:
   [ ] Yes, I can see documents in 'drugs' collection
   [ ] No documents

7. After hard refresh (Ctrl+Shift+R):
   [ ] Still no drugs in dropdown
   [ ] Now working!

===============================
```

**Fill this out and send it to me for precise debugging!** 🔍

---

**Last Updated:** November 26, 2025

**Status:** 🔍 Debugging in progress...

