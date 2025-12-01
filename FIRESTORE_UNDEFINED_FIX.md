# Firestore Undefined Values Fix

## Problem

When calling `updateDoc()` from Firestore with objects containing `undefined` values, it throws an error:

```
FirebaseError: Function updateDoc() called with invalid data. 
Unsupported field value: undefined
```

This happened when updating visits with optional fields like `unit`, `dokter`, `notes` that could be `undefined`, especially in nested objects within arrays (like the `services` array).

## Root Cause

Firestore's `updateDoc()` function does not accept `undefined` values. When we pass an object like:

```typescript
{
  nama: "Service Name",
  harga: 50000,
  unit: undefined,  // ❌ This causes the error
  dokter: undefined, // ❌ This causes the error
}
```

Firestore throws an error because it doesn't know how to handle `undefined` values.

## Solution

Created a **deep cleaning function** that recursively removes all `undefined` values from objects, nested objects, and arrays:

```typescript
// Helper function to recursively remove undefined values
const removeUndefinedValues = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    });
    return cleaned;
  }
  
  return obj;
};

export const updateVisit = async (id: string, data: Partial<Visit>) => {
  const docRef = doc(db, 'visits', id);
  
  // Deep clean to remove all undefined values (including nested objects/arrays)
  const cleanData = removeUndefinedValues(data);
  
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
};
```

## Files Fixed

Applied the fix to all `update` functions in `lib/firestore.ts`:

1. ✅ `updatePatient()` - Fixed
2. ✅ `updateVisit()` - Fixed
3. ✅ `updateDrug()` - Fixed
4. ✅ `updateDoctor()` - Fixed

## How It Works

### Before (Causes Error)
```typescript
const data = {
  services: [
    {
      id: "abc",
      nama: "Service",
      harga: 50000,
      unit: undefined,  // ❌ Error in nested object!
      dokter: undefined, // ❌ Error in nested object!
    }
  ]
};

await updateDoc(docRef, data); // ❌ FirebaseError!
```

### After (Works Correctly)
```typescript
const data = {
  services: [
    {
      id: "abc",
      nama: "Service",
      harga: 50000,
      unit: undefined,
      dokter: undefined,
    }
  ]
};

// Deep clean recursively removes undefined from nested structures
const cleanData = removeUndefinedValues(data);
// Result:
// {
//   services: [
//     {
//       id: "abc",
//       nama: "Service",
//       harga: 50000
//     }
//   ]
// }

await updateDoc(docRef, cleanData); // ✅ Works!
```

## Why This Happened

When adding the edit service feature, we pass optional fields that may be `undefined`:

```typescript
const service: VisitService = {
  id: uuidv4(),
  nama: newService.nama,
  harga: parseFloat(newService.harga),
  quantity: parseInt(newService.quantity) || 1,
  category: newService.category,
  unit: newService.unit || undefined,      // Could be undefined
  dokter: newService.dokter || undefined,  // Could be undefined
  notes: newService.notes || undefined,    // Could be undefined
};
```

When updating the visit with these services, Firestore received `undefined` values **inside the services array** and threw an error. A simple shallow filter wasn't enough - we needed **deep cleaning** to handle nested objects and arrays.

## Testing

After the fix:
- ✅ Adding services with empty optional fields works
- ✅ Editing services works
- ✅ Updating visits works
- ✅ Updating patients works
- ✅ Updating drugs works
- ✅ Updating doctors works

## Best Practice

**Always deep clean to remove `undefined` values before calling Firestore `updateDoc()`:**

```typescript
// Good pattern - Deep cleaning for nested structures
const removeUndefinedValues = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    });
    return cleaned;
  }
  
  return obj;
};

const cleanData = removeUndefinedValues(data);
await updateDoc(docRef, cleanData);
```

## Alternative Solutions

### Option 1: Use `null` instead of `undefined`
```typescript
unit: newService.unit || null,  // Use null instead of undefined
```

**Pros:** Simple  
**Cons:** Stores `null` in database, takes up space

### Option 2: Deep clean before calling (Our choice)
```typescript
// Recursively filter undefined values in the update function
const cleanData = removeUndefinedValues(data);
```

**Pros:** Clean, no extra data in database, handles nested structures  
**Cons:** Requires recursive filtering logic

### Option 3: Only pass defined fields
```typescript
const service: any = {
  id: uuidv4(),
  nama: newService.nama,
  harga: parseFloat(newService.harga),
};

if (newService.unit) service.unit = newService.unit;
if (newService.dokter) service.dokter = newService.dokter;
```

**Pros:** Explicit  
**Cons:** Verbose, error-prone

**We chose Option 2** because it's clean, centralized, handles nested structures (arrays and objects), and doesn't pollute the database with `null` values.

## Summary

✅ **Problem:** Firestore `updateDoc()` doesn't accept `undefined` values (even in nested objects/arrays)  
✅ **Solution:** Deep clean to recursively remove all `undefined` values before updating  
✅ **Impact:** All update functions now work correctly with nested structures  
✅ **Status:** Fixed and tested  

The application now handles optional fields gracefully, even in complex nested structures like the `services` array, without causing Firestore errors.

