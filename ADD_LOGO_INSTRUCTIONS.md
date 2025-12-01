# 🖼️ Quick Guide: Adding RSUM Logo to PDF Invoice

## 📌 Simple 2-Step Process

### Step 1: Save the Logo File

Save your RSUM logo image (the one you showed in the mockup) to:

```
/Users/fajrulnuha/Documents/RSUM/public/rsum-logo.png
```

**File Requirements:**
- **Filename:** `rsum-logo.png` (or any name you prefer)
- **Format:** PNG (with transparent background recommended)
- **Size:** At least 500×500 pixels
- **Location:** Must be in the `public` folder

---

### Step 2: Uncomment Logo Code

Open this file:
```
components/InvoicePDF.tsx
```

Find and **UNCOMMENT** these three sections:

#### 1. Watermark Logo (around line 144):

**Find this:**
```typescript
{/* <Image
  style={styles.watermark}
  src="/rsum-logo.png"
/> */}
```

**Change to:**
```typescript
<Image
  style={styles.watermark}
  src="/rsum-logo.png"
/>
```

---

#### 2. Left Logo (around line 149):

**Find this:**
```typescript
{/* <Image
  style={styles.logo}
  src="/rsum-logo.png"
/> */}
```

**Change to:**
```typescript
<Image
  style={styles.logo}
  src="/rsum-logo.png"
/>
```

---

#### 3. Right Logo (around line 168):

**Find this:**
```typescript
{/* <Image
  style={styles.logo}
  src="/rsum-logo.png"
/> */}
```

**Change to:**
```typescript
<Image
  style={styles.logo}
  src="/rsum-logo.png"
/>
```

---

## ✅ That's It!

After doing these 2 steps:

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Test the PDF:**
   - Go to Kasir → Open any visit
   - Click [🖨️ Cetak Nota]
   - PDF should download with logos! ✓

---

## 🎨 Logo Placement

```
┌─────────────────────────────────────────────────┐
│ [LOGO]  RUMAH SAKIT UNIPDU MEDIKA      [LOGO]  │
│         Jl. Raya Peterongan...                  │
│                                                  │
│              [WATERMARK LOGO]                   │
│              (in background,                     │
│               light/transparent)                 │
│                                                  │
│              Rincian Biaya                       │
│         ┌──────────────────────┐                │
│         │ Services & Drugs     │                │
│         └──────────────────────┘                │
└──────────────────────────────────────────────────┘
```

- **Left Logo:** 80×80pt in header
- **Right Logo:** 80×80pt in header
- **Watermark:** 300×300pt in center, 10% opacity

---

## 🔧 If Using Different Filename

If you saved the logo as something else (e.g., `logo.png`, `hospital.png`):

**Update all three src attributes:**
```typescript
src="/logo.png"          // if file is public/logo.png
src="/hospital.png"      // if file is public/hospital.png
src="/images/logo.png"   // if file is public/images/logo.png
```

---

## ❓ Troubleshooting

### Logo Not Showing?

1. **Check file location:**
   - Must be in `public` folder
   - NOT in `public/assets` or other subfolders
   - File: `/Users/fajrulnuha/Documents/RSUM/public/rsum-logo.png`

2. **Check filename in code:**
   - Must match actual filename
   - Case-sensitive!
   - Must start with `/`

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Check browser console:**
   - Open PDF generation
   - Press F12 → Console
   - Look for image loading errors

---

**Status:** 📝 Ready for logo file

**Next:** Save logo and uncomment code!

**Made with ❤️ for RS UNIPDU Medika**

