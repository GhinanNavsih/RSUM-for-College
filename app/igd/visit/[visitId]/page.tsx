'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getVisit, getPatient, updateVisit, getActiveDrugs, getActiveServicePricesByCategory, getAllAmbulanceConfigs, getActiveDoctors } from '@/lib/firestore';
import { Visit, Patient, VisitService, VisitPrescription, Drug, ServicePrice, BillingCategory, BILLING_SECTIONS, AmbulanceConfig, VisitExam, Doctor } from '@/types/models';
import { ExaminationForm } from '@/components/ExaminationForm';
import { formatDate, formatCurrency, getStatusBadge } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { calculateAmbulanceTariff, configToTariffConfig, getServiceTypes } from '@/lib/ambulancePricing';

export default function VisitDetailPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);
  const [ambulanceConfigs, setAmbulanceConfigs] = useState<AmbulanceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingExam, setSavingExam] = useState(false);

  // Ambulance-specific state
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [ambulanceForm, setAmbulanceForm] = useState({
    vehicleType: 'GRANDMAX',
    serviceType: 'PASIEN',
    oneWayKm: 0,
    estimatedCost: 0,
  });

  // Form states for adding/editing services
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    nama: '',
    harga: '',
    quantity: '1',
    category: 'PEMERIKSAAN_UGD' as BillingCategory,
    unit: '',
    dokter: '',
    notes: '',
  });

  // Form states for adding prescriptions
  const [newPrescription, setNewPrescription] = useState({
    drugId: '',
    namaObat: '',
    qty: '1',
    aturanPakai: '',
    pricePerUnit: 0,
  });

  useEffect(() => {
    loadVisitData();
    loadDrugs();
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId]);

  // Load service prices when category changes or visit loads
  useEffect(() => {
    if (visit) {
      // Load prices based on selected category for all visit types
      loadServicePrices(newService.category);
    }
  }, [newService.category, visit]); // Include full visit object to detect when it loads

  const loadVisitData = async () => {
    setLoading(true);
    try {
      const visitData = await getVisit(visitId);
      if (visitData) {
        setVisit(visitData);
        const patientData = await getPatient(visitData.patientId);
        setPatient(patientData);
      }
    } catch (error) {
      console.error('Error loading visit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDrugs = async () => {
    try {
      console.log('Loading active drugs...');
      const activeDrugs = await getActiveDrugs();
      console.log('Active drugs loaded:', activeDrugs.length, activeDrugs);
      setDrugs(activeDrugs);
    } catch (error) {
      console.error('Error loading doctors:', error);
      alert('Gagal memuat database obat. Silakan refresh halaman.');
    }
  };

  const loadDoctors = async () => {
    try {
      const activeDoctors = await getActiveDoctors();
      setDoctors(activeDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadServicePrices = async (category: BillingCategory) => {
    try {
      console.log('🔍 Loading service prices for category:', category);
      const prices = await getActiveServicePricesByCategory(category);
      console.log('✅ Service prices loaded:', prices.length, 'items', prices);
      setServicePrices(prices);
      
      if (prices.length === 0) {
        console.warn(`⚠️ No services found in category "${category}". Add services in Database Harga → ${category}`);
      }
    } catch (error) {
      console.error('❌ Error loading service prices:', error);
      setServicePrices([]);
    }
  };

  const loadAmbulanceConfigs = async () => {
    try {
      const configs = await getAllAmbulanceConfigs();
      setAmbulanceConfigs(configs.filter(c => c.isActive));
    } catch (error) {
      console.error('Error loading ambulance configs:', error);
      setAmbulanceConfigs([]);
    }
  };

  const calculateTotal = (services: VisitService[], prescriptions: VisitPrescription[]) => {
    const servicesTotal = services.reduce((sum, service) => {
      return sum + (service.harga * (service.quantity || 1));
    }, 0);
    
    const prescriptionsTotal = prescriptions.reduce((sum, prescription) => {
      return sum + (prescription.totalPrice || 0);
    }, 0);
    
    return servicesTotal + prescriptionsTotal;
  };

  const handleAddService = () => {
    if (!visit || !newService.nama || !newService.harga) {
      alert('Mohon lengkapi data tindakan.');
      return;
    }

    if (editingServiceId) {
      // Update existing service
      const updatedServices = visit.services.map(s => 
        s.id === editingServiceId 
          ? {
              ...s,
              nama: newService.nama,
              harga: parseFloat(newService.harga),
              quantity: parseInt(newService.quantity) || 1,
              category: newService.category,
              unit: newService.unit || undefined,
              dokter: newService.dokter || undefined,
              notes: newService.notes || undefined,
            }
          : s
      );

      const updatedVisit = {
        ...visit,
        services: updatedServices,
        totalBiaya: calculateTotal(updatedServices, visit.prescriptions),
      };

      setVisit(updatedVisit);
      setEditingServiceId(null);
    } else {
      // Add new service
      const service: VisitService = {
        id: uuidv4(),
        nama: newService.nama,
        harga: parseFloat(newService.harga),
        quantity: parseInt(newService.quantity) || 1,
        category: newService.category,
        unit: newService.unit || undefined,
        dokter: newService.dokter || undefined,
        notes: newService.notes || undefined,
      };

      const updatedServices = [...visit.services, service];
      const updatedVisit = {
        ...visit,
        services: updatedServices,
        totalBiaya: calculateTotal(updatedServices, visit.prescriptions),
      };

      setVisit(updatedVisit);
    }

    // Reset form
    setNewService({ 
      nama: '', 
      harga: '', 
      quantity: '1',
      category: visit.jenis === 'Rawat Inap' ? 'PERAWATAN_KAMAR' : 'PEMERIKSAAN_UGD',
      unit: '',
      dokter: '',
      notes: '',
    });
  };

  const handleEditService = (service: VisitService) => {
    setEditingServiceId(service.id);
    setNewService({
      nama: service.nama,
      harga: service.harga.toString(),
      quantity: (service.quantity || 1).toString(),
      category: service.category || 'PEMERIKSAAN_UGD',
      unit: service.unit || '',
      dokter: service.dokter || '',
      notes: service.notes || '',
    });
    // Scroll to form
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
    setNewService({ 
      nama: '', 
      harga: '', 
      quantity: '1',
      category: visit?.jenis === 'Rawat Inap' ? 'PERAWATAN_KAMAR' : 'PEMERIKSAAN_UGD',
      unit: '',
      dokter: '',
      notes: '',
    });
  };

  const handleRemoveService = (serviceId: string) => {
    if (!visit) return;

    const updatedServices = visit.services.filter(s => s.id !== serviceId);
    const updatedVisit = {
      ...visit,
      services: updatedServices,
      totalBiaya: calculateTotal(updatedServices, visit.prescriptions),
    };

    setVisit(updatedVisit);
  };

  const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceId = e.target.value;
    if (!selectedServiceId) {
      setNewService({
        ...newService,
        nama: '',
        harga: '',
        unit: '',
      });
      return;
    }

    const selectedService = servicePrices.find(s => s.id === selectedServiceId);
    if (selectedService) {
      setNewService({
        ...newService,
        nama: selectedService.serviceName,
        harga: selectedService.price.toString(),
        unit: selectedService.unit,
      });
    }
  };

  /**
   * Generate grouped service options for PERAWATAN_KAMAR
   * Groups by subcategory (Tarif Kamar, Biaya Perawatan, Perinatologi)
   */
  const getServiceOptions = () => {
    if (newService.category !== 'PERAWATAN_KAMAR') {
      // For other categories, return flat list
      return [
        { value: '', label: `-- Pilih ${currentSection?.label} --` },
        ...servicePrices.map(service => ({
          value: service.id,
          label: `${service.serviceName} - ${formatCurrency(service.price)}/${service.unit}`
        }))
      ];
    }

    // For PERAWATAN_KAMAR, group by subcategory
    const grouped: any[] = [{ value: '', label: `-- Pilih ${currentSection?.label} --` }];
    
    const subcategories = ['TARIF_KAMAR', 'BIAYA_PERAWATAN', 'PERINATOLOGI'];
    const subcategoryLabels: Record<string, string> = {
      TARIF_KAMAR: 'Tarif Kamar',
      BIAYA_PERAWATAN: 'Biaya Perawatan',
      PERINATOLOGI: 'Perinatologi (NICU/Baby Care)',
    };

    subcategories.forEach(subCat => {
      const items = servicePrices.filter(s => (s.subCategory || 'TARIF_KAMAR') === subCat);
      if (items.length > 0) {
        // Add subcategory header
        grouped.push({
          value: '',
          label: `━━ ${subcategoryLabels[subCat]} ━━`,
          disabled: true,
        });
        // Add items
        items.forEach(service => {
          const roomClassLabel = service.roomClass 
            ? ` [${service.roomClass.replace('KLS_', 'Kelas ')}]` 
            : '';
          grouped.push({
            value: service.id,
            label: `   ${service.serviceName}${roomClassLabel} - ${formatCurrency(service.price)}/${service.unit}`,
          });
        });
      }
    });

    return grouped;
  };

  // Ambulance modal handlers
  const handleOpenAmbulanceModal = async () => {
    await loadAmbulanceConfigs();
    setAmbulanceForm({
      vehicleType: 'GRANDMAX',
      serviceType: 'PASIEN',
      oneWayKm: 0,
      estimatedCost: 0,
    });
    setShowAmbulanceModal(true);
  };

  const handleCloseAmbulanceModal = () => {
    setShowAmbulanceModal(false);
  };

  const handleAddAmbulanceService = () => {
    if (!visit) return;

    if (ambulanceForm.oneWayKm === 0) {
      alert('Mohon masukkan jarak tempuh');
      return;
    }

    // Get config for selected vehicle
    const config = ambulanceConfigs.find(c => c.vehicleType === ambulanceForm.vehicleType);
    if (!config) {
      alert('Konfigurasi kendaraan tidak ditemukan');
      return;
    }

    // Calculate tariff
    const tariffConfig = configToTariffConfig(config);
    const tariffResult = calculateAmbulanceTariff(
      {
        vehicleType: ambulanceForm.vehicleType as any,
        serviceType: ambulanceForm.serviceType as any,
        oneWayKm: ambulanceForm.oneWayKm,
      },
      tariffConfig
    );

    // Create service
    const service: VisitService = {
      id: uuidv4(),
      category: 'AMBULANCE',
      nama: `Ambulance ${ambulanceForm.vehicleType.replace(/_/g, ' ')} - ${ambulanceForm.serviceType} (${ambulanceForm.oneWayKm.toFixed(1)} km)`,
      harga: tariffResult.total,
      quantity: 1,
      total: tariffResult.total,
      ambulanceMeta: tariffResult.meta,
    };

    const updatedServices = [...visit.services, service];
    const updatedVisit = {
      ...visit,
      services: updatedServices,
      totalBiaya: calculateTotal(updatedServices, visit.prescriptions),
    };

    setVisit(updatedVisit);
    handleCloseAmbulanceModal();
    alert('Layanan ambulans berhasil ditambahkan!');
  };

  const handleDrugSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDrugId = e.target.value;
    if (!selectedDrugId) {
      setNewPrescription({
        drugId: '',
        namaObat: '',
        qty: '1',
        aturanPakai: '',
        pricePerUnit: 0,
      });
      return;
    }

    const selectedDrug = drugs.find(d => d.id === selectedDrugId);
    if (selectedDrug) {
      setNewPrescription({
        ...newPrescription,
        drugId: selectedDrug.id,
        namaObat: `${selectedDrug.drugName} (${selectedDrug.unit})`,
        pricePerUnit: selectedDrug.pricePerUnit,
      });
    }
  };

  const handleAddPrescription = () => {
    if (!visit || !newPrescription.namaObat || !newPrescription.qty) {
      alert('Mohon lengkapi data resep.');
      return;
    }

    const qty = parseInt(newPrescription.qty);
    const pricePerUnit = newPrescription.pricePerUnit || 0;
    const totalPrice = qty * pricePerUnit;

    const prescription: VisitPrescription = {
      id: uuidv4(),
      drugId: newPrescription.drugId || undefined,
      namaObat: newPrescription.namaObat,
      qty: qty,
      aturanPakai: newPrescription.aturanPakai,
      pricePerUnit: pricePerUnit,
      totalPrice: totalPrice,
    };

    const updatedPrescriptions = [...visit.prescriptions, prescription];
    const updatedVisit = {
      ...visit,
      prescriptions: updatedPrescriptions,
      totalBiaya: calculateTotal(visit.services, updatedPrescriptions),
    };

    setVisit(updatedVisit);
    setNewPrescription({ drugId: '', namaObat: '', qty: '1', aturanPakai: '', pricePerUnit: 0 });
  };

  const handleRemovePrescription = (prescriptionId: string) => {
    if (!visit) return;

    const updatedPrescriptions = visit.prescriptions.filter(p => p.id !== prescriptionId);
    const updatedVisit = {
      ...visit,
      prescriptions: updatedPrescriptions,
      totalBiaya: calculateTotal(visit.services, updatedPrescriptions),
    };

    setVisit(updatedVisit);
  };

  const handleSave = async () => {
    if (!visit) return;

    setSaving(true);
    try {
      await updateVisit(visitId, {
        services: visit.services,
        prescriptions: visit.prescriptions,
        totalBiaya: visit.totalBiaya,
      });
      alert('Perubahan berhasil disimpan!');
    } catch (error) {
      console.error('Error saving visit:', error);
      alert('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExam = async (examData: VisitExam) => {
    if (!visit) return;

    setSavingExam(true);
    try {
      // Debug: log what we're saving
      console.log('💾 Saving exam data:', examData);
      console.log('🔬 penunjangLabRequested:', examData.penunjangLabRequested);
      
      await updateVisit(visitId, {
        exam: examData,
      });
      
      // Update local state
      setVisit({ ...visit, exam: examData });
      
      console.log('✅ Exam saved successfully');
      alert('✅ Data pemeriksaan berhasil disimpan!');
    } catch (error) {
      console.error('❌ Error saving examination:', error);
      alert('Gagal menyimpan data pemeriksaan. Silakan coba lagi.');
    } finally {
      setSavingExam(false);
    }
  };

  const handleFinishVisit = async () => {
    if (!visit) return;

    if (visit.services.length === 0) {
      alert('Mohon tambahkan minimal satu tindakan sebelum menyelesaikan kunjungan.');
      return;
    }

    // Check if exam data has been saved for IGD/Rawat Jalan
    if ((visit.jenis === 'IGD' || visit.jenis === 'Rawat Jalan') && !visit.exam) {
      const proceed = confirm(
        '⚠️ Data Pemeriksaan Pasien belum disimpan!\n\n' +
        'Jika Anda sudah mengisi form pemeriksaan (termasuk centang Laboratorium/Radiologi), ' +
        'pastikan klik "Simpan Pemeriksaan" terlebih dahulu.\n\n' +
        'Apakah Anda yakin ingin melanjutkan tanpa data pemeriksaan?'
      );
      if (!proceed) return;
    }

    // Check if lab was requested but remind user about it
    if (visit.exam?.penunjangLabRequested) {
      console.log('📋 Lab requested for this visit - will appear in Lab queue');
    }

    setSaving(true);
    try {
      await updateVisit(visitId, {
        services: visit.services,
        prescriptions: visit.prescriptions,
        totalBiaya: visit.totalBiaya,
        status: 'igd_done',
      });
      
      // Show message based on whether lab was requested
      if (visit.exam?.penunjangLabRequested) {
        alert('✅ Kunjungan telah selesai!\n\nPasien ini akan muncul di antrian Laboratorium.');
      } else {
        alert('✅ Kunjungan telah selesai!');
      }
      router.push('/igd');
    } catch (error) {
      console.error('Error finishing visit:', error);
      alert('Gagal menyelesaikan kunjungan.');
    } finally {
      setSaving(false);
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

  if (!visit || !patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <p className="text-red-600">Kunjungan tidak ditemukan.</p>
          </Card>
        </div>
      </div>
    );
  }

  const canEdit = (appUser?.role === 'admin' || appUser?.role === 'igd') && visit.status === 'igd_in_progress';
  const statusBadge = getStatusBadge(visit.status);
  const currentSection = BILLING_SECTIONS.find(s => s.key === newService.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detail Kunjungan</h1>
              <p className="text-gray-600 mt-1">{patient.nama} - {patient.noRM}</p>
            </div>
            <Badge color={statusBadge.color} className="text-base px-4 py-2">
              {statusBadge.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card title="Informasi Kunjungan">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tanggal Kunjungan</p>
                <p className="font-medium">{formatDate(visit.tanggalKunjungan)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis</p>
                <Badge>{visit.jenis}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dokter</p>
                <p className="font-medium">{visit.dokter}</p>
              </div>
            </div>
          </Card>

          <Card title="Status Pembayaran">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Biaya</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(visit.totalBiaya)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge color={getStatusBadge(visit.paymentStatus).color}>
                  {getStatusBadge(visit.paymentStatus).label}
                </Badge>
              </div>
            </div>
          </Card>

          <Card title="Status Resep">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Jumlah Obat</p>
                <p className="text-2xl font-bold">{visit.prescriptions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge color={getStatusBadge(visit.dispensationStatus).color}>
                  {getStatusBadge(visit.dispensationStatus).label}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Examination Section - Data Pemeriksaan */}
        {(visit.jenis === 'Rawat Jalan' || visit.jenis === 'IGD') && canEdit && (
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">📋 Data Pemeriksaan Pasien</h2>
              {visit.exam ? (
                <Badge color="green">✓ Tersimpan</Badge>
              ) : (
                <Badge color="bg-red-100 text-red-800">⚠ Belum Disimpan</Badge>
              )}
            </div>
            
            {!visit.exam && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-800">Data Pemeriksaan Belum Disimpan</p>
                    <p className="text-sm text-red-700 mt-1">
                      Isi form di bawah dan klik <strong>&quot;Simpan Pemeriksaan&quot;</strong> untuk menyimpan data pemeriksaan. 
                      Jika Anda mencentang &quot;Laboratorium&quot;, pasien akan muncul di antrian Lab.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {visit.exam?.penunjangLabRequested && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">🔬</span>
                  <div>
                    <p className="font-semibold text-blue-800">Pemeriksaan Lab Diminta</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Pasien ini akan muncul di antrian Laboratorium setelah kunjungan diselesaikan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ExaminationForm
              exam={visit.exam}
              doctors={doctors}
              defaultDoctorId={visit.dokter}
              onSave={handleSaveExam}
              saving={savingExam}
            />
          </Card>
        )}

        {/* Services Section */}
        <Card title="Tindakan & Biaya" className="mb-6">
          {visit.services.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              {visit.jenis === 'Rawat Inap' ? (
                // Rawat Inap: Group by category
                <div className="space-y-6">
                  {BILLING_SECTIONS.map(section => {
                    const sectionServices = visit.services.filter(s => (s.category || 'LAINNYA') === section.key);
                    if (sectionServices.length === 0) return null;
                    
                    return (
                      <div key={section.key} className="border rounded-lg p-4">
                        <h3 className="font-bold text-sm text-gray-700 mb-3">
                          {section.no}. {section.label}
                        </h3>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tindakan</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Dokter</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Tarif</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                              {canEdit && (
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Aksi</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sectionServices.map((service) => (
                              <tr key={service.id}>
                                <td className="px-3 py-2 text-sm">
                                  {service.nama}
                                  {service.notes && (
                                    <div className="text-xs text-gray-500 mt-1">{service.notes}</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm">{service.dokter || '-'}</td>
                                <td className="px-3 py-2 text-sm">{service.unit || '-'}</td>
                                <td className="px-3 py-2 text-sm text-center">{service.quantity || 1}</td>
                                <td className="px-3 py-2 text-sm text-right">{formatCurrency(service.harga)}</td>
                                <td className="px-3 py-2 text-sm font-medium text-right">
                                  {formatCurrency(service.harga * (service.quantity || 1))}
                                </td>
                                {canEdit && (
                                  <td className="px-3 py-2 text-sm text-center">
                                    <div className="flex gap-2 justify-center">
                                      <Button
                                        variant="secondary"
                                        className="text-xs py-1 px-2"
                                        onClick={() => handleEditService(service)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="danger"
                                        className="text-xs py-1 px-2"
                                        onClick={() => handleRemoveService(service.id)}
                                      >
                                        Hapus
                                      </Button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // IGD / Rawat Jalan: Simple list
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Tindakan
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Harga
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                      {canEdit && (
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Aksi
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visit.services.map((service) => (
                      <tr key={service.id}>
                        <td className="px-4 py-2 text-sm">{service.nama}</td>
                        <td className="px-4 py-2 text-sm">{formatCurrency(service.harga)}</td>
                        <td className="px-4 py-2 text-sm">{service.quantity || 1}</td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {formatCurrency(service.harga * (service.quantity || 1))}
                        </td>
                      {canEdit && (
                        <td className="px-4 py-2 text-sm">
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              className="text-xs py-1 px-2"
                              onClick={() => handleEditService(service)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              className="text-xs py-1 px-2"
                              onClick={() => handleRemoveService(service.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {canEdit && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">
                  {editingServiceId ? '✏️ Edit Tindakan' : '+ Tambah Tindakan'}
                </h4>
                {editingServiceId && (
                  <Button 
                    variant="secondary" 
                    className="text-xs py-1 px-3"
                    onClick={handleCancelEdit}
                  >
                    Batal Edit
                  </Button>
                )}
              </div>
              {visit.jenis === 'Rawat Inap' ? (
                // Rawat Inap: Full form with category, unit, doctor, notes
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value as BillingCategory })}
                      options={BILLING_SECTIONS.map(section => ({
                        value: section.key,
                        label: `${section.no}. ${section.label}`
                      }))}
                      className="mb-0"
                    />
                    {newService.category === 'AMBULANCE' ? (
                      <Button 
                        onClick={handleOpenAmbulanceModal}
                        className="h-10"
                        variant="secondary"
                      >
                        🚑 Tambah Layanan Ambulans
                      </Button>
                    ) : servicePrices.length > 0 ? (
                      <Select
                        value=""
                        onChange={handleServiceSelect}
                        options={getServiceOptions()}
                        className="mb-0"
                      />
                    ) : (
                      <Input
                        placeholder="Nama tindakan / layanan"
                        value={newService.nama}
                        onChange={(e) => setNewService({ ...newService, nama: e.target.value })}
                        className="mb-0"
                      />
                    )}
                  </div>
                  {newService.category !== 'AMBULANCE' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                          placeholder="Dokter (opsional)"
                          value={newService.dokter}
                          onChange={(e) => setNewService({ ...newService, dokter: e.target.value })}
                          className="mb-0"
                        />
                        <Input
                          placeholder="Unit (hari/kali/x)"
                          value={newService.unit}
                          onChange={(e) => setNewService({ ...newService, unit: e.target.value })}
                          className="mb-0"
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={newService.quantity}
                          onChange={(e) => setNewService({ ...newService, quantity: e.target.value })}
                          className="mb-0"
                        />
                        <Input
                          type="number"
                          placeholder="Tarif"
                          value={newService.harga}
                          onChange={(e) => setNewService({ ...newService, harga: e.target.value })}
                          className="mb-0"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <Input
                          placeholder="Catatan (opsional, misal: DL, Chol, Tg)"
                          value={newService.notes}
                          onChange={(e) => setNewService({ ...newService, notes: e.target.value })}
                          className="mb-0"
                        />
                      </div>
                      <div className="flex gap-3">
                        {newService.harga && newService.quantity && (
                          <div className="text-sm font-medium text-gray-700 self-center">
                            Subtotal: {formatCurrency(parseFloat(newService.harga) * parseInt(newService.quantity))}
                          </div>
                        )}
                        <Button onClick={handleAddService} className="h-10">
                          {editingServiceId ? '✓ Simpan Perubahan' : '+ Tambah Tindakan'}
                        </Button>
                        {editingServiceId && (
                          <Button 
                            variant="secondary" 
                            onClick={handleCancelEdit} 
                            className="h-10"
                          >
                            Batal
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                  {newService.category === 'AMBULANCE' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Klik tombol <strong>&quot;🚑 Tambah Layanan Ambulans&quot;</strong> di atas untuk menghitung tarif ambulans berdasarkan jarak.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // IGD / Rawat Jalan: Form with database connection
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Category Selector */}
                    <Select
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value as BillingCategory, nama: '', harga: '', unit: '' })}
                      options={BILLING_SECTIONS.map(section => ({
                        value: section.key,
                        label: `${section.no}. ${section.label}`
                      }))}
                      className="mb-0"
                    />
                    {/* Service Selection from Database */}
                    <Select
                      value=""
                      onChange={handleServiceSelect}
                      options={[
                        { 
                          value: '', 
                          label: servicePrices.length > 0 
                            ? `-- Pilih Layanan (${servicePrices.length}) --` 
                            : '-- Belum ada data --'
                        },
                        ...servicePrices.map(service => ({
                          value: service.id,
                          label: `${service.serviceName} - ${formatCurrency(service.price)}/${service.unit || 'x'}`
                        }))
                      ]}
                      className="mb-0"
                    />
                    <Input
                      placeholder="Atau ketik nama manual"
                      value={newService.nama}
                      onChange={(e) => setNewService({ ...newService, nama: e.target.value })}
                      className="mb-0"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      type="number"
                      placeholder="Harga"
                      value={newService.harga}
                      onChange={(e) => setNewService({ ...newService, harga: e.target.value })}
                      className="mb-0"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={newService.quantity}
                      onChange={(e) => setNewService({ ...newService, quantity: e.target.value })}
                      className="mb-0"
                    />
                    {newService.harga && newService.quantity && (
                      <div className="text-sm font-medium text-gray-700 self-center">
                        Subtotal: {formatCurrency(parseFloat(newService.harga) * parseInt(newService.quantity))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleAddService} className="h-10">
                        {editingServiceId ? '✓ Simpan' : '+ Tambah'}
                      </Button>
                      {editingServiceId && (
                        <Button 
                          variant="secondary" 
                          onClick={handleCancelEdit} 
                          className="h-10"
                        >
                          Batal
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    * Pilih kategori, lalu pilih layanan dari database untuk mengisi harga otomatis, atau ketik manual.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Prescriptions Section - Only for IGD and Rawat Jalan */}
        {visit.jenis !== 'Rawat Inap' && (
          <Card title="Resep Obat" className="mb-6">
            {visit.prescriptions.length > 0 && (
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama Obat
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Kuantitas
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Harga/Unit
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Aturan Pakai
                      </th>
                      {canEdit && (
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Aksi
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visit.prescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td className="px-4 py-2 text-sm">{prescription.namaObat}</td>
                        <td className="px-4 py-2 text-sm">{prescription.qty}</td>
                        <td className="px-4 py-2 text-sm">
                          {prescription.pricePerUnit ? formatCurrency(prescription.pricePerUnit) : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {prescription.totalPrice ? formatCurrency(prescription.totalPrice) : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">{prescription.aturanPakai || '-'}</td>
                        {canEdit && (
                          <td className="px-4 py-2 text-sm">
                            <Button
                              variant="danger"
                              className="text-xs py-1 px-2"
                              onClick={() => handleRemovePrescription(prescription.id)}
                            >
                              Hapus
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {canEdit && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">
                  Tambah Resep
                  {drugs.length > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({drugs.length} obat tersedia)
                    </span>
                  )}
                  {drugs.length === 0 && (
                    <span className="text-sm font-normal text-red-500 ml-2">
                      (Tidak ada obat di database)
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Select
                    value={newPrescription.drugId}
                    onChange={handleDrugSelect}
                    options={[
                      { value: '', label: '-- Pilih Obat dari Database --' },
                      ...drugs.map(drug => ({
                        value: drug.id,
                        label: `${drug.drugName} (${drug.unit}) - ${formatCurrency(drug.pricePerUnit)}`
                      }))
                    ]}
                    className="mb-0"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={newPrescription.qty}
                    onChange={(e) => setNewPrescription({ ...newPrescription, qty: e.target.value })}
                    className="mb-0"
                  />
                  <Input
                    placeholder="Aturan pakai (3x1)"
                    value={newPrescription.aturanPakai}
                    onChange={(e) => setNewPrescription({ ...newPrescription, aturanPakai: e.target.value })}
                    className="mb-0"
                  />
                  <div className="text-sm font-medium self-center text-gray-700">
                    {newPrescription.pricePerUnit > 0 && newPrescription.qty && (
                      <span>
                        Total: {formatCurrency(parseInt(newPrescription.qty) * newPrescription.pricePerUnit)}
                      </span>
                    )}
                  </div>
                  <Button onClick={handleAddPrescription} className="h-10">
                    + Tambah
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Pilih obat dari database untuk kalkulasi harga otomatis dan pengurangan stok
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Info message for Rawat Inap */}
        {visit.jenis === 'Rawat Inap' && canEdit && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">ℹ️</div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Resep Obat untuk Rawat Inap</h4>
                <p className="text-sm text-blue-700">
                  Untuk pasien Rawat Inap, obat-obatan diinput melalui kategori <strong>&quot;7. BHP (OBAT &amp; ALKES)&quot;</strong> di bagian &quot;Tindakan &amp; Biaya&quot; di atas.
                  Pilih kategori tersebut, lalu pilih obat dari dropdown untuk menambahkan ke tagihan.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {canEdit && (
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button variant="success" onClick={handleFinishVisit} disabled={saving}>
              Selesai & Kirim ke Kasir/Farmasi
            </Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Kembali
            </Button>
          </div>
        )}
      </div>

      {/* Ambulance Service Modal */}
      {showAmbulanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">🚑 Tambah Layanan Ambulans</h2>
              <p className="text-sm text-gray-600 mb-6">
                Pilih jenis kendaraan, masukkan jarak tempuh, dan hitung tarif otomatis
              </p>

              <div className="space-y-4">
                {/* Vehicle and Service Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kendaraan *
                    </label>
                    <Select
                      value={ambulanceForm.vehicleType}
                      onChange={(e) => setAmbulanceForm({ ...ambulanceForm, vehicleType: e.target.value })}
                      options={ambulanceConfigs.map(config => ({
                        value: config.vehicleType,
                        label: config.vehicleType.replace(/_/g, ' ')
                      }))}
                      className="mb-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Layanan *
                    </label>
                    <Select
                      value={ambulanceForm.serviceType}
                      onChange={(e) => setAmbulanceForm({ ...ambulanceForm, serviceType: e.target.value })}
                      options={getServiceTypes().map(type => ({
                        value: type,
                        label: type
                      }))}
                      className="mb-0"
                    />
                  </div>
                </div>

                {/* Distance Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jarak Tempuh (km) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 5.3"
                    value={ambulanceForm.oneWayKm || ''}
                    onChange={(e) => {
                      const km = parseFloat(e.target.value) || 0;
                      setAmbulanceForm({ ...ambulanceForm, oneWayKm: km });
                      
                      // Recalculate cost
                      if (km > 0) {
                        const config = ambulanceConfigs.find(c => c.vehicleType === ambulanceForm.vehicleType);
                        if (config) {
                          const tariffConfig = configToTariffConfig(config);
                          const tariffResult = calculateAmbulanceTariff(
                            {
                              vehicleType: ambulanceForm.vehicleType as any,
                              serviceType: ambulanceForm.serviceType as any,
                              oneWayKm: km,
                            },
                            tariffConfig
                          );
                          setAmbulanceForm(prev => ({ ...prev, estimatedCost: tariffResult.total }));
                        }
                      }
                    }}
                    className="mb-0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Masukkan jarak satu arah dalam kilometer
                  </p>
                </div>

                {/* Distance Display */}
                {ambulanceForm.oneWayKm > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Jarak Satu Arah</p>
                        <p className="text-xl font-bold text-gray-900">
                          {ambulanceForm.oneWayKm.toFixed(1)} km
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jarak Pulang-Pergi</p>
                        <p className="text-xl font-bold text-gray-900">
                          {(ambulanceForm.oneWayKm * 2).toFixed(1)} km
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cost Estimate */}
                {ambulanceForm.estimatedCost > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Estimasi Biaya</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {formatCurrency(ambulanceForm.estimatedCost)}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      * Sudah termasuk PPN dan semua komponen biaya
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleAddAmbulanceService}
                  disabled={ambulanceForm.oneWayKm === 0}
                >
                  ✓ Tambah ke Tagihan
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseAmbulanceModal}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

