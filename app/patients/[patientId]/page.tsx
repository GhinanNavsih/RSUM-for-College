/**
 * ═══════════════════════════════════════════════════════════════
 * PATIENT DETAIL PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /patients/:id
 * Purpose: Display complete patient information and visit history
 * Features: View all patient data, Edit button, New visit button
 * Access: All authenticated users
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getPatient, getVisitsByPatient } from '@/lib/firestore';
import { Patient, Visit } from '@/types/models';
import { formatDate, formatCurrency, getStatusBadge } from '@/lib/utils';
import Link from 'next/link';

export default function PatientDetailPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      console.log('Loading patient with ID:', patientId);
      const patientData = await getPatient(patientId);
      console.log('Patient data received:', patientData);
      
      if (!patientData) {
        console.error('Patient not found in database');
        setPatient(null);
        setLoading(false);
        return;
      }
      
      const visitsData = await getVisitsByPatient(patientId);
      console.log('Visits data received:', visitsData);
      
      setPatient(patientData);
      setVisits(visitsData);
    } catch (error) {
      console.error('Error loading patient data:', error);
      console.error('Error details:', error);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <p className="text-red-600 font-semibold mb-2">Pasien tidak ditemukan.</p>
            <p className="text-gray-600 text-sm">Patient ID: {patientId}</p>
            <p className="text-gray-600 text-sm mt-2">
              Kemungkinan penyebab:
            </p>
            <ul className="text-gray-600 text-sm list-disc list-inside mt-1">
              <li>Data pasien belum ada di database</li>
              <li>ID pasien tidak valid</li>
              <li>Koneksi ke database bermasalah</li>
            </ul>
            <div className="mt-4">
              <Button onClick={() => router.push('/patients')}>
                Kembali ke Daftar Pasien
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const canCreateVisit = appUser?.role === 'admin' || appUser?.role === 'igd';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{patient.nama}</h1>
            <p className="text-gray-600 mt-1">No. RM: {patient.noRM}</p>
          </div>
          <div className="flex gap-2">
            {canCreateVisit && (
              <>
                <Link href={`/patients/${patientId}/edit`}>
                  <Button variant="secondary">Edit Data Pasien</Button>
                </Link>
                <Link href={`/igd/new-visit?patientId=${patientId}`}>
                  <Button>+ Kunjungan Baru</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Informasi Dasar */}
          <Card title="Informasi Dasar">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">NIK</p>
                <p className="font-medium">{patient.nik || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tanggal Lahir</p>
                <p className="font-medium">
                  {patient.tanggalLahir ? formatDate(patient.tanggalLahir) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Umur</p>
                <p className="font-medium">{patient.umur ? `${patient.umur} tahun` : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis Kelamin</p>
                <p className="font-medium">{patient.jenisKelamin || '-'}</p>
              </div>
            </div>
          </Card>

          {/* Kontak & Alamat */}
          <Card title="Kontak & Alamat">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">No. Telepon / HP</p>
                <p className="font-medium">{patient.noTelp || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{patient.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alamat Lengkap</p>
                <p className="font-medium">{patient.alamat || '-'}</p>
              </div>
            </div>
          </Card>

          {/* Informasi Tambahan */}
          <Card title="Informasi Tambahan">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status Pernikahan</p>
                <p className="font-medium">{patient.statusPernikahan || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pekerjaan</p>
                <p className="font-medium">{patient.pekerjaan || '-'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Penanggung Jawab */}
        <div className="mb-6">
          <Card title="Penanggung Jawab">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Penanggung Jawab</p>
                <p className="font-medium">{patient.namaPenanggungJawab || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hubungan</p>
                <p className="font-medium">{patient.hubunganPenanggungJawab || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kontak Penanggung Jawab</p>
                <p className="font-medium">{patient.kontakPenanggungJawab || '-'}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Riwayat Kunjungan">
          {visits.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Belum ada riwayat kunjungan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Jenis
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dokter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Biaya
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visits.map((visit) => {
                    const statusBadge = getStatusBadge(visit.status);
                    const paymentBadge = getStatusBadge(visit.paymentStatus);
                    
                    return (
                      <tr key={visit.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {formatDate(visit.tanggalKunjungan)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Badge>{visit.jenis}</Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {visit.dokter}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(visit.totalBiaya)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="space-y-1">
                            <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
                            <br />
                            <Badge color={paymentBadge.color}>{paymentBadge.label}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Link href={`/igd/visit/${visit.id}`}>
                            <Button variant="secondary" className="text-xs py-1 px-3">
                              Detail
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

