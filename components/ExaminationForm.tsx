/**
 * ═══════════════════════════════════════════════════════════════
 * EXAMINATION FORM COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * Purpose: Form for recording patient examination data (Pemeriksaan Pasien)
 * Used by: /igd/visit/[visitId]
 * Features: Vital signs, GCS, SOAP, Penunjang, Diagnosis
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { VisitExam, ConsciousnessLevel } from '@/types/models';

interface ExaminationFormProps {
  exam: VisitExam | undefined;
  doctors: Array<{ id: string; fullName: string }>;
  defaultDoctorId?: string;
  onSave: (exam: VisitExam) => Promise<void>;
  saving?: boolean;
}

export function ExaminationForm({
  exam,
  doctors,
  defaultDoctorId,
  onSave,
  saving = false,
}: ExaminationFormProps) {
  const [formData, setFormData] = useState<VisitExam>({
    examDate: exam?.examDate || new Date().toISOString().slice(0, 16),
    doctorId: exam?.doctorId || defaultDoctorId || '',
    nurseId: exam?.nurseId || '',
    tempC: exam?.tempC,
    respiratoryRate: exam?.respiratoryRate,
    bloodPressureSys: exam?.bloodPressureSys,
    bloodPressureDia: exam?.bloodPressureDia,
    spo2: exam?.spo2,
    heartRate: exam?.heartRate,
    gcsEye: exam?.gcsEye,
    gcsVerbal: exam?.gcsVerbal,
    gcsMotor: exam?.gcsMotor,
    gcsTotal: exam?.gcsTotal,
    heightCm: exam?.heightCm,
    weightKg: exam?.weightKg,
    allergies: exam?.allergies,
    consciousnessLevel: exam?.consciousnessLevel,
    subjective: exam?.subjective,
    objective: exam?.objective,
    assessment: exam?.assessment,
    plan: exam?.plan,
    kie: exam?.kie,
    penunjangLabRequested: exam?.penunjangLabRequested || false,
    penunjangRadioRequested: exam?.penunjangRadioRequested || false,
    penunjangOtherRequested: exam?.penunjangOtherRequested || false,
    penunjangOtherText: exam?.penunjangOtherText,
    diagnosis: exam?.diagnosis,
    diagnosisSecondary: exam?.diagnosisSecondary,
  });

  // Auto-calculate GCS Total
  useEffect(() => {
    const total = (formData.gcsEye || 0) + (formData.gcsVerbal || 0) + (formData.gcsMotor || 0);
    if (total > 0) {
      setFormData(prev => ({ ...prev, gcsTotal: total }));
    }
  }, [formData.gcsEye, formData.gcsVerbal, formData.gcsMotor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.examDate) {
      alert('Tanggal pemeriksaan harus diisi');
      return;
    }
    if (!formData.doctorId) {
      alert('Dokter harus dipilih');
      return;
    }
    if (!formData.nurseId) {
      alert('Perawat/Bidan harus diisi');
      return;
    }
    if (!formData.diagnosis || formData.diagnosis.trim() === '') {
      alert('Diagnosa Utama harus diisi');
      return;
    }

    await onSave(formData);
  };

  const gcsEyeOptions = [
    { value: '', label: '-- Pilih --' },
    { value: '4', label: '4 - Spontan' },
    { value: '3', label: '3 - Menanggapi Ucapan' },
    { value: '2', label: '2 - Menanggapi Rasa Sakit' },
    { value: '1', label: '1 - Tidak Ada' },
  ];

  const gcsVerbalOptions = [
    { value: '', label: '-- Pilih --' },
    { value: '5', label: '5 - Sadar' },
    { value: '4', label: '4 - Percakapan Bingung' },
    { value: '3', label: '3 - Kata-kata Tidak Tepat' },
    { value: '2', label: '2 - Suara yang tidak dimengerti' },
    { value: '1', label: '1 - Tidak ada' },
  ];

  const gcsMotorOptions = [
    { value: '', label: '-- Pilih --' },
    { value: '6', label: '6 - Menuruti perintah' },
    { value: '5', label: '5 - Menunjukkan lokasi nyeri' },
    { value: '4', label: '4 - Menarik diri dari nyeri' },
    { value: '3', label: '3 - Fleksi abnormal (postur decorticate)' },
    { value: '2', label: '2 - Ekstensi (postur decerebrate)' },
    { value: '1', label: '1 - Tidak ada' },
  ];

  const consciousnessOptions = [
    { value: '', label: '-- Pilih Kesadaran --' },
    { value: 'COMPOS_MENTIS', label: 'Compos mentis (Sadar sepenuhnya, GCS 14–15)' },
    { value: 'APATIS', label: 'Apatis (Acuh tak acuh, GCS 12–13)' },
    { value: 'DELIRIUM', label: 'Delirium (Bingung, gelisah, GCS 10–11)' },
    { value: 'SOMNOLEN', label: 'Somnolen (Mengantuk/lemas, GCS 7–9)' },
    { value: 'SOPOR', label: 'Sopor (Stupor, butuh rangsangan nyeri, GCS 5–6)' },
    { value: 'SEMI_KOMA', label: 'Semi Koma (reaksi minimal terhadap nyeri, GCS 4)' },
    { value: 'KOMA', label: 'Koma (tidak responsif sama sekali, GCS 3)' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {/* Header Meta */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pemeriksaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Tanggal Pemeriksaan"
            type="datetime-local"
            value={formData.examDate.slice(0, 16)}
            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
            required
          />
          <Select
            label="Dokter Pemeriksa"
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Dokter --' },
              ...doctors.map(d => ({ value: d.id, label: d.fullName }))
            ]}
            required
          />
          <Input
            label="Perawat/Bidan"
            value={formData.nurseId}
            onChange={(e) => setFormData({ ...formData, nurseId: e.target.value })}
            placeholder="Nama perawat/bidan"
            required
          />
        </div>
      </Card>

      {/* Vital Signs */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tanda-Tanda Vital</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="Suhu (°C)"
            type="number"
            step="0.1"
            value={formData.tempC || ''}
            onChange={(e) => setFormData({ ...formData, tempC: parseFloat(e.target.value) || undefined })}
            placeholder="36.5"
          />
          <Input
            label="Respiratory Rate (/menit)"
            type="number"
            value={formData.respiratoryRate || ''}
            onChange={(e) => setFormData({ ...formData, respiratoryRate: parseInt(e.target.value) || undefined })}
            placeholder="20"
          />
          <Input
            label="SPO2 (%)"
            type="number"
            value={formData.spo2 || ''}
            onChange={(e) => setFormData({ ...formData, spo2: parseInt(e.target.value) || undefined })}
            placeholder="98"
          />
          <Input
            label="Tensi Sistolik"
            type="number"
            value={formData.bloodPressureSys || ''}
            onChange={(e) => setFormData({ ...formData, bloodPressureSys: parseInt(e.target.value) || undefined })}
            placeholder="120"
          />
          <Input
            label="Tensi Diastolik"
            type="number"
            value={formData.bloodPressureDia || ''}
            onChange={(e) => setFormData({ ...formData, bloodPressureDia: parseInt(e.target.value) || undefined })}
            placeholder="80"
          />
          <Input
            label="Nadi (/menit)"
            type="number"
            value={formData.heartRate || ''}
            onChange={(e) => setFormData({ ...formData, heartRate: parseInt(e.target.value) || undefined })}
            placeholder="72"
          />
        </div>
      </Card>

      {/* GCS */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Glasgow Coma Scale (GCS)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Respons Mata (E)"
            value={formData.gcsEye?.toString() || ''}
            onChange={(e) => setFormData({ ...formData, gcsEye: parseInt(e.target.value) as 1 | 2 | 3 | 4 || undefined })}
            options={gcsEyeOptions}
          />
          <Select
            label="Respons Verbal (V)"
            value={formData.gcsVerbal?.toString() || ''}
            onChange={(e) => setFormData({ ...formData, gcsVerbal: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 || undefined })}
            options={gcsVerbalOptions}
          />
          <Select
            label="Respons Motorik (M)"
            value={formData.gcsMotor?.toString() || ''}
            onChange={(e) => setFormData({ ...formData, gcsMotor: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 || undefined })}
            options={gcsMotorOptions}
          />
        </div>
        {formData.gcsTotal && formData.gcsTotal > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">
              GCS: E{formData.gcsEye || 0} V{formData.gcsVerbal || 0} M{formData.gcsMotor || 0} (Total {formData.gcsTotal})
            </p>
          </div>
        )}
      </Card>

      {/* Anthropometrics & Allergies */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Antropometri & Alergi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Tinggi Badan (cm)"
            type="number"
            value={formData.heightCm || ''}
            onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value) || undefined })}
            placeholder="170"
          />
          <Input
            label="Berat Badan (kg)"
            type="number"
            step="0.1"
            value={formData.weightKg || ''}
            onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || undefined })}
            placeholder="65"
          />
          <Input
            label="Alergi"
            value={formData.allergies || ''}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            placeholder="Tidak ada / Nama obat/makanan"
          />
        </div>
      </Card>

      {/* Consciousness Level */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kesadaran (Descriptive)</h3>
        <Select
          label="Tingkat Kesadaran"
          value={formData.consciousnessLevel || ''}
          onChange={(e) => setFormData({ ...formData, consciousnessLevel: e.target.value as ConsciousnessLevel || undefined })}
          options={consciousnessOptions}
        />
      </Card>

      {/* SOAP + KIE */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SOAP + KIE</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <textarea
              value={formData.subjective || ''}
              onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Keluhan pasien..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Object</label>
            <textarea
              value={formData.objective || ''}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hasil pemeriksaan objektif..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asesmen</label>
            <textarea
              value={formData.assessment || ''}
              onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Asesmen dokter..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
            <textarea
              value={formData.plan || ''}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rencana tindakan..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">KIE (Komunikasi, Informasi, Edukasi)</label>
            <textarea
              value={formData.kie || ''}
              onChange={(e) => setFormData({ ...formData, kie: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Edukasi yang diberikan kepada pasien..."
            />
          </div>
        </div>
      </Card>

      {/* Penunjang */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pemeriksaan Penunjang</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.penunjangLabRequested}
              onChange={(e) => setFormData({ ...formData, penunjangLabRequested: e.target.checked })}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Laboratorium</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.penunjangRadioRequested}
              onChange={(e) => setFormData({ ...formData, penunjangRadioRequested: e.target.checked })}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Radiologi</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.penunjangOtherRequested}
              onChange={(e) => setFormData({ ...formData, penunjangOtherRequested: e.target.checked })}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Lainnya</span>
          </label>
          {formData.penunjangOtherRequested && (
            <Input
              label="Keterangan Lainnya"
              value={formData.penunjangOtherText || ''}
              onChange={(e) => setFormData({ ...formData, penunjangOtherText: e.target.value })}
              placeholder="Tuliskan penunjang lain yang dibutuhkan"
            />
          )}
        </div>
      </Card>

      {/* Diagnosis */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosa</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosa Utama <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.diagnosis || ''}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan diagnosa utama pasien..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosa Tambahan (Opsional)
            </label>
            <textarea
              value={formData.diagnosisSecondary || ''}
              onChange={(e) => setFormData({ ...formData, diagnosisSecondary: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan diagnosa tambahan jika ada..."
            />
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : exam ? 'Perbarui Pemeriksaan' : 'Simpan Pemeriksaan'}
        </Button>
      </div>
    </form>
  );
}

