import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Visit, Patient } from '@/types/models';

// Reuse the same visual language as InvoicePDF (header, watermark, info layout)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  // Watermark
  watermark: {
    position: 'absolute',
    top: '35%',
    left: '25%',
    opacity: 0.1,
    width: 300,
    height: 300,
  },
  // Header
  header: {
    marginBottom: 20,
    borderColor: '#000',
    paddingVertical: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 75,
  },
  hospitalInfo: {
    flex: 10,
    marginLeft: 12,
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#2563EB',
    marginBottom: 5,
    textAlign: 'center',
  },
  hospitalAddress: {
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  invoiceTitleContainer: {
    borderTopWidth: 2,
    borderColor: '#000',
    marginTop: 4,
    paddingTop: 24,
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  // Patient and Visit Info
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  infoColumn: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 80,
    fontSize: 9,
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  // Table
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  // Table columns for prescription
  colNo: {
    flex: 0.5,
    textAlign: 'left',
  },
  colDrug: {
    flex: 3,
  },
  colQty: {
    flex: 0.7,
    textAlign: 'center',
  },
  colRules: {
    flex: 2,
  },
  // Footer
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Helvetica-BoldOblique',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
  },
  precautionBox: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FBBF24',
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
  },
  precautionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#B45309',
    marginBottom: 4,
  },
  precautionItem: {
    fontSize: 9,
    color: '#92400E',
    marginBottom: 2,
  },
  dosageText: {
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

interface PrescriptionPDFProps {
  visit: Visit;
  patient: Patient;
}

export const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({ visit, patient }) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.watermark} src="/rsum-logo.png" />

        {/* Header with Logo - same as InvoicePDF */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.logo} src="/rsum-logo.png" />

            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>RUMAH SAKIT UNIPDU MEDIKA</Text>
              <Text style={styles.hospitalAddress}>
                Jl. Raya Peterongan-Jogoroto KM. 0,5 (Tambar) Jombang.
              </Text>
              <Text style={styles.hospitalAddress}>
                No Telp. 081235477781 | Email: rs.unipdu.medika@gmail.com
              </Text>
            </View>
          </View>

          <View style={styles.invoiceTitleContainer}>
            <Text style={styles.invoiceTitle}>Lembar Resep Obat {patient.nama}</Text>
          </View>
        </View>

        {/* Patient and Visit Information - same layout as invoice */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Informasi Pasien</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>No. RM:</Text>
              <Text style={styles.infoValue}>{patient.noRM}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nama:</Text>
              <Text style={styles.infoValue}>{patient.nama}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal Lahir & Umur:</Text>
              <Text style={styles.infoValue}>
                {patient.tanggalLahir ? formatDate(patient.tanggalLahir) : '-'}
                {patient.umur ? ` (${patient.umur} tahun)` : ''}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Penanggung Jawab:</Text>
              <Text style={styles.infoValue}>{patient.namaPenanggungJawab || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Informasi Kunjungan</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal:</Text>
              <Text style={styles.infoValue}>{formatDate(visit.tanggalKunjungan)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jenis:</Text>
              <Text style={styles.infoValue}>{visit.jenis}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dokter:</Text>
              <Text style={styles.infoValue}>{visit.dokter}</Text>
            </View>
          </View>
        </View>

        {/* Prescription Table */}
        <View style={styles.table}>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
            Daftar Resep
          </Text>

          {visit.prescriptions.length === 0 ? (
            <Text>Tidak ada resep.</Text>
          ) : (
            <>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.colNo}>No.</Text>
                <Text style={styles.colDrug}>Nama Obat</Text>
                <Text style={styles.colQty}>Qty</Text>
                <Text style={styles.colRules}>Aturan Pakai</Text>
              </View>

              {visit.prescriptions.map((p, index) => (
                <View key={p.id || index} style={styles.tableRow}>
                  <Text style={styles.colNo}>{index + 1}</Text>
                  <View style={styles.colDrug}>
                    <Text>{p.namaObat}</Text>
                  </View>
                  <Text style={styles.colQty}>{p.qty}</Text>
                  <View style={styles.colRules}>
                    <Text>{p.aturanPakai || '-'}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Precaution box for patient */}
        <View style={styles.precautionBox}>
          <Text style={styles.precautionTitle}>⚠ Petunjuk untuk Pasien</Text>
          <Text style={styles.precautionItem}>
            • Konsumsi obat sesuai dengan aturan pakai yang tertera.
          </Text>
          <Text style={styles.precautionItem}>
            • Jika ada efek samping, segera hubungi dokter atau datang ke IGD.
          </Text>
          <Text style={styles.precautionItem}>
            • Simpan obat di tempat yang sejuk dan kering.
          </Text>
          <Text style={styles.precautionItem}>
            • Jauhkan dari jangkauan anak-anak.
          </Text>
        </View>

        {/* Footer note - reuse same message for consistency */}
        <View style={styles.footer}>
          <Text>-- TERIMAKASIH DAN SEMOGA SEHAT SELALU --</Text>
        </View>
      </Page>
    </Document>
  );
};


