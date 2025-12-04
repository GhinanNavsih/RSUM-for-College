import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Visit, Patient } from '@/types/models';

// Create styles for PDF
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
  tableSectionHeader: {
    flexDirection: 'row',
    padding: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  // Table columns
  colItem: {
    flex: 3,
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colQty: {
    flex: 0.7,
    textAlign: 'center',
  },
  colSubtotal: {
    flex: 1.2,
    textAlign: 'right',
  },
  // Subtotals
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#9ca3af',
  },
  subtotalLabel: {
    width: 120,
    textAlign: 'right',
    fontSize: 9,
    color: '#6b7280',
  },
  subtotalValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  totalLabel: {
    width: 120,
    textAlign: 'right',
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
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
  // Dosage text
  dosageText: {
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

interface InvoicePDFProps {
  visit: Visit;
  patient: Patient;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ visit, patient }) => {
  // Calculate totals
  const servicesTotal = visit.services.reduce(
    (sum, s) => sum + (s.harga * (s.quantity || 1)),
    0
  );
  const prescriptionsTotal = visit.prescriptions.reduce(
    (sum, p) => sum + (p.totalPrice || 0),
    0
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

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
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          style={styles.watermark}
          src="/rsum-logo.png"
        />

        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Left Logo */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              style={styles.logo}
              src="/rsum-logo.png"
            />
            
            {/* Hospital Info */}
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>RUMAH SAKIT UNIPDU MEDIKA</Text>
              <Text style={styles.hospitalAddress}>
                Jl. Raya Peterongan-Jogoroto KM. 0,5 (Tambar) Jombang.
              </Text>
              <Text style={styles.hospitalAddress}>
                No Telp. 081235477781 | Email: rs.unipdu.medika@gmail.com
              </Text>
            </View>

            {/* Right Logo */}
            {/* <Image
              style={styles.logo}
              src="/rsum-logo.png"
            /> */}
          </View>
          
          <View style={styles.invoiceTitleContainer}>
            <Text style={styles.invoiceTitle}>Nota Pembayaran {visit.jenis}</Text>
          </View>
        </View>

        {/* Patient and Visit Information */}
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

        {/* Billing Details Table */}
        <View style={styles.table}>
          <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>
            Rincian Biaya
          </Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Tindakan</Text>
            <Text style={styles.colPrice}>Harga</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>

          {/* Services Section */}
          {visit.services.length > 0 && (
            <>
              <View style={styles.tableSectionHeader}>
                <Text style={styles.colItem}>Tindakan & Layanan</Text>
              </View>
              {visit.services.map((service, index) => (
                <View key={service.id || index} style={styles.tableRow}>
                  <Text style={styles.colItem}>{service.nama}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(service.harga)}</Text>
                  <Text style={styles.colQty}>{service.quantity || 1}</Text>
                  <Text style={styles.colSubtotal}>
                    {formatCurrency(service.harga * (service.quantity || 1))}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Prescriptions Section */}
          {visit.prescriptions.length > 0 && (
            <>
              <View style={styles.tableSectionHeader}>
                <Text style={styles.colItem}>Obat-obatan</Text>
              </View>
              {visit.prescriptions.map((prescription, index) => (
                <View key={prescription.id || index} style={styles.tableRow}>
                  <View style={styles.colItem}>
                    <Text>{prescription.namaObat}</Text>
                    {prescription.aturanPakai && (
                      <Text style={styles.dosageText}>
                        Aturan pakai: {prescription.aturanPakai}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.colPrice}>
                    {prescription.pricePerUnit
                      ? formatCurrency(prescription.pricePerUnit)
                      : '-'}
                  </Text>
                  <Text style={styles.colQty}>{prescription.qty}</Text>
                  <Text style={styles.colSubtotal}>
                    {prescription.totalPrice
                      ? formatCurrency(prescription.totalPrice)
                      : '-'}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Subtotals */}
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Subtotal Tindakan:</Text>
            <Text style={styles.subtotalValue}>{formatCurrency(servicesTotal)}</Text>
          </View>
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Subtotal Obat:</Text>
            <Text style={styles.subtotalValue}>{formatCurrency(prescriptionsTotal)}</Text>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>{formatCurrency(visit.totalBiaya)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>-- TERIMAKASIH DAN SEMOGA SEHAT SELALU --</Text>
        </View>
      </Page>
    </Document>
  );
};
