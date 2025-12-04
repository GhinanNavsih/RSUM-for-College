/**
 * ═══════════════════════════════════════════════════════════════
 * RADIOLOGY ORDER PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /radiologi/visit/[visitId]
 * Purpose: Radiologi user selects which radiology exams to perform for a visit
 * Features:
 * - View visit and patient info
 * - Select radiology tests grouped by category (accordion style)
 * - Support for R/L side selection for applicable tests
 * - Save radiology order to Firestore
 * Access: Radiologi users (and admin)
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
import { getVisit, getPatient, getRadiologyOrderByVisitId, upsertRadiologyOrder } from '@/lib/firestore';
import { Visit, Patient, RadiologyOrder, RadiologyTestSelection } from '@/types/models';
import { 
  RADIOLOGY_TEST_GROUPS, 
  RADIOLOGY_TESTS_BY_GROUP, 
  RadiologyTestGroupId, 
  RadiologyTestDefinition 
} from '@/types/radiology-tests';
import { formatDate } from '@/lib/utils';

export default function RadiologyVisitPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [existingOrder, setExistingOrder] = useState<RadiologyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selected tests state
  const [selectedTests, setSelectedTests] = useState<RadiologyTestSelection[]>([]);

  // Expanded groups state (for accordion)
  const [expandedGroups, setExpandedGroups] = useState<Set<RadiologyTestGroupId>>(new Set());

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
        router.push('/radiologi');
        return;
      }
      setVisit(visitData);

      // Load patient data
      const patientData = await getPatient(visitData.patientId);
      setPatient(patientData);

      // Load existing radiology order if any
      const radiologyOrder = await getRadiologyOrderByVisitId(visitId);
      if (radiologyOrder) {
        setExistingOrder(radiologyOrder);
        setSelectedTests(radiologyOrder.tests || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupId: RadiologyTestGroupId) => {
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

  // Get selected test by ID
  const getSelectedTest = (testId: string): RadiologyTestSelection | undefined => {
    return selectedTests.find(t => t.testId === testId);
  };

  // Toggle individual test
  const toggleTest = (test: RadiologyTestDefinition) => {
    setSelectedTests(prev => {
      const exists = prev.some(t => t.testId === test.id);
      if (exists) {
        return prev.filter(t => t.testId !== test.id);
      } else {
        return [...prev, {
          testId: test.id,
          groupId: test.groupId,
          label: test.label,
          // Default to Right side for tests that require side selection
          side: test.hasSide ? 'R' : undefined,
        }];
      }
    });
  };

  // Update side for a test
  const updateTestSide = (testId: string, side: 'R' | 'L') => {
    setSelectedTests(prev => 
      prev.map(t => t.testId === testId ? { ...t, side } : t)
    );
  };

  // Get selected count for a group
  const getGroupSelectedCount = (groupId: RadiologyTestGroupId): number => {
    return selectedTests.filter(t => t.groupId === groupId).length;
  };

  // Get total count for a group
  const getGroupTotalCount = (groupId: RadiologyTestGroupId): number => {
    return RADIOLOGY_TESTS_BY_GROUP[groupId]?.length || 0;
  };

  // Check if all tests in group are selected
  const isGroupFullySelected = (groupId: RadiologyTestGroupId): boolean => {
    const tests = RADIOLOGY_TESTS_BY_GROUP[groupId] || [];
    return tests.every(test => isTestSelected(test.id));
  };

  // Check if some (but not all) tests in group are selected
  const isGroupPartiallySelected = (groupId: RadiologyTestGroupId): boolean => {
    const selectedCount = getGroupSelectedCount(groupId);
    const totalCount = getGroupTotalCount(groupId);
    return selectedCount > 0 && selectedCount < totalCount;
  };

  // Toggle all tests in a group
  const toggleGroupAll = (groupId: RadiologyTestGroupId) => {
    const tests = RADIOLOGY_TESTS_BY_GROUP[groupId] || [];
    const isFullySelected = isGroupFullySelected(groupId);

    if (isFullySelected) {
      // Deselect all in this group
      setSelectedTests(prev => prev.filter(t => t.groupId !== groupId));
    } else {
      // Select all in this group
      const newSelections: RadiologyTestSelection[] = tests.map(test => ({
        testId: test.id,
        groupId: test.groupId,
        label: test.label,
        side: test.hasSide ? 'R' : undefined,
      }));
      // Remove existing selections from this group and add all
      setSelectedTests(prev => [
        ...prev.filter(t => t.groupId !== groupId),
        ...newSelections,
      ]);
    }
  };

  // Save radiology order
  const handleSave = async () => {
    if (!visit || !patient) return;

    setSaving(true);
    try {
      const radiologyOrder: RadiologyOrder = {
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

      await upsertRadiologyOrder(radiologyOrder);
      setExistingOrder(radiologyOrder);
      alert('✅ Permintaan radiologi berhasil disimpan!');
    } catch (error) {
      console.error('Error saving radiology order:', error);
      alert('Gagal menyimpan permintaan radiologi');
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

  // Access control - allow admin and radiologi roles
  // For now, also allow IGD to view
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

  // Check if radiology was requested in the examination form
  const radioRequested = visit.exam?.penunjangRadioRequested === true;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📷 Permintaan Radiologi</h1>
              <p className="text-gray-600 mt-1">Pilih pemeriksaan radiologi yang diminta untuk pasien ini</p>
            </div>
            {existingOrder && (
              <Badge color="bg-green-100 text-green-800">
                Sudah ada permintaan
              </Badge>
            )}
          </div>
        </div>

        {/* Warning if radiology not requested */}
        {!radioRequested && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-800">Pemeriksaan Radiologi Belum Diminta</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  IGD belum mencentang &quot;Radiologi&quot; di bagian Pemeriksaan Penunjang. 
                  Anda tetap dapat membuat permintaan radiologi, namun pastikan ini sesuai dengan instruksi dokter.
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  {test.label}
                  {test.side && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-purple-200 text-purple-900 font-medium">
                      {test.side}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      const testDef = RADIOLOGY_TESTS_BY_GROUP[test.groupId]?.find(t => t.id === test.testId);
                      if (testDef) toggleTest(testDef);
                    }}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Radiology Test Groups (Accordion) */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📁 Kategori Pemeriksaan Radiologi</h2>
          <div className="space-y-2">
            {RADIOLOGY_TEST_GROUPS.map(group => {
              const isExpanded = expandedGroups.has(group.id);
              const selectedCount = getGroupSelectedCount(group.id);
              const totalCount = getGroupTotalCount(group.id);
              const isFullySelected = isGroupFullySelected(group.id);
              const isPartiallySelected = isGroupPartiallySelected(group.id);
              const tests = RADIOLOGY_TESTS_BY_GROUP[group.id] || [];

              return (
                <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-purple-50' : 'bg-gray-50 hover:bg-gray-100'
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
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{group.label}</span>
                        {selectedCount > 0 && (
                          <span className="ml-2 text-sm text-purple-600">
                            ({selectedCount}/{totalCount} dipilih)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{totalCount} pemeriksaan</span>
                      <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Group Tests (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-white p-4">
                      <div className="space-y-3">
                        {tests.map(test => {
                          const selected = isTestSelected(test.id);
                          const selectedTest = getSelectedTest(test.id);

                          return (
                            <div
                              key={test.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                selected ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <label className="flex items-center gap-3 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleTest(test)}
                                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <div>
                                  <span className="text-gray-900">{test.label}</span>
                                  {test.note && (
                                    <span className="text-amber-600 text-xs ml-2">
                                      {test.note}
                                    </span>
                                  )}
                                  {test.hasSide && (
                                    <span className="text-gray-500 text-xs ml-2">
                                      (Pilih sisi: R/L)
                                    </span>
                                  )}
                                </div>
                              </label>

                              {/* R/L Side Selection (only for tests with hasSide) */}
                              {test.hasSide && selected && (
                                <div className="flex items-center gap-1 ml-4">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTestSide(test.id, 'R');
                                    }}
                                    className={`px-3 py-1 text-sm rounded-l-md border ${
                                      selectedTest?.side === 'R'
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    R
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTestSide(test.id, 'L');
                                    }}
                                    className={`px-3 py-1 text-sm rounded-r-md border-t border-b border-r ${
                                      selectedTest?.side === 'L'
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    L
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
            {saving ? 'Menyimpan...' : '💾 Simpan Permintaan Radiologi'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.back()}
            disabled={saving}
          >
            Kembali
          </Button>
        </div>

        {/* Note about R/L */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="text-purple-600 font-medium">R / L</span> = Kanan (Right) / Kiri (Left) - 
            untuk pemeriksaan ekstremitas yang memerlukan spesifikasi sisi tubuh
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="text-amber-600 font-medium">*</span> = Pilihan proyeksi/posisi tersedia
          </p>
        </div>
      </div>
    </div>
  );
}

