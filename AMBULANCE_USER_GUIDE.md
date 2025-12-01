# Ambulance Service - User Guide

## 🎯 Quick Start

**Adding an ambulance service is now as easy as 1-2-3!**

1. Select "11. AMBULANCE" category
2. Click "🚑 Tambah Layanan Ambulans"
3. Fill form → Calculate distance → Add to visit

---

## 📖 Step-by-Step Guide

### Step 1: Open Visit Editor

```
IGD Dashboard → Click on Visit → Scroll to "Tindakan & Biaya"
```

### Step 2: Select Ambulance Category

**For Rawat Inap visits:**

In the category dropdown, select:
```
11. AMBULANCE
```

You'll see a button appear:
```
┌──────────────────────────────────────┐
│  🚑 Tambah Layanan Ambulans          │
└──────────────────────────────────────┘
```

### Step 3: Click the Button

A modal will pop up with the ambulance form.

---

## 🚑 Ambulance Form

### What You'll See

```
┌─────────────────────────────────────────────────────────────┐
│ 🚑 Tambah Layanan Ambulans                                  │
│ Pilih jenis kendaraan, masukkan lokasi, dan hitung tarif   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Jenis Kendaraan *                 Jenis Layanan *          │
│ ┌─────────────────────┐          ┌─────────────────────┐   │
│ │ GRANDMAX           ▼│          │ PASIEN             ▼│   │
│ └─────────────────────┘          └─────────────────────┘   │
│                                                             │
│ Lokasi Penjemputan *                                        │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Jl. Sudirman No. 45, Ponorogo                         │   │
│ └───────────────────────────────────────────────────────┘   │
│ Masukkan alamat lengkap untuk perhitungan jarak akurat     │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │     📍 Hitung Jarak via Google Maps                   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Jarak Satu Arah        Jarak Pulang-Pergi              │ │
│ │ 5.3 km                 10.6 km                          │ │
│ │                                                         │ │
│ │ 🗺️ Lihat di Google Maps →                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Atau Masukkan Jarak Manual (km)                            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 5.3                                                   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Estimasi Biaya                                          │ │
│ │ Rp 62,462                                               │ │
│ │ * Sudah termasuk PPN dan semua komponen biaya          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────┐  ┌─────────────────┐                   │
│ │ ✓ Tambah ke     │  │ Batal           │                   │
│ │   Tagihan       │  │                 │                   │
│ └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Field Descriptions

### 1. Jenis Kendaraan (Vehicle Type)

**Options:**
- **GRANDMAX** - Standard ambulance
- **AMBULANS JENAZAH** - For deceased transport
- **PREGIO** - Larger vehicle

**How to Choose:**
- For patient transport → GRANDMAX
- For deceased → AMBULANS JENAZAH
- For multiple patients → PREGIO

### 2. Jenis Layanan (Service Type)

**Options:**
- **PASIEN** - Patient transport
- **JENAZAH** - Deceased transport
- **NON MEDIS** - Non-medical transport

**How to Choose:**
- Living patient → PASIEN
- Deceased → JENAZAH
- Equipment/supplies → NON MEDIS

### 3. Lokasi Penjemputan (Pickup Location)

**What to Enter:**
- Full street address
- Include street name, number, village
- Example: "Jl. Sudirman No. 45, Ponorogo"

**Tips:**
- Be as specific as possible
- Include landmarks if available
- City name will be added automatically

### 4. Calculate Distance

**Two Options:**

**Option A: Automatic (Recommended)**
```
Click "📍 Hitung Jarak via Google Maps"
↓
System calculates distance automatically
↓
Shows one-way and round-trip distance
↓
Provides Google Maps link for verification
```

**Option B: Manual**
```
Enter distance directly in "Jarak Manual" field
↓
Cost calculates automatically
```

### 5. Review Cost

**Displayed Information:**
- Estimated cost in Rupiah
- Includes all components:
  - Fuel (BBA)
  - Driver
  - Administration
  - Maintenance
  - Hospital service
  - Tax (PPN)

---

## ✅ Adding to Visit

### Final Step

1. **Review all information:**
   - Vehicle type correct?
   - Service type correct?
   - Distance accurate?
   - Cost acceptable?

2. **Click "✓ Tambah ke Tagihan"**

3. **Service added!**
   - Appears in services table
   - Total biaya updated
   - Can be edited/deleted like other services

---

## 🔍 What Gets Stored

When you add an ambulance service, the system stores:

✅ **Basic Info:**
- Vehicle type (GRANDMAX)
- Service type (PASIEN)
- Distance (5.3 km one-way)

✅ **Cost Breakdown:**
- Fuel cost (BBA)
- Driver cost
- Admin cost
- Maintenance cost
- Hospital service cost
- Tax (PPN)
- **Total**

✅ **Verification:**
- Google Maps URL (if used)
- Timestamp
- User who added

**Why This Matters:**
- Complete audit trail
- Can verify calculation anytime
- Transparent pricing
- Professional documentation

---

## 💡 Tips & Best Practices

### For Accurate Distance

✅ **DO:**
- Enter complete address
- Include street number
- Mention village/area
- Use landmarks if helpful

❌ **DON'T:**
- Use abbreviations
- Skip street number
- Be too vague
- Forget city name

### For Cost Accuracy

✅ **DO:**
- Use Google Maps when possible
- Verify distance makes sense
- Check Google Maps link
- Confirm with patient/family

❌ **DON'T:**
- Guess distance
- Round too much
- Skip verification
- Ignore patient input

### For Efficiency

✅ **DO:**
- Prepare address beforehand
- Have Google Maps open
- Know vehicle availability
- Confirm service type

❌ **DON'T:**
- Rush the process
- Skip distance calculation
- Forget to add to visit
- Ignore cost estimate

---

## 🆘 Troubleshooting

### "Google Maps not calculating"

**Possible Causes:**
- API key not configured
- Network issue
- Invalid address

**Solutions:**
1. Check address spelling
2. Try manual distance input
3. Contact IT if persistent

### "Cost seems wrong"

**Check:**
1. Distance correct?
2. Vehicle type correct?
3. Service type correct?
4. Pricing updated in system?

**If Still Wrong:**
- Contact administrator
- Check `/prices` page
- Verify configuration

### "Can't find ambulance button"

**Check:**
1. Is visit type "Rawat Inap"?
2. Is category "11. AMBULANCE"?
3. Is page loaded completely?

**If Not Visible:**
- Refresh page
- Check user permissions
- Contact IT support

### "Distance calculation fails"

**Fallback:**
1. Use manual distance input
2. Measure on Google Maps manually
3. Enter distance in km
4. Cost calculates automatically

---

## 📊 Example Scenarios

### Scenario 1: Local Transport

**Situation:**
- Patient in Ponorogo city
- Transport to hospital
- Short distance

**Steps:**
1. Vehicle: GRANDMAX
2. Service: PASIEN
3. Location: "Jl. Merdeka No. 10, Ponorogo"
4. Calculate: ~2 km
5. Cost: ~Rp 30,000

### Scenario 2: Inter-City Transport

**Situation:**
- Patient in Madiun
- Transport to RS UNIPDU
- Long distance

**Steps:**
1. Vehicle: GRANDMAX or PREGIO
2. Service: PASIEN
3. Location: "Jl. Pahlawan No. 25, Madiun"
4. Calculate: ~40 km
5. Cost: ~Rp 250,000

### Scenario 3: Deceased Transport

**Situation:**
- Deceased from hospital
- Transport to family home
- Medium distance

**Steps:**
1. Vehicle: AMBULANS JENAZAH
2. Service: JENAZAH
3. Location: "Desa Kauman, Ponorogo"
4. Calculate: ~8 km
5. Cost: ~Rp 80,000

---

## 📱 Quick Reference Card

```
┌─────────────────────────────────────────────┐
│ AMBULANCE SERVICE - QUICK REFERENCE         │
├─────────────────────────────────────────────┤
│                                             │
│ 1. Select "11. AMBULANCE" category         │
│ 2. Click "🚑 Tambah Layanan Ambulans"      │
│ 3. Choose vehicle & service type           │
│ 4. Enter pickup location                   │
│ 5. Click "📍 Hitung Jarak"                 │
│ 6. Review cost                              │
│ 7. Click "✓ Tambah ke Tagihan"             │
│                                             │
│ VEHICLES:                                   │
│ • GRANDMAX - Standard                       │
│ • AMBULANS JENAZAH - Deceased               │
│ • PREGIO - Large                            │
│                                             │
│ SERVICES:                                   │
│ • PASIEN - Patient                          │
│ • JENAZAH - Deceased                        │
│ • NON MEDIS - Equipment                     │
│                                             │
│ TIPS:                                       │
│ ✓ Use full address                          │
│ ✓ Verify distance                           │
│ ✓ Check cost estimate                       │
│ ✓ Save Google Maps link                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## ✅ Checklist

Before adding ambulance service:

- [ ] Patient/family confirmed need
- [ ] Pickup location known
- [ ] Vehicle type determined
- [ ] Service type confirmed
- [ ] Distance verified
- [ ] Cost approved

After adding:

- [ ] Service appears in table
- [ ] Total biaya updated
- [ ] Metadata complete
- [ ] Google Maps link saved (if used)
- [ ] Patient/family informed of cost

---

## 🎓 Training Notes

### For New Staff

**Key Points:**
1. Always use Google Maps when available
2. Verify distance with patient/family
3. Confirm cost before adding
4. Save Google Maps link for records
5. Double-check vehicle/service type

**Common Mistakes:**
- Forgetting to calculate distance
- Wrong vehicle type
- Incomplete address
- Not verifying cost
- Skipping Google Maps link

**Best Practices:**
- Prepare information first
- Use checklist above
- Verify with supervisor if unsure
- Document everything
- Keep Google Maps link

---

## 📞 Support

**Need Help?**
- Check this guide first
- Try troubleshooting section
- Contact IT support
- Ask supervisor
- Check documentation folder

**For Technical Issues:**
- API key problems → IT department
- Pricing errors → Administrator
- System bugs → IT support
- Training → Supervisor

---

## 🎉 Summary

**Ambulance service is now:**
- ✅ Easy to add (3 clicks)
- ✅ Automatic distance (Google Maps)
- ✅ Accurate pricing (real-time)
- ✅ Fully documented (audit trail)
- ✅ User friendly (intuitive interface)

**Remember:**
1. Select AMBULANCE category
2. Click ambulance button
3. Fill form completely
4. Calculate distance
5. Add to visit

**That's it!** 🚑✨

---

**For detailed technical documentation, see:**
- `AMBULANCE_VISIT_INTEGRATION_COMPLETE.md`
- `GOOGLE_MAPS_SETUP_GUIDE.md`
- `AMBULANCE_EDITABLE_COMPLETE_SUMMARY.md`

