'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getVisit, getPatient, updateVisit, updateDrugStock } from '@/lib/firestore';
import { Visit, Patient } from '@/types/models';
import { formatDate, formatDateTime, getStatusBadge } from '@/lib/utils';
import { pdf } from '@react-pdf/renderer';
import { PrescriptionPDF } from '@/components/PrescriptionPDF';
import Image from 'next/image';

export default function FarmasiVisitDetailPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadVisitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId]);

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

  const handleDispensePrescriptions = async () => {
    if (!visit || !appUser) return;

    if (visit.prescriptions.length === 0) {
      alert('Tidak ada resep untuk diproses.');
      return;
    }

    const confirmed = window.confirm(
      `Konfirmasi bahwa ${visit.prescriptions.length} obat telah disiapkan dan diserahkan kepada pasien?`
    );

    if (!confirmed) return;

    setProcessing(true);
    try {
      // Update drug stock for each prescription that has drugId
      const stockUpdatePromises = visit.prescriptions
        .filter(p => p.drugId) // Only update prescriptions linked to drug database
        .map(async (prescription) => {
          try {
            await updateDrugStock(prescription.drugId!, prescription.qty, 'subtract');
            console.log(`Stock updated for drug ${prescription.drugId}: -${prescription.qty}`);
          } catch (error) {
            console.error(`Failed to update stock for ${prescription.namaObat}:`, error);
            // Don't throw error - continue with other updates
            // Log for staff to manually check inventory
          }
        });

      // Wait for all stock updates to complete
      await Promise.all(stockUpdatePromises);

      // Mark dispensation as done
      await updateVisit(visitId, {
        dispensationStatus: 'done',
        dispensationTime: new Date().toISOString(),
        farmasiUserId: appUser.id,
      });

      alert('Pemberian obat berhasil diproses dan stok telah diperbarui!');
      router.push('/farmasi');
    } catch (error) {
      console.error('Error processing dispensation:', error);
      alert('Gagal memproses pemberian obat. Silakan coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = async () => {
    if (!visit || !patient) return;

    try {
      const blob = await pdf(
        <PrescriptionPDF visit={visit} patient={patient} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resep_${patient.noRM}_${
        visit.tanggalKunjungan.split('T')[0]
      }.pdf`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating prescription PDF:', error);
      alert('Gagal membuat PDF resep. Silakan coba lagi.');
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

  const isDone = visit.dispensationStatus === 'done';
  const dispensationBadge = getStatusBadge(visit.dispensationStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 no-print">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detail Resep</h1>
              <p className="text-gray-600 mt-1">Resep untuk {patient.nama}</p>
            </div>
            <Badge color={dispensationBadge.color} className="text-base px-4 py-2">
              {dispensationBadge.label}
            </Badge>
          </div>
        </div>

        {/* Print-friendly prescription - match PrescriptionPDF layout/design */}
        <Card className="mb-6">
          <div className="relative">
            {/* Watermark */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
              <Image
                src="/rsum-logo.png"
                alt="RSUM Watermark"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>

            {/* Header matching PrescriptionPDF */}
            <div className="pb-8 mb-8 relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-40 h-40 flex items-center justify-start">
                  <Image
                    src="/rsum-logo.png"
                    alt="Logo RSUM"
                    width={125}
                    height={125}
                    className="rounded-full object-contain"
                  />
                </div>
                <div className="ml-8 text-center">
                  <h2 className="text-3xl font-bold text-primary-600">
                    RUMAH SAKIT UNIPDU MEDIKA
                  </h2>
                  <p className="text-sm text-gray-700 mt-1">
                    Jl. Raya Peterongan-Jogoroto KM. 0,5 (Tambar) Jombang.
                  </p>
                  <p className="text-sm text-gray-700">
                    No Telp. 081235477781 | Email: rs.unipdu.medika@gmail.com
                  </p>
                </div>
              </div>
              <div className="border-t-2 border-black pt-3 mt-2">
                <h3 className="text-xl font-bold text-center">
                  Lembar Resep Obat {patient.nama}
                </h3>
              </div>
            </div>

            {/* Patient and Visit Info - same fields as PrescriptionPDF */}
            <div className="grid grid-cols-2 gap-8 pb-4 mb-6 border-b border-black text-sm relative z-10">
              <div>
                <h3 className="font-bold mb-3">Informasi Pasien</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-600 w-40">No. RM:</span>
                    <span className="font-bold">{patient.noRM}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">Nama:</span>
                    <span className="font-bold">{patient.nama}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">
                      Tanggal Lahir &amp; Umur:
                    </span>
                    <span className="font-bold">
                      {patient.tanggalLahir
                        ? formatDate(patient.tanggalLahir)
                        : '-'}
                      {patient.umur ? ` (${patient.umur} tahun)` : ''}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-40">
                      Penanggung Jawab:
                    </span>
                    <span className="font-bold">
                      {patient.namaPenanggungJawab || '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Informasi Kunjungan</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-600 w-32">Tanggal:</span>
                    <span className="font-bold">
                      {formatDate(visit.tanggalKunjungan)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Jenis:</span>
                    <span className="font-bold">{visit.jenis}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32">Dokter:</span>
                    <span className="font-bold">{visit.dokter}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar Resep - same columns as PrescriptionPDF */}
            <div className="border-t pt-4 mb-6 relative z-10">
              <h3 className="font-semibold mb-4">Daftar Resep</h3>
              {visit.prescriptions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada resep.
                </p>
              ) : (
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">
                        No.
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">
                        Nama Obat
                      </th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">
                        Qty
                      </th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">
                        Aturan Pakai
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visit.prescriptions.map((prescription, index) => (
                      <tr key={prescription.id} className="border-b">
                        <td className="py-3 text-sm">{index + 1}</td>
                        <td className="py-3 text-sm font-medium">
                          {prescription.namaObat}
                        </td>
                        <td className="py-3 text-sm text-center">
                          <Badge color="bg-primary-100 text-primary-800">
                            {prescription.qty}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm">
                          {prescription.aturanPakai || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Informasi Pemberian Obat */}
            {isDone && (
              <div className="border-t pt-4 relative z-10">
                <h3 className="font-semibold mb-3">Informasi Pemberian Obat</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Waktu Serah Terima:</span>
                    <span className="ml-2">
                      {visit.dispensationTime
                        ? formatDateTime(visit.dispensationTime)
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      color="bg-green-100 text-green-800"
                      className="ml-2"
                    >
                      SELESAI
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Petunjuk untuk Pasien - visually echo the PDF precaution box */}
            {visit.prescriptions.length > 0 && (
              <div className="border-t pt-4 mt-4 relative z-10">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    ⚠️ Petunjuk untuk Pasien
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>
                      Konsumsi obat sesuai dengan aturan pakai yang tertera.
                    </li>
                    <li>
                      Jika ada efek samping, segera hubungi dokter atau datang
                      ke IGD.
                    </li>
                    <li>Simpan obat di tempat yang sejuk dan kering.</li>
                    <li>Jauhkan dari jangkauan anak-anak.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Dispensation actions */}
        {!isDone && visit.prescriptions.length > 0 && (appUser?.role === 'admin' || appUser?.role === 'farmasi') && (
          <Card className="mb-6 no-print">
            <h3 className="font-semibold mb-4">Proses Pemberian Obat</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pastikan semua obat telah disiapkan dan dijelaskan aturan pakainya kepada pasien sebelum melanjutkan.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleDispensePrescriptions} disabled={processing} variant="success">
                {processing ? 'Memproses...' : '✓ Konfirmasi Obat Telah Diserahkan'}
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Batal
              </Button>
            </div>
          </Card>
        )}

        {/* Print and back buttons */}
        <div className="flex gap-4 no-print">
          <Button onClick={handlePrint} variant="secondary">
            🖨️ Cetak Resep
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}

