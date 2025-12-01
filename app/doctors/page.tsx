/**
 * ═══════════════════════════════════════════════════════════════
 * DOCTOR DATABASE PAGE (Master Data)
 * ═══════════════════════════════════════════════════════════════
 * Route: /doctors
 * Purpose: Manage doctor master data
 * Features: CRUD operations, search
 * Access: Admin only
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
import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor, searchDoctors } from '@/lib/firestore';
import { Doctor, DoctorSpecialization, DoctorDepartment } from '@/types/models';

export default function DoctorsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    gender: '' as 'Laki-laki' | 'Perempuan' | '',
    sipNumber: '',
    specialization: 'Umum' as DoctorSpecialization,
    department: 'IGD' as DoctorDepartment,
    phone: '',
    email: '',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser) {
      loadDoctors();
    }
  }, [appUser]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await getAllDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      alert('Gagal memuat data dokter');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadDoctors();
      return;
    }

    setLoading(true);
    try {
      const results = await searchDoctors(searchTerm);
      setDoctors(results);
    } catch (error) {
      console.error('Error searching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        fullName: doctor.fullName,
        shortName: doctor.shortName || '',
        gender: doctor.gender || '',
        sipNumber: doctor.sipNumber || '',
        specialization: doctor.specialization || 'Umum',
        department: doctor.department || 'IGD',
        phone: doctor.phone || '',
        email: doctor.email || '',
        isActive: doctor.isActive,
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        fullName: '',
        shortName: '',
        gender: '',
        sipNumber: '',
        specialization: 'Umum',
        department: 'IGD',
        phone: '',
        email: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const doctorData = {
        fullName: formData.fullName,
        shortName: formData.shortName || undefined,
        gender: formData.gender || undefined,
        sipNumber: formData.sipNumber || undefined,
        specialization: formData.specialization,
        department: formData.department,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        isActive: formData.isActive,
      };

      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, doctorData);
        alert('Dokter berhasil diperbarui!');
      } else {
        await createDoctor(doctorData);
        alert('Dokter berhasil ditambahkan!');
      }

      handleCloseModal();
      loadDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert('Gagal menyimpan data dokter');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!confirm(`Hapus dokter "${doctor.fullName}"?`)) return;

    try {
      await deleteDoctor(doctor.id);
      alert('Dokter berhasil dihapus!');
      loadDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Gagal menghapus dokter');
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

  // Access control: only admin
  const hasAccess = appUser.role === 'admin';
  
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
            <h1 className="text-3xl font-bold text-gray-900">Database Dokter</h1>
            <p className="text-gray-600 mt-1">Master Data Dokter</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            + Tambah Dokter Baru
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Cari dokter berdasarkan nama atau spesialisasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="mb-0"
            />
            <Button onClick={handleSearch}>Cari</Button>
            <Button variant="secondary" onClick={loadDoctors}>
              Reset
            </Button>
          </div>
        </div>

        {/* Doctor Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">Belum ada data dokter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Lengkap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Panggilan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spesialisasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departemen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Telp
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
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doctor.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.shortName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.specialization || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge color={doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {doctor.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3"
                            onClick={() => handleOpenModal(doctor)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(doctor)}
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
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Doctor */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingDoctor ? 'Edit Dokter' : 'Tambah Dokter Baru'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nama Lengkap *"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="dr. Ahmad Fulan, Sp.PD"
                      required
                    />
                  </div>

                  <Input
                    label="Nama Panggilan"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    placeholder="dr. Ahmad"
                  />

                  <Select
                    label="Jenis Kelamin"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    options={[
                      { value: '', label: '-- Pilih --' },
                      { value: 'Laki-laki', label: 'Laki-laki' },
                      { value: 'Perempuan', label: 'Perempuan' },
                    ]}
                  />

                  <Input
                    label="Nomor SIP"
                    name="sipNumber"
                    value={formData.sipNumber}
                    onChange={handleChange}
                    placeholder="SIP/001/2025"
                  />

                  <Select
                    label="Spesialisasi"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    options={[
                      { value: 'Umum', label: 'Umum' },
                      { value: 'Sp.A', label: 'Sp.A (Anak)' },
                      { value: 'Sp.PD', label: 'Sp.PD (Penyakit Dalam)' },
                      { value: 'Sp.B', label: 'Sp.B (Bedah)' },
                      { value: 'Sp.OG', label: 'Sp.OG (Obgyn)' },
                      { value: 'Sp.P', label: 'Sp.P (Paru)' },
                      { value: 'Sp.JP', label: 'Sp.JP (Jantung)' },
                      { value: 'Lainnya', label: 'Lainnya' },
                    ]}
                  />

                  <Select
                    label="Departemen"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    options={[
                      { value: 'IGD', label: 'IGD' },
                      { value: 'Rawat Jalan', label: 'Rawat Jalan' },
                      { value: 'Rawat Inap', label: 'Rawat Inap' },
                      { value: 'Kamar Bersalin', label: 'Kamar Bersalin' },
                      { value: 'Poli Umum', label: 'Poli Umum' },
                      { value: 'Poli Anak', label: 'Poli Anak' },
                      { value: 'Poli Penyakit Dalam', label: 'Poli Penyakit Dalam' },
                      { value: 'Lainnya', label: 'Lainnya' },
                    ]}
                  />

                  <Input
                    label="No. Telepon"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="081234567890"
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="dokter@example.com"
                  />

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
                        Dokter Aktif (Tersedia untuk ditugaskan)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Menyimpan...' : editingDoctor ? 'Simpan Perubahan' : 'Tambah Dokter'}
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
    </div>
  );
}

