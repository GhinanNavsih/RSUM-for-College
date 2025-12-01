# 🚀 Quick Migration Guide - 5 Minutes

## Step-by-Step (Copy & Paste)

### 1️⃣ Access Migration Page
```
http://localhost:3000/admin/migrate
```
(Login as Admin if needed)

### 2️⃣ Click Button
```
▶️ Start Migration
```
Wait 10-30 seconds...

### 3️⃣ Verify Success
```
✅ Migration Complete!
📊 Total: X | Success: X | Failed: 0
```

### 4️⃣ Check Result
```
Go to: /prices
Select: "7. BHP (OBAT & ALKES)"
See: All your drugs listed
```

### 5️⃣ Test
```
Create Rawat Inap visit
Select: "7. BHP (OBAT & ALKES)"
See: Dropdown with drugs
Select drug → Auto-fills price
```

### 6️⃣ Delete Migration Page
```bash
rm -rf app/admin/migrate
```

## ✅ Done!

Your drugs are now in the unified pricing system under category 7!

---

## What Changed

| Before | After |
|--------|-------|
| Drugs in separate page | Drugs in unified pricing (category 7) |
| Manual price entry | Dropdown with auto-fill |
| Separate management | Centralized pricing |

## What Didn't Change

✅ Stock tracking still works  
✅ Prescriptions still work  
✅ Farmasi workflow unchanged  
✅ Drug database still exists  

---

## Quick Test

```
1. /prices → Category 7 → See drugs ✓
2. Rawat Inap visit → Category 7 → Dropdown works ✓
3. Prescription → Still works ✓
4. Delete migration page ✓
```

## Need Help?

Read: `MIGRATION_INSTRUCTIONS.md` for detailed guide

---

**Total Time: ~5 minutes** ⏱️  
**Difficulty: Easy** 😊  
**Risk: None (non-destructive)** ✅

