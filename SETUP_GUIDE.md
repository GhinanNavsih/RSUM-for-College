# 🚀 Setup Guide - Step by Step untuk Pemula

Panduan lengkap setup project RSUM dari nol.

## ✅ Checklist Setup

- [ ] Install Node.js
- [ ] Install dependencies
- [ ] Buat Firebase Project
- [ ] Enable Firebase Authentication
- [ ] Enable Firestore Database
- [ ] Buat users di Firebase
- [ ] Setup environment variables
- [ ] Run development server
- [ ] Test login

---

## 📦 Step 1: Install Node.js

1. Download Node.js dari [nodejs.org](https://nodejs.org/)
2. Pilih versi **LTS** (Long Term Support)
3. Install seperti biasa
4. Verifikasi instalasi:

```bash
node --version
# Output: v18.x.x atau lebih tinggi

npm --version
# Output: 9.x.x atau lebih tinggi
```

---

## 📥 Step 2: Install Dependencies

Buka Terminal/Command Prompt, masuk ke folder project:

```bash
cd /Users/fajrulnuha/Documents/RSUM
npm install
```

Tunggu sampai selesai (mungkin 2-5 menit tergantung internet).

---

## 🔥 Step 3: Setup Firebase

### 3.1 Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Login dengan Google Account
3. Klik **"Add project"** atau **"Tambahkan project"**
4. Masukkan nama project: `rsum-igd-system`
5. (Optional) Disable Google Analytics kalau tidak perlu
6. Klik **"Create project"**
7. Tunggu sampai selesai (1-2 menit)

### 3.2 Enable Authentication

1. Di dashboard Firebase project, klik **"Authentication"** di menu sebelah kiri
2. Klik tombol **"Get started"**
3. Klik tab **"Sign-in method"**
4. Cari **"Email/Password"**
5. Klik, lalu **Enable** → **Save**

### 3.3 Tambah Users di Authentication

Masih di halaman Authentication:

1. Klik tab **"Users"**
2. Klik **"Add user"**
3. Tambahkan 4 users berikut:

**User 1 - Admin**
- Email: `admin@rsum.com`
- Password: `admin123`
- Klik **"Add user"**
- **COPY UID** user ini! (contoh: `abc123xyz456`)

**User 2 - IGD**
- Email: `igd@rsum.com`
- Password: `igd123`
- **COPY UID**

**User 3 - Kasir**
- Email: `kasir@rsum.com`
- Password: `kasir123`
- **COPY UID**

**User 4 - Farmasi**
- Email: `farmasi@rsum.com`
- Password: `farmasi123`
- **COPY UID**

**PENTING**: Simpan semua UID yang di-copy! Kita butuh nanti.

### 3.4 Enable Firestore Database

1. Di menu sebelah kiri, klik **"Firestore Database"**
2. Klik **"Create database"**
3. Pilih **"Start in test mode"** ← PENTING untuk development
4. Klik **"Next"**
5. Pilih location: **"asia-southeast2 (Jakarta)"** untuk Indonesia
6. Klik **"Enable"**
7. Tunggu sampai database dibuat

### 3.5 Setup Firestore Rules

Masih di Firestore Database:

1. Klik tab **"Rules"**
2. Replace semua text dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Klik **"Publish"**

### 3.6 Tambah User Data ke Firestore

**INI STEP YANG SERING TERLEWAT!**

Sekarang kita tambahkan data user ke Firestore:

1. Di Firestore Database, klik tab **"Data"**
2. Klik **"Start collection"**
3. Collection ID: `users` → **Next**

**Tambah Document 1 - Admin:**
- Document ID: (paste UID dari admin yang tadi di-copy)
- Fields:
  - Field: `id`, Type: string, Value: (UID yang sama)
  - Klik **"Add field"**
  - Field: `email`, Type: string, Value: `admin@rsum.com`
  - Klik **"Add field"**
  - Field: `displayName`, Type: string, Value: `Administrator`
  - Klik **"Add field"**
  - Field: `role`, Type: string, Value: `admin`
  - Klik **"Add field"**
  - Field: `createdAt`, Type: string, Value: `2024-01-01T00:00:00.000Z`
  - Klik **"Add field"**
  - Field: `updatedAt`, Type: string, Value: `2024-01-01T00:00:00.000Z`
- Klik **"Save"**

**Tambah Document 2 - IGD:**
- Klik **"Add document"**
- Document ID: (paste UID dari igd)
- Fields sama seperti di atas, tapi:
  - `id`: UID igd
  - `email`: `igd@rsum.com`
  - `displayName`: `Staff IGD`
  - `role`: `igd`
- Klik **"Save"**

**Tambah Document 3 - Kasir:**
- Klik **"Add document"**
- Document ID: (paste UID dari kasir)
- Fields:
  - `id`: UID kasir
  - `email`: `kasir@rsum.com`
  - `displayName`: `Staff Kasir`
  - `role`: `kasir`
  - `createdAt` & `updatedAt`: timestamps
- Klik **"Save"**

**Tambah Document 4 - Farmasi:**
- Klik **"Add document"**
- Document ID: (paste UID dari farmasi)
- Fields:
  - `id`: UID farmasi
  - `email`: `farmasi@rsum.com`
  - `displayName`: `Staff Farmasi`
  - `role`: `farmasi`
  - `createdAt` & `updatedAt`: timestamps
- Klik **"Save"**

Sekarang Anda punya 4 documents di collection `users`.

### 3.7 Get Firebase Config

1. Di Firebase Console, klik icon ⚙️ (Settings) di menu kiri
2. Klik **"Project settings"**
3. Scroll ke bawah sampai **"Your apps"**
4. Klik icon **Web** (`</>`)
5. App nickname: `RSUM Web App`
6. Klik **"Register app"**
7. Copy semua config yang muncul:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "rsum-....firebaseapp.com",
  projectId: "rsum-...",
  storageBucket: "rsum-....appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};
```

**SIMPAN CONFIG INI!** Kita butuh untuk step selanjutnya.

---

## 🔐 Step 4: Setup Environment Variables

1. Di folder project, buat file baru bernama `.env.local`
2. Copy-paste isi dari `.env.local.example`
3. Isi dengan Firebase config Anda:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rsum-....firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rsum-...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rsum-....appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...
```

**PENTING**: 
- Pastikan TIDAK ADA SPASI setelah `=`
- Pastikan semua value TIDAK pakai tanda kutip
- Save file

---

## 🎯 Step 5: Run Development Server

Di Terminal:

```bash
npm run dev
```

Output yang benar:

```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

---

## ✅ Step 6: Test Application

1. Buka browser
2. Pergi ke: [http://localhost:3000](http://localhost:3000)
3. Anda akan diredirect ke `/login`
4. **Test Login Admin:**
   - Email: `admin@rsum.com`
   - Password: `admin123`
   - Klik **"Masuk"**

Jika berhasil, Anda akan masuk ke dashboard!

---

## 🎉 Setup Selesai!

Sekarang Anda bisa:

✅ Login dengan 4 user (admin, igd, kasir, farmasi)  
✅ Tambah pasien baru  
✅ Buat kunjungan  
✅ Proses pembayaran  
✅ Proses resep obat  

---

## ❌ Troubleshooting

### Problem: Login gagal "Email atau password salah"

**Solution:**
1. Pastikan user sudah dibuat di Firebase Authentication
2. Pastikan password benar (case-sensitive!)
3. Check Firebase Console > Authentication > Users

### Problem: Login berhasil tapi error "Role tidak ditemukan"

**Solution:**
1. User belum ada di Firestore!
2. Ikuti Step 3.6 lagi dengan teliti
3. Pastikan Document ID = UID dari Authentication
4. Pastikan field `role` sudah diisi

### Problem: "Firebase not initialized"

**Solution:**
1. Check file `.env.local` ada dan isinya benar
2. Pastikan tidak ada spasi atau tanda kutip extra
3. Restart dev server: Ctrl+C lalu `npm run dev` lagi

### Problem: "Permission denied" di Firestore

**Solution:**
1. Check Firestore Rules sudah di-set (Step 3.5)
2. Rules harus allow authenticated users

### Problem: Port 3000 sudah dipakai

**Solution:**
```bash
npm run dev -- -p 3001
```
Lalu buka http://localhost:3001

---

## 📞 Need Help?

Jika masih ada masalah:

1. Baca error message dengan teliti
2. Google error messagenya
3. Check Firebase Console untuk pastikan setup benar
4. Restart development server
5. Clear browser cache dan coba lagi

---

**Selamat! Anda sudah berhasil setup RSUM System! 🎉**

