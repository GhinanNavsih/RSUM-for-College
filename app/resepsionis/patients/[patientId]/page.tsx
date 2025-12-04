/**
 * ═══════════════════════════════════════════════════════════════
 * RESEPSIONIS - COMPLETE PATIENT REGISTRATION
 * ═══════════════════════════════════════════════════════════════
 * Route: /resepsionis/patients/[patientId]
 * Purpose: Complete full registration for temporary patients
 * Access: Resepsionis, Admin only
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PatientForm, PatientFormData } from '@/components/PatientForm';
import { getPatient, updatePatient, generateMRN } from '@/lib/firestore';
import { buildFullAddress, getLocationName } from '@/lib/locationService';

export default function CompletePatientRegistrationPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempData, setTempData] = useState<any>(null);
  
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
        router.push('/resepsionis/patients');
        return;
      }

      // Check if already completed
      if (patient.registrationStatus === 'COMPLETE') {
        alert('Pasien ini sudah melakukan registrasi lengkap');
        router.push('/resepsionis/patients');
        return;
      }

      setTempData(patient);

      // Generate MRN if not exists
      let mrn = patient.noRM || '';
      if (!mrn) {
        mrn = await generateMRN();
      }

      // Pre-fill form with temporary data
      setFormData({
        noRM: mrn,
        nama: patient.tempFullName || patient.nama || '',
        nik: patient.nik || '',
        tanggalLahir: patient.tanggalLahir || '',
        jenisKelamin: patient.tempGender === 'L' ? 'Laki-laki' : patient.tempGender === 'P' ? 'Perempuan' : patient.jenisKelamin || 'Laki-laki',
        provinsiId: patient.alamatLengkap?.provinsiId || '',
        kabupatenId: patient.alamatLengkap?.kabupatenId || '',
        kecamatanId: patient.alamatLengkap?.kecamatanId || '',
        desaId: patient.alamatLengkap?.desaId || '',
        detailAlamat: patient.alamatLengkap?.detailAlamat || '',
        noTelp: patient.tempPhoneNumber || patient.noTelp || '',
        email: patient.email || '',
        insuranceType: patient.insuranceType || 'Umum',
        religion: patient.religion || 'Islam',
        statusPernikahan: patient.statusPernikahan || '',
        pekerjaan: patient.pekerjaan || '',
        namaPenanggungJawab: patient.namaPenanggungJawab || '',
        hubunganPenanggungJawab: patient.hubunganPenanggungJawab || 'Orang Tua',
        kontakPenanggungJawab: patient.tempFamilyContact || patient.kontakPenanggungJawab || '',
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
        // Update registration status
        registrationStatus: 'COMPLETE',
        
        // Standard fields
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
        
        // New standardized fields
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
      });

      alert('✅ Registrasi pasien berhasil dilengkapi!');
      router.push('/resepsionis/patients');
    } catch (error) {
      console.error('Error completing registration:', error);
      alert('Gagal melengkapi registrasi. Silakan coba lagi.');
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
          <h1 className="text-3xl font-bold text-gray-900">Lengkapi Registrasi Pasien</h1>
          <p className="text-gray-600 mt-2">Lengkapi data pasien yang telah didaftarkan sementara oleh IGD</p>
        </div>

        {/* Temporary Data Info */}
        {tempData && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Data Sementara dari IGD</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              {tempData.tempFullName && (
                <div>
                  <span className="font-medium">Nama:</span> {tempData.tempFullName}
                </div>
              )}
              {tempData.tempAge && (
                <div>
                  <span className="font-medium">Umur:</span> {tempData.tempAge} tahun
                </div>
              )}
              {tempData.tempGender && (
                <div>
                  <span className="font-medium">Jenis Kelamin:</span> {tempData.tempGender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </div>
              )}
              {tempData.tempPhoneNumber && (
                <div>
                  <span className="font-medium">No. HP:</span> {tempData.tempPhoneNumber}
                </div>
              )}
              {tempData.tempChiefComplaint && (
                <div className="col-span-2">
                  <span className="font-medium">Keluhan:</span> {tempData.tempChiefComplaint}
                </div>
              )}
            </div>
          </Card>
        )}

        <PatientForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Lengkapi & Simpan Registrasi"
          showMRNField={true}
          mrnReadOnly={true}
        />

        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={() => router.push('/resepsionis/patients')}
          >
            ← Kembali ke Daftar Pasien Sementara
          </Button>
        </div>
      </div>
    </div>
  );
}
