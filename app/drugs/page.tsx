/**
 * ═══════════════════════════════════════════════════════════════
 * DRUG DATABASE PAGE (Master & Inventory)
 * ═══════════════════════════════════════════════════════════════
 * Route: /drugs
 * Purpose: Manage drug master data and inventory
 * Features: CRUD operations, stock management, search
 * Access: Admin, Farmasi only
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/Badge';
import { BulkPurchaseModal } from '@/components/BulkPurchaseModal';
import { getAllDrugs, createDrug, updateDrug, deleteDrug, searchDrugs, getAveragePurchasePrices } from '@/lib/firestore';
import { Drug, DrugUnit } from '@/types/models';
import { formatCurrency } from '@/lib/utils';

export default function DrugsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Average purchase prices (Harga Kulak) - keyed by drug Firestore ID
  const [avgPurchasePrices, setAvgPurchasePrices] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    drugId: '',
    drugName: '',
    unit: 'Tablet' as DrugUnit,
    pricePerUnit: 0,
    stockQty: 0,
    minStockQty: 10,
    isActive: true,
    description: '',
    manufacturer: '',
  });

  // Bulk Purchase Modal state
  const [showBulkPurchaseModal, setShowBulkPurchaseModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser) {
      loadDrugs();
    }
  }, [appUser]);

  const loadDrugs = async () => {
    setLoading(true);
    try {
      // Load drugs and average purchase prices in parallel
      const [drugsData, avgPrices] = await Promise.all([
        getAllDrugs(),
        getAveragePurchasePrices(),
      ]);
      setDrugs(drugsData);
      setAvgPurchasePrices(avgPrices);
    } catch (error) {
      console.error('Error loading drugs:', error);
      alert('Gagal memuat data obat');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadDrugs();
      return;
    }

    setLoading(true);
    try {
      const results = await searchDrugs(searchTerm);
      setDrugs(results);
    } catch (error) {
      console.error('Error searching drugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (drug?: Drug) => {
    if (drug) {
      setEditingDrug(drug);
      setFormData({
        drugId: drug.drugId,
        drugName: drug.drugName,
        unit: drug.unit,
        pricePerUnit: drug.pricePerUnit,
        stockQty: drug.stockQty,
        minStockQty: drug.minStockQty || 10,
        isActive: drug.isActive,
        description: drug.description || '',
        manufacturer: drug.manufacturer || '',
      });
    } else {
      setEditingDrug(null);
      setFormData({
        drugId: '',
        drugName: '',
        unit: 'Tablet',
        pricePerUnit: 0,
        stockQty: 0,
        minStockQty: 10,
        isActive: true,
        description: '',
        manufacturer: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDrug(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const drugData = {
        drugId: formData.drugId,
        drugName: formData.drugName,
        unit: formData.unit,
        pricePerUnit: Number(formData.pricePerUnit),
        stockQty: Number(formData.stockQty),
        minStockQty: Number(formData.minStockQty),
        isActive: formData.isActive,
        description: formData.description,
        manufacturer: formData.manufacturer,
      };

      if (editingDrug) {
        await updateDrug(editingDrug.id, drugData);
        alert('Obat berhasil diperbarui!');
      } else {
        await createDrug(drugData);
        alert('Obat berhasil ditambahkan!');
      }

      handleCloseModal();
      loadDrugs();
    } catch (error) {
      console.error('Error saving drug:', error);
      alert('Gagal menyimpan data obat');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (drug: Drug) => {
    if (!confirm(`Hapus obat "${drug.drugName}"?`)) return;

    try {
      await deleteDrug(drug.id);
      alert('Obat berhasil dihapus!');
      loadDrugs();
    } catch (error) {
      console.error('Error deleting drug:', error);
      alert('Gagal menghapus obat');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!appUser) return null;

  // Access control: only admin and farmasi
  const hasAccess = appUser.role === 'admin' || appUser.role === 'farmasi';
  
  if (!hasAccess) {
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
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Database Obat</h1>
            <p className="text-gray-600 mt-1">Master Data & Inventory Management</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary"
              onClick={() => setShowBulkPurchaseModal(true)}
            >
              📦 Input Pembelian Obat
            </Button>
            <Button onClick={() => handleOpenModal()}>
              + Tambah Obat Baru
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Cari obat berdasarkan nama atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="mb-0"
            />
            <Button onClick={handleSearch}>Cari</Button>
            <Button variant="secondary" onClick={loadDrugs}>
              Reset
            </Button>
          </div>
        </div>

        {/* Drug Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : drugs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">Belum ada data obat.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Obat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Obat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satuan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga Kulak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga Jual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drugs.map((drug) => {
                    const isLowStock = drug.minStockQty && drug.stockQty <= drug.minStockQty;
                    
                    return (
                      <tr key={drug.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {drug.drugId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {drug.drugName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {drug.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {avgPurchasePrices[drug.id] ? (
                            <span className="font-medium text-orange-600">
                              {formatCurrency(avgPurchasePrices[drug.id])}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Belum ada</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          <span className="text-green-600">
                            {formatCurrency(drug.pricePerUnit)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {drug.stockQty}
                          </span>
                          {isLowStock && (
                            <Badge color="bg-red-100 text-red-800" className="ml-2">
                              Stok Rendah
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge color={drug.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {drug.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              className="text-xs py-1 px-3"
                              onClick={() => handleOpenModal(drug)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              className="text-xs py-1 px-3 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(drug)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Drug */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingDrug ? 'Edit Obat' : 'Tambah Obat Baru'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ID Obat *"
                    name="drugId"
                    value={formData.drugId}
                    onChange={handleChange}
                    placeholder="DRG-001"
                    required
                  />

                  <Input
                    label="Nama Obat *"
                    name="drugName"
                    value={formData.drugName}
                    onChange={handleChange}
                    placeholder="Paracetamol 500mg"
                    required
                  />

                  <Select
                    label="Satuan *"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    options={[
                      { value: 'Tablet', label: 'Tablet' },
                      { value: 'Kapsul', label: 'Kapsul' },
                      { value: 'Kaplet', label: 'Kaplet' },
                      { value: 'Botol', label: 'Botol' },
                      { value: 'Ampul', label: 'Ampul' },
                      { value: 'Vial', label: 'Vial' },
                      { value: 'Tube', label: 'Tube' },
                      { value: 'Strip', label: 'Strip' },
                      { value: 'Box', label: 'Box' },
                      { value: 'Sachet', label: 'Sachet' },
                      { value: 'ml', label: 'ml' },
                      { value: 'mg', label: 'mg' },
                      { value: 'Lainnya', label: 'Lainnya' },
                    ]}
                    required
                  />

                  <Input
                    label="Harga Jual per Unit *"
                    name="pricePerUnit"
                    type="number"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    placeholder="5000"
                    required
                  />

                  <Input
                    label="Jumlah Stok *"
                    name="stockQty"
                    type="number"
                    value={formData.stockQty}
                    onChange={handleChange}
                    placeholder="100"
                    required
                  />

                  <Input
                    label="Minimum Stok (Peringatan)"
                    name="minStockQty"
                    type="number"
                    value={formData.minStockQty}
                    onChange={handleChange}
                    placeholder="10"
                  />

                  <Input
                    label="Pabrik / Manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="PT. Pharma"
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Deskripsi / Keterangan"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Obat pereda nyeri dan demam"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Obat Aktif (Tersedia untuk diresepkan)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Menyimpan...' : editingDrug ? 'Simpan Perubahan' : 'Tambah Obat'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    disabled={saving}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Purchase Modal */}
      <BulkPurchaseModal
        isOpen={showBulkPurchaseModal}
        onClose={() => setShowBulkPurchaseModal(false)}
        onSuccess={loadDrugs}
        currentUserId={appUser?.id || ''}
      />
    </div>
  );
}

