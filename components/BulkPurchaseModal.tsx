/**
 * ═══════════════════════════════════════════════════════════════
 * BULK PURCHASE MODAL COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * Modal for inputting bulk drug purchases (Pembelian Obat)
 * Features:
 * - Supplier info header
 * - Invoice file upload to Firebase Storage
 * - Multi-row drug item entry with autocomplete
 * - Auto-calculated subtotals and total
 * - Stock auto-update on save
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Drug, DrugPurchase, DrugPurchaseItem } from '@/types/models';
import { getAllDrugs, createDrugPurchase } from '@/lib/firestore';
import { uploadPurchaseInvoice, generateUploadId } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';

interface BulkPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
}

interface PurchaseItemRow {
  id: string;               // Temporary row ID for React key
  drugId: string;           // Firestore doc id
  drugCode: string;         // Custom drug ID (e.g., "DRG-001")
  drugName: string;
  quantity: number | string;
  unit: string;
  unitPrice: number | string;
  subtotal: number;
}

export const BulkPurchaseModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
}: BulkPurchaseModalProps) => {
  // Header state
  const [supplierName, setSupplierName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState('');

  // Items state - start with 4 empty rows
  const [items, setItems] = useState<PurchaseItemRow[]>([]);

  // Drug autocomplete state
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loadingDrugs, setLoadingDrugs] = useState(false);
  const [searchResults, setSearchResults] = useState<Record<string, Drug[]>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Form state
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load drugs on mount
  useEffect(() => {
    if (isOpen) {
      loadDrugs();
      // Reset form when opening
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Initialize search results for new rows when drugs are loaded
  // Only initialize rows that don't have search results yet (to not overwrite filtered results)
  useEffect(() => {
    if (drugs.length > 0 && items.length > 0) {
      setSearchResults(prev => {
        const updated = { ...prev };
        let hasNewRows = false;
        
        items.forEach(item => {
          // Only initialize if this row doesn't have search results yet
          if (!updated[item.id]) {
            updated[item.id] = drugs;
            hasNewRows = true;
            console.log('📦 Initialized search results for row:', item.id);
          }
        });
        
        // Only update state if we actually added new rows
        return hasNewRows ? updated : prev;
      });
    }
  }, [drugs, items]); // Include items in dependencies to catch new rows

  const loadDrugs = async () => {
    setLoadingDrugs(true);
    try {
      const data = await getAllDrugs();
      // Only show active drugs in the dropdown
      const activeDrugs = data.filter(d => d.isActive);
      console.log('📦 Loaded drugs for autocomplete:', activeDrugs.length, 'active drugs');
      console.log('📦 Drug names:', activeDrugs.map(d => d.drugName));
      setDrugs(activeDrugs);
      // Note: searchResults will be initialized by the useEffect that watches [drugs, items]
    } catch (error) {
      console.error('❌ Error loading drugs:', error);
    } finally {
      setLoadingDrugs(false);
    }
  };

  const resetForm = () => {
    setSupplierName('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setInvoiceFile(null);
    setInvoiceUrl('');
    setNotes('');
    // Create 4 empty rows by default
    setItems([
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
    ]);
    setErrors([]);
    setSearchResults({});
    setActiveDropdown(null);
  };

  function createEmptyRow(): PurchaseItemRow {
    return {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      drugId: '',
      drugCode: '',
      drugName: '',
      quantity: '',
      unit: '',
      unitPrice: '',
      subtotal: 0,
    };
  }

  // Handle drug search
  const handleDrugSearch = (rowId: string, searchTerm: string) => {
    console.log('🔍 handleDrugSearch called:', { rowId, searchTerm, drugsCount: drugs.length });
    
    // Update the drugName field (only clear drugId if user is typing something different)
    setItems(prev =>
      prev.map(item =>
        item.id === rowId ? { ...item, drugName: searchTerm, drugId: '', drugCode: '' } : item
      )
    );

    // Filter drugs - show all if empty, otherwise filter
    const filtered = searchTerm.trim()
      ? drugs.filter(
          d =>
            d.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.drugId.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : drugs; // Show all drugs when search is empty
    
    console.log('🔍 Filtered results:', filtered.length, 'drugs match');
    
    setSearchResults(prev => ({ ...prev, [rowId]: filtered }));
    setActiveDropdown(rowId);
  };

  // Handle focus on drug input - show all drugs
  const handleDrugFocus = (rowId: string) => {
    console.log('👆 handleDrugFocus called:', { rowId, drugsCount: drugs.length });
    // Always show all drugs when focusing (for initial click)
    setSearchResults(prev => ({ ...prev, [rowId]: drugs }));
    setActiveDropdown(rowId);
  };

  // Handle drug selection from dropdown
  const handleSelectDrug = (rowId: string, drug: Drug) => {
    setItems(prev =>
      prev.map(item =>
        item.id === rowId
          ? {
              ...item,
              drugId: drug.id,
              drugCode: drug.drugId,
              drugName: drug.drugName,
              unit: drug.unit,
              unitPrice: drug.pricePerUnit, // Pre-fill with current price
              subtotal: calculateSubtotal(item.quantity, drug.pricePerUnit),
            }
          : item
      )
    );
    setSearchResults(prev => ({ ...prev, [rowId]: [] }));
    setActiveDropdown(null);
  };

  // Calculate subtotal
  const calculateSubtotal = (
    qty: number | string,
    price: number | string
  ): number => {
    const q = typeof qty === 'string' ? parseFloat(qty) || 0 : qty;
    const p = typeof price === 'string' ? parseFloat(price) || 0 : price;
    return q * p;
  };

  // Update item field
  const updateItem = (
    rowId: string,
    field: keyof PurchaseItemRow,
    value: string | number
  ) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== rowId) return item;

        const updated = { ...item, [field]: value };

        // Recalculate subtotal if quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          updated.subtotal = calculateSubtotal(updated.quantity, updated.unitPrice);
        }

        return updated;
      })
    );
  };

  // Add new row
  const addRow = () => {
    setItems(prev => [...prev, createEmptyRow()]);
  };

  // Remove row
  const removeRow = (rowId: string) => {
    if (items.length === 1) {
      // Don't remove the last row, just clear it
      setItems([createEmptyRow()]);
      return;
    }
    setItems(prev => prev.filter(item => item.id !== rowId));
  };

  // Calculate total
  const calculateTotal = (): number => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan PDF, JPG, atau PNG.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    setInvoiceFile(file);

    // Upload immediately
    setUploading(true);
    try {
      const uploadId = generateUploadId();
      const url = await uploadPurchaseInvoice(file, uploadId);
      setInvoiceUrl(url);
      console.log('✅ Invoice uploaded:', url);
    } catch (error) {
      console.error('Error uploading invoice:', error);
      alert('Gagal mengupload file. Silakan coba lagi.');
      setInvoiceFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Validate form
  const validate = (): string[] => {
    const errs: string[] = [];

    if (!supplierName.trim()) {
      errs.push('Nama Supplier harus diisi');
    }

    if (!purchaseDate) {
      errs.push('Tanggal Pembelian harus diisi');
    }

    // Note: Invoice upload is now optional (can be added later if Firebase Storage is enabled)
    // if (!invoiceUrl) {
    //   errs.push('Nota Supplier harus diupload');
    // }

    const validItems = items.filter(
      item => item.drugId && item.quantity && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      errs.push('Minimal satu obat dengan jumlah > 0 harus diisi');
    }

    // Check for items with selected drug but missing quantity
    items.forEach((item, idx) => {
      if (item.drugId && (!item.quantity || Number(item.quantity) <= 0)) {
        errs.push(`Baris ${idx + 1}: Jumlah harus lebih dari 0`);
      }
    });

    return errs;
  };

  // Handle save
  const handleSave = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setSaving(true);

    try {
      // Build purchase items
      const purchaseItems: DrugPurchaseItem[] = items
        .filter(item => item.drugId && Number(item.quantity) > 0)
        .map(item => ({
          drugId: item.drugId,
          drugCode: item.drugCode,
          drugName: item.drugName,
          quantity: Number(item.quantity),
          unit: item.unit,
          unitPrice: Number(item.unitPrice) || 0,
          subtotal: calculateSubtotal(item.quantity, item.unitPrice),
        }));

      // Build purchase object - only include defined values (Firestore doesn't accept undefined)
      const purchase: Omit<DrugPurchase, 'id'> = {
        supplierName: supplierName.trim(),
        purchaseDate: purchaseDate,
        invoiceUrl: invoiceUrl || '', // Empty string if no file uploaded
        items: purchaseItems,
        totalAmount: calculateTotal(),
        createdAt: new Date().toISOString(),
        createdBy: currentUserId,
      };
      
      // Only add optional fields if they have values
      if (invoiceFile?.name) {
        purchase.invoiceFileName = invoiceFile.name;
      }
      if (notes.trim()) {
        purchase.notes = notes.trim();
      }

      // Save to Firestore and update stock
      await createDrugPurchase(purchase);

      alert('✅ Pembelian berhasil disimpan dan stok telah diperbarui!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Gagal menyimpan pembelian. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              📦 Input Pembelian Obat (Bulk Purchase)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={saving}
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">
                Mohon perbaiki kesalahan berikut:
              </h4>
              <ul className="list-disc list-inside text-red-700 text-sm">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Header Section */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Pembelian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nama Supplier *"
                placeholder="PT. Kimia Farma"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                required
              />

              <Input
                label="Tanggal Pembelian *"
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Nota Supplier (Opsional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-shrink-0"
                  >
                    {uploading ? (
                      <>
                        <LoadingSpinner size="sm" /> Uploading...
                      </>
                    ) : (
                      '📎 Pilih File'
                    )}
                  </Button>
                  {invoiceFile && (
                    <span className="text-sm text-gray-600 truncate">
                      {invoiceFile.name}
                      {invoiceUrl && (
                        <span className="text-green-600 ml-1">✓</span>
                      )}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: PDF, JPG, PNG. Maks 10MB
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Input
                label="Catatan (Opsional)"
                placeholder="Catatan tambahan untuk pembelian ini..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </Card>

          {/* Items Table */}
          <Card className="mb-6 overflow-visible">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Daftar Obat
            </h3>

            {loadingDrugs ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Table - using overflow-visible to allow dropdown to escape */}
                <div className="overflow-visible">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-64">
                          Nama Obat *
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">
                          Jumlah *
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">
                          Satuan
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">
                          Harga Satuan
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">
                          Subtotal
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">
                          
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 overflow-visible">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {/* Drug Name (Autocomplete) */}
                          <td className="px-3 py-2 relative overflow-visible">
                            <input
                              type="text"
                              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                item.drugId ? 'border-green-400 bg-green-50' : 'border-gray-300'
                              }`}
                              placeholder="Klik untuk pilih obat..."
                              value={item.drugName}
                              onChange={e =>
                                handleDrugSearch(item.id, e.target.value)
                              }
                              onFocus={() => handleDrugFocus(item.id)}
                              onBlur={() => {
                                // Delay to allow click on dropdown
                                setTimeout(() => {
                                  if (activeDropdown === item.id) {
                                    setActiveDropdown(null);
                                  }
                                }, 200);
                              }}
                            />
                            {/* Autocomplete Dropdown */}
                            {activeDropdown === item.id && (
                              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {drugs.length === 0 ? (
                                  <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                    <p>⚠️ Belum ada obat di database.</p>
                                    <p className="text-xs mt-1">Tambahkan obat terlebih dahulu di Database Obat.</p>
                                  </div>
                                ) : !searchResults[item.id] || searchResults[item.id].length === 0 ? (
                                  <div className="px-3 py-3 text-center text-gray-500 text-sm">
                                    {item.drugName ? 'Tidak ada obat yang cocok dengan pencarian.' : 'Ketik untuk mencari obat...'}
                                  </div>
                                ) : (
                                  <>
                                    <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 border-b sticky top-0">
                                      📋 {searchResults[item.id].length} obat ditemukan
                                    </div>
                                    {searchResults[item.id].map(drug => (
                                      <div
                                        key={drug.id}
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                        onMouseDown={() =>
                                          handleSelectDrug(item.id, drug)
                                        }
                                      >
                                        <div className="font-medium text-gray-900">
                                          {drug.drugName}
                                        </div>
                                        <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">{drug.drugId}</span>
                                          <span>{drug.unit}</span>
                                          <span className="text-green-600 font-medium">{formatCurrency(drug.pricePerUnit)}</span>
                                          <span className="text-blue-600">Stok: {drug.stockQty}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}
                            {item.drugId && (
                              <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                ✓ {item.drugCode}
                              </span>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="0"
                              value={item.quantity}
                              onChange={e =>
                                updateItem(item.id, 'quantity', e.target.value)
                              }
                            />
                          </td>

                          {/* Unit (Read-only) */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-600"
                              value={item.unit}
                              disabled
                              readOnly
                            />
                          </td>

                          {/* Unit Price */}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="0"
                              value={item.unitPrice}
                              onChange={e =>
                                updateItem(item.id, 'unitPrice', e.target.value)
                              }
                            />
                          </td>

                          {/* Subtotal (Read-only) */}
                          <td className="px-3 py-2">
                            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-700">
                              {formatCurrency(item.subtotal)}
                            </div>
                          </td>

                          {/* Delete Button */}
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Hapus baris"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Row Button */}
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addRow}
                    className="w-full"
                  >
                    + Tambah Obat
                  </Button>
                </div>
              </>
            )}
          </Card>

          {/* Total */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">
                Total Pembelian
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" /> Menyimpan...
              </>
            ) : (
              '💾 Simpan Pembelian'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

