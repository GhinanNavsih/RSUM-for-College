# 🎨 "Pasien Sendiri" Checkbox - Visual UI Guide

## 📱 How It Looks in the Form

### Section: Informasi Penanggung Jawab

```
┌─────────────────────────────────────────────────────────────────┐
│ Informasi Penanggung Jawab                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💙 [Light Blue Background Box]                              │ │
│ │                                                              │ │
│ │  ☑️  Pasien datang sendiri dan dapat membuat               │ │
│ │     keputusan medis/hukum sendiri                           │ │
│ │                                                              │ │
│ │     ℹ️ Centang jika pasien tidak memerlukan                │ │
│ │        penanggung jawab                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────┐  ┌─────────────────────────┐ │
│  │ Nama Penanggung Jawab *      │  │ Hubungan Penanggung     │ │
│  │ ┌──────────────────────────┐ │  │ Jawab *                 │ │
│  │ │ [Auto-filled when ✓]     │ │  │ ┌─────────────────────┐ │ │
│  │ └──────────────────────────┘ │  │ │ [Pasien Sendiri]    │ │ │
│  └──────────────────────────────┘  │ └─────────────────────┘ │ │
│                                     └─────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Kontak Penanggung Jawab *                                │  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ [Auto-filled when ✓]                                 │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Changes: Before vs After

### State 1: Checkbox UNCHECKED (Default)

```
┌─────────────────────────────────────────────────┐
│  ☐  Pasien datang sendiri...                    │
│     (Checkbox is empty - NOT checked)            │
└─────────────────────────────────────────────────┘

Fields Status:
✅ Nama Penanggung Jawab: ENABLED (white background)
✅ Hubungan: ENABLED, dropdown shows "Orang Tua"
✅ Kontak: ENABLED (white background)

User must manually fill all three fields.
```

### State 2: Checkbox CHECKED

```
┌─────────────────────────────────────────────────┐
│  ☑️  Pasien datang sendiri...                   │
│     (Checkbox has checkmark - IS checked)        │
└─────────────────────────────────────────────────┘

Fields Status:
🔒 Nama Penanggung Jawab: DISABLED (grayed out)
   Auto-filled with: Patient's full name
   
🔒 Hubungan: DISABLED (grayed out)
   Auto-set to: "Pasien Sendiri"
   
🔒 Kontak: DISABLED (grayed out)
   Auto-filled with: Patient's phone number

User CANNOT edit these fields (locked).
```

---

## 🎬 User Interaction Flow

### Scenario A: Patient Comes Alone

```
Step 1: Fill Patient Basic Info
┌─────────────────────────────────┐
│ Nama: "Ahmad Yusuf"             │
│ No. Telp: "081234567890"        │
└─────────────────────────────────┘

Step 2: Scroll to Guardian Section
→ User sees the blue checkbox box

Step 3: Check the Box
☐ → ☑️ (User clicks checkbox)

Step 4: Auto-Fill Magic! ✨
┌─────────────────────────────────┐
│ Nama PJ: "Ahmad Yusuf"      ✓   │  ← Auto-filled
│ Hubungan: "Pasien Sendiri"  ✓   │  ← Auto-set
│ Kontak PJ: "081234567890"   ✓   │  ← Auto-filled
└─────────────────────────────────┘
All fields are GRAYED OUT (disabled)

Step 5: Submit Form
→ Saves to database with:
  hubunganPenanggungJawab: "Pasien Sendiri"
```

### Scenario B: Patient Has Guardian

```
Step 1: Fill Patient Basic Info
┌─────────────────────────────────┐
│ Nama: "Ahmad Yusuf"             │
│ No. Telp: "081234567890"        │
└─────────────────────────────────┘

Step 2: Scroll to Guardian Section
→ User sees the blue checkbox box

Step 3: LEAVE CHECKBOX UNCHECKED
☐ (User does NOT click it)

Step 4: Fill Guardian Manually
┌─────────────────────────────────┐
│ Nama PJ: "Fatimah Zahra"        │  ← User types
│ Hubungan: "Orang Tua"           │  ← User selects
│ Kontak PJ: "081298765432"       │  ← User types
└─────────────────────────────────┘
All fields are ENABLED (editable)

Step 5: Submit Form
→ Saves with different guardian info
```

---

## 🔄 Real-Time Sync Feature

### What Happens When User Changes Patient Info?

**If checkbox is CHECKED:**

```
Initial State:
Patient: "Ahmad Yusuf" → Guardian: "Ahmad Yusuf"
Patient Phone: "0812..." → Guardian: "0812..."

User changes patient name to "Ahmad Yusuf Hidayat"
↓
Automatic Update! ✨
Guardian name ALSO changes to "Ahmad Yusuf Hidayat"

User changes patient phone to "0813..."
↓
Automatic Update! ✨
Guardian contact ALSO changes to "0813..."
```

This ensures **data consistency** - the guardian info always matches patient info when "Pasien Sendiri" is selected.

---

## 📊 Dropdown Options (Alphabetically Sorted)

When user clicks the "Hubungan Penanggung Jawab" dropdown:

```
┌─────────────────────────────┐
│ Hubungan Penanggung Jawab * │
│ ┌─────────────────────────┐ │
│ │ Anak                ▼   │ │ ← Click to open
│ └─────────────────────────┘ │
└─────────────────────────────┘

Opens to show:
┌──────────────────────────────┐
│ Anak                         │ ← 1st
│ Kakek/Nenek                  │ ← 2nd
│ Orang Tua                    │ ← 3rd
│ Paman/Bibi                   │ ← 4th
│ Pasangan                     │ ← 5th
│ Pasien Sendiri          ✨   │ ← 6th (NEW!)
│ Pengasuh Asrama              │ ← 7th
│ Pengurus Asrama              │ ← 8th
│ Teman                        │ ← 9th
│ Tetangga                     │ ← 10th
│ Lainnya                      │ ← LAST (moved from middle)
└──────────────────────────────┘
```

---

## 🎨 Color & Style Details

### Blue Checkbox Box
- **Background**: Light blue (`bg-blue-50`)
- **Border**: Blue border (`border-blue-200`)
- **Padding**: Comfortable spacing (`p-4`)
- **Corners**: Rounded (`rounded-lg`)

### Checkbox Styling
- **Size**: 16x16px (`w-4 h-4`)
- **Color**: Blue (`text-blue-600`)
- **Hover**: Focus ring effect (`focus:ring-blue-500`)

### Disabled Fields
- **Appearance**: Grayed out (browser default)
- **Cursor**: Not allowed (browser default)
- **Background**: Light gray (browser default)

---

## 💡 UX Benefits

### Why This Design Works:

1. **Visibility** 👁️
   - Blue box stands out from rest of form
   - Clear label explains what it does
   - Helper text provides guidance

2. **Clarity** 💭
   - Checkbox label is descriptive
   - Users know exactly what will happen
   - No confusion about purpose

3. **Feedback** ⚡
   - Instant auto-fill when checked
   - Fields gray out to show they're locked
   - Changes reflect immediately

4. **Safety** 🛡️
   - Can't accidentally edit auto-filled data
   - Unchecking clears data (prevents stale info)
   - Required validation still works

5. **Efficiency** ⏱️
   - Saves time - no re-typing
   - Reduces errors - consistent data
   - Faster patient registration

---

## 🧪 Testing Visual States

### Test Checklist:

- [ ] Blue box appears above guardian fields
- [ ] Checkbox is unchecked by default
- [ ] Clicking checkbox shows checkmark
- [ ] Fields gray out when checkbox is checked
- [ ] Auto-filled values appear correctly
- [ ] Unchecking removes checkmark
- [ ] Fields return to white/editable when unchecked
- [ ] Dropdown shows "Pasien Sendiri" option
- [ ] "Lainnya" appears at end of dropdown
- [ ] Helper text is visible below checkbox label

---

## 📱 Responsive Behavior

### Desktop View (md+ screens):
```
[Nama PJ Field]    [Hubungan Dropdown]
[Kontak PJ Field - spans below them]
```

### Mobile View (< md screens):
```
[Nama PJ Field]
[Hubungan Dropdown]
[Kontak PJ Field]
(Stacked vertically)
```

The blue checkbox box always spans full width on all screen sizes.

---

## 🎯 Expected User Behavior

### Most Common Use Cases:

1. **Adult patients** (students, workers) → Check the box ✅
2. **Children/minors** → Leave unchecked, enter parent info
3. **Elderly with family** → Leave unchecked, enter family contact
4. **Emergency walk-ins** → Check if alone, uncheck if family arrives later

---

**Visual Design Status:** ✅ **COMPLETE**

**Last Updated:** November 26, 2025

**Made with ❤️ for RS UNIPDU Medika**

