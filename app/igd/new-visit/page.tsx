'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getAllPatients, createVisit, getPatient, getActiveDoctors } from '@/lib/firestore';
import { Patient, VisitType, AsuransiType, Doctor } from '@/types/models';

function NewVisitContent() {
  const { appUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPatientId = searchParams.get('patientId');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [formData, setFormData] = useState({
    patientId: preSelectedPatientId || '',
    jenis: 'IGD' as VisitType,
    dokter: '',
    rujukan: '',
    asuransi: 'Umum' as AsuransiType,
  });

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (preSelectedPatientId) {
      setFormData(prev => ({ ...prev, patientId: preSelectedPatientId }));
    }
  }, [preSelectedPatientId]);

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await getActiveDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appUser) {
      alert('Anda harus login terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {
      const visitId = await createVisit({
        patientId: formData.patientId,
        tanggalKunjungan: new Date().toISOString(),
        jenis: formData.jenis,
        dokter: formData.dokter,
        rujukan: formData.rujukan || undefined,
        asuransi: formData.asuransi,
        status: 'igd_in_progress',
        services: [],
        prescriptions: [],
        totalBiaya: 0,
        paymentStatus: 'unpaid',
        dispensationStatus: 'pending',
        createdByUserId: appUser.id,
      });

      alert('Kunjungan berhasil dibuat!');
      router.push(`/igd/visit/${visitId}`);
    } catch (error) {
      console.error('Error creating visit:', error);
      alert('Gagal membuat kunjungan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kunjungan Baru</h1>
          <p className="text-gray-600 mt-2">Buat kunjungan baru untuk pasien</p>
        </div>

        <Card>
          {(loadingPatients || loadingDoctors) ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Select
                label="Pilih Pasien *"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                options={[
                  { value: '', label: '-- Pilih Pasien --' },
                  ...patients.map(p => ({
                    value: p.id,
                    label: `${p.noRM} - ${p.nama}`,
                  })),
                ]}
                required
              />

              <Select
                label="Jenis Kunjungan *"
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                options={[
                  { value: 'IGD', label: 'IGD' },
                  { value: 'Rawat Jalan', label: 'Rawat Jalan' },
                  { value: 'Rawat Inap', label: 'Rawat Inap' },
                ]}
                required
              />

              <Select
                label="Dokter Penanggung Jawab *"
                name="dokter"
                value={formData.dokter}
                onChange={handleChange}
                options={[
                  { value: '', label: '-- Pilih Dokter --' },
                  ...doctors.map(d => ({
                    value: d.fullName,
                    label: `${d.fullName}${d.specialization ? ` (${d.specialization})` : ''}`,
                  })),
                ]}
                required
              />
              {doctors.length === 0 && !loadingDoctors && (
                <p className="text-xs text-red-500 -mt-3 mb-4">
                  Tidak ada dokter di database. Admin perlu menambahkan dokter terlebih dahulu.
                </p>
              )}

              <Input
                label="Rujukan"
                name="rujukan"
                value={formData.rujukan}
                onChange={handleChange}
                placeholder="Contoh: RS Lain, Puskesmas, Datang Sendiri"
              />

              <Select
                label="Asuransi *"
                name="asuransi"
                value={formData.asuransi}
                onChange={handleChange}
                options={[
                  { value: 'Umum', label: 'Umum' },
                  { value: 'BPJS', label: 'BPJS' },
                  { value: 'P2KS', label: 'P2KS' },
                  { value: 'YAPETIDU', label: 'YAPETIDU' },
                ]}
                required
              />

              <div className="flex gap-4 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Membuat...' : 'Buat Kunjungan'}
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

export default function NewVisitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    }>
      <NewVisitContent />
    </Suspense>
  );
}

