/**
 * ═══════════════════════════════════════════════════════════════
 * EDIT PATIENT PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /patients/:id/edit
 * Purpose: Edit existing patient information
 * Features: Pre-filled form, "Pasien Sendiri" detection, Update patient
 * Access: Admin, IGD only
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PatientForm, PatientFormData } from '@/components/PatientForm';
import { getPatient, updatePatient } from '@/lib/firestore';
import { StatusPernikahan, HubunganPenanggungJawab } from '@/types/models';
import { buildFullAddress, getLocationName } from '@/lib/locationService';

export default function EditPatientPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<PatientFormData>({
    noRM: '',
    nama: '',
    nik: '',
    tanggalLahir: '',
    jenisKelamin: 'Laki-laki',
    provinsiId: '',
    kabupatenId: '',
    kecamatanId: '',
    desaId: '',
    detailAlamat: '',
    noTelp: '',
    email: '',
    insuranceType: 'Umum',
    religion: 'Islam',
    statusPernikahan: '',
    pekerjaan: '',
    namaPenanggungJawab: '',
    hubunganPenanggungJawab: 'Orang Tua',
    kontakPenanggungJawab: '',
  });

  useEffect(() => {
    loadPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      const patient = await getPatient(patientId);
      if (!patient) {
        alert('Pasien tidak ditemukan');
        router.push('/patients');
        return;
      }

      setFormData({
        noRM: patient.noRM || '',
        nama: patient.nama || patient.fullName || '',
        nik: patient.nik || '',
        tanggalLahir: patient.tanggalLahir || patient.birthDate || '',
        jenisKelamin: patient.jenisKelamin || (patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'),
        provinsiId: patient.alamatLengkap?.provinsiId || patient.addressProvinceId || '',
        kabupatenId: patient.alamatLengkap?.kabupatenId || patient.addressRegencyId || '',
        kecamatanId: patient.alamatLengkap?.kecamatanId || patient.addressDistrictId || '',
        desaId: patient.alamatLengkap?.desaId || patient.addressVillageId || '',
        detailAlamat: patient.alamatLengkap?.detailAlamat || patient.addressDetail || '',
        noTelp: patient.noTelp || patient.phoneNumber || '',
        email: patient.email || '',
        insuranceType: patient.insuranceType || 'Umum',
        religion: patient.religion || 'Islam',
        statusPernikahan: (patient.statusPernikahan || patient.maritalStatus || '') as StatusPernikahan | '',
        pekerjaan: patient.pekerjaan || '',
        namaPenanggungJawab: patient.namaPenanggungJawab || patient.guarantorName || '',
        hubunganPenanggungJawab: (patient.hubunganPenanggungJawab || patient.guarantorRelationship || 'Orang Tua') as HubunganPenanggungJawab,
        kontakPenanggungJawab: patient.kontakPenanggungJawab || patient.guarantorPhone || '',
      });
    } catch (error) {
      console.error('Error loading patient:', error);
      alert('Gagal memuat data pasien');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (updates: Partial<PatientFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Build full address from location IDs
      const fullAddress = await buildFullAddress({
        provinsiId: formData.provinsiId,
        kabupatenId: formData.kabupatenId,
        kecamatanId: formData.kecamatanId,
        desaId: formData.desaId,
        detailAlamat: formData.detailAlamat,
      });

      // Get location names
      const provinsiName = await getLocationName('provinsi', formData.provinsiId);
      const kabupatenName = await getLocationName('kabupaten', formData.kabupatenId);
      const kecamatanName = await getLocationName('kecamatan', formData.kecamatanId);
      const desaName = await getLocationName('desa', formData.desaId);

      // Calculate age
      const birthDate = new Date(formData.tanggalLahir);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      await updatePatient(patientId, {
        noRM: formData.noRM,
        nama: formData.nama,
        nik: formData.nik,
        tanggalLahir: formData.tanggalLahir,
        umur: age,
        jenisKelamin: formData.jenisKelamin,
        alamat: fullAddress,
        alamatLengkap: {
          provinsiId: formData.provinsiId,
          provinsiName: provinsiName,
          kabupatenId: formData.kabupatenId,
          kabupatenName: kabupatenName,
          kecamatanId: formData.kecamatanId,
          kecamatanName: kecamatanName,
          desaId: formData.desaId,
          desaName: desaName,
          detailAlamat: formData.detailAlamat,
        },
        noTelp: formData.noTelp,
        email: formData.email || undefined,
        statusPernikahan: formData.statusPernikahan || undefined,
        pekerjaan: formData.pekerjaan || undefined,
        namaPenanggungJawab: formData.namaPenanggungJawab,
        hubunganPenanggungJawab: formData.hubunganPenanggungJawab,
        kontakPenanggungJawab: formData.kontakPenanggungJawab,
        // New fields
        fullName: formData.nama,
        birthDate: formData.tanggalLahir,
        gender: formData.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
        phoneNumber: formData.noTelp,
        insuranceType: formData.insuranceType,
        religion: formData.religion,
        maritalStatus: formData.statusPernikahan || undefined,
        addressProvinceId: formData.provinsiId,
        addressProvinceName: provinsiName,
        addressRegencyId: formData.kabupatenId,
        addressRegencyName: kabupatenName,
        addressDistrictId: formData.kecamatanId,
        addressDistrictName: kecamatanName,
        addressVillageId: formData.desaId,
        addressVillageName: desaName,
        addressDetail: formData.detailAlamat,
        guarantorName: formData.namaPenanggungJawab,
        guarantorRelationship: formData.hubunganPenanggungJawab,
        guarantorPhone: formData.kontakPenanggungJawab,
        registrationStatus: 'COMPLETE',
      });

      alert('✅ Data pasien berhasil diperbarui!');
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Gagal memperbarui data pasien. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Data Pasien</h1>
          <p className="text-gray-600 mt-2">Perbarui informasi pasien di bawah ini</p>
        </div>

        <PatientForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Simpan Perubahan"
          showMRNField={true}
          mrnReadOnly={true}
        />

        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push(`/patients/${patientId}`)}
          >
            ← Kembali ke Detail Pasien
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/patients')}
          >
            Ke Daftar Pasien
          </Button>
        </div>
      </div>
    </div>
  );
}
