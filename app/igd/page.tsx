'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getVisitsByStatus, getPatient } from '@/lib/firestore';
import { Visit, Patient } from '@/types/models';
import { formatDate, formatCurrency, getStatusBadge } from '@/lib/utils';
import Link from 'next/link';

export default function IGDPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
    if (!authLoading && appUser && appUser.role !== 'admin' && appUser.role !== 'igd') {
      router.push('/');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser) {
      loadVisits();
    }
  }, [appUser]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const data = await getVisitsByStatus('igd_in_progress');
      setVisits(data);

      // Load patient data for each visit
      const patientMap: Record<string, Patient> = {};
      for (const visit of data) {
        if (!patientMap[visit.patientId]) {
          const patient = await getPatient(visit.patientId);
          if (patient) {
            patientMap[visit.patientId] = patient;
          }
        }
      }
      setPatients(patientMap);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard IGD</h1>
            <p className="text-gray-600 mt-2">Kelola kunjungan pasien IGD</p>
          </div>
          <div className="flex gap-3">
            <Link href="/igd/intake">
              <Button variant="primary">+ Registrasi Cepat IGD</Button>
            </Link>
            <Link href="/igd/new-visit">
              <Button variant="secondary">Kunjungan Baru</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Dalam Proses</p>
              <p className="text-4xl font-bold text-yellow-600">{visits.length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Menunggu Pembayaran</p>
              <p className="text-4xl font-bold text-red-600">
                {visits.filter(v => v.status === 'igd_done' && v.paymentStatus === 'unpaid').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Menunggu Obat</p>
              <p className="text-4xl font-bold text-orange-600">
                {visits.filter(v => v.prescriptions.length > 0 && v.dispensationStatus === 'pending').length}
              </p>
            </div>
          </Card>
        </div>

        <Card title="Kunjungan Dalam Proses">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : visits.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Tidak ada kunjungan dalam proses.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pasien
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No. RM
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dokter
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
                    const patient = patients[visit.patientId];
                    const statusBadge = getStatusBadge(visit.status);
                    
                    return (
                      <tr key={visit.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {patient?.nama || 'Loading...'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient?.noRM || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {formatDate(visit.tanggalKunjungan)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {visit.dokter}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Badge color={statusBadge.color}>{statusBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Link href={`/igd/visit/${visit.id}`}>
                            <Button variant="secondary" className="text-xs py-1 px-3">
                              Proses
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

