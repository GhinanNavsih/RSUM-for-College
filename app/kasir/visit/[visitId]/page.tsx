'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getVisit, getPatient, updateVisit } from '@/lib/firestore';
import { Visit, Patient } from '@/types/models';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getStatusBadge,
} from '@/lib/utils';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import Image from 'next/image';

export default function KasirVisitDetailPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

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

  const handleProcessPayment = async () => {
    if (!visit || !appUser) return;

    const confirmed = window.confirm(
      `Konfirmasi pembayaran sebesar ${formatCurrency(
        visit.totalBiaya,
      )} dengan metode ${paymentMethod}?`,
    );

    if (!confirmed) return;

    setProcessing(true);
    try {
      await updateVisit(visitId, {
        paymentStatus: 'paid',
        paymentTime: new Date().toISOString(),
        paymentMethod,
        kasirUserId: appUser.id,
      });

      alert('Pembayaran berhasil diproses!');
      router.push('/kasir');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Gagal memproses pembayaran. Silakan coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = async () => {
    if (!visit || !patient) return;

    try {
      const blob = await pdf(
        <InvoicePDF visit={visit} patient={patient} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nota_${patient.noRM}_${
        visit.tanggalKunjungan.split('T')[0]
      }.pdf`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
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

  const isPaid = visit.paymentStatus === 'paid';
  const paymentBadge = getStatusBadge(visit.paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 no-print">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detail Pembayaran
              </h1>
              <p className="text-gray-600 mt-1">
                Tagihan untuk {patient.nama}
              </p>
            </div>
            <Badge color={paymentBadge.color} className="text-base px-4 py-2">
              {paymentBadge.label}
            </Badge>
          </div>
        </div>

        {/* Print-friendly invoice */}
        <Card className="mb-6">
          <div className="relative">
            {/* Invoice watermark */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
              <Image
                src="/rsum-logo.png"
                alt="RSUM Watermark"
                width={400}
                height={400}
                className="object-contain"
              />
            </div>

            {/* Header matching Invoice PDF */}
            <div className="pb-4 mb-6 relative z-10">
              <div className="flex items-center justify-center mb-2">
                <div className="w-20 h-20 flex items-center justify-center">
                  <Image
                    src="/rsum-logo.png"
                    alt="Logo RSUM"
                    width={80}
                    height={80}
                    className="rounded-full object-contain"
                  />
                </div>
                <div className="ml-4 text-center">
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
                  Nota Pembayaran {visit.jenis}
                </h3>
              </div>
            </div>

            {/* Patient and Visit Info */}
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

            {/* Billing Details */}
            <div className="mb-6 relative z-10">
              <h3 className="font-bold text-base mb-3">Rincian Biaya</h3>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">
                      Tindakan
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">
                      Harga
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">
                      Qty
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Services Section */}
                  {visit.services.length > 0 && (
                    <>
                      <tr>
                        <td
                          colSpan={4}
                          className="py-2 px-4 text-sm font-bold text-gray-700"
                        >
                          Tindakan &amp; Layanan
                        </td>
                      </tr>
                      {visit.services.map((service) => (
                        <tr
                          key={service.id}
                          className="border-b border-gray-200"
                        >
                          <td className="py-3 px-4 text-sm">
                            {service.nama}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            {formatCurrency(service.harga)}
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            {service.quantity || 1}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-bold">
                            {formatCurrency(
                              service.harga * (service.quantity || 1),
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Prescriptions Section */}
                  {visit.prescriptions.length > 0 && (
                    <>
                      <tr>
                        <td
                          colSpan={4}
                          className="py-2 px-4 text-sm font-bold text-gray-700"
                        >
                          Obat-obatan
                        </td>
                      </tr>
                      {visit.prescriptions.map((prescription) => (
                        <tr
                          key={prescription.id}
                          className="border-b border-gray-200"
                        >
                          <td className="py-3 px-4 text-sm">
                            {prescription.namaObat}
                            {prescription.aturanPakai && (
                              <div className="text-xs text-gray-500 italic mt-1">
                                Aturan pakai: {prescription.aturanPakai}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            {prescription.pricePerUnit
                              ? formatCurrency(prescription.pricePerUnit)
                              : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-center">
                            {prescription.qty}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-bold">
                            {prescription.totalPrice
                              ? formatCurrency(prescription.totalPrice)
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
                <tfoot>
                  {/* Subtotal breakdown */}
                  <tr className="border-t border-gray-400">
                    <td
                      colSpan={3}
                      className="py-2 px-4 text-right text-sm text-gray-600"
                    >
                      Subtotal Tindakan:
                    </td>
                    <td className="py-2 px-4 text-right text-sm font-bold">
                      {formatCurrency(
                        visit.services.reduce(
                          (sum, s) => sum + s.harga * (s.quantity || 1),
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="py-2 px-4 text-right text-sm text-gray-600"
                    >
                      Subtotal Obat:
                    </td>
                    <td className="py-2 px-4 text-right text-sm font-bold">
                      {formatCurrency(
                        visit.prescriptions.reduce(
                          (sum, p) => sum + (p.totalPrice || 0),
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                  {/* Grand Total */}
                  <tr className="border-t-2 border-black">
                    <td
                      colSpan={3}
                      className="py-4 px-4 text-right font-bold text-lg"
                    >
                      TOTAL:
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-2xl text-primary-1000">
                      {formatCurrency(visit.totalBiaya)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer message */}
            <div className="text-center border-t border-black pt-4 mt-4 relative z-10">
              <p className="font-bold text-sm italic">
                -- TERIMAKASIH DAN SEMOGA SEHAT SELALU --
              </p>
            </div>

            {isPaid && (
              <div className="border-t pt-4 mt-4 relative z-10">
                <h3 className="font-semibold mb-3">Informasi Pembayaran</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Waktu Bayar:</span>
                    <span className="ml-2">
                      {visit.paymentTime
                        ? formatDateTime(visit.paymentTime)
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Metode:</span>
                    <span className="ml-2 capitalize">
                      {visit.paymentMethod}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      color="bg-green-100 text-green-800"
                      className="ml-2"
                    >
                      LUNAS
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Payment actions */}
        {!isPaid && (appUser?.role === 'admin' || appUser?.role === 'kasir') && (
          <Card className="mb-6 no-print">
            <h3 className="font-semibold mb-4">Proses Pembayaran</h3>
            <div className="mb-4">
              <Select
                label="Metode Pembayaran"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'cash', label: 'Tunai' },
                  { value: 'debit', label: 'Kartu Debit' },
                  { value: 'credit', label: 'Kartu Kredit' },
                  { value: 'transfer', label: 'Transfer Bank' },
                  { value: 'qris', label: 'QRIS' },
                ]}
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleProcessPayment}
                disabled={processing}
                variant="success"
              >
                {processing
                  ? 'Memproses...'
                  : `Konfirmasi Pembayaran ${formatCurrency(
                      visit.totalBiaya,
                    )}`}
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.back()}
              >
                Batal
              </Button>
            </div>
          </Card>
        )}

        {/* Print and back buttons */}
        <div className="flex gap-4 no-print">
          <Button onClick={handlePrint} variant="secondary">
            🖨️ Cetak Nota
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.back()}
          >
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}