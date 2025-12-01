/**
 * ═══════════════════════════════════════════════════════════════
 * NEW PATIENT PAGE (Patient Registration)
 * ═══════════════════════════════════════════════════════════════
 * Route: /patients/new
 * Purpose: Form to register a new patient in the system
 * Features: Complete patient info, Guardian info, "Pasien Sendiri" option
 * Access: Admin, IGD only
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { createPatient } from '@/lib/firestore';
import { JenisKelamin, StatusPernikahan, HubunganPenanggungJawab } from '@/types/models';
import { calculateAge } from '@/lib/utils';
import { 
  getProvinsi, 
  getKabupaten, 
  getKecamatan, 
  getKelurahan,
  getLocationName,
  buildFullAddress,
  LocationItem 
} from '@/lib/locationService';

export default function NewPatientPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPasienSendiri, setIsPasienSendiri] = useState(false);
  
  // Location data
  const [provinsiList, setProvinsiList] = useState<LocationItem[]>([]);
  const [kabupatenList, setKabupatenList] = useState<LocationItem[]>([]);
  const [kecamatanList, setKecamatanList] = useState<LocationItem[]>([]);
  const [desaList, setDesaList] = useState<LocationItem[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    noRM: '',
    nama: '',
    nik: '',
    tanggalLahir: '',
    jenisKelamin: 'Laki-laki' as JenisKelamin,
    alamat: '',
    // Structured address fields
    provinsiId: '',
    kabupatenId: '',
    kecamatanId: '',
    desaId: '',
    detailAlamat: '',
    noTelp: '',
    email: '',
    statusPernikahan: '' as StatusPernikahan | '',
    pekerjaan: '',
    namaPenanggungJawab: '',
    hubunganPenanggungJawab: 'Orang Tua' as HubunganPenanggungJawab,
    kontakPenanggungJawab: '',
  });

  // Load provinces on mount
  useEffect(() => {
    loadProvinsi();
  }, []);

  // Load kabupaten when provinsi changes
  useEffect(() => {
    if (formData.provinsiId) {
      loadKabupaten(formData.provinsiId);
    } else {
      setKabupatenList([]);
      setKecamatanList([]);
      setDesaList([]);
    }
  }, [formData.provinsiId]);

  // Load kecamatan when kabupaten changes
  useEffect(() => {
    if (formData.kabupatenId) {
      loadKecamatan(formData.kabupatenId);
    } else {
      setKecamatanList([]);
      setDesaList([]);
    }
  }, [formData.kabupatenId]);

  // Load desa when kecamatan changes
  useEffect(() => {
    if (formData.kecamatanId) {
      loadDesa(formData.kecamatanId);
    } else {
      setDesaList([]);
    }
  }, [formData.kecamatanId]);

  // Update full address when any location field changes
  useEffect(() => {
    if (formData.provinsiId || formData.detailAlamat) {
      const provinsiName = getLocationName(provinsiList, formData.provinsiId);
      const kabupatenName = getLocationName(kabupatenList, formData.kabupatenId);
      const kecamatanName = getLocationName(kecamatanList, formData.kecamatanId);
      const desaName = getLocationName(desaList, formData.desaId);
      
      const fullAddress = buildFullAddress(
        formData.detailAlamat,
        desaName,
        kecamatanName,
        kabupatenName,
        provinsiName
      );
      
      setFormData(prev => ({ ...prev, alamat: fullAddress }));
    }
  }, [formData.provinsiId, formData.kabupatenId, formData.kecamatanId, formData.desaId, formData.detailAlamat, provinsiList, kabupatenList, kecamatanList, desaList]);

  const loadProvinsi = async () => {
    try {
      setLoadingLocation(true);
      const data = await getProvinsi();
      setProvinsiList(data);
    } catch (error) {
      console.error('Error loading provinsi:', error);
      alert('Gagal memuat data provinsi. Silakan refresh halaman.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadKabupaten = async (provinsiId: string) => {
    try {
      setLoadingLocation(true);
      const data = await getKabupaten(provinsiId);
      setKabupatenList(data);
    } catch (error) {
      console.error('Error loading kabupaten:', error);
      alert('Gagal memuat data kabupaten.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadKecamatan = async (kabupatenId: string) => {
    try {
      setLoadingLocation(true);
      const data = await getKecamatan(kabupatenId);
      setKecamatanList(data);
    } catch (error) {
      console.error('Error loading kecamatan:', error);
      alert('Gagal memuat data kecamatan.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadDesa = async (kecamatanId: string) => {
    try {
      setLoadingLocation(true);
      const data = await getKelurahan(kecamatanId);
      setDesaList(data);
    } catch (error) {
      console.error('Error loading desa:', error);
      alert('Gagal memuat data desa/kelurahan.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const umur = calculateAge(formData.tanggalLahir);
      
      // Prepare patient data, excluding empty optional fields
      const patientData: any = {
        noRM: formData.noRM,
        nama: formData.nama,
        nik: formData.nik,
        tanggalLahir: formData.tanggalLahir,
        umur,
        jenisKelamin: formData.jenisKelamin,
        alamat: formData.alamat,
        noTelp: formData.noTelp,
        namaPenanggungJawab: formData.namaPenanggungJawab,
        hubunganPenanggungJawab: formData.hubunganPenanggungJawab,
        kontakPenanggungJawab: formData.kontakPenanggungJawab,
      };

      // Add structured address data
      if (formData.provinsiId) {
        patientData.alamatLengkap = {
          provinsiId: formData.provinsiId,
          provinsiName: getLocationName(provinsiList, formData.provinsiId),
          kabupatenId: formData.kabupatenId || undefined,
          kabupatenName: formData.kabupatenId ? getLocationName(kabupatenList, formData.kabupatenId) : undefined,
          kecamatanId: formData.kecamatanId || undefined,
          kecamatanName: formData.kecamatanId ? getLocationName(kecamatanList, formData.kecamatanId) : undefined,
          desaId: formData.desaId || undefined,
          desaName: formData.desaId ? getLocationName(desaList, formData.desaId) : undefined,
          detailAlamat: formData.detailAlamat || undefined,
        };
      }

      // Add optional fields only if they have values
      if (formData.email) patientData.email = formData.email;
      if (formData.statusPernikahan) patientData.statusPernikahan = formData.statusPernikahan;
      if (formData.pekerjaan) patientData.pekerjaan = formData.pekerjaan;

      const patientId = await createPatient(patientData);

      alert('Pasien berhasil ditambahkan!');
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Gagal menambahkan pasien. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // If patient name or phone changes and "Pasien Sendiri" is checked, update guardian info
    if (isPasienSendiri) {
      if (name === 'nama') {
        setFormData(prev => ({ ...prev, nama: value, namaPenanggungJawab: value }));
      } else if (name === 'noTelp') {
        setFormData(prev => ({ ...prev, noTelp: value, kontakPenanggungJawab: value }));
      }
    }
  };

  const handlePasienSendiriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsPasienSendiri(isChecked);

    if (isChecked) {
      // Auto-fill guardian info with patient info
      setFormData({
        ...formData,
        namaPenanggungJawab: formData.nama,
        hubunganPenanggungJawab: 'Pasien Sendiri',
        kontakPenanggungJawab: formData.noTelp,
      });
    } else {
      // Clear guardian info when unchecked
      setFormData({
        ...formData,
        namaPenanggungJawab: '',
        hubunganPenanggungJawab: 'Orang Tua',
        kontakPenanggungJawab: '',
      });
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Tambah Pasien Baru</h1>
          <p className="text-gray-600 mt-2">Lengkapi data pasien di bawah ini</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            {/* Informasi Dasar Pasien */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar Pasien</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nomor Rekam Medis (No. RM) *"
                  name="noRM"
                  value={formData.noRM}
                  onChange={handleChange}
                  placeholder="contoh: RM-2024-001"
                  required
                />

                <Input
                  label="Nama Lengkap *"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap pasien"
                  required
                />

                <Input
                  label="NIK (Nomor Induk Kependudukan) *"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="16 digit NIK KTP"
                  required
                  maxLength={16}
                />

                <Input
                  label="Tanggal Lahir *"
                  name="tanggalLahir"
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  required
                />

                <Select
                  label="Jenis Kelamin *"
                  name="jenisKelamin"
                  value={formData.jenisKelamin}
                  onChange={handleChange}
                  options={[
                    { value: 'Laki-laki', label: 'Laki-laki' },
                    { value: 'Perempuan', label: 'Perempuan' },
                  ]}
                  required
                />

                <Input
                  label="No. Telepon / HP *"
                  name="noTelp"
                  type="tel"
                  value={formData.noTelp}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>

              {/* Address Section with Cascading Dropdowns */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Alamat Lengkap *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Provinsi *"
                    name="provinsiId"
                    value={formData.provinsiId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        provinsiId: e.target.value,
                        kabupatenId: '',
                        kecamatanId: '',
                        desaId: '',
                      });
                    }}
                    options={[
                      { value: '', label: loadingLocation ? 'Memuat...' : '-- Pilih Provinsi --' },
                      ...provinsiList.map(p => ({ value: p.id, label: p.nama }))
                    ]}
                    required
                    disabled={loadingLocation}
                  />

                  <Select
                    label="Kabupaten/Kota *"
                    name="kabupatenId"
                    value={formData.kabupatenId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        kabupatenId: e.target.value,
                        kecamatanId: '',
                        desaId: '',
                      });
                    }}
                    options={[
                      { value: '', label: formData.provinsiId ? (loadingLocation ? 'Memuat...' : '-- Pilih Kabupaten/Kota --') : '-- Pilih Provinsi Dulu --' },
                      ...kabupatenList.map(k => ({ value: k.id, label: k.nama }))
                    ]}
                    required
                    disabled={!formData.provinsiId || loadingLocation}
                  />

                  <Select
                    label="Kecamatan *"
                    name="kecamatanId"
                    value={formData.kecamatanId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        kecamatanId: e.target.value,
                        desaId: '',
                      });
                    }}
                    options={[
                      { value: '', label: formData.kabupatenId ? (loadingLocation ? 'Memuat...' : '-- Pilih Kecamatan --') : '-- Pilih Kabupaten Dulu --' },
                      ...kecamatanList.map(k => ({ value: k.id, label: k.nama }))
                    ]}
                    required
                    disabled={!formData.kabupatenId || loadingLocation}
                  />

                  <Select
                    label="Desa/Kelurahan *"
                    name="desaId"
                    value={formData.desaId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        desaId: e.target.value,
                      });
                    }}
                    options={[
                      { value: '', label: formData.kecamatanId ? (loadingLocation ? 'Memuat...' : '-- Pilih Desa/Kelurahan --') : '-- Pilih Kecamatan Dulu --' },
                      ...desaList.map(d => ({ value: d.id, label: d.nama }))
                    ]}
                    required
                    disabled={!formData.kecamatanId || loadingLocation}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Detail Alamat (Jalan, RT/RW, No. Rumah) *"
                      name="detailAlamat"
                      value={formData.detailAlamat}
                      onChange={handleChange}
                      placeholder="Contoh: Jl. Merdeka No. 123, RT 02/RW 05"
                      required
                    />
                  </div>

                  {formData.alamat && (
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Alamat Lengkap:</p>
                      <p className="text-sm font-medium text-gray-900">{formData.alamat}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informasi Tambahan (Optional) */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Tambahan (Opsional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />

                <Select
                  label="Status Pernikahan"
                  name="statusPernikahan"
                  value={formData.statusPernikahan}
                  onChange={handleChange}
                  options={[
                    { value: '', label: '-- Pilih Status --' },
                    { value: 'Belum Menikah', label: 'Belum Menikah' },
                    { value: 'Menikah', label: 'Menikah' },
                    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
                    { value: 'Cerai Mati', label: 'Cerai Mati' },
                  ]}
                />

                <Input
                  label="Pekerjaan"
                  name="pekerjaan"
                  value={formData.pekerjaan}
                  onChange={handleChange}
                  placeholder="Pekerjaan pasien"
                />
              </div>
            </div>

            {/* Informasi Penanggung Jawab */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penanggung Jawab</h2>
              
              {/* Checkbox for Pasien Sendiri */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPasienSendiri}
                    onChange={handlePasienSendiriChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    Pasien datang sendiri dan dapat membuat keputusan medis/hukum sendiri
                  </span>
                </label>
                <p className="ml-6 mt-1 text-xs text-gray-600">
                  Centang jika pasien tidak memerlukan penanggung jawab
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Penanggung Jawab *"
                  name="namaPenanggungJawab"
                  value={formData.namaPenanggungJawab}
                  onChange={handleChange}
                  placeholder="Nama lengkap penanggung jawab"
                  required
                  disabled={isPasienSendiri}
                />

                <Select
                  label="Hubungan Penanggung Jawab *"
                  name="hubunganPenanggungJawab"
                  value={formData.hubunganPenanggungJawab}
                  onChange={handleChange}
                  options={[
                    { value: 'Anak', label: 'Anak' },
                    { value: 'Kakek/Nenek', label: 'Kakek/Nenek' },
                    { value: 'Orang Tua', label: 'Orang Tua' },
                    { value: 'Paman/Bibi', label: 'Paman/Bibi' },
                    { value: 'Pasangan', label: 'Pasangan' },
                    { value: 'Pasien Sendiri', label: 'Pasien Sendiri' },
                    { value: 'Pengasuh Asrama', label: 'Pengasuh Asrama' },
                    { value: 'Pengurus Asrama', label: 'Pengurus Asrama' },
                    { value: 'Teman', label: 'Teman' },
                    { value: 'Tetangga', label: 'Tetangga' },
                    { value: 'Lainnya', label: 'Lainnya' },
                  ]}
                  required
                  disabled={isPasienSendiri}
                />

                <Input
                  label="Kontak Penanggung Jawab *"
                  name="kontakPenanggungJawab"
                  type="tel"
                  value={formData.kontakPenanggungJawab}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  required
                  disabled={isPasienSendiri}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Pasien'}
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
        </Card>
      </div>
    </div>
  );
}

