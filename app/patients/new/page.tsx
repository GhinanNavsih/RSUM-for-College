/**
 * ═══════════════════════════════════════════════════════════════
 * NEW PATIENT PAGE (Patient Registration)
 * ═══════════════════════════════════════════════════════════════
 * Route: /patients/new
 * Purpose: Form to register a new patient in the system
 * Features: Complete patient info, Guardian info, "Pasien Sendiri" option
 * Access: Admin, IGD only
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PatientForm, PatientFormData } from '@/components/PatientForm';
import { createPatient, generateMRN } from '@/lib/firestore';
import { buildFullAddress, getLocationName } from '@/lib/locationService';

export default function NewPatientPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingMRN, setGeneratingMRN] = useState(false);
  
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

  // Generate MRN on mount
  useEffect(() => {
    const generateNewMRN = async () => {
      setGeneratingMRN(true);
      try {
        const mrn = await generateMRN();
        setFormData(prev => ({ ...prev, noRM: mrn }));
      } catch (error) {
        console.error('Error generating MRN:', error);
        alert('Gagal generate No. RM. Silakan coba lagi.');
      } finally {
        setGeneratingMRN(false);
      }
    };
    generateNewMRN();
  }, []);

  const handleFormChange = (updates: Partial<PatientFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      await createPatient({
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

      alert('✅ Data pasien berhasil ditambahkan!');
      router.push('/patients');
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Gagal menambahkan data pasien. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (generatingMRN) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
          <p className="ml-3 text-gray-600">Generating No. RM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tambah Pasien Baru</h1>
          <p className="text-gray-600 mt-2">Isi formulir di bawah untuk mendaftarkan pasien baru</p>
        </div>

        <PatientForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Simpan Data Pasien"
          showMRNField={true}
          mrnReadOnly={true}
        />

        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={() => router.push('/patients')}
          >
            ← Kembali ke Daftar Pasien
          </Button>
        </div>
      </div>
    </div>
  );
}
