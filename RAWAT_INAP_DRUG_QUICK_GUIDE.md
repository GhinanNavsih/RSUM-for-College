# 🏥 Quick Guide: Adding Drugs to Rawat Inap

## ⚡ Quick Reference

### IGD / Rawat Jalan
```
Use: "Resep Obat" section ✓
(No changes - works as before)
```

### Rawat Inap
```
Use: "7. BHP (OBAT & ALKES)" category ✓
(New - drugs are now part of billing items)
```

---

## 📋 Step-by-Step: Adding Drugs to Rawat Inap

### Step 1: Select Category
```
┌─────────────────────────────────────┐
│ Category: [7. BHP (OBAT & ALKES) ▼] │
└─────────────────────────────────────┘
```

### Step 2: Select Drug
```
┌─────────────────────────────────────────────────┐
│ Drug: [Paracetamol 500mg - Rp 1,000/Tablet ▼]  │
└─────────────────────────────────────────────────┘
```
*Auto-fills: Name, Price, Unit*

### Step 3: Enter Details
```
┌──────────────┬──────────┬──────┬──────────┐
│ Dokter       │ Unit     │ Qty  │ Tarif    │
│ (optional)   │ Tablet   │ 10   │ 1,000    │
└──────────────┴──────────┴──────┴──────────┘
```

### Step 4: Add Dosage (Optional)
```
┌─────────────────────────────────────────────────┐
│ Catatan: 3x1 sehari sesudah makan              │
└─────────────────────────────────────────────────┘
```

### Step 5: Add to Billing
```
┌───────────────────────┐
│ + Tambah Tindakan     │
└───────────────────────┘
```

---

## 📊 Result Display

### In Billing Table

```
7. BHP (OBAT & ALKES)
┌──────────────────┬────────┬────────┬─────┬──────────┬────────────┐
│ Tindakan         │ Dokter │ Unit   │ Qty │ Tarif    │ Subtotal   │
├──────────────────┼────────┼────────┼─────┼──────────┼────────────┤
│ Paracetamol      │ -      │ Tablet │ 10  │ Rp 1,000 │ Rp 10,000  │
│ 500mg            │        │        │     │          │            │
│ 3x1 sehari       │        │        │     │          │            │
├──────────────────┼────────┼────────┼─────┼──────────┼────────────┤
│ Amoxicillin      │ -      │ Kapsul │ 15  │ Rp 2,500 │ Rp 37,500  │
│ 500mg            │        │        │     │          │            │
│ 3x1 sehari       │        │        │     │          │            │
└──────────────────┴────────┴────────┴─────┴──────────┴────────────┘
```

---

## 💡 Tips

### ✅ DO
- Use "7. BHP (OBAT & ALKES)" for Rawat Inap drugs
- Add dosage instructions in "Catatan" field
- Select drugs from dropdown for auto-fill
- Include medical supplies (infus, bandage) in same category

### ❌ DON'T
- Look for "Resep Obat" section in Rawat Inap (it's hidden)
- Manually type drug prices (use dropdown)
- Forget to add dosage in "Catatan"

---

## 🔍 Where to Find What

### For IGD/Rawat Jalan Visits
```
Scroll down → Find "Resep Obat" section
```

### For Rawat Inap Visits
```
"Tindakan & Biaya" section → 
Select "7. BHP (OBAT & ALKES)" category →
Select drug from dropdown
```

---

## ℹ️ Info Message

When editing Rawat Inap, you'll see:

```
┌─────────────────────────────────────────────────┐
│ ℹ️ Resep Obat untuk Rawat Inap                  │
│                                                 │
│ Untuk pasien Rawat Inap, obat-obatan diinput   │
│ melalui kategori "7. BHP (OBAT & ALKES)" di     │
│ bagian "Tindakan & Biaya" di atas.             │
└─────────────────────────────────────────────────┘
```

---

## 📝 Example: Complete Entry

```
Category:  7. BHP (OBAT & ALKES)
Drug:      Paracetamol 500mg - Rp 1,000/Tablet
Dokter:    (leave empty)
Unit:      Tablet (auto-filled)
Qty:       10
Tarif:     1000 (auto-filled)
Catatan:   3x1 sehari sesudah makan

Result:
✓ Paracetamol 500mg
  10 Tablet × Rp 1,000 = Rp 10,000
  Note: 3x1 sehari sesudah makan
```

---

## 🎯 Quick Comparison

| Item | IGD/Rawat Jalan | Rawat Inap |
|------|-----------------|------------|
| **Section** | "Resep Obat" | "Tindakan & Biaya" |
| **Category** | N/A | "7. BHP (OBAT & ALKES)" |
| **Input** | Dedicated form | Same as other services |
| **Display** | Separate table | Grouped by category |

---

## ✅ Checklist

Before adding drugs to Rawat Inap:

- [ ] Visit type is "Rawat Inap"
- [ ] In "Tindakan & Biaya" section
- [ ] Selected "7. BHP (OBAT & ALKES)" category
- [ ] Drug selected from dropdown
- [ ] Quantity entered
- [ ] Dosage added in "Catatan"
- [ ] Clicked "Tambah Tindakan"

---

## 🆘 Troubleshooting

**Q: I don't see "Resep Obat" section**  
A: ✓ Correct! For Rawat Inap, use "7. BHP (OBAT & ALKES)" instead

**Q: Dropdown is empty**  
A: Go to Database Harga → "7. BHP (OBAT & ALKES)" → Add drugs first

**Q: Where do I add dosage?**  
A: Use the "Catatan" field (e.g., "3x1 sehari sesudah makan")

**Q: Can I add non-drug items?**  
A: Yes! BHP includes both drugs and medical supplies

---

## 🚀 Ready to Use!

**For Rawat Inap:**
1. Select category "7. BHP (OBAT & ALKES)"
2. Choose drug from dropdown
3. Enter quantity
4. Add dosage in notes
5. Click "Tambah Tindakan"

**Done!** 🎉

