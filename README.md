# RS UNIPDU Medika - Sistem Informasi IGD & Rawat Jalan

Sistem informasi berbasis web untuk mengelola data pasien, kunjungan, pembayaran, dan resep obat di RS UNIPDU Medika.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Cloud Firestore
- **State Management**: React Context API

## 📋 Fitur Utama

### 1. Manajemen Pasien
- Tambah, lihat, dan cari data pasien
- Nomor Rekam Medis (RM)
- Data lengkap pasien (nama, tanggal lahir, alamat, asuransi, dll)

### 2. IGD Workflow
- Buat kunjungan baru untuk pasien
- Input tindakan medis dan biaya
- Input resep obat
- Single source of truth untuk billing dan farmasi

### 3. Kasir (Pembayaran)
- Lihat daftar tagihan yang belum dibayar
- Proses pembayaran dengan berbagai metode
- Cetak nota pembayaran

### 4. Farmasi (Resep)
- Lihat resep yang perlu diproses
- Konfirmasi pemberian obat
- Cetak lembar resep

### 5. Admin
- Manajemen pengguna
- Ubah role/hak akses pengguna
- Monitoring sistem

## 🏗️ Struktur Project

```
RSUM/
├── app/                          # Next.js App Router
│   ├── login/                    # Login page
│   ├── patients/                 # Patient management
│   │   ├── page.tsx             # List & search patients
│   │   ├── new/page.tsx         # Create new patient
│   │   └── [patientId]/page.tsx # Patient detail
│   ├── igd/                      # IGD workflow
│   │   ├── page.tsx             # IGD dashboard
│   │   ├── new-visit/page.tsx   # Create new visit
│   │   └── visit/[visitId]/page.tsx # Visit detail
│   ├── kasir/                    # Cashier module
│   │   ├── page.tsx             # Unpaid visits
│   │   └── visit/[visitId]/page.tsx # Payment processing
│   ├── farmasi/                  # Pharmacy module
│   │   ├── page.tsx             # Pending prescriptions
│   │   └── visit/[visitId]/page.tsx # Dispense prescriptions
│   └── admin/
│       └── users/page.tsx       # User management
├── components/                   # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx
│   ├── LoadingSpinner.tsx
│   └── Navbar.tsx
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── lib/
│   ├── firebase.ts              # Firebase initialization
│   ├── firestore.ts             # Firestore CRUD operations
│   └── utils.ts                 # Utility functions
├── types/
│   └── models.ts                # TypeScript type definitions
└── package.json
```

## 🛠️ Setup & Installation

### 1. Prerequisites

- Node.js 18+ dan npm/yarn
- Firebase account (gratis tier sudah cukup)

### 2. Clone atau Download Project

```bash
cd /Users/fajrulnuha/Documents/RSUM
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Firebase

#### 4.1 Buat Firebase Project

1. Pergi ke [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add project"** / **"Tambah project"**
3. Beri nama project, misal: `rsum-igd`
4. Ikuti wizard setup (Analytics optional)

#### 4.2 Enable Authentication

1. Di Firebase Console, pilih project Anda
2. Klik **"Authentication"** di sidebar
3. Klik tab **"Sign-in method"**
4. Enable **"Email/Password"**
5. Klik **"Users"** tab → **"Add user"**
6. Tambahkan user untuk testing:
   - `admin@rsum.com` / `admin123` (role: admin)
   - `igd@rsum.com` / `igd123` (role: igd)
   - `kasir@rsum.com` / `kasir123` (role: kasir)
   - `farmasi@rsum.com` / `farmasi123` (role: farmasi)

#### 4.3 Enable Firestore Database

1. Klik **"Firestore Database"** di sidebar
2. Klik **"Create database"**
3. Pilih **"Start in test mode"** (untuk development)
4. Pilih location (asia-southeast2 untuk Indonesia)

#### 4.4 Setup Firestore Security Rules (IMPORTANT!)

Di Firestore Console, klik tab **"Rules"** dan ganti dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note**: Untuk production, buat rules yang lebih ketat!

#### 4.5 Tambah User Data ke Firestore

Setelah membuat users di Authentication, Anda perlu menambahkan data user ke Firestore:

1. Di Firestore Console, klik **"Start collection"**
2. Collection ID: `users`
3. Document ID: (copy dari Authentication UID)
4. Fields:
   - `id` (string): sama dengan document ID
   - `email` (string): email user
   - `displayName` (string): nama lengkap (optional)
   - `role` (string): "admin" / "igd" / "kasir" / "farmasi"
   - `createdAt` (string): ISO timestamp
   - `updatedAt` (string): ISO timestamp

Contoh document untuk admin:
```json
{
  "id": "abc123xyz",
  "email": "admin@rsum.com",
  "displayName": "Administrator",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

Ulangi untuk semua users (igd, kasir, farmasi).

#### 4.6 Get Firebase Config

1. Di Firebase Console, klik ⚙️ (Settings) → **Project settings**
2. Scroll ke bawah ke **"Your apps"**
3. Klik **"Web"** icon (</>) → register app
4. Copy Firebase configuration

### 5. Configure Environment Variables

Buat file `.env.local` di root project:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` dan isi dengan Firebase config Anda:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. Run Development Server

```bash
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000)

## 👤 User Credentials (Testing)

Setelah setup Firebase Authentication dan Firestore:

- **Admin**: `admin@rsum.com` / `admin123`
- **IGD**: `igd@rsum.com` / `igd123`
- **Kasir**: `kasir@rsum.com` / `kasir123`
- **Farmasi**: `farmasi@rsum.com` / `farmasi123`

## 🎯 User Roles & Permissions

| Role    | Pasien | Kunjungan | Tindakan/Resep | Pembayaran | Farmasi | Admin |
|---------|--------|-----------|----------------|------------|---------|-------|
| Admin   | ✅ All | ✅ All    | ✅ All         | ✅ All     | ✅ All  | ✅    |
| IGD     | ✅ CRUD| ✅ Create | ✅ Create      | ❌         | ❌      | ❌    |
| Kasir   | 👁️ View| 👁️ View  | 👁️ View       | ✅ Process | ❌      | ❌    |
| Farmasi | 👁️ View| 👁️ View  | 👁️ View       | ❌         | ✅ Process| ❌  |

## 📱 Workflow

### Alur Normal Pasien

```
1. Pasien Datang
   ↓
2. IGD: Input/Pilih Data Pasien
   ↓
3. IGD: Buat Kunjungan Baru
   ↓
4. IGD: Input Tindakan & Biaya
   ↓
5. IGD: Input Resep Obat (jika ada)
   ↓
6. IGD: Selesai → Kirim ke Kasir & Farmasi
   ↓
7. Kasir: Terima Pasien → Proses Pembayaran
   ↓
8. Farmasi: Siapkan Obat → Serahkan ke Pasien
   ↓
9. Pasien Pulang ✅
```

## 🔥 Firestorm Collections

### `patients`
```typescript
{
  id: string,
  noRM: string,
  nama: string,
  tanggalLahir?: string,
  umur?: number,
  alamat?: string,
  noTelp?: string,
  penanggungJawab?: string,
  dokterUtama?: string,
  asuransi?: "BPJS" | "Pribadi" | "Asuransi Lain" | "Lainnya",
  createdAt: string,
  updatedAt: string
}
```

### `visits`
```typescript
{
  id: string,
  patientId: string,
  tanggalKunjungan: string,
  jenis: "IGD" | "Rawat Jalan",
  dokter: string,
  status: "igd_in_progress" | "igd_done",
  services: VisitService[],
  prescriptions: VisitPrescription[],
  totalBiaya: number,
  paymentStatus: "unpaid" | "paid",
  paymentTime?: string,
  paymentMethod?: string,
  kasirUserId?: string,
  dispensationStatus: "pending" | "done",
  dispensationTime?: string,
  farmasiUserId?: string,
  createdByUserId: string,
  createdAt: string,
  updatedAt: string
}
```

### `users`
```typescript
{
  id: string,
  email: string,
  displayName?: string,
  role: "admin" | "igd" | "kasir" | "farmasi",
  createdAt: string,
  updatedAt: string
}
```

## 🚀 Build for Production

```bash
npm run build
npm start
```

## 📝 Notes untuk Beginner

1. **Firebase Setup adalah Step Terpenting!**
   - Pastikan Authentication sudah enable
   - Pastikan Firestore sudah dibuat
   - Pastikan `.env.local` sudah benar

2. **Kalau Error "Firebase not initialized"**
   - Cek `.env.local` sudah benar
   - Cek semua `NEXT_PUBLIC_` prefix ada
   - Restart dev server setelah ubah env

3. **Kalau Error "Permission denied" di Firestore**
   - Cek Firestore Rules sudah diset ke test mode
   - Atau set rules yang proper

4. **Login Gagal?**
   - Cek user sudah dibuat di Firebase Authentication
   - Cek user sudah ada document di Firestore collection `users`
   - Cek field `role` sudah di-set

5. **Untuk Development/Testing**
   - Gunakan Firestore test mode
   - Buat beberapa dummy patients
   - Test dengan berbagai role

6. **Untuk Production**
   - Ganti Firestore rules ke production mode
   - Enable security features
   - Setup proper backup
   - Monitor usage

## 🔐 Security Considerations (Production)

Untuk production, tambahkan:

1. **Firestore Security Rules yang ketat**
2. **Environment variables yang secure**
3. **HTTPS only**
4. **Rate limiting**
5. **Audit logs**
6. **Regular backups**

## 🆘 Troubleshooting

### Port 3000 sudah dipakai?
```bash
npm run dev -- -p 3001
```

### Clear cache & restart
```bash
rm -rf .next
npm run dev
```

### Firebase errors?
- Pastikan billing account aktif (walaupun pakai free tier)
- Cek quota Firestore belum habis
- Cek API keys valid

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 📄 License

This project is for educational purposes for RS UNIPDU Medika.

---

**Developed with ❤️ for RS UNIPDU Medika**

Jika ada pertanyaan atau issue, silakan hubungi tim IT RS UNIPDU Medika.

