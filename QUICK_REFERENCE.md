# 🚀 Quick Reference Guide - RSUM System

## ⚡ Common Commands

### Development
```bash
# Start development server
npm run dev

# Start on different port
npm run dev -- -p 3001

# Build for production
npm run build

# Run production build locally
npm start

# Check for errors
npm run lint
```

### Git Commands (if using version control)
```bash
# Initialize git
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Create .gitignore (already included)
# Make sure .env.local is in .gitignore!
```

## 🔑 Default Login Credentials

| Role    | Email             | Password   | Access                          |
|---------|-------------------|------------|---------------------------------|
| Admin   | admin@rsum.com    | admin123   | Full access to all features     |
| IGD     | igd@rsum.com      | igd123     | Patient & visit management      |
| Kasir   | kasir@rsum.com    | kasir123   | Payment processing              |
| Farmasi | farmasi@rsum.com  | farmasi123 | Prescription dispensation       |

## 📱 Page Routes

### Public Routes
- `/login` - Login page

### Protected Routes (requires authentication)

#### Patient Management
- `/patients` - List all patients
- `/patients/new` - Create new patient (IGD/Admin only)
- `/patients/[id]` - Patient detail & visit history

#### IGD Module (IGD/Admin only)
- `/igd` - IGD dashboard
- `/igd/new-visit` - Create new visit
- `/igd/visit/[id]` - Visit detail (add services & prescriptions)

#### Kasir Module (Kasir/Admin only)
- `/kasir` - List unpaid visits
- `/kasir/visit/[id]` - Process payment

#### Farmasi Module (Farmasi/Admin only)
- `/farmasi` - List pending prescriptions
- `/farmasi/visit/[id]` - Dispense prescriptions

#### Admin Module (Admin only)
- `/admin/users` - User management

## 🗂️ Key Files to Know

### Configuration
| File                   | Purpose                          |
|------------------------|----------------------------------|
| `.env.local`          | Firebase credentials (KEEP SECRET!) |
| `package.json`        | Dependencies & scripts           |
| `tsconfig.json`       | TypeScript configuration         |
| `tailwind.config.ts`  | Tailwind CSS settings            |

### Core Application
| File/Folder           | Purpose                          |
|-----------------------|----------------------------------|
| `app/layout.tsx`     | Root layout, AuthProvider        |
| `app/page.tsx`       | Home page (redirects by role)    |
| `contexts/AuthContext.tsx` | Auth state management      |
| `lib/firebase.ts`    | Firebase initialization          |
| `lib/firestore.ts`   | Database operations (CRUD)       |
| `types/models.ts`    | TypeScript type definitions      |

## 🔥 Firestore Collections

### patients
```typescript
{
  id: string,           // Auto-generated
  noRM: string,         // "RM-2024-001"
  nama: string,         // "John Doe"
  tanggalLahir: string, // "1990-01-01"
  umur: number,         // 34
  alamat: string,
  noTelp: string,       // "08123456789"
  asuransi: string,     // "BPJS" | "Pribadi"
  // ... timestamps
}
```

### visits
```typescript
{
  id: string,
  patientId: string,    // Reference to patient
  dokter: string,
  status: string,       // "igd_in_progress" | "igd_done"
  services: [...],      // Array of services
  prescriptions: [...], // Array of prescriptions
  totalBiaya: number,
  paymentStatus: string, // "unpaid" | "paid"
  dispensationStatus: string, // "pending" | "done"
  // ... timestamps
}
```

### users
```typescript
{
  id: string,          // Firebase Auth UID
  email: string,
  displayName: string,
  role: string,        // "admin" | "igd" | "kasir" | "farmasi"
  // ... timestamps
}
```

## 🎨 Reusable Components

```tsx
// Button
<Button variant="primary">Click Me</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Save</Button>

// Input
<Input
  label="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter name"
  required
/>

// Select
<Select
  label="Role"
  value={role}
  onChange={(e) => setRole(e.target.value)}
  options={[
    { value: 'admin', label: 'Admin' },
    { value: 'igd', label: 'IGD' }
  ]}
/>

// Badge
<Badge color="bg-green-100 text-green-800">
  Lunas
</Badge>

// Card
<Card title="Patient Info">
  <p>Content here</p>
</Card>

// Loading
<LoadingSpinner size="lg" />
```

## 🛠️ Common Tasks

### Add a New Patient
1. Login as IGD or Admin
2. Go to `/patients`
3. Click "Tambah Pasien Baru"
4. Fill form and save

### Create a Visit
1. Login as IGD or Admin
2. Go to `/igd`
3. Click "Kunjungan Baru"
4. Select patient and doctor
5. Save

### Add Services & Prescriptions
1. Go to `/igd/visit/[visitId]`
2. Add services (tindakan) for billing
3. Add prescriptions (resep) for pharmacy
4. Click "Selesai & Kirim ke Kasir/Farmasi"

### Process Payment
1. Login as Kasir or Admin
2. Go to `/kasir`
3. Click "Proses Bayar" on a visit
4. Select payment method
5. Confirm payment

### Dispense Drugs
1. Login as Farmasi or Admin
2. Go to `/farmasi`
3. Click "Proses" on a prescription
4. Verify drugs are ready
5. Confirm dispensation

### Manage Users
1. Login as Admin
2. Go to `/admin/users`
3. Click "Edit Role" on a user
4. Select new role and save

## 🚨 Troubleshooting Quick Fixes

### Login Issues
```bash
# Check Firebase Auth users exist
# Check Firestore users collection has matching documents
# Check .env.local has correct credentials
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

### Firestore Permission Denied
```bash
# Check Firestore Rules in Firebase Console
# Should allow authenticated users
# rules_version = '2';
# service cloud.firestore {
#   match /databases/{database}/documents {
#     match /{document=**} {
#       allow read, write: if request.auth != null;
#     }
#   }
# }
```

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📊 Data Flow Cheat Sheet

```
Patient → Visit → Services → Payment (Kasir)
              └→ Prescriptions → Dispensation (Farmasi)
```

**Visit Statuses:**
- `igd_in_progress` → IGD still working
- `igd_done` → Ready for Kasir/Farmasi

**Payment Statuses:**
- `unpaid` → Waiting for payment
- `paid` → Payment completed

**Dispensation Statuses:**
- `pending` → Waiting for drugs
- `done` → Drugs dispensed

## 🔐 Environment Variables Template

```env
# Copy this to .env.local and fill with your values
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 📞 Where to Get Help

1. **Error Messages**: Read them carefully - they usually tell you what's wrong
2. **Firebase Console**: Check Authentication, Firestore for data issues
3. **Browser Console**: Press F12, check Console tab for errors
4. **Network Tab**: Check if API calls are working
5. **README.md**: Comprehensive documentation
6. **SETUP_GUIDE.md**: Step-by-step setup instructions
7. **ARCHITECTURE.md**: System architecture & data flow

## 💡 Pro Tips

1. **Always check user is logged in** before accessing protected pages
2. **Use Chrome DevTools** to debug (F12)
3. **Check Firestore Console** to verify data is saved
4. **Clear browser cache** if styles look broken
5. **Restart dev server** after changing .env.local
6. **Use TypeScript** - it catches errors early!
7. **Read error messages** - they're your friends!

## 🎯 Quick Testing Checklist

- [ ] Can login with all 4 roles
- [ ] Can create new patient
- [ ] Can create new visit
- [ ] Can add services to visit
- [ ] Can add prescriptions to visit
- [ ] Can process payment as Kasir
- [ ] Can dispense drugs as Farmasi
- [ ] Can manage users as Admin
- [ ] Can print receipts/prescriptions
- [ ] All pages load without errors

---

**Keep this file handy for quick reference! 📌**

