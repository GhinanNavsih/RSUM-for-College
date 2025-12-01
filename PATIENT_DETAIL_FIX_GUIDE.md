# 🔧 Patient Detail "Pasien tidak ditemukan" - Debugging Guide

## 🐛 Problem Description

When clicking the **[Detail]** button on the patient list page, you get redirected to:
```
http://localhost:3000/patients/A2XuYi78k4phX6aBoFLe
```

But the page shows:
```
❌ Pasien tidak ditemukan.
```

---

## ✅ What I Fixed

### 1. **Added Better Error Logging**

**File**: `app/patients/[patientId]/page.tsx`

Added console.log statements to track what's happening:
- Logs when patient ID is received
- Logs when patient data is fetched
- Logs if patient doesn't exist
- Logs any errors that occur

### 2. **Improved Error Handling**

**File**: `lib/firestore.ts`

Enhanced the `getPatient()` function with:
- Try-catch error handling
- Console logging of fetch attempts
- Better error messages

### 3. **Better Error Display**

**File**: `app/patients/[patientId]/page.tsx`

The "not found" page now shows:
- Patient ID that was searched
- Possible reasons for the error
- "Back to Patient List" button

### 4. **Added Page Identification Comments**

Added clear header comments to all `page.tsx` files:
```typescript
/**
 * ═══════════════════════════════════════════════════════════
 * PATIENT DETAIL PAGE
 * ═══════════════════════════════════════════════════════════
 * Route: /patients/:id
 * Purpose: Display complete patient information
 * ...
 */
```

---

## 🔍 How to Debug This Issue

### Step 1: Open Browser Console

1. Open the patient list page: `http://localhost:3000/patients`
2. Right-click → "Inspect" → Go to "Console" tab
3. Click the **[Detail]** button for a patient
4. Watch the console for logs

### Step 2: Check Console Logs

You should see logs like:
```
Loading patient with ID: A2XuYi78k4phX6aBoFLe
Fetching patient with ID: A2XuYi78k4phX6aBoFLe
Patient document found: { ... }  ← OR
Patient document does not exist  ← OR
Error fetching patient: [error]
```

### Step 3: Diagnose Based on Logs

#### Scenario A: "Patient document does not exist"

**Problem**: The patient ID exists in the list but not in Firestore

**Possible Causes:**
1. The patient was deleted from Firestore but cache still shows it
2. The ID in the list is wrong
3. Database connection issue

**Solution:**
```bash
# Clear the browser cache and reload
# OR
# Check Firebase Console → Firestore → patients collection
# Verify the document ID exists
```

#### Scenario B: "Patient document found: {}"

**Problem**: Document exists but data is empty or malformed

**Possible Causes:**
1. Old patient data doesn't have new required fields
2. Data format mismatch

**Solution:**
Update the patient data in Firebase Console or create a new test patient.

#### Scenario C: "Error fetching patient: [error message]"

**Problem**: Firebase connection or permission issue

**Possible Causes:**
1. Firebase not initialized properly
2. Firestore rules blocking read
3. Network issue

**Solution:**
Check Firebase configuration and rules.

---

## 🧪 Test with a Fresh Patient

### Create a New Test Patient:

1. Go to `/patients/new`
2. Fill in all REQUIRED fields:
   - No. RM: `TEST-001`
   - Nama: `Test Patient`
   - NIK: `1234567890123456`
   - Tanggal Lahir: Pick any date
   - Jenis Kelamin: Select one
   - No. Telp: `08123456789`
   - Alamat: `Test Address`
   - Nama Penanggung Jawab: `Test Guardian`
   - Hubungan: Select one
   - Kontak PJ: `08198765432`
3. Click **[Simpan Pasien]**
4. You should be redirected to the detail page
5. If this works → Problem is with old patient data
6. If this fails → Problem is with code/Firebase setup

---

## 🔧 Common Fixes

### Fix 1: Update Old Patient Data

If you have old patients in Firestore that don't have the new required fields:

**Option A: Update via Firebase Console**

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open `patients` collection
4. For each patient document, add missing fields:
   - `nik`: "0000000000000000"
   - `jenisKelamin`: "Laki-laki" or "Perempuan"
   - `namaPenanggungJawab`: "Unknown"
   - `hubunganPenanggungJawab`: "Lainnya"
   - `kontakPenanggungJawab`: "0000000000"

**Option B: Create Migration Script** (Advanced)

Create a one-time script to update all patients:

```typescript
// scripts/migrate-patients.ts
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

async function migratePatients() {
  const patientsRef = collection(db, 'patients');
  const snapshot = await getDocs(patientsRef);
  
  for (const patientDoc of snapshot.docs) {
    const data = patientDoc.data();
    
    // Add missing fields with defaults
    const updates: any = {};
    
    if (!data.nik) updates.nik = '0000000000000000';
    if (!data.jenisKelamin) updates.jenisKelamin = 'Laki-laki';
    if (!data.namaPenanggungJawab) updates.namaPenanggungJawab = data.penanggungJawab || 'Unknown';
    if (!data.hubunganPenanggungJawab) updates.hubunganPenanggungJawab = 'Lainnya';
    if (!data.kontakPenanggungJawab) updates.kontakPenanggungJawab = data.noTelp || '0000000000';
    
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, 'patients', patientDoc.id), updates);
      console.log(`Updated patient: ${patientDoc.id}`);
    }
  }
  
  console.log('Migration complete!');
}

// Run this once
migratePatients();
```

### Fix 2: Check Firestore Rules

Make sure your Firestore rules allow reading patients:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read patients
    match /patients/{patientId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Fix 3: Check Firebase Initialization

**File**: `lib/firebase.ts`

Make sure Firebase is initialized correctly:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

## 📊 Expected Console Output (Success)

When everything works correctly, you should see:

```
Loading patient with ID: A2XuYi78k4phX6aBoFLe
Fetching patient with ID: A2XuYi78k4phX6aBoFLe
Patient document found: {
  nama: "Dick Nielson",
  noRM: "RM2024-00025",
  nik: "3517101309040001",
  jenisKelamin: "Perempuan",
  tanggalLahir: "2000-01-01",
  // ... more fields
}
Patient data received: { id: "A2XuYi78k4phX6aBoFLe", ... }
Visits data received: []
```

Then the page should display the patient information.

---

## 🎯 Quick Diagnostic Checklist

- [ ] Browser console shows patient ID being loaded
- [ ] Firebase Console shows patient document exists
- [ ] Patient document has all required fields
- [ ] Firestore rules allow authenticated reads
- [ ] User is logged in (authentication works)
- [ ] `.env.local` has correct Firebase credentials
- [ ] `npm run dev` shows no errors
- [ ] Network tab shows successful Firestore requests

---

## 🚨 Emergency Workaround

If you need the system working immediately:

1. Delete all old patients from Firestore
2. Create fresh patients using `/patients/new` form
3. All new patients will have correct data structure

**Note**: This is only if old data is not critical!

---

## 📞 Need More Help?

### Check These Files:

1. `lib/firestore.ts` - Database operations
2. `app/patients/[patientId]/page.tsx` - Detail page logic
3. `lib/firebase.ts` - Firebase initialization
4. `.env.local` - Environment variables

### Verify Firebase Setup:

1. Firebase Console → Project Settings
2. Check if Web App is registered
3. Verify API keys match `.env.local`
4. Check Firestore Database is created
5. Verify Authentication is enabled

---

## ✅ Once Fixed

After the issue is resolved, you can remove the extra console.log statements to clean up the console output.

---

**Last Updated:** November 26, 2025

**Made with ❤️ for RS UNIPDU Medika**

