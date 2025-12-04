/**
 * ═══════════════════════════════════════════════════════════════
 * RADIOLOGY QUEUE PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /radiologi
 * Purpose: Radiology dashboard showing visits that need radiology exams
 * Features:
 * - List of visits with pending radiology requests
 * - Quick access to radiology order page
 * Access: Radiologi users (and admin)
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
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPatient, getRadiologyOrderByVisitId } from '@/lib/firestore';
import { Visit, Patient, RadiologyOrder } from '@/types/models';
import { formatDate } from '@/lib/utils';

interface RadiologyQueueItem {
  visit: Visit;
  patient: Patient | null;
  radiologyOrder: RadiologyOrder | null;
}

export default function RadiologiPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [queueItems, setQueueItems] = useState<RadiologyQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser) {
      loadRadiologyQueue();
    }
  }, [appUser]);

  const loadRadiologyQueue = async () => {
    setLoading(true);
    try {
      // Query visits that have radiology requested (exam.penunjangRadioRequested = true)
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
      console.log('📷 Visits with exam data:', visitsWithExam.length);
      visitsWithExam.forEach(v => {
        console.log(`  - Visit ${v.id}: penunjangRadioRequested = ${v.exam?.penunjangRadioRequested}`);
      });

      // Filter visits that have radiology requested
      const radioVisits = visits.filter(visit => 
        visit.exam?.penunjangRadioRequested === true
      );
      
      console.log('✅ Visits with radiology requested:', radioVisits.length);

      // Load patient data and radiology orders for each visit
      const items: RadiologyQueueItem[] = await Promise.all(
        radioVisits.slice(0, 50).map(async (visit) => {
          const patient = await getPatient(visit.patientId);
          const radiologyOrder = await getRadiologyOrderByVisitId(visit.id);
          return { visit, patient, radiologyOrder };
        })
      );

      setQueueItems(items);
    } catch (error) {
      console.error('❌ Error loading radiology queue:', error);
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

  // Get radiology order status badge
  const getRadiologyStatusBadge = (radiologyOrder: RadiologyOrder | null) => {
    if (!radiologyOrder) {
      return <Badge color="bg-yellow-100 text-yellow-800">Belum diproses</Badge>;
    }
    if (radiologyOrder.status === 'COMPLETED') {
      return <Badge color="bg-green-100 text-green-800">Selesai</Badge>;
    }
    return (
      <Badge color="bg-purple-100 text-purple-800">
        Diminta ({radiologyOrder.tests?.length || 0} pemeriksaan)
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
  if (!appUser || !['admin', 'igd', 'radiologi'].includes(appUser.role)) {
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
          <h1 className="text-3xl font-bold text-gray-900">📷 Radiologi</h1>
          <p className="text-gray-600 mt-2">
            Daftar kunjungan yang memerlukan pemeriksaan radiologi
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">
                {queueItems.filter(i => !i.radiologyOrder).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Belum Diproses</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">
                {queueItems.filter(i => i.radiologyOrder?.status === 'REQUESTED').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Permintaan Aktif</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {queueItems.filter(i => i.radiologyOrder?.status === 'COMPLETED').length}
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
            <Button variant="secondary" onClick={loadRadiologyQueue}>
              🔄 Refresh
            </Button>
          </div>
        </Card>

        {/* Queue Table */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Antrian Radiologi ({filteredItems.length})
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
                  : 'Tidak ada kunjungan yang memerlukan pemeriksaan radiologi.'}
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
                      Status Radiologi
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
                        {getRadiologyStatusBadge(item.radiologyOrder)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="primary"
                          className="text-xs py-1 px-3"
                          onClick={() => router.push(`/radiologi/visit/${item.visit.id}`)}
                        >
                          {item.radiologyOrder ? '📝 Edit' : '➕ Proses'}
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
        <Card className="mt-6 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <span className="text-purple-600 text-xl">ℹ️</span>
            <div>
              <h4 className="font-semibold text-purple-900">Petunjuk</h4>
              <ul className="text-sm text-purple-700 mt-1 list-disc list-inside">
                <li>Daftar ini menampilkan kunjungan dengan permintaan radiologi dari IGD</li>
                <li>Klik &quot;Proses&quot; untuk memilih pemeriksaan radiologi yang akan dilakukan</li>
                <li>Klik &quot;Edit&quot; untuk mengubah permintaan radiologi yang sudah ada</li>
                <li>Untuk pemeriksaan ekstremitas, pilih sisi <strong>R</strong> (kanan) atau <strong>L</strong> (kiri)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

