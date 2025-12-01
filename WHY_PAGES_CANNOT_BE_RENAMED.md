# ⚠️ Why page.tsx Files Cannot Be Renamed in Next.js App Router

## 🚨 CRITICAL: File Naming in Next.js 14 App Router

### The Rule: **page.tsx MUST be named page.tsx**

In Next.js 14 with the App Router, the file name `page.tsx` is **NOT arbitrary** - it's a **routing convention** that the framework requires.

---

## 🔍 How Next.js App Router Works

Next.js uses **file-system based routing** where the folder structure and specific file names determine your routes:

### File Name Conventions:

| File Name | Purpose | Required? |
|-----------|---------|-----------|
| `page.tsx` | Creates a route that is publicly accessible | YES (for routes) |
| `layout.tsx` | Shared UI wrapper for routes | Optional |
| `loading.tsx` | Loading UI | Optional |
| `error.tsx` | Error UI | Optional |
| `not-found.tsx` | 404 UI | Optional |
| `route.ts` | API endpoint | Optional |

---

## ❌ What Happens If You Rename page.tsx?

### Example: Renaming to patientpage.tsx

```
app/
  patients/
    patientpage.tsx  ❌ WRONG
```

**Result:**
- ❌ Route `/patients` will NOT exist
- ❌ Visiting `http://localhost:3000/patients` shows 404
- ❌ The file is completely ignored by Next.js router
- ❌ Your app breaks

### Correct Way:

```
app/
  patients/
    page.tsx  ✅ CORRECT
```

**Result:**
- ✅ Route `/patients` exists
- ✅ Visiting `http://localhost:3000/patients` works
- ✅ Next.js recognizes and routes to this file

---

## 📂 Current Project Structure (CANNOT BE CHANGED)

```
app/
  ├── page.tsx                           → Route: /
  ├── login/
  │   └── page.tsx                       → Route: /login
  ├── patients/
  │   ├── page.tsx                       → Route: /patients (LIST)
  │   ├── new/
  │   │   └── page.tsx                   → Route: /patients/new (CREATE)
  │   └── [patientId]/
  │       ├── page.tsx                   → Route: /patients/:id (DETAIL)
  │       └── edit/
  │           └── page.tsx               → Route: /patients/:id/edit (EDIT)
  ├── igd/
  │   ├── page.tsx                       → Route: /igd (DASHBOARD)
  │   ├── new-visit/
  │   │   └── page.tsx                   → Route: /igd/new-visit
  │   └── visit/
  │       └── [visitId]/
  │           └── page.tsx               → Route: /igd/visit/:id
  ├── kasir/
  │   ├── page.tsx                       → Route: /kasir (DASHBOARD)
  │   └── visit/
  │       └── [visitId]/
  │           └── page.tsx               → Route: /kasir/visit/:id
  ├── farmasi/
  │   ├── page.tsx                       → Route: /farmasi (DASHBOARD)
  │   └── visit/
  │       └── [visitId]/
  │           └── page.tsx               → Route: /farmasi/visit/:id
  └── admin/
      └── users/
          └── page.tsx                   → Route: /admin/users
```

**Each `page.tsx` MUST keep that name or the route breaks!**

---

## ✅ SOLUTION: Use Comments to Identify Pages

Since we can't rename the files, we add clear comments at the top of each file:

### Example for /patients/page.tsx:

```typescript
/**
 * PATIENT LIST PAGE
 * Route: /patients
 * Purpose: Display all patients in a table with search functionality
 * Access: All authenticated users
 */
'use client';

import { useEffect, useState } from 'react';
// ... rest of code
```

### Example for /patients/new/page.tsx:

```typescript
/**
 * NEW PATIENT PAGE (Patient Registration)
 * Route: /patients/new
 * Purpose: Form to register a new patient
 * Access: Admin, IGD only
 */
'use client';

import { useState } from 'react';
// ... rest of code
```

### Example for /patients/[patientId]/page.tsx:

```typescript
/**
 * PATIENT DETAIL PAGE
 * Route: /patients/:id
 * Purpose: Display complete patient information
 * Access: All authenticated users
 */
'use client';

import { useEffect, useState } from 'react';
// ... rest of code
```

---

## 📚 Official Next.js Documentation

From [Next.js App Router Documentation](https://nextjs.org/docs/app/building-your-application/routing):

> "A **page** is UI that is unique to a route. You can define pages by exporting a component from a **page.js** file."

> "Pages are **Server Components** by default but can be set to a Client Component."

> "The file name **must** be **page.js** (or .jsx, .tsx)"

---

## 🎯 Best Practices for Organization

### 1. **Use Clear Folder Names**

The folder name is what shows in the URL, so make it descriptive:

```
✅ GOOD:
app/patients/new/page.tsx         → /patients/new
app/igd/new-visit/page.tsx        → /igd/new-visit

❌ BAD:
app/p/n/page.tsx                  → /p/n (unclear)
```

### 2. **Add Header Comments**

Add a descriptive comment block at the top of every `page.tsx`:

```typescript
/**
 * PAGE IDENTIFICATION
 * Route: [URL path]
 * Purpose: [What this page does]
 * Access: [Who can access]
 * Features: [Key features]
 */
```

### 3. **Use Component Files with Clear Names**

For reusable components, you CAN use descriptive names:

```
components/
  ├── PatientTable.tsx          ✅ Clear name
  ├── PatientForm.tsx           ✅ Clear name
  ├── VisitCard.tsx             ✅ Clear name
  └── Button.tsx                ✅ Clear name
```

### 4. **Create a Route Map Document**

Create a `ROUTES.md` file documenting all routes:

```markdown
# Application Routes

## Patient Routes
- `/patients` - Patient list
- `/patients/new` - Create new patient
- `/patients/:id` - Patient detail
- `/patients/:id/edit` - Edit patient

## IGD Routes
- `/igd` - IGD dashboard
- `/igd/new-visit` - Create new visit
- `/igd/visit/:id` - Visit detail
```

---

## 💡 Why This Design?

### Advantages of File-Based Routing:

1. **Convention over Configuration**
   - No need to maintain separate route config
   - File structure = URL structure
   - Easy to understand

2. **Automatic Code Splitting**
   - Each page is automatically code-split
   - Faster page loads

3. **Type Safety**
   - TypeScript knows about routes
   - Compiler catches broken links

4. **Co-location**
   - Page code lives with its route
   - Easy to find and maintain

---

## 🚀 Summary

### What You CANNOT Do:
❌ Rename `page.tsx` to anything else  
❌ Use custom file names for routes  
❌ Change the file naming convention  

### What You CAN Do:
✅ Add descriptive comments in each file  
✅ Use clear folder names  
✅ Create documentation mapping routes  
✅ Name component files however you want  
✅ Organize with clear folder structure  

---

## 📖 Alternative: Use IDE Features

Most modern IDEs (VS Code, WebStorm) show the full file path in the tab:

```
Instead of just: page.tsx
You see: patients/new/page.tsx
```

### VS Code Settings:

```json
{
  "workbench.editor.labelFormat": "medium"
}
```

This shows more context in file tabs.

---

## ✅ Conclusion

**You MUST keep the name `page.tsx`** - it's not optional in Next.js App Router.

Instead, use:
- Clear comments at the top of each file
- Descriptive folder names
- Route documentation
- IDE settings to show full paths

This is a **framework requirement**, not a project choice. All Next.js 14 App Router projects work this way!

---

**Last Updated:** November 26, 2025

**Made with ❤️ for RS UNIPDU Medika**

