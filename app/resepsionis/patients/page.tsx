/**
 * ═══════════════════════════════════════════════════════════════
 * RESEPSIONIS - TEMPORARY PATIENTS LIST PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /resepsionis/patients
 * Purpose: List all temporary patients needing full registration
 * Access: Resepsionis, Admin only
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getTemporaryPatients } from '@/lib/firestore';
import { Patient } from '@/types/models';
import { formatDate, formatTime } from '@/lib/utils';

export default function ResepsionisTemporaryPatientsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today'>('today');

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
    if (!authLoading && appUser && appUser.role !== 'admin' && appUser.role !== 'resepsionis') {
      router.push('/');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser) {
      loadPatients();
    }
  }, [appUser]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await getTemporaryPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading temporary patients:', error);
      alert('Gagal memuat data pasien sementara.');
    } finally {
      setLoading(false);
    }
  };

  const getTriageColor = (triage?: string) => {
    switch (triage) {
      case 'MERAH':
        return 'red';
      case 'KUNING':
        return 'yellow';
      case 'HIJAU':
        return 'green';
      case 'HITAM':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getTriageLabel = (triage?: string) => {
    switch (triage) {
      case 'MERAH':
        return '🔴 Merah';
      case 'KUNING':
        return '🟡 Kuning';
      case 'HIJAU':
        return '🟢 Hijau';
      case 'HITAM':
        return '⚫ Hitam';
      default:
        return '-';
    }
  };

  const filterPatients = (patients: Patient[]) => {
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      return patients.filter(p => p.createdAt >= todayISO);
    }
    return patients;
  };

  const filteredPatients = filterPatients(patients);

  if (authLoading || !appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pasien Registrasi Sementara</h1>
            <p className="text-gray-600 mt-2">Lengkapi data pasien yang didaftarkan oleh IGD</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={filter === 'today' ? 'primary' : 'secondary'}
            onClick={() => setFilter('today')}
          >
            Hari Ini
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            Semua
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Hari Ini</p>
              <p className="text-4xl font-bold text-blue-600">
                {filterPatients(patients).length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Belum Lengkap</p>
              <p className="text-4xl font-bold text-orange-600">{patients.length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Perlu Dilengkapi</p>
              <p className="text-4xl font-bold text-red-600">{filteredPatients.length}</p>
            </div>
          </Card>
        </div>

        <Card title="Daftar Pasien Sementara">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredPatients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {filter === 'today' 
                ? 'Tidak ada pasien sementara hari ini.' 
                : 'Tidak ada pasien sementara.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Waktu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama Pasien
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Umur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Triase
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dokter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Domisili
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No HP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatTime(patient.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(patient.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient.tempFullName || patient.nama || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.tempAge || patient.umur || '-'} th
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Badge color={getTriageColor(patient.tempTriage)}>
                          {getTriageLabel(patient.tempTriage)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.tempDoctorName || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.tempDomicile || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.tempPhoneNumber || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Link href={`/resepsionis/patients/${patient.id}`}>
                          <Button variant="primary" className="text-xs py-1 px-3">
                            Lengkapi Data
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

