# 🗺️ Application Routes Map - RS UNIPDU Medika

Complete guide to all routes in the application.

---

## 📋 Route Structure Overview

```
/                           → Home/Dashboard (redirects based on role)
├── /login                  → Login page
├── /patients               → Patient management
│   ├── /patients           → List all patients
│   ├── /patients/new       → Create new patient
│   ├── /patients/:id       → Patient detail
│   └── /patients/:id/edit  → Edit patient
├── /igd                    → IGD (Emergency Dept)
│   ├── /igd                → IGD dashboard
│   ├── /igd/new-visit      → Create new visit
│   └── /igd/visit/:id      → Visit detail & management
├── /kasir                  → Cashier/Billing
│   ├── /kasir              → Unpaid visits list
│   └── /kasir/visit/:id    → Process payment
├── /farmasi                → Pharmacy
│   ├── /farmasi            → Pending prescriptions
│   └── /farmasi/visit/:id  → Dispense medications
└── /admin                  → Admin panel
    └── /admin/users        → User management
```

---

## 🏠 Public Routes

### /login
- **File**: `app/login/page.tsx`
- **Purpose**: User authentication
- **Access**: Public (unauthenticated users)
- **Features**:
  - Email/password login
  - Role-based redirect after login

---

## 👤 Patient Routes

### 1. /patients
- **File**: `app/patients/page.tsx`
- **Component Name**: PATIENT LIST PAGE
- **Purpose**: Display all patients in searchable table
- **Access**: All authenticated users
- **Features**:
  - Search by name, RM, NIK, phone
  - Table with 5 columns (RM, Nama, NIK, Telp, Aksi)
  - [Detail] and [Edit] buttons
  - "Add New Patient" button (Admin/IGD only)

### 2. /patients/new
- **File**: `app/patients/new/page.tsx`
- **Component Name**: NEW PATIENT PAGE
- **Purpose**: Register new patient
- **Access**: Admin, IGD only
- **Features**:
  - Complete patient registration form
  - 3 sections: Basic Info, Additional Info, Guardian Info
  - "Pasien Sendiri" checkbox for auto-fill
  - Form validation

### 3. /patients/:id
- **File**: `app/patients/[patientId]/page.tsx`
- **Component Name**: PATIENT DETAIL PAGE
- **Purpose**: View complete patient information
- **Access**: All authenticated users
- **Features**:
  - 4 info cards (Basic, Contact, Additional, Guardian)
  - Visit history table
  - "Edit Data Pasien" button (Admin/IGD only)
  - "New Visit" button (Admin/IGD only)

### 4. /patients/:id/edit
- **File**: `app/patients/[patientId]/edit/page.tsx`
- **Component Name**: EDIT PATIENT PAGE
- **Purpose**: Update patient information
- **Access**: Admin, IGD only
- **Features**:
  - Pre-filled form with current data
  - Same structure as new patient form
  - "Pasien Sendiri" auto-detection
  - Save/Cancel buttons

---

## 🏥 IGD (Emergency Department) Routes

### 1. /igd
- **File**: `app/igd/page.tsx`
- **Component Name**: IGD DASHBOARD
- **Purpose**: View active IGD visits
- **Access**: Admin, IGD only
- **Features**:
  - List of in-progress visits
  - Quick access to visit details
  - Create new visit

### 2. /igd/new-visit
- **File**: `app/igd/new-visit/page.tsx`
- **Component Name**: NEW VISIT PAGE
- **Purpose**: Create new patient visit
- **Access**: Admin, IGD only
- **Features**:
  - Select patient
  - Enter visit type, doctor
  - Automatic timestamp

### 3. /igd/visit/:id
- **File**: `app/igd/visit/[visitId]/page.tsx`
- **Component Name**: IGD VISIT DETAIL PAGE
- **Purpose**: Manage visit (services & prescriptions)
- **Access**: Admin, IGD only
- **Features**:
  - Add services/tindakan (for billing)
  - Add prescriptions/resep (for pharmacy)
  - Calculate total cost
  - Mark visit as done
  - Send to Kasir & Farmasi

---

## 💰 Kasir (Cashier/Billing) Routes

### 1. /kasir
- **File**: `app/kasir/page.tsx`
- **Component Name**: KASIR DASHBOARD
- **Purpose**: View unpaid visits
- **Access**: Admin, Kasir only
- **Features**:
  - List of visits ready for payment
  - Filter by payment status
  - Quick access to process payment

### 2. /kasir/visit/:id
- **File**: `app/kasir/visit/[visitId]/page.tsx`
- **Component Name**: PAYMENT PROCESSING PAGE
- **Purpose**: Process patient payment
- **Access**: Admin, Kasir only
- **Features**:
  - View services and total cost
  - Select payment method (cash, debit, credit, etc.)
  - Record payment
  - Print receipt

---

## 💊 Farmasi (Pharmacy) Routes

### 1. /farmasi
- **File**: `app/farmasi/page.tsx`
- **Component Name**: FARMASI DASHBOARD
- **Purpose**: View pending prescriptions
- **Access**: Admin, Farmasi only
- **Features**:
  - List of visits with pending dispensation
  - Filter by status
  - Quick access to dispense

### 2. /farmasi/visit/:id
- **File**: `app/farmasi/visit/[visitId]/page.tsx`
- **Component Name**: PRESCRIPTION DISPENSING PAGE
- **Purpose**: Dispense medications
- **Access**: Admin, Farmasi only
- **Features**:
  - View prescription list
  - Patient instructions
  - Mark as dispensed
  - Print prescription sheet

---

## 👑 Admin Routes

### 1. /admin/users
- **File**: `app/admin/users/page.tsx`
- **Component Name**: USER MANAGEMENT PAGE
- **Purpose**: Manage system users and roles
- **Access**: Admin only
- **Features**:
  - List all users
  - Change user roles
  - View user statistics
  - User access control

---

## 🔐 Access Control Matrix

| Route | Admin | IGD | Kasir | Farmasi |
|-------|-------|-----|-------|---------|
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/patients` | ✅ | ✅ | ✅ | ✅ |
| `/patients/new` | ✅ | ✅ | ❌ | ❌ |
| `/patients/:id` | ✅ | ✅ | ✅ | ✅ |
| `/patients/:id/edit` | ✅ | ✅ | ❌ | ❌ |
| `/igd` | ✅ | ✅ | ❌ | ❌ |
| `/igd/new-visit` | ✅ | ✅ | ❌ | ❌ |
| `/igd/visit/:id` | ✅ | ✅ | ❌ | ❌ |
| `/kasir` | ✅ | ❌ | ✅ | ❌ |
| `/kasir/visit/:id` | ✅ | ❌ | ✅ | ❌ |
| `/farmasi` | ✅ | ❌ | ❌ | ✅ |
| `/farmasi/visit/:id` | ✅ | ❌ | ❌ | ✅ |
| `/admin/users` | ✅ | ❌ | ❌ | ❌ |

---

## 🔄 User Flow Examples

### Flow 1: Register New Patient → Create Visit
```
/patients
  → Click [+ Tambah Pasien Baru]
    → /patients/new
      → Fill form & save
        → /patients/:id (detail page)
          → Click [+ Kunjungan Baru]
            → /igd/new-visit
              → Select patient & save
                → /igd/visit/:id (add services/prescriptions)
```

### Flow 2: Process Payment
```
/kasir (dashboard)
  → See unpaid visits list
    → Click visit to process
      → /kasir/visit/:id
        → Select payment method
          → Mark as paid
            → Patient gets receipt
```

### Flow 3: Dispense Medications
```
/farmasi (dashboard)
  → See pending prescriptions
    → Click visit to dispense
      → /farmasi/visit/:id
        → Review prescription list
          → Mark as dispensed
            → Patient receives medications
```

---

## 📝 File Location Reference

Quick reference for finding files:

```
PATIENT ROUTES:
- List:   app/patients/page.tsx
- New:    app/patients/new/page.tsx
- Detail: app/patients/[patientId]/page.tsx
- Edit:   app/patients/[patientId]/edit/page.tsx

IGD ROUTES:
- Dashboard: app/igd/page.tsx
- New Visit: app/igd/new-visit/page.tsx
- Visit:     app/igd/visit/[visitId]/page.tsx

KASIR ROUTES:
- Dashboard: app/kasir/page.tsx
- Payment:   app/kasir/visit/[visitId]/page.tsx

FARMASI ROUTES:
- Dashboard: app/farmasi/page.tsx
- Dispense:  app/farmasi/visit/[visitId]/page.tsx

ADMIN ROUTES:
- Users: app/admin/users/page.tsx

AUTH ROUTES:
- Login: app/login/page.tsx
```

---

## 🎯 Dynamic Routes Explained

### What is [patientId]?

- **Folder name**: `[patientId]` (with square brackets)
- **URL example**: `/patients/A2XuYi78k4phX6aBoFLe`
- **In code**: Accessed via `params.patientId`
- **Purpose**: Dynamic route that matches any patient ID

### What is [visitId]?

- **Folder name**: `[visitId]` (with square brackets)
- **URL example**: `/igd/visit/xyz123`
- **In code**: Accessed via `params.visitId`
- **Purpose**: Dynamic route that matches any visit ID

---

## ⚙️ Technical Notes

### File Naming Convention

**⚠️ IMPORTANT:** All route files MUST be named `page.tsx`

This is a Next.js 14 App Router requirement. You cannot rename them without breaking routing.

### Route Priority

1. Static routes (e.g., `/patients/new`)
2. Dynamic routes (e.g., `/patients/:id`)

That's why `/patients/new` must be a separate folder, not handled by `[patientId]`.

### Middleware

Protected routes use `middleware.ts` at the root to check authentication before allowing access.

---

## 🚀 Quick Navigation Tips

### In VS Code:

1. **Quick Open**: `Cmd/Ctrl + P` → Type filename
2. **Search in Files**: `Cmd/Ctrl + Shift + F` → Search for route
3. **Go to Definition**: Click URL in code → `Cmd/Ctrl + Click`

### Finding a Specific Route:

1. Look at URL structure
2. Match folder structure in `app/`
3. Find the `page.tsx` in that folder

**Example:**
- URL: `/patients/123/edit`
- File: `app/patients/[patientId]/edit/page.tsx`

---

## 📱 Mobile-Responsive Routes

All routes are mobile-responsive with Tailwind CSS:
- Tables scroll horizontally on small screens
- Forms stack vertically on mobile
- Buttons resize appropriately
- Navigation collapses on mobile

---

**Last Updated:** November 26, 2025

**Made with ❤️ for RS UNIPDU Medika**

