# 📋 Data Pemeriksaan Pasien - Implementation Guide

## ✅ What Was Implemented

Successfully added a comprehensive **Patient Examination Form** (Data Pemeriksaan Pasien) to the visit detail page for recording complete medical examination data.

---

## 🎯 Overview

The examination form allows doctors and nurses to record detailed patient examination data including:
- Vital signs
- Glasgow Coma Scale (GCS)
- Anthropometric measurements
- SOAP notes + KIE
- Supporting investigations (Penunjang)
- Diagnosis and summaries

---

## 📁 Files Created/Modified

### Created
1. ✅ **`components/ExaminationForm.tsx`** - Reusable examination form component (500+ lines)

### Modified
1. ✅ **`types/models.ts`** - Added `VisitExam` interface and `ConsciousnessLevel` type
2. ✅ **`app/igd/visit/[visitId]/page.tsx`** - Integrated examination form into visit detail page

---

## 🗂️ Data Model

### New Types

```typescript
export type ConsciousnessLevel =
  | 'COMPOS_MENTIS'
  | 'APATIS'
  | 'DELIRIUM'
  | 'SOMNOLEN'
  | 'SOPOR'
  | 'SEMI_KOMA'
  | 'KOMA';

export interface VisitExam {
  // Meta
  examDate: string;        // ISO date-time
  doctorId: string;        // Dokter yang memeriksa
  nurseId: string;         // Perawat/Bidan yang memeriksa

  // Vital signs
  tempC?: number;          // Suhu (°C)
  respiratoryRate?: number; // RR (breaths/min)
  bloodPressureSys?: number; // Sistolik
  bloodPressureDia?: number; // Diastolik
  spo2?: number;           // Saturasi O2 (%)
  heartRate?: number;      // Nadi (beats/min)

  // GCS – Glasgow Coma Scale
  gcsEye?: 1 | 2 | 3 | 4;
  gcsVerbal?: 1 | 2 | 3 | 4 | 5;
  gcsMotor?: 1 | 2 | 3 | 4 | 5 | 6;
  gcsTotal?: number;       // auto-computed

  // Anthropometrics & allergies
  heightCm?: number;
  weightKg?: number;
  allergies?: string;

  // Level of consciousness
  consciousnessLevel?: ConsciousnessLevel;

  // SOAP + KIE
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  kie?: string;

  // Penunjang
  penunjangLabRequested?: boolean;
  penunjangRadioRequested?: boolean;
  penunjangOtherRequested?: boolean;
  penunjangOtherText?: string;

  // Diagnosis & summaries
  diagnosis?: string;
  tindakanSummary?: string;
  obatSummary?: string;
}
```

### Extended Visit Model

```typescript
export interface Visit {
  // ... existing fields ...
  exam?: VisitExam;  // NEW: Data Pemeriksaan
}
```

---

## 🎨 Form Sections

### 1. Informasi Pemeriksaan (Header Meta)
- **Tanggal Pemeriksaan** - datetime-local input
- **Dokter Pemeriksa** - dropdown (from doctors collection)
- **Perawat/Bidan** - text input

**Required**: All three fields

---

### 2. Tanda-Tanda Vital (Vital Signs)
- **Suhu (°C)** - number input, step 0.1
- **Respiratory Rate (/menit)** - number input
- **SPO2 (%)** - number input
- **Tensi Sistolik** - number input
- **Tensi Diastolik** - number input
- **Nadi (/menit)** - number input

**All optional**

---

### 3. Glasgow Coma Scale (GCS)

Three dropdowns with auto-calculation:

**Respons Mata (E)**:
- 4 - Spontan
- 3 - Menanggapi Ucapan
- 2 - Menanggapi Rasa Sakit
- 1 - Tidak Ada

**Respons Verbal (V)**:
- 5 - Sadar
- 4 - Percakapan Bingung
- 3 - Kata-kata Tidak Tepat
- 2 - Suara yang tidak dimengerti
- 1 - Tidak ada

**Respons Motorik (M)**:
- 6 - Menuruti perintah
- 5 - Menunjukkan lokasi nyeri
- 4 - Menarik diri dari nyeri
- 3 - Fleksi abnormal (postur decorticate)
- 2 - Ekstensi (postur decerebrate)
- 1 - Tidak ada

**Auto-calculated Total**: Displays "GCS: E4 V5 M6 (Total 15)"

---

### 4. Antropometri & Alergi
- **Tinggi Badan (cm)** - number input
- **Berat Badan (kg)** - number input, step 0.1
- **Alergi** - text input

**All optional**

---

### 5. Kesadaran (Descriptive)

Dropdown with GCS-correlated options:
- **Compos mentis** (Sadar sepenuhnya, GCS 14–15)
- **Apatis** (Acuh tak acuh, GCS 12–13)
- **Delirium** (Bingung, gelisah, GCS 10–11)
- **Somnolen** (Mengantuk/lemas, GCS 7–9)
- **Sopor** (Stupor, butuh rangsangan nyeri, GCS 5–6)
- **Semi Koma** (reaksi minimal terhadap nyeri, GCS 4)
- **Koma** (tidak responsif sama sekali, GCS 3)

**Note**: User manually selects; not auto-set from GCS

---

### 6. SOAP + KIE

Five textarea fields:
- **Subject** - Keluhan pasien
- **Object** - Hasil pemeriksaan objektif
- **Asesmen** - Asesmen dokter
- **Plan** - Rencana tindakan
- **KIE** - Komunikasi, Informasi, Edukasi

**All optional**

---

### 7. Pemeriksaan Penunjang

Three checkboxes:
- ☑️ **Laboratorium**
- ☑️ **Radiologi**
- ☑️ **Lainnya**

When "Lainnya" is checked, shows text input for details.

**Note**: For now, only stores flags. Future integration with Lab/Radio queues.

---

### 8. Diagnosa & Ringkasan

Three textarea fields:
- **Diagnosa** - Diagnosa utama (free text)
- **Ringkasan Tindakan** - Optional narrative summary
- **Ringkasan Obat** - Optional narrative summary

**Important**: These are narrative summaries only. Actual billing data comes from "Tindakan & Biaya" and "Resep Obat" sections.

---

## 🔧 How It Works

### Visibility Rules

The examination form appears when:
1. ✅ Visit type is "Rawat Jalan" OR "IGD"
2. ✅ User has edit permission (`canEdit` = true)
3. ✅ Visit status is `igd_in_progress`

**Hidden for**: Rawat Inap (different workflow)

---

### Form Behavior

**New Examination**:
- Form is empty
- Shows yellow info banner: "Belum ada data pemeriksaan"
- Button text: "Simpan Pemeriksaan"

**Edit Existing Examination**:
- Form pre-filled with `visit.exam` data
- Shows green badge: "Sudah diisi"
- Button text: "Perbarui Pemeriksaan"

---

### Auto-Calculations

**GCS Total**:
```typescript
useEffect(() => {
  const total = (gcsEye || 0) + (gcsVerbal || 0) + (gcsMotor || 0);
  if (total > 0) {
    setFormData(prev => ({ ...prev, gcsTotal: total }));
  }
}, [gcsEye, gcsVerbal, gcsMotor]);
```

---

### Validation

**Required Fields**:
- ✅ Tanggal Pemeriksaan
- ✅ Dokter Pemeriksa
- ✅ Perawat/Bidan

**Optional**: All other fields

---

### Save Flow

```
User fills form
  ↓
Clicks "Simpan Pemeriksaan"
  ↓
Validate required fields
  ↓
Call handleSaveExam(examData)
  ↓
updateVisit(visitId, { exam: examData })
  ↓
Update local state
  ↓
Show success message
  ↓
Form switches to "edit mode"
```

---

## 💻 Code Integration

### In Visit Detail Page

```typescript
// State
const [doctors, setDoctors] = useState<Doctor[]>([]);
const [savingExam, setSavingExam] = useState(false);

// Load doctors
const loadDoctors = async () => {
  const activeDoctors = await getActiveDoctors();
  setDoctors(activeDoctors);
};

// Save handler
const handleSaveExam = async (examData: VisitExam) => {
  setSavingExam(true);
  try {
    await updateVisit(visitId, { exam: examData });
    setVisit({ ...visit, exam: examData });
    alert('✅ Data pemeriksaan berhasil disimpan!');
  } catch (error) {
    alert('Gagal menyimpan data pemeriksaan.');
  } finally {
    setSavingExam(false);
  }
};

// UI
<ExaminationForm
  exam={visit.exam}
  doctors={doctors}
  defaultDoctorId={visit.dokter}
  onSave={handleSaveExam}
  saving={savingExam}
/>
```

---

## 📊 UI Layout

```
┌─────────────────────────────────────────────────┐
│ 📋 Data Pemeriksaan Pasien      [Sudah diisi]  │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Informasi Pemeriksaan Card]                    │
│ - Tanggal, Dokter, Perawat                      │
│                                                 │
│ [Tanda-Tanda Vital Card]                        │
│ - Suhu, RR, SPO2, Tensi, Nadi                   │
│                                                 │
│ [Glasgow Coma Scale Card]                       │
│ - E, V, M dropdowns                             │
│ - GCS: E4 V5 M6 (Total 15)                      │
│                                                 │
│ [Antropometri & Alergi Card]                    │
│ - Tinggi, Berat, Alergi                         │
│                                                 │
│ [Kesadaran Card]                                │
│ - Dropdown (Compos mentis, etc.)                │
│                                                 │
│ [SOAP + KIE Card]                               │
│ - 5 textareas                                   │
│                                                 │
│ [Pemeriksaan Penunjang Card]                    │
│ - 3 checkboxes + conditional input              │
│                                                 │
│ [Diagnosa & Ringkasan Card]                     │
│ - 3 textareas                                   │
│                                                 │
│                    [Simpan Pemeriksaan Button]  │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Backward Compatibility

**Old Visits** (without `exam` field):
- ✅ Still render normally
- ✅ Form shows as "new" (empty)
- ✅ No errors or warnings
- ✅ Can add examination data anytime

**Firestore**:
- `exam` field is optional in Visit document
- Missing `exam` = `undefined` (not error)
- Firestore update only touches `exam` field

---

## 🎯 User Workflow

### Scenario 1: New Visit with Examination

1. Admin/IGD creates new visit at `/igd/new-visit`
2. System redirects to `/igd/visit/[visitId]`
3. User sees "Data Pemeriksaan" section (yellow banner)
4. User fills examination form
5. Clicks "Simpan Pemeriksaan"
6. Success! Badge changes to green "Sudah diisi"
7. User continues to add "Tindakan & Biaya"
8. User adds "Resep Obat" if needed
9. Clicks "Selesaikan Kunjungan"

### Scenario 2: Edit Existing Examination

1. User opens visit detail page
2. Sees examination form pre-filled
3. Makes changes to any field
4. Clicks "Perbarui Pemeriksaan"
5. Success! Data updated

### Scenario 3: View-Only (Kasir/Farmasi)

1. Kasir/Farmasi opens visit
2. Examination section is **hidden** (no edit permission)
3. They only see billing and prescription sections

---

## 📝 Important Notes

### 1. Separation of Concerns

**Examination Form** (narrative/clinical):
- SOAP notes
- Diagnosis
- Summaries (narrative only)

**Tindakan & Biaya** (billing):
- Actual services performed
- Prices and quantities
- Source of truth for billing

**Resep Obat** (prescription):
- Actual drugs prescribed
- Quantities and instructions
- Source of truth for pharmacy

### 2. No Auto-Population

The examination summaries (`tindakanSummary`, `obatSummary`) are:
- ✅ Free text fields
- ✅ Optional
- ❌ NOT auto-populated from billing data
- ❌ NOT used for billing calculations

### 3. Penunjang (Future Integration)

Current implementation:
- ✅ Stores flags (Lab/Radio/Other requested)
- ❌ Does NOT create Lab/Radio queue items yet
- 🔮 Future: Will trigger Lab/Radio workflow

---

## ✅ Testing Checklist

- [x] Types compile without errors
- [x] Form renders on visit detail page
- [x] Form only shows for Rawat Jalan/IGD
- [x] Form hidden when no edit permission
- [x] GCS auto-calculation works
- [x] "Lainnya" penunjang shows conditional input
- [x] Required field validation works
- [x] Save creates new exam
- [x] Save updates existing exam
- [x] Old visits without exam still work
- [x] No linter errors

---

## 🚀 Next Steps (Future Enhancements)

Potential improvements:
- [ ] Add ICD-10 diagnosis code lookup
- [ ] Auto-suggest consciousness level from GCS
- [ ] Integrate with Lab/Radio queue system
- [ ] Add vital signs trend charts
- [ ] Add BMI auto-calculation
- [ ] Add print/export examination report
- [ ] Add examination history view
- [ ] Add templates for common diagnoses

---

## 📚 Related Documentation

- `types/models.ts` - Data model definitions
- `components/ExaminationForm.tsx` - Form component
- `app/igd/visit/[visitId]/page.tsx` - Integration point

---

**Status**: ✅ **COMPLETE & PRODUCTION READY**

**Last Updated**: December 2, 2025  
**Version**: 1.0  
**Files Created**: 1 component  
**Files Modified**: 2 files  
**Lines of Code**: ~700 lines

---

**The examination form is now fully integrated and ready for use! 🎉**

