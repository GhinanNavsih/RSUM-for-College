# 🔍 DEBUG: Patient Detail Not Working - Complete Guide

## ❓ Your Situation

- ✅ Deleted all old patients from Firestore
- ❌ Detail page still shows "Pasien tidak ditemukan"
- 🤔 Even with fresh data, it's not working

---

## 🎯 Let's Find the Real Problem

### Test 1: Do You Have ANY Patients in Firestore?

**Check Firebase Console:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Look for **`patients`** collection
5. Are there ANY documents inside?

**Expected:**
```
patients/
  └─ (document ID: abc123)
     ├─ noRM: "RM-2024-001"
     ├─ nama: "John Doe"
     ├─ nik: "1234567890123456"
     └─ ... (all other fields)
```

**If empty (no documents):**
→ You need to create a new patient first!

**If has documents:**
→ Continue to Test 2

---

### Test 2: Create a Brand New Patient

Let's create a test patient with ALL required fields:

1. **Open your app**: `http://localhost:3000/patients/new`

2. **Fill the form**:
   ```
   No. RM: TEST-001
   Nama: Test Patient
   NIK: 1234567890123456
   Tanggal Lahir: 2000-01-01
   Jenis Kelamin: Laki-laki
   No. Telp: 08123456789
   Alamat: Test Address
   Email: test@example.com (optional)
   
   Nama Penanggung Jawab: Test Guardian
   Hubungan: Orang Tua
   Kontak PJ: 08198765432
   ```

3. **Click "Simpan Pasien"**

4. **What happens?**
   - ✅ Redirected to detail page → SUCCESS! It works!
   - ❌ Still shows error → Continue to Test 3

---

### Test 3: Check Browser Console

1. Open patient list: `http://localhost:3000/patients`
2. Open browser console: **F12** or **Right-click → Inspect → Console**
3. Click **[Detail]** button on any patient
4. **Look at console logs**

**What you should see:**
```javascript
Loading patient with ID: abc123
Fetching patient with ID: abc123
Patient document found: { nama: "Test Patient", ... }
Patient data received: { id: "abc123", ... }
Visits data received: []
```

**If you see "Patient document does not exist":**
→ The ID in the URL doesn't match Firestore document ID

**If you see an error:**
→ Firebase connection or rules issue

---

### Test 4: Check Patient IDs Match

**In Patient List Page:**

Open browser console on `/patients` and run:

```javascript
// Check what patients are loaded
console.log('Patients in list:', patients);
```

**In Firestore Console:**

1. Go to Firestore Database
2. Open `patients` collection
3. **Copy one document ID** (e.g., "A2XuYi78k4phX6aBoFLe")
4. **Manually visit**: `http://localhost:3000/patients/A2XuYi78k4phX6aBoFLe`

**What happens?**
- ✅ Page loads → Firebase works, issue is with the list
- ❌ Still error → Firebase connection issue

---

### Test 5: Check Firebase Configuration

**File**: `.env.local`

Make sure it has ALL these values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
```

**Missing any?** → Copy from Firebase Console → Project Settings → Web App

---

### Test 6: Check Firestore Rules

**In Firebase Console:**

1. Go to **Firestore Database**
2. Click **Rules** tab
3. Check your rules:

**Should look like:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /patients/{patientId} {
      allow read, write: if request.auth != null;
    }
    match /visits/{visitId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**If rules are too restrictive:**
→ Change to allow authenticated reads

---

## 🔧 Common Issues & Fixes

### Issue 1: Cache Problem

**Symptom**: List shows patients but clicking detail fails

**Fix**: Hard refresh the page
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Issue 2: Patient List Shows Old IDs

**Symptom**: Deleted patients still appear in list

**Fix**: The list is cached. Restart dev server:
```bash
# Stop the server (Ctrl + C)
npm run dev
```

### Issue 3: Firestore Rules Too Strict

**Symptom**: Console shows permission denied

**Fix**: Update Firestore rules (see Test 6)

### Issue 4: No Patients Created Yet

**Symptom**: List is empty, detail shows error

**Fix**: Create a new patient first (see Test 2)

### Issue 5: Wrong Firebase Project

**Symptom**: Everything fails, can't find data

**Fix**: Check `.env.local` matches your actual Firebase project

---

## 📊 Quick Diagnosis Flowchart

```
START: Click [Detail] button
  ↓
Is patient list empty?
  ├─ YES → Create new patient (Test 2)
  └─ NO → Continue
  ↓
Check browser console (Test 3)
  ↓
Do you see "Patient document found"?
  ├─ YES → Issue elsewhere (check visits)
  └─ NO → Continue
  ↓
Do you see "Patient document does not exist"?
  ├─ YES → ID mismatch (Test 4)
  └─ NO → Continue
  ↓
Do you see permission/connection error?
  ├─ YES → Firebase config issue (Test 5 & 6)
  └─ NO → Something else
```

---

## 🎯 Most Likely Cause

Based on your situation (deleted old patients), the most likely issues are:

### #1: No New Patients Created Yet (90% probability)

You deleted the old ones but haven't created new ones with correct schema.

**Solution**: Create a new test patient

### #2: Browser Cache (5% probability)

Browser is still showing old patient list with deleted patient IDs.

**Solution**: Hard refresh or restart dev server

### #3: Firestore Index Issue (3% probability)

After deleting all data, Firestore indexes might need time.

**Solution**: Wait 1-2 minutes, try again

### #2: Firebase Rules Changed (2% probability)

Someone changed Firestore rules and blocked reads.

**Solution**: Check and update rules

---

## ✅ Step-by-Step Fix (Most Common)

### Step 1: Verify Firestore is Empty

Firebase Console → Firestore → patients collection

**Is it empty?** → Continue to Step 2

### Step 2: Create ONE Test Patient

Go to: `http://localhost:3000/patients/new`

Fill ALL required fields (including NIK, Jenis Kelamin, Guardian info)

Click **[Simpan Pasien]**

### Step 3: Check Redirect

**After saving:**
- ✅ Redirected to detail page showing patient data → **WORKING!**
- ❌ Shows "Pasien tidak ditemukan" → Check console logs

### Step 4: Go Back to List

Navigate to: `http://localhost:3000/patients`

You should see your test patient in the table.

### Step 5: Click [Detail]

Click the [Detail] button for your test patient.

**Expected**: Detail page opens and shows all patient information.

### Step 6: If Still Failing

Open browser console (F12) and share the error messages.

---

## 🚨 If Nothing Works

### Nuclear Option: Complete Reset

1. **Delete `.next` folder**:
   ```bash
   rm -rf .next
   ```

2. **Clear node_modules** (if needed):
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **Hard refresh browser**:
   ```
   Windows/Linux: Ctrl + Shift + R
   Mac: Cmd + Shift + R
   ```

5. **Try again**

---

## 📝 Checklist Before Asking for Help

If you still have issues, check these first:

- [ ] Firebase Console shows `patients` collection exists
- [ ] At least ONE patient document exists in Firestore
- [ ] Patient document has ALL required fields (check Firebase Console)
- [ ] You're logged in (not logged out)
- [ ] `.env.local` has correct Firebase credentials
- [ ] Firestore rules allow authenticated reads
- [ ] Browser console is open to see errors
- [ ] Dev server is running (`npm run dev`)
- [ ] You've tried hard refresh (Ctrl+Shift+R)

---

## 🎉 Expected Success Result

When everything works correctly:

1. **Patient List** shows patients with correct data
2. **Click [Detail]** → Redirects to `/patients/:id`
3. **Detail Page** displays:
   - Patient name at top
   - 3 info cards with all data
   - Guardian info card
   - Visit history (empty if no visits)
   - Edit and New Visit buttons
4. **No errors** in console
5. **No "Pasien tidak ditemukan"** message

---

**Last Updated:** November 26, 2025

**Made with ❤️ for RS UNIPDU Medika**

