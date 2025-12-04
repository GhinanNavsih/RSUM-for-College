/**
 * ═══════════════════════════════════════════════════════════════
 * LAB QUEUE PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /lab
 * Purpose: Lab dashboard showing visits that need lab tests
 * Features:
 * - List of visits with pending lab requests
 * - Quick access to lab order page
 * Access: Lab users (and admin)
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPatient, getLabOrderByVisitId } from '@/lib/firestore';
import { Visit, Patient, LabOrder } from '@/types/models';
import { formatDate } from '@/lib/utils';

interface LabQueueItem {
  visit: Visit;
  patient: Patient | null;
  labOrder: LabOrder | null;
}

export default function LabPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [queueItems, setQueueItems] = useState<LabQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser) {
      loadLabQueue();
    }
  }, [appUser]);

  const loadLabQueue = async () => {
    setLoading(true);
    try {
      // Query visits that have lab requested (exam.penunjangLabRequested = true)
      const visitsRef = collection(db, 'visits');
      
      let visits: Visit[] = [];
      
      try {
        // Try with orderBy first
        const q = query(
          visitsRef,
          orderBy('tanggalKunjungan', 'desc')
        );
        const querySnapshot = await getDocs(q);
        visits = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Visit));
      } catch (orderError: any) {
        // Fallback: get all visits without ordering
        console.warn('orderBy failed, fetching without order:', orderError);
        const querySnapshot = await getDocs(visitsRef);
        visits = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Visit));
        // Sort client-side
        visits.sort((a, b) => 
          new Date(b.tanggalKunjungan).getTime() - new Date(a.tanggalKunjungan).getTime()
        );
      }

      console.log('📋 Total visits loaded:', visits.length);
      
      // Debug: log visits with exam data
      const visitsWithExam = visits.filter(v => v.exam);
      console.log('🔬 Visits with exam data:', visitsWithExam.length);
      visitsWithExam.forEach(v => {
        console.log(`  - Visit ${v.id}: penunjangLabRequested = ${v.exam?.penunjangLabRequested}`);
      });

      // Filter visits that have lab requested
      const labVisits = visits.filter(visit => 
        visit.exam?.penunjangLabRequested === true
      );
      
      console.log('✅ Visits with lab requested:', labVisits.length);

      // Load patient data and lab orders for each visit
      const items: LabQueueItem[] = await Promise.all(
        labVisits.slice(0, 50).map(async (visit) => {
          const patient = await getPatient(visit.patientId);
          const labOrder = await getLabOrderByVisitId(visit.id);
          return { visit, patient, labOrder };
        })
      );

      setQueueItems(items);
    } catch (error) {
      console.error('❌ Error loading lab queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search
  const filteredItems = queueItems.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const patientName = item.patient?.nama || item.patient?.fullName || item.patient?.tempFullName || '';
    const patientMRN = item.patient?.noRM || '';
    return (
      patientName.toLowerCase().includes(searchLower) ||
      patientMRN.toLowerCase().includes(searchLower)
    );
  });

  // Get patient display name
  const getPatientName = (patient: Patient | null): string => {
    if (!patient) return '-';
    return patient.nama || patient.fullName || patient.tempFullName || '-';
  };

  // Get lab order status badge
  const getLabStatusBadge = (labOrder: LabOrder | null) => {
    if (!labOrder) {
      return <Badge color="bg-yellow-100 text-yellow-800">Belum diproses</Badge>;
    }
    if (labOrder.status === 'COMPLETED') {
      return <Badge color="bg-green-100 text-green-800">Selesai</Badge>;
    }
    return (
      <Badge color="bg-blue-100 text-blue-800">
        Diminta ({labOrder.tests?.length || 0} tes)
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Access control
  if (!appUser || !['admin', 'igd', 'lab'].includes(appUser.role)) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🔬 Laboratorium</h1>
          <p className="text-gray-600 mt-2">
            Daftar kunjungan yang memerlukan pemeriksaan laboratorium
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">
                {queueItems.filter(i => !i.labOrder).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Belum Diproses</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">
                {queueItems.filter(i => i.labOrder?.status === 'REQUESTED').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Permintaan Aktif</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {queueItems.filter(i => i.labOrder?.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Selesai</p>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Cari Pasien"
                placeholder="Cari berdasarkan nama atau No. RM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-0"
              />
            </div>
            <Button variant="secondary" onClick={loadLabQueue}>
              🔄 Refresh
            </Button>
          </div>
        </Card>

        {/* Queue Table */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Antrian Lab ({filteredItems.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Tidak ada hasil yang cocok dengan pencarian.'
                  : 'Tidak ada kunjungan yang memerlukan pemeriksaan lab.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No. RM
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama Pasien
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Jenis
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dokter
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status Lab
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.visit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(item.visit.tanggalKunjungan)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {item.patient?.noRM || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {getPatientName(item.patient)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge>{item.visit.jenis}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.visit.dokter || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getLabStatusBadge(item.labOrder)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="primary"
                          className="text-xs py-1 px-3"
                          onClick={() => router.push(`/lab/visit/${item.visit.id}`)}
                        >
                          {item.labOrder ? '📝 Edit' : '➕ Proses'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-xl">ℹ️</span>
            <div>
              <h4 className="font-semibold text-blue-900">Petunjuk</h4>
              <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                <li>Daftar ini menampilkan kunjungan dengan permintaan lab dari IGD</li>
                <li>Klik &quot;Proses&quot; untuk memilih pemeriksaan lab yang akan dilakukan</li>
                <li>Klik &quot;Edit&quot; untuk mengubah permintaan lab yang sudah ada</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

