/**
 * ═══════════════════════════════════════════════════════════════
 * IGD INTAKE PAGE (Temporary Patient Registration)
 * ═══════════════════════════════════════════════════════════════
 * Route: /igd/intake
 * Purpose: Quick emergency registration form for IGD staff
 * Features: Minimal required fields for emergency situations
 * Access: IGD, Admin only
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { createPatient, getActiveDoctors } from '@/lib/firestore';
import { EmergencyTriageLevel, JenisKelaminShort, Doctor } from '@/types/models';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function IGDIntakePage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const [formData, setFormData] = useState({
    tempDoctorId: '',
    tempNurseName: '',
    tempFullName: '',
    tempAge: '',
    tempWeightKg: '',
    tempGender: 'L' as JenisKelaminShort,
    tempDomicile: '',
    tempPhoneNumber: '',
    tempFamilyContact: '',
    tempChiefComplaint: '',
    tempTriage: '' as EmergencyTriageLevel | '',
    tempDischargeReason: '',
    tempSectioEmergency: false,
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await getActiveDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      alert('Gagal memuat data dokter.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find selected doctor
      const selectedDoctor = doctors.find(d => d.id === formData.tempDoctorId);
      
      // Create temporary patient record
      const patientId = await createPatient({
        registrationStatus: 'TEMPORARY',
        
        // Temporary fields
        tempDoctorId: formData.tempDoctorId,
        tempDoctorName: selectedDoctor?.fullName || '',
        tempNurseName: formData.tempNurseName,
        tempFullName: formData.tempFullName,
        tempAge: formData.tempAge ? parseInt(formData.tempAge) : undefined,
        tempWeightKg: formData.tempWeightKg ? parseFloat(formData.tempWeightKg) : undefined,
        tempGender: formData.tempGender,
        tempDomicile: formData.tempDomicile || undefined,
        tempPhoneNumber: formData.tempPhoneNumber || undefined,
        tempFamilyContact: formData.tempFamilyContact || undefined,
        tempChiefComplaint: formData.tempChiefComplaint,
        tempTriage: formData.tempTriage as EmergencyTriageLevel,
        tempDischargeReason: formData.tempDischargeReason || undefined,
        tempSectioEmergency: formData.tempSectioEmergency,
        
        // Also populate some legacy fields for compatibility
        nama: formData.tempFullName,
        umur: formData.tempAge ? parseInt(formData.tempAge) : undefined,
        noTelp: formData.tempPhoneNumber || undefined,
      });

      alert('Pasien IGD berhasil didaftarkan (sementara)!');
      
      // Redirect to create visit for this patient
      router.push(`/igd/new-visit?patientId=${patientId}`);
    } catch (error) {
      console.error('Error creating temporary patient:', error);
      alert('Gagal mendaftarkan pasien. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'igd')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <p className="text-red-600">Anda tidak memiliki akses ke halaman ini.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Registrasi Pasien IGD - Sementara</h1>
          <p className="text-gray-600 mt-2">Form cepat untuk pendaftaran pasien gawat darurat</p>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Info:</strong> Form ini hanya untuk data darurat. Resepsionis akan melengkapi data pasien nanti.
            </p>
          </div>
        </div>

        <Card>
          {loadingDoctors ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Medical Staff Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Petugas Medis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Dokter *"
                    name="tempDoctorId"
                    value={formData.tempDoctorId}
                    onChange={handleChange}
                    options={[
                      { value: '', label: '-- Pilih Dokter --' },
                      ...doctors.map(d => ({
                        value: d.id,
                        label: `${d.fullName}${d.specialization ? ` (${d.specialization})` : ''}`,
                      })),
                    ]}
                    required
                  />

                  <Input
                    label="Perawat/Bidan *"
                    name="tempNurseName"
                    value={formData.tempNurseName}
                    onChange={handleChange}
                    placeholder="Nama perawat/bidan"
                    required
                  />
                </div>
              </div>

              {/* Patient Basic Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Dasar Pasien</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nama Lengkap *"
                      name="tempFullName"
                      value={formData.tempFullName}
                      onChange={handleChange}
                      placeholder="Nama lengkap pasien"
                      required
                    />
                  </div>

                  <Input
                    label="Umur (tahun) *"
                    name="tempAge"
                    type="number"
                    value={formData.tempAge}
                    onChange={handleChange}
                    placeholder="Umur dalam tahun"
                    required
                    min="0"
                    max="150"
                  />

                  <Input
                    label="Berat Badan (kg)"
                    name="tempWeightKg"
                    type="number"
                    step="0.1"
                    value={formData.tempWeightKg}
                    onChange={handleChange}
                    placeholder="Berat badan"
                    min="0"
                  />

                  <Select
                    label="Jenis Kelamin *"
                    name="tempGender"
                    value={formData.tempGender}
                    onChange={handleChange}
                    options={[
                      { value: 'L', label: 'Laki-laki' },
                      { value: 'P', label: 'Perempuan' },
                    ]}
                    required
                  />

                  <Input
                    label="Domisili"
                    name="tempDomicile"
                    value={formData.tempDomicile}
                    onChange={handleChange}
                    placeholder="Desa/Kota"
                  />

                  <Input
                    label="No HP Pasien"
                    name="tempPhoneNumber"
                    type="tel"
                    value={formData.tempPhoneNumber}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                  />

                  <Input
                    label="Kontak Keluarga"
                    name="tempFamilyContact"
                    type="tel"
                    value={formData.tempFamilyContact}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              {/* Clinical Information */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Klinis</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keluhan Utama *
                  </label>
                  <textarea
                    name="tempChiefComplaint"
                    value={formData.tempChiefComplaint}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Keluhan pasien..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Triase *"
                    name="tempTriage"
                    value={formData.tempTriage}
                    onChange={handleChange}
                    options={[
                      { value: '', label: '-- Pilih Level Triase --' },
                      { value: 'MERAH', label: '🔴 MERAH - Emergency' },
                      { value: 'KUNING', label: '🟡 KUNING - Urgent' },
                      { value: 'HIJAU', label: '🟢 HIJAU - Non-Urgent' },
                      { value: 'HITAM', label: '⚫ HITAM - Deceased' },
                    ]}
                    required
                  />

                  <Input
                    label="Alasan Pulang"
                    name="tempDischargeReason"
                    value={formData.tempDischargeReason}
                    onChange={handleChange}
                    placeholder="Pulang, Rujuk, Meninggal, dll"
                  />
                </div>

                <div className="mt-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="tempSectioEmergency"
                      checked={formData.tempSectioEmergency}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      Sectio Caesarea Emergency
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan & Lanjut ke Kunjungan'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

