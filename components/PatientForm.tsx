/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED PATIENT FORM COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * Purpose: Reusable form for creating/editing patient information
 * Used by: /patients/new, /patients/[id]/edit, /resepsionis/patients/[id]
 * Features: Complete patient info, Guardian info, "Pasien Sendiri" option
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { 
  JenisKelamin, 
  StatusPernikahan, 
  HubunganPenanggungJawab, 
  JenisAsuransiType, 
  AgamaType 
} from '@/types/models';
import { calculateAge } from '@/lib/utils';
import { 
  getProvinsi, 
  getKabupaten, 
  getKecamatan, 
  getKelurahan,
  LocationItem 
} from '@/lib/locationService';

export interface PatientFormData {
  noRM: string;
  nama: string;
  nik: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin;
  provinsiId: string;
  kabupatenId: string;
  kecamatanId: string;
  desaId: string;
  detailAlamat: string;
  noTelp: string;
  email: string;
  insuranceType: JenisAsuransiType;
  religion: AgamaType;
  statusPernikahan: StatusPernikahan | '';
  pekerjaan: string;
  namaPenanggungJawab: string;
  hubunganPenanggungJawab: HubunganPenanggungJawab;
  kontakPenanggungJawab: string;
}

interface PatientFormProps {
  formData: PatientFormData;
  onChange: (data: Partial<PatientFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
  showMRNField?: boolean;
  mrnReadOnly?: boolean;
}

export function PatientForm({
  formData,
  onChange,
  onSubmit,
  loading = false,
  submitLabel = 'Simpan',
  showMRNField = true,
  mrnReadOnly = false,
}: PatientFormProps) {
  const [isPasienSendiri, setIsPasienSendiri] = useState(false);
  
  // Location data
  const [provinsiList, setProvinsiList] = useState<LocationItem[]>([]);
  const [kabupatenList, setKabupatenList] = useState<LocationItem[]>([]);
  const [kecamatanList, setKecamatanList] = useState<LocationItem[]>([]);
  const [desaList, setDesaList] = useState<LocationItem[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinsi();
  }, []);

  // Load kabupaten when provinsi changes
  useEffect(() => {
    if (formData.provinsiId) {
      loadKabupaten(formData.provinsiId);
    } else {
      setKabupatenList([]);
      setKecamatanList([]);
      setDesaList([]);
    }
  }, [formData.provinsiId]);

  // Load kecamatan when kabupaten changes
  useEffect(() => {
    if (formData.kabupatenId) {
      loadKecamatan(formData.kabupatenId);
    } else {
      setKecamatanList([]);
      setDesaList([]);
    }
  }, [formData.kabupatenId]);

  // Load desa when kecamatan changes
  useEffect(() => {
    if (formData.kecamatanId) {
      loadDesa(formData.kecamatanId);
    } else {
      setDesaList([]);
    }
  }, [formData.kecamatanId]);

  // Detect "Pasien Sendiri" on mount
  useEffect(() => {
    if (
      formData.hubunganPenanggungJawab === 'Pasien Sendiri' ||
      (formData.namaPenanggungJawab === formData.nama && 
       formData.kontakPenanggungJawab === formData.noTelp &&
       formData.nama && formData.noTelp)
    ) {
      setIsPasienSendiri(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProvinsi = async () => {
    setLoadingLocation(true);
    try {
      const data = await getProvinsi();
      setProvinsiList(data);
    } catch (error) {
      console.error('Error loading provinsi:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadKabupaten = async (provinsiId: string) => {
    setLoadingLocation(true);
    try {
      const data = await getKabupaten(provinsiId);
      setKabupatenList(data);
    } catch (error) {
      console.error('Error loading kabupaten:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadKecamatan = async (kabupatenId: string) => {
    setLoadingLocation(true);
    try {
      const data = await getKecamatan(kabupatenId);
      setKecamatanList(data);
    } catch (error) {
      console.error('Error loading kecamatan:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadDesa = async (kecamatanId: string) => {
    setLoadingLocation(true);
    try {
      const data = await getKelurahan(kecamatanId);
      setDesaList(data);
    } catch (error) {
      console.error('Error loading desa:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handlePasienSendiriChange = (checked: boolean) => {
    setIsPasienSendiri(checked);
    if (checked) {
      onChange({
        namaPenanggungJawab: formData.nama,
        hubunganPenanggungJawab: 'Pasien Sendiri',
        kontakPenanggungJawab: formData.noTelp,
      });
    } else {
      onChange({
        namaPenanggungJawab: '',
        hubunganPenanggungJawab: 'Orang Tua',
        kontakPenanggungJawab: '',
      });
    }
  };

  // Auto-update penanggung jawab when patient info changes (if Pasien Sendiri is checked)
  useEffect(() => {
    if (isPasienSendiri) {
      onChange({
        namaPenanggungJawab: formData.nama,
        kontakPenanggungJawab: formData.noTelp,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.nama, formData.noTelp, isPasienSendiri]);

  const jenisKelaminOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' },
  ];

  const statusPernikahanOptions = [
    { value: '', label: '-- Pilih Status Pernikahan --' },
    { value: 'Belum Kawin', label: 'Belum Kawin' },
    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
    { value: 'Cerai Mati', label: 'Cerai Mati' },
    { value: 'Kawin', label: 'Kawin' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const hubunganOptions = [
    { value: 'Anak', label: 'Anak' },
    { value: 'Kakek/Nenek', label: 'Kakek/Nenek' },
    { value: 'Orang Tua', label: 'Orang Tua' },
    { value: 'Paman/Bibi', label: 'Paman/Bibi' },
    { value: 'Pasien Sendiri', label: 'Pasien Sendiri' },
    { value: 'Pengasuh Asrama', label: 'Pengasuh Asrama' },
    { value: 'Pengurus Asrama', label: 'Pengurus Asrama' },
    { value: 'Suami/Istri', label: 'Suami/Istri' },
    { value: 'Teman', label: 'Teman' },
    { value: 'Tetangga', label: 'Tetangga' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const insuranceOptions = [
    { value: 'Umum', label: 'Umum' },
    { value: 'BPJS', label: 'BPJS' },
    { value: 'BPJS TK', label: 'BPJS TK' },
    { value: 'P2KS', label: 'P2KS' },
    { value: 'KIS', label: 'KIS' },
    { value: 'Jasaraharja', label: 'Jasaraharja' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const religionOptions = [
    { value: 'Islam', label: 'Islam' },
    { value: 'Protestan', label: 'Protestan' },
    { value: 'Katolik', label: 'Katolik' },
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Buddha', label: 'Buddha' },
    { value: 'Konghucu', label: 'Konghucu' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  return (
    <form onSubmit={onSubmit}>
      {/* Informasi Dasar Pasien */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Dasar Pasien</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showMRNField && (
            <Input
              label="No. Rekam Medis (No. RM)"
              value={formData.noRM}
              onChange={(e) => onChange({ noRM: e.target.value })}
              required
              readOnly={mrnReadOnly}
              placeholder="RM-2025-0001"
            />
          )}
          <Input
            label="Nama Lengkap"
            value={formData.nama}
            onChange={(e) => onChange({ nama: e.target.value })}
            required
            placeholder="Nama lengkap pasien"
          />
          <Input
            label="NIK (KTP)"
            value={formData.nik}
            onChange={(e) => onChange({ nik: e.target.value })}
            required
            placeholder="16 digit NIK"
            maxLength={16}
          />
          <Input
            label="Tanggal Lahir"
            type="date"
            value={formData.tanggalLahir}
            onChange={(e) => onChange({ tanggalLahir: e.target.value })}
            required
          />
          {formData.tanggalLahir && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">
                Umur: <span className="font-semibold">{calculateAge(formData.tanggalLahir)} tahun</span>
              </p>
            </div>
          )}
          <Select
            label="Jenis Kelamin"
            value={formData.jenisKelamin}
            onChange={(e) => onChange({ jenisKelamin: e.target.value as JenisKelamin })}
            options={jenisKelaminOptions}
            required
          />
          <Input
            label="No. Telepon / HP"
            value={formData.noTelp}
            onChange={(e) => onChange({ noTelp: e.target.value })}
            required
            placeholder="08xxxxxxxxxx"
          />
        </div>
      </Card>

      {/* Alamat Lengkap */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Alamat Lengkap</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Provinsi"
            value={formData.provinsiId}
            onChange={(e) => {
              onChange({
                provinsiId: e.target.value,
                kabupatenId: '',
                kecamatanId: '',
                desaId: '',
              });
            }}
            options={[
              { value: '', label: loadingLocation ? 'Memuat...' : '-- Pilih Provinsi --' },
              ...provinsiList.map(p => ({ value: p.id, label: p.name }))
            ]}
            required
            disabled={loadingLocation}
          />
          <Select
            label="Kabupaten / Kota"
            value={formData.kabupatenId}
            onChange={(e) => {
              onChange({
                kabupatenId: e.target.value,
                kecamatanId: '',
                desaId: '',
              });
            }}
            options={[
              { value: '', label: loadingLocation ? 'Memuat...' : '-- Pilih Kabupaten --' },
              ...kabupatenList.map(k => ({ value: k.id, label: k.name }))
            ]}
            required
            disabled={!formData.provinsiId || loadingLocation}
          />
          <Select
            label="Kecamatan"
            value={formData.kecamatanId}
            onChange={(e) => {
              onChange({
                kecamatanId: e.target.value,
                desaId: '',
              });
            }}
            options={[
              { value: '', label: loadingLocation ? 'Memuat...' : '-- Pilih Kecamatan --' },
              ...kecamatanList.map(k => ({ value: k.id, label: k.name }))
            ]}
            required
            disabled={!formData.kabupatenId || loadingLocation}
          />
          <Select
            label="Desa / Kelurahan"
            value={formData.desaId}
            onChange={(e) => onChange({ desaId: e.target.value })}
            options={[
              { value: '', label: loadingLocation ? 'Memuat...' : '-- Pilih Desa --' },
              ...desaList.map(d => ({ value: d.id, label: d.name }))
            ]}
            required
            disabled={!formData.kecamatanId || loadingLocation}
          />
          <div className="md:col-span-2">
            <Input
              label="Detail Alamat (RT/RW, No. Rumah, dll)"
              value={formData.detailAlamat}
              onChange={(e) => onChange({ detailAlamat: e.target.value })}
              placeholder="RT 01 / RW 02, No. 123"
            />
          </div>
        </div>
      </Card>

      {/* Informasi Tambahan (Opsional) */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Tambahan (Opsional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="email@example.com"
          />
          <Input
            label="Pekerjaan"
            value={formData.pekerjaan}
            onChange={(e) => onChange({ pekerjaan: e.target.value })}
            placeholder="Mahasiswa"
          />
          <Select
            label="Status Pernikahan"
            value={formData.statusPernikahan}
            onChange={(e) => onChange({ statusPernikahan: e.target.value as StatusPernikahan })}
            options={statusPernikahanOptions}
          />
          <Select
            label="Jenis Asuransi"
            value={formData.insuranceType}
            onChange={(e) => onChange({ insuranceType: e.target.value as JenisAsuransiType })}
            options={insuranceOptions}
            required
          />
          <Select
            label="Agama"
            value={formData.religion}
            onChange={(e) => onChange({ religion: e.target.value as AgamaType })}
            options={religionOptions}
            required
          />
        </div>
      </Card>

      {/* Informasi Penanggung Jawab */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Penanggung Jawab</h2>
        
        {/* Pasien Sendiri Checkbox */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={isPasienSendiri}
              onChange={(e) => handlePasienSendiriChange(e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="font-medium text-gray-900">
                Pasien datang sendiri dan dapat membuat keputusan medis/hukum sendiri
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Centang jika pasien tidak memerlukan penanggung jawab
              </p>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nama Penanggung Jawab"
            value={formData.namaPenanggungJawab}
            onChange={(e) => onChange({ namaPenanggungJawab: e.target.value })}
            required
            readOnly={isPasienSendiri}
            placeholder="Nama lengkap penanggung jawab"
          />
          <Select
            label="Hubungan Penanggung Jawab"
            value={formData.hubunganPenanggungJawab}
            onChange={(e) => onChange({ hubunganPenanggungJawab: e.target.value as HubunganPenanggungJawab })}
            options={hubunganOptions}
            required
            disabled={isPasienSendiri}
          />
          <Input
            label="Nomor HP Penanggung Jawab"
            value={formData.kontakPenanggungJawab}
            onChange={(e) => onChange({ kontakPenanggungJawab: e.target.value })}
            required
            readOnly={isPasienSendiri}
            placeholder="08xxxxxxxxxx"
          />
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

