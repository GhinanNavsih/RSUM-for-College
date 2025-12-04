/**
 * ═══════════════════════════════════════════════════════════════
 * FIREBASE STORAGE HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════
 * Handles file uploads to Firebase Storage
 * ═══════════════════════════════════════════════════════════════
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'purchase-receipts/abc123/nota.pdf')
 * @returns The download URL of the uploaded file
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ File uploaded successfully:', path);
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload a purchase receipt/invoice to Firebase Storage
 * @param file - The invoice file (PDF, JPG, PNG)
 * @param purchaseId - A unique identifier for the purchase
 * @returns The download URL of the uploaded file
 */
export const uploadPurchaseInvoice = async (
  file: File,
  purchaseId: string
): Promise<string> => {
  // Sanitize filename
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `purchase-receipts/${purchaseId}/${sanitizedName}`;
  return uploadFile(file, path);
};

/**
 * Delete a file from Firebase Storage
 * @param url - The download URL or storage path of the file
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // If it's a full URL, extract the path
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    console.log('✅ File deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};

/**
 * Generate a unique ID for file uploads
 */
export const generateUploadId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

