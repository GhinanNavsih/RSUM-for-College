# 🏗️ System Architecture - RSUM IGD Information System

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RSUM IGD SYSTEM                          │
│                  Next.js 14 + Firebase                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │   Auth Layer │    │   Database   │
│   Next.js    │◄──►│   Firebase   │◄──►│  Firestore   │
│   React      │    │   Auth       │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 🔐 Authentication Flow

```
┌──────────┐
│  Login   │
│  Page    │
└────┬─────┘
     │
     │ Email/Password
     ▼
┌──────────────────┐
│ Firebase Auth    │
│ Verify           │
└────┬─────────────┘
     │
     │ Success
     ▼
┌──────────────────┐
│ Fetch User Role  │
│ from Firestore   │
└────┬─────────────┘
     │
     │
     ▼
┌──────────────────────────────────────┐
│         Role-Based Redirect          │
├──────────────────────────────────────┤
│  Admin  → /patients (full access)    │
│  IGD    → /igd (create visits)       │
│  Kasir  → /kasir (process payment)   │
│  Farmasi→ /farmasi (dispense drugs)  │
└──────────────────────────────────────┘
```

## 🏥 Patient Visit Workflow

```
┌────────────────────────────────────────────────────┐
│                 1. PATIENT ARRIVAL                 │
│              (Pasien Datang ke IGD)                │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────┐
│        2. IGD - PATIENT REGISTRATION               │
│   ┌────────────────────────────────────┐           │
│   │ • Search existing patient          │           │
│   │ • Or create new patient            │           │
│   │ • Input: No.RM, Nama, Data Pasien │           │
│   └────────────────────────────────────┘           │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────┐
│          3. IGD - CREATE VISIT                     │
│   ┌────────────────────────────────────┐           │
│   │ • Select patient                   │           │
│   │ • Select doctor                    │           │
│   │ • Visit type (IGD/Rawat Jalan)    │           │
│   │ Status: "igd_in_progress"         │           │
│   └────────────────────────────────────┘           │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────┐
│        4. IGD - ADD SERVICES & PRESCRIPTIONS       │
│   ┌────────────────────────────────────┐           │
│   │ SERVICES (for Kasir):              │           │
│   │ • Tindakan 1: Konsultasi - Rp100k │           │
│   │ • Tindakan 2: Infus - Rp50k       │           │
│   │ Total: Rp150k ───────────────┐    │           │
│   │                               │    │           │
│   │ PRESCRIPTIONS (for Farmasi):  │    │           │
│   │ • Obat 1: Paracetamol 500mg   │    │           │
│   │ • Obat 2: Amoxicillin         │    │           │
│   └────────────────────────────────────┘           │
└────────────────────┬───────────────────────────────┘
                     │
                     │ IGD marks as DONE
                     ▼
┌────────────────────────────────────────────────────┐
│              5. STATUS CHANGE                      │
│   status: "igd_done"                              │
│   paymentStatus: "unpaid" ──► Visible to KASIR    │
│   dispensationStatus: "pending" ──► Visible to    │
│                                     FARMASI       │
└────────┬────────────────────────────┬──────────────┘
         │                            │
         │                            │
    ┌────▼──────┐              ┌─────▼──────┐
    │   KASIR   │              │  FARMASI   │
    │  (dapat   │              │  (dapat    │
    │   berjalan paralel)      │   berjalan paralel)
    │           │              │            │
    └────┬──────┘              └─────┬──────┘
         │                            │
         ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐
│  6. KASIR PROCESS   │      │ 7. FARMASI PROCESS  │
│  ┌───────────────┐  │      │ ┌───────────────┐   │
│  │ View services │  │      │ │View prescrip. │   │
│  │ Total: 150k   │  │      │ │ Paracetamol   │   │
│  │ Select method │  │      │ │ Amoxicillin   │   │
│  │ (Cash/Debit)  │  │      │ │               │   │
│  │               │  │      │ │ Prepare drugs │   │
│  │ [Confirm]     │  │      │ │ Explain usage │   │
│  └───────────────┘  │      │ │               │   │
│                     │      │ │ [Confirm]     │   │
│ paymentStatus:      │      │ └───────────────┘   │
│   "paid" ✅         │      │                     │
└─────────────────────┘      │ dispensationStatus: │
                             │   "done" ✅         │
                             └─────────────────────┘
                                      │
                                      │
                  ┌───────────────────┴─────────────┐
                  │  Both KASIR & FARMASI completed │
                  └───────────────────┬─────────────┘
                                      │
                                      ▼
                          ┌────────────────────┐
                          │  8. PATIENT LEAVES │
                          │    (Pasien Pulang) │
                          └────────────────────┘
```

## 📁 File Structure (Detailed)

```
RSUM/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.ts        # Tailwind CSS config
│   ├── next.config.mjs           # Next.js config
│   ├── .env.local               # Firebase credentials (DO NOT COMMIT!)
│   └── .gitignore               # Git ignore rules
│
├── 📱 app/                       # Next.js App Router
│   │
│   ├── layout.tsx               # Root layout (AuthProvider)
│   ├── page.tsx                 # Home (redirect based on role)
│   ├── globals.css              # Global styles
│   │
│   ├── 🔐 login/
│   │   └── page.tsx             # Login form
│   │
│   ├── 👤 patients/             # Patient Management
│   │   ├── page.tsx             # List & search patients
│   │   ├── new/
│   │   │   └── page.tsx         # Create new patient
│   │   └── [patientId]/
│   │       └── page.tsx         # Patient detail + visit history
│   │
│   ├── 🏥 igd/                  # IGD Module
│   │   ├── page.tsx             # IGD dashboard (in-progress visits)
│   │   ├── new-visit/
│   │   │   └── page.tsx         # Create new visit
│   │   └── visit/[visitId]/
│   │       └── page.tsx         # Visit detail (add services & prescriptions)
│   │
│   ├── 💰 kasir/                # Cashier Module
│   │   ├── page.tsx             # List unpaid visits
│   │   └── visit/[visitId]/
│   │       └── page.tsx         # Process payment & print receipt
│   │
│   ├── 💊 farmasi/              # Pharmacy Module
│   │   ├── page.tsx             # List pending prescriptions
│   │   └── visit/[visitId]/
│   │       └── page.tsx         # Dispense prescriptions
│   │
│   └── 👨‍💼 admin/              # Admin Module
│       └── users/
│           └── page.tsx         # User management & role assignment
│
├── 🎨 components/               # Reusable UI Components
│   ├── Button.tsx              # Styled button
│   ├── Card.tsx                # Card container
│   ├── Input.tsx               # Form input
│   ├── Select.tsx              # Dropdown select
│   ├── Badge.tsx               # Status badge
│   ├── LoadingSpinner.tsx      # Loading indicator
│   └── Navbar.tsx              # Navigation bar
│
├── 🔌 contexts/                # React Contexts
│   └── AuthContext.tsx         # Authentication state & methods
│
├── 📚 lib/                     # Library & Utilities
│   ├── firebase.ts             # Firebase initialization
│   ├── firestore.ts            # Firestore CRUD operations
│   └── utils.ts                # Utility functions (format, etc)
│
├── 📝 types/                   # TypeScript Types
│   └── models.ts               # Data model interfaces
│
└── 📖 Documentation
    ├── README.md               # Main documentation
    ├── SETUP_GUIDE.md          # Step-by-step setup guide
    └── ARCHITECTURE.md         # This file
```

## 🗄️ Database Schema

```
Firestore Database
│
├── 📁 patients/                    # Patients Collection
│   ├── {patientId}                # Document
│   │   ├── id: string
│   │   ├── noRM: string           # Medical Record Number
│   │   ├── nama: string
│   │   ├── tanggalLahir: string
│   │   ├── umur: number
│   │   ├── alamat: string
│   │   ├── noTelp: string
│   │   ├── penanggungJawab: string
│   │   ├── dokterUtama: string
│   │   ├── asuransi: string       # BPJS, Pribadi, etc
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│
├── 📁 visits/                     # Visits Collection
│   ├── {visitId}                 # Document
│   │   ├── id: string
│   │   ├── patientId: string     # → patients/{id}
│   │   ├── tanggalKunjungan: timestamp
│   │   ├── jenis: string         # IGD / Rawat Jalan
│   │   ├── dokter: string
│   │   ├── status: string        # igd_in_progress / igd_done
│   │   ├── services: array       # Array of VisitService
│   │   │   ├── [0]
│   │   │   │   ├── id: string
│   │   │   │   ├── nama: string
│   │   │   │   ├── harga: number
│   │   │   │   └── quantity: number
│   │   │   └── [1] ...
│   │   ├── prescriptions: array  # Array of VisitPrescription
│   │   │   ├── [0]
│   │   │   │   ├── id: string
│   │   │   │   ├── namaObat: string
│   │   │   │   ├── qty: number
│   │   │   │   └── aturanPakai: string
│   │   │   └── [1] ...
│   │   ├── totalBiaya: number
│   │   ├── paymentStatus: string  # unpaid / paid
│   │   ├── paymentTime: timestamp
│   │   ├── paymentMethod: string  # cash, debit, etc
│   │   ├── kasirUserId: string
│   │   ├── dispensationStatus: string  # pending / done
│   │   ├── dispensationTime: timestamp
│   │   ├── farmasiUserId: string
│   │   ├── createdByUserId: string
│   │   ├── createdAt: timestamp
│   │   └── updatedAt: timestamp
│   │
│
└── 📁 users/                      # Users Collection
    ├── {userId}                   # Document (same as Auth UID)
    │   ├── id: string             # Firebase Auth UID
    │   ├── email: string
    │   ├── displayName: string
    │   ├── role: string           # admin / igd / kasir / farmasi
    │   ├── createdAt: timestamp
    │   └── updatedAt: timestamp
```

## 🔄 Data Flow Examples

### Example 1: Creating a New Visit

```
1. User (IGD) navigates to /igd/new-visit
2. Component loads all patients from Firestore
3. User selects patient & fills form
4. User clicks "Buat Kunjungan"
5. Frontend calls createVisit() in lib/firestore.ts
6. Function creates new document in visits/ collection
7. Document includes:
   - patientId (selected)
   - status: "igd_in_progress"
   - services: [] (empty)
   - prescriptions: [] (empty)
   - paymentStatus: "unpaid"
   - dispensationStatus: "pending"
8. Firestore returns new visitId
9. Frontend redirects to /igd/visit/{visitId}
10. User can now add services & prescriptions
```

### Example 2: Processing Payment

```
1. User (Kasir) logs in → redirected to /kasir
2. Component calls getUnpaidVisits() from Firestore
3. Firestore returns visits where:
   - status = "igd_done"
   - paymentStatus = "unpaid"
4. Kasir clicks "Proses Bayar" on a visit
5. Navigate to /kasir/visit/{visitId}
6. Component loads visit & patient data
7. Display all services & total amount
8. Kasir selects payment method (cash/debit/etc)
9. Kasir clicks "Konfirmasi Pembayaran"
10. Frontend calls updateVisit() with:
    - paymentStatus: "paid"
    - paymentTime: now
    - paymentMethod: selected
    - kasirUserId: current user ID
11. Firestore updates document
12. Visit disappears from kasir dashboard
```

## 🎯 Role-Based Access Control

```
┌─────────────────────────────────────────────────────┐
│                    ADMIN ROLE                       │
├─────────────────────────────────────────────────────┤
│ ✅ View/Create/Edit Patients                        │
│ ✅ View/Create/Edit Visits                          │
│ ✅ Add Services & Prescriptions                     │
│ ✅ Process Payments                                 │
│ ✅ Dispense Prescriptions                           │
│ ✅ Manage Users & Roles                             │
│ ✅ Access ALL pages                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                     IGD ROLE                        │
├─────────────────────────────────────────────────────┤
│ ✅ View/Create/Edit Patients                        │
│ ✅ Create New Visits                                │
│ ✅ Add Services (for billing)                       │
│ ✅ Add Prescriptions (for pharmacy)                 │
│ ✅ Mark Visit as Done                               │
│ ❌ Cannot process payments                          │
│ ❌ Cannot dispense drugs                            │
│ ❌ Cannot manage users                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    KASIR ROLE                       │
├─────────────────────────────────────────────────────┤
│ 👁️ View Patients (read-only)                       │
│ 👁️ View Visits (read-only)                         │
│ 👁️ View Services & Amounts                         │
│ ✅ Process Payments                                 │
│ ✅ Print Receipts                                   │
│ ❌ Cannot create/edit patients                      │
│ ❌ Cannot create visits                             │
│ ❌ Cannot add services/prescriptions                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   FARMASI ROLE                      │
├─────────────────────────────────────────────────────┤
│ 👁️ View Patients (read-only)                       │
│ 👁️ View Visits (read-only)                         │
│ 👁️ View Prescriptions                              │
│ ✅ Mark Prescriptions as Dispensed                  │
│ ✅ Print Prescription Sheets                        │
│ ❌ Cannot create/edit patients                      │
│ ❌ Cannot create visits                             │
│ ❌ Cannot add services/prescriptions                │
│ ❌ Cannot process payments                          │
└─────────────────────────────────────────────────────┘
```

## 🔒 Security Layers

```
Layer 1: Firebase Authentication
├─ Email/Password verification
├─ Token-based sessions
└─ Automatic token refresh

Layer 2: Firestore Security Rules
├─ Only authenticated users can read/write
├─ Rules defined in Firebase Console
└─ Server-side validation

Layer 3: Frontend Route Protection
├─ middleware.ts checks auth state
├─ useAuth() hook provides auth context
└─ Role-based component rendering

Layer 4: Component-Level Checks
├─ Check user role before rendering
├─ Disable buttons based on permissions
└─ Conditional navigation items
```

## 📊 Performance Considerations

### Optimization Strategies

1. **Firestore Queries**
   - Use indexes for complex queries
   - Limit results with pagination (future feature)
   - Cache frequently accessed data

2. **Next.js Features**
   - Client-side rendering for dynamic content
   - Lazy loading for heavy components
   - Image optimization (if added)

3. **Data Loading**
   - Load patient list once, cache in state
   - Fetch visit details only when needed
   - Batch related queries

## 🚀 Deployment Architecture

```
Development:
localhost:3000 → Next.js Dev Server → Firebase (test mode)

Production:
Users → Vercel/Netlify → Next.js Build → Firebase (production)
     └→ CDN Cache
```

## 📈 Future Enhancements

Potential improvements:

1. **Reports & Analytics**
   - Daily visit summary
   - Revenue reports
   - Drug usage statistics

2. **Advanced Features**
   - Real-time notifications
   - Print queue management
   - Drug inventory tracking
   - Appointment scheduling

3. **Mobile App**
   - React Native version
   - Patient mobile access
   - Push notifications

4. **Integration**
   - BPJS API integration
   - Lab system integration
   - WhatsApp notifications

---

**This architecture is designed to be simple, scalable, and beginner-friendly! 🎉**

