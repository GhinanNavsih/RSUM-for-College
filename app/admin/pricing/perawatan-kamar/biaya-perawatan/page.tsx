/**
 * ═══════════════════════════════════════════════════════════════
 * BIAYA PERAWATAN - MATRIX PRICING PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /admin/pricing/perawatan-kamar/biaya-perawatan
 * Purpose: Manage doctor/nursing/admin fees by room class
 * Features: Matrix table with per-class pricing
 * Access: Admin only
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  getAllServicePrices,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
} from '@/lib/firestore';
import { ServicePrice, RoomClass } from '@/types/models';
import { formatCurrency } from '@/lib/utils';

// Define the room classes for columns
const ROOM_CLASSES: RoomClass[] = ['KLS_3', 'KLS_2', 'KLS_1', 'VIP', 'KABER', 'ICU'];
const ROOM_CLASS_LABELS: Record<RoomClass, string> = {
  KLS_3: 'Kelas 3',
  KLS_2: 'Kelas 2',
  KLS_1: 'Kelas 1',
  VIP: 'VIP',
  KABER: 'KABER',
  ICU: 'ICU',
  BOX: 'Box',
  COUVE: 'Couveuse',
  INCUBATOR: 'Incubator',
};

// Define the service rows based on Excel tariff sheet
interface ServiceRow {
  serviceName: string;
  unit: string;
}

const SERVICE_ROWS: ServiceRow[] = [
  { serviceName: 'Visite dr Spesialis', unit: '/hari' },
  { serviceName: 'Visite dr Umum', unit: '/hari' },
  { serviceName: 'Jasa Pelayanan', unit: '/hari' },
  { serviceName: 'Sarana Keperawatan', unit: '/hari' },
  { serviceName: 'Konsul dr Spesialis', unit: '/kali' },
  { serviceName: 'Administrasi Kelas', unit: '/paket' },
  { serviceName: 'Sarana UGD', unit: '/paket' },
  { serviceName: 'Pemeriksaan dr Umum di UGD', unit: '/kali' },
];

export default function BiayaPerawatanPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allPrices, setAllPrices] = useState<ServicePrice[]>([]);
  
  // Matrix data: [serviceName][roomClass] => { price, id }
  const [matrix, setMatrix] = useState<Record<string, Record<string, { price: number; id?: string }>>>({});

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    } else if (appUser && appUser.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser && appUser.role === 'admin') {
      loadPrices();
    }
  }, [appUser]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const data = await getAllServicePrices();
      // Filter for BIAYA_PERAWATAN subcategory
      const biayaPerawatan = data.filter(
        p => p.category === 'PERAWATAN_KAMAR' && p.subCategory === 'BIAYA_PERAWATAN'
      );
      setAllPrices(biayaPerawatan);
      
      // Build matrix
      const newMatrix: Record<string, Record<string, { price: number; id?: string }>> = {};
      SERVICE_ROWS.forEach(row => {
        newMatrix[row.serviceName] = {};
        ROOM_CLASSES.forEach(roomClass => {
          const existing = biayaPerawatan.find(
            p => p.serviceName === row.serviceName && p.roomClass === roomClass
          );
          newMatrix[row.serviceName][roomClass] = {
            price: existing?.price || 0,
            id: existing?.id,
          };
        });
      });
      setMatrix(newMatrix);
    } catch (error) {
      console.error('Error loading prices:', error);
      alert('Gagal memuat data harga');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (serviceName: string, roomClass: string, value: string) => {
    const price = parseFloat(value) || 0;
    setMatrix(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        [roomClass]: {
          ...prev[serviceName][roomClass],
          price,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!confirm('Simpan semua perubahan harga Biaya Perawatan?')) return;

    setSaving(true);
    try {
      // Iterate through matrix and save/update each cell
      for (const row of SERVICE_ROWS) {
        for (const roomClass of ROOM_CLASSES) {
          const cell = matrix[row.serviceName]?.[roomClass];
          if (!cell) continue;

          const { price, id } = cell;

          // If price is 0 or empty, skip or delete
          if (price === 0) {
            if (id) {
              // Delete if exists
              await deleteServicePrice(id);
            }
            continue;
          }

          const serviceData = {
            category: 'PERAWATAN_KAMAR' as const,
            subCategory: 'BIAYA_PERAWATAN' as const,
            serviceName: row.serviceName,
            unit: row.unit,
            price,
            roomClass: roomClass as RoomClass,
            isActive: true,
            code: `BIAYA-${roomClass}-${row.serviceName.substring(0, 10).toUpperCase()}`,
          };

          if (id) {
            // Update existing
            await updateServicePrice(id, serviceData);
          } else {
            // Create new
            await createServicePrice(serviceData);
          }
        }
      }

      alert('✅ Semua harga Biaya Perawatan berhasil disimpan!');
      await loadPrices();
    } catch (error) {
      console.error('Error saving prices:', error);
      alert('Gagal menyimpan data harga');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!appUser || appUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <a href="/prices" className="hover:text-blue-600">Database Harga</a>
            <span>›</span>
            <span>1. PERAWATAN/KAMAR</span>
            <span>›</span>
            <span className="font-semibold text-gray-900">Biaya Perawatan</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Biaya Perawatan - Per Kelas Perawatan
          </h1>
          <p className="text-gray-600 mt-2">
            Atur tarif visite dokter, jasa pelayanan, sarana keperawatan, dan biaya administrasi per kelas perawatan.
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-2xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Cara Penggunaan</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Masukkan tarif untuk setiap jenis layanan (baris) dan kelas perawatan (kolom)</li>
                <li>• Kosongkan atau isi 0 jika layanan tidak tersedia untuk kelas tertentu</li>
                <li>• Klik <strong>&quot;💾 Simpan Semua Perubahan&quot;</strong> untuk menyimpan</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Matrix Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Jenis Layanan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satuan
                  </th>
                  {ROOM_CLASSES.map(roomClass => (
                    <th key={roomClass} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {ROOM_CLASS_LABELS[roomClass]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {SERVICE_ROWS.map((row, rowIdx) => (
                  <tr key={row.serviceName} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                      {row.serviceName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.unit}
                    </td>
                    {ROOM_CLASSES.map(roomClass => (
                      <td key={roomClass} className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={matrix[row.serviceName]?.[roomClass]?.price || 0}
                          onChange={(e) => handlePriceChange(row.serviceName, roomClass, e.target.value)}
                          className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {formatCurrency(matrix[row.serviceName]?.[roomClass]?.price || 0)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push('/prices')}
            >
              ← Kembali ke Database Harga
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : '💾 Simpan Semua Perubahan'}
            </Button>
          </div>
        </Card>

        {/* Summary */}
        <Card className="mt-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">📊 Ringkasan Data</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Layanan:</span>
              <span className="ml-2 font-semibold">{SERVICE_ROWS.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Kelas Perawatan:</span>
              <span className="ml-2 font-semibold">{ROOM_CLASSES.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Sel:</span>
              <span className="ml-2 font-semibold">{SERVICE_ROWS.length * ROOM_CLASSES.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Terisi:</span>
              <span className="ml-2 font-semibold text-green-600">{allPrices.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

