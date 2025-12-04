/**
 * ═══════════════════════════════════════════════════════════════
 * LAB ORDER PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /lab/visit/[visitId]
 * Purpose: Lab user selects which lab tests to perform for a visit
 * Features:
 * - View visit and patient info
 * - Select lab tests grouped by category (accordion style)
 * - Save lab order to Firestore
 * Access: Lab users (and admin)
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
import { getVisit, getPatient, getLabOrderByVisitId, upsertLabOrder } from '@/lib/firestore';
import { Visit, Patient, LabOrder, LabTestSelection } from '@/types/models';
import { 
  LAB_TEST_GROUPS, 
  LAB_TESTS_BY_GROUP, 
  LabTestGroupId, 
  LabTestDefinition 
} from '@/types/lab-tests';
import { formatDate } from '@/lib/utils';

export default function LabVisitPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [existingOrder, setExistingOrder] = useState<LabOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selected tests state
  const [selectedTests, setSelectedTests] = useState<LabTestSelection[]>([]);

  // Expanded groups state (for accordion)
  const [expandedGroups, setExpandedGroups] = useState<Set<LabTestGroupId>>(new Set());

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser && visitId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser, visitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load visit data
      const visitData = await getVisit(visitId);
      if (!visitData) {
        alert('Kunjungan tidak ditemukan');
        router.push('/lab');
        return;
      }
      setVisit(visitData);

      // Load patient data
      const patientData = await getPatient(visitData.patientId);
      setPatient(patientData);

      // Load existing lab order if any
      const labOrder = await getLabOrderByVisitId(visitId);
      if (labOrder) {
        setExistingOrder(labOrder);
        setSelectedTests(labOrder.tests || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupId: LabTestGroupId) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Check if a test is selected
  const isTestSelected = (testId: string): boolean => {
    return selectedTests.some(t => t.testId === testId);
  };

  // Toggle individual test
  const toggleTest = (test: LabTestDefinition) => {
    setSelectedTests(prev => {
      const exists = prev.some(t => t.testId === test.id);
      if (exists) {
        return prev.filter(t => t.testId !== test.id);
      } else {
        return [...prev, {
          testId: test.id,
          groupId: test.groupId,
          label: test.label,
        }];
      }
    });
  };

  // Get selected count for a group
  const getGroupSelectedCount = (groupId: LabTestGroupId): number => {
    return selectedTests.filter(t => t.groupId === groupId).length;
  };

  // Get total count for a group
  const getGroupTotalCount = (groupId: LabTestGroupId): number => {
    return LAB_TESTS_BY_GROUP[groupId]?.length || 0;
  };

  // Check if all tests in group are selected
  const isGroupFullySelected = (groupId: LabTestGroupId): boolean => {
    const tests = LAB_TESTS_BY_GROUP[groupId] || [];
    return tests.every(test => isTestSelected(test.id));
  };

  // Check if some (but not all) tests in group are selected
  const isGroupPartiallySelected = (groupId: LabTestGroupId): boolean => {
    const selectedCount = getGroupSelectedCount(groupId);
    const totalCount = getGroupTotalCount(groupId);
    return selectedCount > 0 && selectedCount < totalCount;
  };

  // Toggle all tests in a group
  const toggleGroupAll = (groupId: LabTestGroupId) => {
    const tests = LAB_TESTS_BY_GROUP[groupId] || [];
    const isFullySelected = isGroupFullySelected(groupId);

    if (isFullySelected) {
      // Deselect all in this group
      setSelectedTests(prev => prev.filter(t => t.groupId !== groupId));
    } else {
      // Select all in this group
      const newSelections: LabTestSelection[] = tests.map(test => ({
        testId: test.id,
        groupId: test.groupId,
        label: test.label,
      }));
      // Remove existing selections from this group and add all
      setSelectedTests(prev => [
        ...prev.filter(t => t.groupId !== groupId),
        ...newSelections,
      ]);
    }
  };

  // Save lab order
  const handleSave = async () => {
    if (!visit || !patient) return;

    setSaving(true);
    try {
      const labOrder: LabOrder = {
        id: visitId,
        visitId: visitId,
        patientId: visit.patientId,
        createdAt: existingOrder?.createdAt ?? new Date().toISOString(),
        createdBy: existingOrder?.createdBy ?? appUser?.id,
        updatedAt: new Date().toISOString(),
        updatedBy: appUser?.id,
        status: 'REQUESTED',
        tests: selectedTests,
      };

      await upsertLabOrder(labOrder);
      setExistingOrder(labOrder);
      alert('✅ Permintaan lab berhasil disimpan!');
    } catch (error) {
      console.error('Error saving lab order:', error);
      alert('Gagal menyimpan permintaan lab');
    } finally {
      setSaving(false);
    }
  };

  // Get patient display name
  const getPatientName = (): string => {
    if (!patient) return '-';
    return patient.nama || patient.fullName || patient.tempFullName || '-';
  };

  // Get patient MRN
  const getPatientMRN = (): string => {
    if (!patient) return '-';
    return patient.noRM || '-';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Access control - allow admin and lab roles
  // For now, also allow IGD to view (since there's no dedicated lab role yet)
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

  // Check if lab was requested in the examination form
  const labRequested = visit.exam?.penunjangLabRequested === true;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔬 Permintaan Laboratorium</h1>
              <p className="text-gray-600 mt-1">Pilih pemeriksaan lab yang diminta untuk pasien ini</p>
            </div>
            {existingOrder && (
              <Badge color="bg-green-100 text-green-800">
                Sudah ada permintaan
              </Badge>
            )}
          </div>
        </div>

        {/* Warning if lab not requested */}
        {!labRequested && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-800">Pemeriksaan Lab Belum Diminta</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  IGD belum mencentang &quot;Laboratorium&quot; di bagian Pemeriksaan Penunjang. 
                  Anda tetap dapat membuat permintaan lab, namun pastikan ini sesuai dengan instruksi dokter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Patient & Visit Info Card */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Informasi Pasien & Kunjungan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nama Pasien</p>
              <p className="font-medium text-gray-900">{getPatientName()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">No. Rekam Medis</p>
              <p className="font-medium text-gray-900">{getPatientMRN()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal Kunjungan</p>
              <p className="font-medium text-gray-900">{formatDate(visit.tanggalKunjungan)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dokter</p>
              <p className="font-medium text-gray-900">{visit.dokter || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Jenis Kunjungan</p>
              <Badge>{visit.jenis}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Diagnosa</p>
              <p className="font-medium text-gray-900">
                {visit.exam?.diagnosis || visit.exam?.diagnosisSecondary || '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* Selection Summary */}
        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">📋 Pemeriksaan Terpilih</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedTests.length} pemeriksaan dipilih
              </p>
            </div>
            {selectedTests.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => setSelectedTests([])}
                className="text-sm"
              >
                Hapus Semua
              </Button>
            )}
          </div>
          {selectedTests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTests.map(test => (
                <span
                  key={test.testId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {test.label}
                  <button
                    onClick={() => {
                      const testDef = LAB_TESTS_BY_GROUP[test.groupId]?.find(t => t.id === test.testId);
                      if (testDef) toggleTest(testDef);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Lab Test Groups (Accordion) */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📁 Kategori Pemeriksaan Lab</h2>
          <div className="space-y-2">
            {LAB_TEST_GROUPS.map(group => {
              const isExpanded = expandedGroups.has(group.id);
              const selectedCount = getGroupSelectedCount(group.id);
              const totalCount = getGroupTotalCount(group.id);
              const isFullySelected = isGroupFullySelected(group.id);
              const isPartiallySelected = isGroupPartiallySelected(group.id);
              const tests = LAB_TESTS_BY_GROUP[group.id] || [];

              return (
                <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleGroupExpansion(group.id)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Group Checkbox */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupAll(group.id);
                        }}
                        className="flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={isFullySelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isPartiallySelected;
                          }}
                          onChange={() => toggleGroupAll(group.id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{group.label}</span>
                        {selectedCount > 0 && (
                          <span className="ml-2 text-sm text-blue-600">
                            ({selectedCount}/{totalCount} dipilih)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{totalCount} tes</span>
                      <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Group Tests (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-white p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tests.map(test => (
                          <label
                            key={test.id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isTestSelected(test.id)}
                              onChange={() => toggleTest(test)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">
                              {test.label}
                              {test.note && (
                                <span className="text-amber-600 text-xs ml-1" title="Memerlukan persiapan khusus">
                                  {test.note}
                                </span>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={saving || selectedTests.length === 0}
            className="flex-1"
          >
            {saving ? (
              'Menyimpan...'
            ) : (
              '💾 Simpan Permintaan Lab'
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.back()}
            disabled={saving}
          >
            Kembali
          </Button>
        </div>

        {/* Note about asterisk */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="text-amber-600 font-medium">(*)</span> = Pemeriksaan memerlukan persiapan khusus (puasa, dll.)
          </p>
        </div>
      </div>
    </div>
  );
}

