/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED PRICING DATABASE PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /prices
 * Purpose: Manage all service pricing across 12 billing categories
 * Features: CRUD operations, category-based filtering, search
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
import {
  getAllServicePrices,
  getServicePricesByCategory,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
  searchServicePrices,
  getAllAmbulanceConfigs,
  createAmbulanceConfig,
  updateAmbulanceConfig,
} from '@/lib/firestore';
import { ServicePrice, BillingCategory, BILLING_SECTIONS, AmbulanceConfig } from '@/types/models';
import { formatCurrency } from '@/lib/utils';
import { 
  DEFAULT_AMBULANCE_CONFIG, 
  AmbulanceVehicleType,
  AmbulanceTariffConfig,
  getVehicleTypes 
} from '@/lib/ambulancePricing';

export default function PricesPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BillingCategory>('PERAWATAN_KAMAR');
  const [showModal, setShowModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ServicePrice | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    serviceName: '',
    price: 0,
    unit: 'Hari',
    code: '',
    isActive: true,
    description: '',
  });

  // Ambulance-specific state
  const [ambulanceConfigs, setAmbulanceConfigs] = useState<AmbulanceConfig[]>([]);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [editingVehicleType, setEditingVehicleType] = useState<string | null>(null);
  const [ambulanceFormData, setAmbulanceFormData] = useState({
    costPerKm: 0,
    driverPct: 0,
    adminPct: 0,
    maintenancePct: 0,
    hospitalPct: 0,
    taxPct: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser) {
      if (selectedCategory === 'AMBULANCE') {
        loadAmbulanceConfigs();
      } else {
        loadPrices();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser, selectedCategory]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const data = await getServicePricesByCategory(selectedCategory);
      setPrices(data);
    } catch (error) {
      console.error('Error loading prices:', error);
      alert('Gagal memuat data harga');
    } finally {
      setLoading(false);
    }
  };

  const loadAmbulanceConfigs = async () => {
    setLoading(true);
    try {
      const configs = await getAllAmbulanceConfigs();
      
      // If no configs in Firestore, initialize with defaults
      if (configs.length === 0) {
        console.log('No ambulance configs found, initializing with defaults...');
        const vehicleTypes = getVehicleTypes();
        for (const vehicleType of vehicleTypes) {
          const defaultConfig = DEFAULT_AMBULANCE_CONFIG[vehicleType];
          await createAmbulanceConfig({
            vehicleType,
            ...defaultConfig,
            isActive: true,
          });
        }
        // Reload after initialization
        const newConfigs = await getAllAmbulanceConfigs();
        setAmbulanceConfigs(newConfigs);
      } else {
        setAmbulanceConfigs(configs);
      }
    } catch (error) {
      console.error('Error loading ambulance configs:', error);
      alert('Gagal memuat konfigurasi ambulans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadPrices();
      return;
    }

    setLoading(true);
    try {
      const results = await searchServicePrices(searchTerm, selectedCategory);
      setPrices(results);
    } catch (error) {
      console.error('Error searching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (price?: ServicePrice) => {
    if (price) {
      setEditingPrice(price);
      setFormData({
        serviceName: price.serviceName,
        price: price.price,
        unit: price.unit,
        code: price.code || '',
        isActive: price.isActive,
        description: price.description || '',
      });
    } else {
      setEditingPrice(null);
      setFormData({
        serviceName: '',
        price: 0,
        unit: 'Hari',
        code: '',
        isActive: true,
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPrice(null);
    setFormData({
      serviceName: '',
      price: 0,
      unit: 'Hari',
      code: '',
      isActive: true,
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data with subcategory defaults for PERAWATAN_KAMAR
      const dataToSave: any = {
        ...formData,
        category: selectedCategory,
      };

      // For PERAWATAN_KAMAR, set default subCategory and roomClass
      if (selectedCategory === 'PERAWATAN_KAMAR') {
        dataToSave.subCategory = dataToSave.subCategory || 'TARIF_KAMAR';
        
        // Auto-detect roomClass from serviceName if not set
        if (!dataToSave.roomClass) {
          const name = formData.serviceName.toLowerCase();
          if (name.includes('icu')) dataToSave.roomClass = 'ICU';
          else if (name.includes('kaber')) dataToSave.roomClass = 'KABER';
          else if (name.includes('vip')) dataToSave.roomClass = 'VIP';
          else if (name.includes('kelas 1') || name.includes('klas 1')) dataToSave.roomClass = 'KLS_1';
          else if (name.includes('kelas 2') || name.includes('klas 2')) dataToSave.roomClass = 'KLS_2';
          else if (name.includes('kelas 3') || name.includes('klas 3')) dataToSave.roomClass = 'KLS_3';
        }
      }

      if (editingPrice) {
        await updateServicePrice(editingPrice.id, dataToSave);
        alert('Data harga berhasil diperbarui!');
      } else {
        await createServicePrice(dataToSave);
        alert('Data harga berhasil ditambahkan!');
      }
      handleCloseModal();
      loadPrices();
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Gagal menyimpan data harga');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, serviceName: string) => {
    if (!confirm(`Hapus data harga "${serviceName}"?`)) return;

    try {
      await deleteServicePrice(id);
      alert('Data harga berhasil dihapus!');
      loadPrices();
    } catch (error) {
      console.error('Error deleting price:', error);
      alert('Gagal menghapus data harga');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as BillingCategory);
    setSearchTerm('');
  };

  // Ambulance configuration handlers
  const handleOpenAmbulanceModal = (config: AmbulanceConfig) => {
    setEditingVehicleType(config.vehicleType);
    setAmbulanceFormData({
      costPerKm: config.costPerKm,
      driverPct: config.driverPct,
      adminPct: config.adminPct,
      maintenancePct: config.maintenancePct,
      hospitalPct: config.hospitalPct,
      taxPct: config.taxPct,
      isActive: config.isActive,
    });
    setShowAmbulanceModal(true);
  };

  const handleCloseAmbulanceModal = () => {
    setShowAmbulanceModal(false);
    setEditingVehicleType(null);
  };

  const handleSaveAmbulanceConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicleType) return;

    // Validate percentages
    if (ambulanceFormData.driverPct < 0 || ambulanceFormData.driverPct > 1) {
      alert('Persentase pengemudi harus antara 0-100%');
      return;
    }
    if (ambulanceFormData.adminPct < 0 || ambulanceFormData.adminPct > 1) {
      alert('Persentase admin harus antara 0-100%');
      return;
    }
    if (ambulanceFormData.maintenancePct < 0 || ambulanceFormData.maintenancePct > 1) {
      alert('Persentase pemeliharaan harus antara 0-100%');
      return;
    }
    if (ambulanceFormData.hospitalPct < 0 || ambulanceFormData.hospitalPct > 1) {
      alert('Persentase jasa RS harus antara 0-100%');
      return;
    }
    if (ambulanceFormData.taxPct < 0 || ambulanceFormData.taxPct > 1) {
      alert('Persentase PPN harus antara 0-100%');
      return;
    }
    if (ambulanceFormData.costPerKm <= 0) {
      alert('Tarif per km harus lebih dari 0');
      return;
    }

    setSaving(true);
    try {
      await updateAmbulanceConfig(editingVehicleType, ambulanceFormData);
      alert('Konfigurasi ambulans berhasil diperbarui!');
      handleCloseAmbulanceModal();
      loadAmbulanceConfigs();
    } catch (error) {
      console.error('Error saving ambulance config:', error);
      alert('Gagal menyimpan konfigurasi ambulans');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !appUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (appUser.role !== 'admin' && appUser.role !== 'farmasi') {
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

  const currentSection = BILLING_SECTIONS.find(s => s.key === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Database Harga</h1>
          <p className="text-gray-600 mt-2">
            Kelola harga layanan dan tindakan untuk semua kategori billing
          </p>
        </div>

        {/* Category Selector */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kategori
              </label>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                options={BILLING_SECTIONS.map(section => ({
                  value: section.key,
                  label: `${section.no}. ${section.label}`,
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Layanan
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Cari nama layanan atau kode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="mb-0"
                />
                <Button onClick={handleSearch} variant="secondary">
                  Cari
                </Button>
                {searchTerm && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      loadPrices();
                    }}
                    variant="secondary"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Current Category Display */}
        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentSection?.no}. {currentSection?.label}
              </h2>
              {selectedCategory === 'PERAWATAN_KAMAR' && (
                <p className="text-sm font-medium text-blue-600 mt-1">
                  Subkategori: Tarif Kamar
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                {selectedCategory === 'AMBULANCE' 
                  ? `${getVehicleTypes().length} tipe kendaraan tersedia`
                  : `${prices.length} layanan terdaftar`
                }
              </p>
            </div>
            {selectedCategory !== 'AMBULANCE' && (
              <Button onClick={() => handleOpenModal()}>
                + Tambah Layanan
              </Button>
            )}
          </div>
        </Card>

        {/* Ambulance Configuration or Prices Table */}
        {selectedCategory === 'AMBULANCE' ? (
          // Ambulance Configuration View
          <Card>
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">✅ Konfigurasi Tarif Ambulans</h3>
              <p className="text-sm text-green-700">
                Tarif ambulans dihitung berdasarkan <strong>jarak (km)</strong> menggunakan formula yang dapat dikonfigurasi per jenis kendaraan.
                Klik <strong>&quot;Edit&quot;</strong> untuk mengubah nilai tarif dan persentase.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : ambulanceConfigs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Belum ada konfigurasi ambulans. Sistem akan membuat konfigurasi default...
                </p>
                <LoadingSpinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Jenis Kendaraan
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Tarif/km
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Pengemudi
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Admin
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Pemeliharaan
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Jasa RS
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        PPN
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ambulanceConfigs.map((config) => (
                      <tr key={config.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {config.vehicleType.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">
                          {formatCurrency(config.costPerKm)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {(config.driverPct * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {(config.adminPct * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {(config.maintenancePct * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {(config.hospitalPct * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {(config.taxPct * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            color={
                              config.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {config.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3"
                            onClick={() => handleOpenAmbulanceModal(config)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">📐 Formula Perhitungan</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>1. <strong>Jarak PP</strong> = Jarak Satu Arah × 2</p>
                <p>2. <strong>BBA (Bahan Bakar)</strong> = Jarak PP × Tarif/km</p>
                <p>3. <strong>Biaya Pengemudi</strong> = BBA × Pengemudi %</p>
                <p>4. <strong>Biaya Admin</strong> = BBA × Admin %</p>
                <p>5. <strong>Biaya Pemeliharaan</strong> = BBA × Pemeliharaan %</p>
                <p>6. <strong>Jasa RS</strong> = BBA × Jasa RS %</p>
                <p>7. <strong>Subtotal</strong> = BBA + Pengemudi + Admin + Pemeliharaan + Jasa RS</p>
                <p>8. <strong>PPN</strong> = Subtotal × PPN %</p>
                <p>9. <strong>TOTAL</strong> = Subtotal + PPN</p>
              </div>
            </div>
          </Card>
        ) : (
          // Regular Prices Table
          <Card>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : prices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Belum ada data harga untuk kategori ini.
                </p>
                <Button onClick={() => handleOpenModal()} className="mt-4">
                  + Tambah Layanan Pertama
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kode
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama Layanan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Satuan
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Harga
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prices.map((price) => (
                      <tr key={price.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {price.code || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {price.serviceName}
                          </div>
                          {price.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {price.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {price.unit}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">
                          {formatCurrency(price.price)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            color={
                              price.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {price.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="secondary"
                              className="text-xs py-1 px-3"
                              onClick={() => handleOpenModal(price)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              className="text-xs py-1 px-3"
                              onClick={() => handleDelete(price.id, price.serviceName)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Modal - Regular Service */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingPrice ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Kategori: <span className="font-semibold">{currentSection?.label}</span>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Kode Layanan (Opsional)"
                    placeholder="Contoh: ICU-001"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />

                  <Input
                    label="Nama Layanan *"
                    placeholder="Contoh: ICU"
                    value={formData.serviceName}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceName: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="Satuan *"
                    placeholder="Contoh: Hari, Kali, Paket, x"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="Harga *"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <Input
                  label="Deskripsi (Opsional)"
                  placeholder="Keterangan tambahan..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-4"
                />

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Aktif (tampilkan di dropdown)
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Menyimpan...' : editingPrice ? 'Simpan Perubahan' : 'Tambah Layanan'}
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

      {/* Modal - Ambulance Configuration Edit */}
      {showAmbulanceModal && editingVehicleType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                Edit Konfigurasi: {editingVehicleType.replace(/_/g, ' ')}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Ubah tarif dan persentase untuk kendaraan ini
              </p>

              <form onSubmit={handleSaveAmbulanceConfig}>
                <div className="space-y-4">
                  {/* Main Tariff */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarif per Kilometer *
                      </label>
                      <Input
                        type="number"
                        value={ambulanceFormData.costPerKm}
                        onChange={(e) =>
                          setAmbulanceFormData({
                            ...ambulanceFormData,
                            costPerKm: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="3120"
                        required
                        className="mb-0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Biaya bahan bakar per km</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PPN (Tax) * (%)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={(ambulanceFormData.taxPct * 100).toFixed(2)}
                        onChange={(e) =>
                          setAmbulanceFormData({
                            ...ambulanceFormData,
                            taxPct: parseFloat(e.target.value) / 100 || 0,
                          })
                        }
                        placeholder="10"
                        required
                        className="mb-0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Pajak pertambahan nilai (biasanya 10%)</p>
                    </div>
                  </div>

                  {/* Component Percentages */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Persentase Komponen Biaya (% dari BBA) *</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pengemudi (%)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(ambulanceFormData.driverPct * 100).toFixed(2)}
                          onChange={(e) =>
                            setAmbulanceFormData({
                              ...ambulanceFormData,
                              driverPct: parseFloat(e.target.value) / 100 || 0,
                            })
                          }
                          placeholder="16"
                          required
                          className="mb-0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Administrasi (%)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(ambulanceFormData.adminPct * 100).toFixed(2)}
                          onChange={(e) =>
                            setAmbulanceFormData({
                              ...ambulanceFormData,
                              adminPct: parseFloat(e.target.value) / 100 || 0,
                            })
                          }
                          placeholder="16"
                          required
                          className="mb-0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pemeliharaan (%)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(ambulanceFormData.maintenancePct * 100).toFixed(2)}
                          onChange={(e) =>
                            setAmbulanceFormData({
                              ...ambulanceFormData,
                              maintenancePct: parseFloat(e.target.value) / 100 || 0,
                            })
                          }
                          placeholder="25"
                          required
                          className="mb-0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jasa Rumah Sakit (%)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(ambulanceFormData.hospitalPct * 100).toFixed(2)}
                          onChange={(e) =>
                            setAmbulanceFormData({
                              ...ambulanceFormData,
                              hospitalPct: parseFloat(e.target.value) / 100 || 0,
                            })
                          }
                          placeholder="25"
                          required
                          className="mb-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ambulanceFormData.isActive}
                        onChange={(e) =>
                          setAmbulanceFormData({
                            ...ambulanceFormData,
                            isActive: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Aktif (tampilkan di dropdown kendaraan)
                      </span>
                    </label>
                  </div>

                  {/* Live Calculation Preview */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">📐 Preview Perhitungan (5 km satu arah)</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      {(() => {
                        const oneWay = 5;
                        const roundTrip = oneWay * 2;
                        const bba = roundTrip * ambulanceFormData.costPerKm;
                        const driver = bba * ambulanceFormData.driverPct;
                        const admin = bba * ambulanceFormData.adminPct;
                        const maintenance = bba * ambulanceFormData.maintenancePct;
                        const hospital = bba * ambulanceFormData.hospitalPct;
                        const subtotal = bba + driver + admin + maintenance + hospital;
                        const tax = subtotal * ambulanceFormData.taxPct;
                        const total = subtotal + tax;

                        return (
                          <>
                            <p>• Jarak PP: {oneWay} km × 2 = {roundTrip} km</p>
                            <p>• BBA: {roundTrip} km × {formatCurrency(ambulanceFormData.costPerKm)} = {formatCurrency(bba)}</p>
                            <p>• Pengemudi: {formatCurrency(bba)} × {(ambulanceFormData.driverPct * 100).toFixed(1)}% = {formatCurrency(driver)}</p>
                            <p>• Admin: {formatCurrency(bba)} × {(ambulanceFormData.adminPct * 100).toFixed(1)}% = {formatCurrency(admin)}</p>
                            <p>• Pemeliharaan: {formatCurrency(bba)} × {(ambulanceFormData.maintenancePct * 100).toFixed(1)}% = {formatCurrency(maintenance)}</p>
                            <p>• Jasa RS: {formatCurrency(bba)} × {(ambulanceFormData.hospitalPct * 100).toFixed(1)}% = {formatCurrency(hospital)}</p>
                            <p className="font-semibold mt-2">• Subtotal: {formatCurrency(subtotal)}</p>
                            <p>• PPN ({(ambulanceFormData.taxPct * 100).toFixed(1)}%): {formatCurrency(tax)}</p>
                            <p className="font-bold text-base mt-2">• TOTAL: {formatCurrency(total)}</p>
                          </>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      * Preview ini akan update otomatis saat Anda mengubah nilai di atas
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseAmbulanceModal}
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
    </div>
  );
}

