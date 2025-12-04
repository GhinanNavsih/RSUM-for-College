// Firestore helper functions for CRUD operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  DocumentData,
  QueryConstraint,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Patient, Visit, AppUser, Drug, Doctor, RoomPrice, ServicePrice, BillingCategory, AmbulanceConfig } from '@/types/models';

// ============================================
// PATIENT OPERATIONS
// ============================================

/**
 * Generate a unique MRN (Medical Record Number) in format: RM-YYYY-NNNN
 * e.g., RM-2024-0001, RM-2024-0002, etc.
 */
export const generateMRN = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `RM-${currentYear}-`;
  
  try {
    // Get all patients with MRN starting with current year prefix
    const allPatients = await getAllPatients();
    const currentYearPatients = allPatients.filter(p => 
      p.noRM && p.noRM.startsWith(prefix)
    );
    
    // Find the highest number
    let maxNumber = 0;
    currentYearPatients.forEach(p => {
      if (p.noRM) {
        const numberPart = p.noRM.replace(prefix, '');
        const num = parseInt(numberPart, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    // Generate next number
    const nextNumber = maxNumber + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    
    return `${prefix}${paddedNumber}`;
  } catch (error) {
    console.error('Error generating MRN:', error);
    // Fallback to timestamp-based
    return `RM-${currentYear}-${Date.now().toString().slice(-4)}`;
  }
};

export const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'patients'), {
    ...patientData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getPatient = async (id: string): Promise<Patient | null> => {
  try {
    console.log('Fetching patient with ID:', id);
    const docRef = doc(db, 'patients', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Patient document found:', data);
      return { id: docSnap.id, ...data } as Patient;
    } else {
      console.log('Patient document does not exist');
      return null;
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
};

export const getAllPatients = async (): Promise<Patient[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'patients'), orderBy('createdAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
};

export const updatePatient = async (id: string, data: Partial<Patient>) => {
  const docRef = doc(db, 'patients', id);
  
  // Deep clean to remove all undefined values
  const cleanData = removeUndefinedValues(data);
  
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
};

export const searchPatients = async (searchTerm: string): Promise<Patient[]> => {
  const patients = await getAllPatients();
  const term = searchTerm.toLowerCase();
  return patients.filter(patient => 
    (patient.nama && patient.nama.toLowerCase().includes(term)) ||
    (patient.noRM && patient.noRM.toLowerCase().includes(term)) ||
    (patient.nik && patient.nik.includes(term)) ||
    (patient.noTelp && patient.noTelp.includes(term)) ||
    (patient.tempFullName && patient.tempFullName.toLowerCase().includes(term)) ||
    (patient.fullName && patient.fullName.toLowerCase().includes(term))
  );
};

// Get patients with temporary registration status
export const getTemporaryPatients = async (): Promise<Patient[]> => {
  try {
    const q = query(
      collection(db, 'patients'),
      where('registrationStatus', '==', 'TEMPORARY'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
  } catch (error: any) {
    // If index error, fall back to client-side filtering
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found for temporary patients, using client-side filtering');
      const allPatients = await getAllPatients();
      return allPatients
        .filter(patient => patient.registrationStatus === 'TEMPORARY')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    throw error;
  }
};

// Get temporary patients created today
export const getTodayTemporaryPatients = async (): Promise<Patient[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const allTemporary = await getTemporaryPatients();
    return allTemporary.filter(patient => patient.createdAt >= todayISO);
  } catch (error) {
    console.error('Error fetching today temporary patients:', error);
    throw error;
  }
};

// ============================================
// VISIT OPERATIONS
// ============================================

export const createVisit = async (visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'visits'), {
    ...visitData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getVisit = async (id: string): Promise<Visit | null> => {
  const docRef = doc(db, 'visits', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Visit;
  }
  return null;
};

// Helper function to recursively remove undefined values from objects and arrays
const removeUndefinedValues = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    });
    return cleaned;
  }
  
  return obj;
};

export const updateVisit = async (id: string, data: Partial<Visit>) => {
  const docRef = doc(db, 'visits', id);
  
  // Deep clean to remove all undefined values (including nested objects/arrays)
  const cleanData = removeUndefinedValues(data);
  
  // Debug: log what's being saved
  console.log('📝 updateVisit - Input data:', JSON.stringify(data, null, 2));
  console.log('🧹 updateVisit - Cleaned data:', JSON.stringify(cleanData, null, 2));
  
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
  
  console.log('✅ updateVisit - Successfully updated visit:', id);
};

export const getVisitsByPatient = async (patientId: string): Promise<Visit[]> => {
  try {
    const q = query(
      collection(db, 'visits'),
      where('patientId', '==', patientId),
      orderBy('tanggalKunjungan', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
  } catch (error: any) {
    // If index error, fall back to fetching all and filtering client-side
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found, using client-side filtering');
      const q = query(
        collection(db, 'visits'),
        where('patientId', '==', patientId)
      );
      const querySnapshot = await getDocs(q);
      const visits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
      // Sort client-side
      return visits.sort((a, b) => 
        new Date(b.tanggalKunjungan).getTime() - new Date(a.tanggalKunjungan).getTime()
      );
    }
    throw error;
  }
};

export const getVisitsByStatus = async (status: string): Promise<Visit[]> => {
  try {
    const q = query(
      collection(db, 'visits'),
      where('status', '==', status),
      orderBy('tanggalKunjungan', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
  } catch (error: any) {
    // If index error, fall back to client-side sorting
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found, using client-side filtering');
      const q = query(
        collection(db, 'visits'),
        where('status', '==', status)
      );
      const querySnapshot = await getDocs(q);
      const visits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
      return visits.sort((a, b) => 
        new Date(b.tanggalKunjungan).getTime() - new Date(a.tanggalKunjungan).getTime()
      );
    }
    throw error;
  }
};

export const getUnpaidVisits = async (): Promise<Visit[]> => {
  try {
    const q = query(
      collection(db, 'visits'),
      where('paymentStatus', '==', 'unpaid'),
      where('status', '==', 'igd_done'),
      orderBy('tanggalKunjungan', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
  } catch (error: any) {
    // If index error, fall back to client-side filtering and sorting
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found, using client-side filtering');
      const q = query(
        collection(db, 'visits'),
        where('paymentStatus', '==', 'unpaid'),
        where('status', '==', 'igd_done')
      );
      const querySnapshot = await getDocs(q);
      const visits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
      return visits.sort((a, b) => 
        new Date(b.tanggalKunjungan).getTime() - new Date(a.tanggalKunjungan).getTime()
      );
    }
    throw error;
  }
};

export const getPendingDispensation = async (): Promise<Visit[]> => {
  try {
    const q = query(
      collection(db, 'visits'),
      where('dispensationStatus', '==', 'pending'),
      where('status', '==', 'igd_done'),
      orderBy('tanggalKunjungan', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
  } catch (error: any) {
    // If index error, fall back to client-side filtering and sorting
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found, using client-side filtering');
      const q = query(
        collection(db, 'visits'),
        where('dispensationStatus', '==', 'pending'),
        where('status', '==', 'igd_done')
      );
      const querySnapshot = await getDocs(q);
      const visits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visit));
      return visits.sort((a, b) => 
        new Date(b.tanggalKunjungan).getTime() - new Date(a.tanggalKunjungan).getTime()
      );
    }
    throw error;
  }
};

// ============================================
// USER OPERATIONS
// ============================================

export const createUser = async (userData: Omit<AppUser, 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'users', userData.id), {
    ...userData,
    createdAt: now,
    updatedAt: now,
  });
};

export const getUser = async (id: string): Promise<AppUser | null> => {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as AppUser;
  }
  return null;
};

export const getAllUsers = async (): Promise<AppUser[]> => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
};

export const updateUserRole = async (userId: string, role: string) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    role,
    updatedAt: new Date().toISOString(),
  });
};

export const setUserData = async (userId: string, userData: Partial<AppUser>) => {
  const docRef = doc(db, 'users', userId);
  const now = new Date().toISOString();
  
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    // Create new user document - use setDoc for new documents
    const { setDoc } = await import('firebase/firestore');
    await setDoc(docRef, {
      ...userData,
      id: userId,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    // Update existing user
    await updateDoc(docRef, {
      ...userData,
      updatedAt: now,
    });
  }
};

// ============================================
// DRUG OPERATIONS
// ============================================

export const createDrug = async (drugData: Omit<Drug, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'drugs'), {
    ...drugData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getDrug = async (id: string): Promise<Drug | null> => {
  try {
    const docRef = doc(db, 'drugs', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data } as Drug;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching drug:', error);
    throw error;
  }
};

export const getAllDrugs = async (): Promise<Drug[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'drugs'), orderBy('drugName', 'asc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Drug));
};

export const getActiveDrugs = async (): Promise<Drug[]> => {
  try {
    const q = query(
      collection(db, 'drugs'),
      where('isActive', '==', true),
      orderBy('drugName', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Drug));
  } catch (error: any) {
    // If index error, fall back to client-side filtering and sorting
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found for active drugs, using client-side filtering');
      const allDrugs = await getAllDrugs();
      return allDrugs.filter(drug => drug.isActive);
    }
    console.error('Error fetching active drugs:', error);
    throw error;
  }
};

export const updateDrug = async (id: string, data: Partial<Drug>) => {
  const docRef = doc(db, 'drugs', id);
  
  // Deep clean to remove all undefined values
  const cleanData = removeUndefinedValues(data);
  
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteDrug = async (id: string) => {
  const docRef = doc(db, 'drugs', id);
  await deleteDoc(docRef);
};

export const searchDrugs = async (searchTerm: string): Promise<Drug[]> => {
  const drugs = await getAllDrugs();
  const term = searchTerm.toLowerCase();
  return drugs.filter(drug => 
    drug.drugName.toLowerCase().includes(term) ||
    drug.drugId.toLowerCase().includes(term)
  );
};

export const updateDrugStock = async (id: string, quantity: number, operation: 'add' | 'subtract') => {
  const drug = await getDrug(id);
  if (!drug) throw new Error('Drug not found');
  
  const newStock = operation === 'add' 
    ? drug.stockQty + quantity 
    : drug.stockQty - quantity;
    
  if (newStock < 0) throw new Error('Stock cannot be negative');
  
  await updateDrug(id, { stockQty: newStock });
};

// ============================================
// DOCTOR OPERATIONS
// ============================================

export const createDoctor = async (doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'doctors'), {
    ...doctorData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getDoctor = async (id: string): Promise<Doctor | null> => {
  try {
    const docRef = doc(db, 'doctors', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data } as Doctor;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
};

export const getAllDoctors = async (): Promise<Doctor[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'doctors'), orderBy('fullName', 'asc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
};

export const getActiveDoctors = async (): Promise<Doctor[]> => {
  try {
    const q = query(
      collection(db, 'doctors'),
      where('isActive', '==', true),
      orderBy('fullName', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
  } catch (error: any) {
    // If index error, fall back to client-side filtering
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found for active doctors, using client-side filtering');
      const allDoctors = await getAllDoctors();
      return allDoctors.filter(doctor => doctor.isActive);
    }
    console.error('Error fetching active doctors:', error);
    throw error;
  }
};

export const updateDoctor = async (id: string, data: Partial<Doctor>) => {
  const docRef = doc(db, 'doctors', id);
  
  // Deep clean to remove all undefined values
  const cleanData = removeUndefinedValues(data);
  
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteDoctor = async (id: string) => {
  const docRef = doc(db, 'doctors', id);
  await deleteDoc(docRef);
};

export const searchDoctors = async (searchTerm: string): Promise<Doctor[]> => {
  const doctors = await getAllDoctors();
  const term = searchTerm.toLowerCase();
  return doctors.filter(doctor => 
    doctor.fullName.toLowerCase().includes(term) ||
    (doctor.shortName && doctor.shortName.toLowerCase().includes(term)) ||
    (doctor.specialization && doctor.specialization.toLowerCase().includes(term))
  );
};

// ============================================
// SERVICE PRICING OPERATIONS (UNIFIED FOR ALL CATEGORIES)
// ============================================

export const createServicePrice = async (serviceData: Omit<ServicePrice, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'servicePrices'), {
    ...serviceData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getServicePrice = async (id: string): Promise<ServicePrice | null> => {
  const docRef = doc(db, 'servicePrices', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ServicePrice;
  }
  return null;
};

export const getAllServicePrices = async (): Promise<ServicePrice[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'servicePrices'), orderBy('serviceName', 'asc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServicePrice));
};

export const getServicePricesByCategory = async (category: BillingCategory): Promise<ServicePrice[]> => {
  try {
    const q = query(
      collection(db, 'servicePrices'),
      where('category', '==', category),
      orderBy('serviceName', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServicePrice));
  } catch (error: any) {
    // If index error, fall back to client-side filtering
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found, using client-side filtering');
      const allServices = await getAllServicePrices();
      return allServices.filter(service => service.category === category);
    }
    console.error('Error fetching service prices by category:', error);
    throw error;
  }
};

export const getActiveServicePricesByCategory = async (category: BillingCategory): Promise<ServicePrice[]> => {
  try {
    console.log(`🔍 Firestore query: servicePrices where category=${category} AND isActive=true`);
    const q = query(
      collection(db, 'servicePrices'),
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('serviceName', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServicePrice));
    console.log(`✅ Found ${results.length} active services for category ${category}`);
    return results;
  } catch (error: any) {
    // If index error, fall back to client-side filtering
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('⚠️ Firestore index not found, using client-side filtering');
      const allServices = await getAllServicePrices();
      const filtered = allServices.filter(service => service.category === category && service.isActive);
      console.log(`✅ Client-side filter found ${filtered.length} services for category ${category}`);
      return filtered;
    }
    console.error('❌ Error fetching active service prices:', error);
    throw error;
  }
};

export const updateServicePrice = async (id: string, data: Partial<ServicePrice>) => {
  const docRef = doc(db, 'servicePrices', id);
  
  // Deep clean to remove all undefined values
  const cleanData = removeUndefinedValues(data);
  
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteServicePrice = async (id: string) => {
  const docRef = doc(db, 'servicePrices', id);
  await deleteDoc(docRef);
};

export const searchServicePrices = async (searchTerm: string, category?: BillingCategory): Promise<ServicePrice[]> => {
  let services = await getAllServicePrices();
  
  if (category) {
    services = services.filter(s => s.category === category);
  }
  
  const term = searchTerm.toLowerCase();
  return services.filter(service => 
    service.serviceName.toLowerCase().includes(term) ||
    (service.code && service.code.toLowerCase().includes(term)) ||
    (service.description && service.description.toLowerCase().includes(term))
  );
};

// ============================================
// SERVICE PRICE OPERATIONS (Subcategory Support)
// ============================================

/**
 * Get service prices by category and subcategory
 * For PERAWATAN_KAMAR: supports TARIF_KAMAR, BIAYA_PERAWATAN, PERINATOLOGI
 */
export const getServicePricesByCategoryAndSubcategory = async (
  category: BillingCategory,
  subCategory?: string
): Promise<ServicePrice[]> => {
  try {
    let services = await getServicePricesByCategory(category);
    
    if (subCategory) {
      services = services.filter(s => (s.subCategory || 'TARIF_KAMAR') === subCategory);
    }
    
    return services;
  } catch (error) {
    console.error('Error fetching service prices by subcategory:', error);
    throw error;
  }
};

/**
 * Get active service prices by category and subcategory
 */
export const getActiveServicePricesByCategoryAndSubcategory = async (
  category: BillingCategory,
  subCategory?: string
): Promise<ServicePrice[]> => {
  try {
    let services = await getActiveServicePricesByCategory(category);
    
    if (subCategory) {
      services = services.filter(s => (s.subCategory || 'TARIF_KAMAR') === subCategory);
    }
    
    return services;
  } catch (error) {
    console.error('Error fetching active service prices by subcategory:', error);
    throw error;
  }
};

/**
 * Get service prices by room class
 * Used for matrix display in PERAWATAN_KAMAR subcategories
 */
export const getServicePricesByRoomClass = async (
  subCategory: string,
  roomClass: string
): Promise<ServicePrice[]> => {
  try {
    const services = await getAllServicePrices();
    return services.filter(
      s => s.category === 'PERAWATAN_KAMAR' &&
           (s.subCategory || 'TARIF_KAMAR') === subCategory &&
           s.roomClass === roomClass
    );
  } catch (error) {
    console.error('Error fetching service prices by room class:', error);
    throw error;
  }
};

// ============================================
// LEGACY ROOM PRICING OPERATIONS (For backward compatibility)
// ============================================

export const createRoomPrice = async (roomData: Omit<RoomPrice, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'roomPrices'), {
    ...roomData,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const getAllRoomPrices = async (): Promise<RoomPrice[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'roomPrices'), orderBy('roomType', 'asc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomPrice));
};

export const getActiveRoomPrices = async (): Promise<RoomPrice[]> => {
  try {
    const q = query(
      collection(db, 'roomPrices'),
      where('isActive', '==', true),
      orderBy('roomType', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomPrice));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found for active room prices, using client-side filtering');
      const allRooms = await getAllRoomPrices();
      return allRooms.filter(room => room.isActive);
    }
    console.error('Error fetching active room prices:', error);
    throw error;
  }
};

// ============================================
// AMBULANCE CONFIGURATION OPERATIONS
// ============================================

export const createAmbulanceConfig = async (configData: Omit<AmbulanceConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  // Use vehicleType as document ID for easy lookup
  const docRef = doc(db, 'ambulanceConfigs', configData.vehicleType);
  await updateDoc(docRef, {
    ...configData,
    createdAt: now,
    updatedAt: now,
  }).catch(async () => {
    // If document doesn't exist, create it
    await addDoc(collection(db, 'ambulanceConfigs'), {
      ...configData,
      createdAt: now,
      updatedAt: now,
    });
  });
  return configData.vehicleType;
};

export const getAllAmbulanceConfigs = async (): Promise<AmbulanceConfig[]> => {
  const querySnapshot = await getDocs(
    query(collection(db, 'ambulanceConfigs'), orderBy('vehicleType', 'asc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AmbulanceConfig));
};

export const getActiveAmbulanceConfigs = async (): Promise<AmbulanceConfig[]> => {
  try {
    const q = query(
      collection(db, 'ambulanceConfigs'),
      where('isActive', '==', true),
      orderBy('vehicleType', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AmbulanceConfig));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found for active ambulance configs, using client-side filtering');
      const allConfigs = await getAllAmbulanceConfigs();
      return allConfigs.filter(config => config.isActive);
    }
    console.error('Error fetching active ambulance configs:', error);
    throw error;
  }
};

export const getAmbulanceConfig = async (vehicleType: string): Promise<AmbulanceConfig | null> => {
  try {
    const docRef = doc(db, 'ambulanceConfigs', vehicleType);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AmbulanceConfig;
    }
    return null;
  } catch (error) {
    console.error('Error fetching ambulance config:', error);
    throw error;
  }
};

export const updateAmbulanceConfig = async (
  vehicleType: string,
  configData: Partial<Omit<AmbulanceConfig, 'id' | 'createdAt' | 'updatedAt'>>
) => {
  const docRef = doc(db, 'ambulanceConfigs', vehicleType);
  const cleanedData = removeUndefinedValues(configData);
  await updateDoc(docRef, {
    ...cleanedData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteAmbulanceConfig = async (vehicleType: string) => {
  const docRef = doc(db, 'ambulanceConfigs', vehicleType);
  await deleteDoc(docRef);
};

// ============================================
// LAB ORDER FUNCTIONS
// ============================================

import type { LabOrder } from '@/types/models';

/**
 * Get a lab order by visit ID
 * Since each visit has at most one lab order, visitId is used as the document ID
 */
export const getLabOrderByVisitId = async (visitId: string): Promise<LabOrder | null> => {
  try {
    const docRef = doc(db, 'labOrders', visitId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LabOrder;
    }
    return null;
  } catch (error) {
    console.error('Error fetching lab order:', error);
    throw error;
  }
};

/**
 * Create or update a lab order
 * Uses setDoc with merge: true so it creates if not exists, or updates if exists
 */
export const upsertLabOrder = async (order: LabOrder): Promise<void> => {
  try {
    const docRef = doc(db, 'labOrders', order.visitId);
    const cleanedOrder = removeUndefinedValues(order);
    
    await setDoc(docRef, {
      ...cleanedOrder,
      id: order.visitId, // Ensure ID matches visitId
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    console.log('✅ Lab order saved successfully for visit:', order.visitId);
  } catch (error) {
    console.error('❌ Error saving lab order:', error);
    throw error;
  }
};

/**
 * Get all lab orders (for lab queue/list page if needed later)
 */
export const getAllLabOrders = async (): Promise<LabOrder[]> => {
  try {
    const q = query(
      collection(db, 'labOrders'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabOrder));
  } catch (error) {
    console.error('Error fetching all lab orders:', error);
    throw error;
  }
};

/**
 * Get lab orders by status
 */
export const getLabOrdersByStatus = async (status: 'REQUESTED' | 'COMPLETED'): Promise<LabOrder[]> => {
  try {
    const q = query(
      collection(db, 'labOrders'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabOrder));
  } catch (error: any) {
    // Fallback to client-side filtering if index doesn't exist
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found, using client-side filtering');
      const allOrders = await getAllLabOrders();
      return allOrders.filter(order => order.status === status);
    }
    console.error('Error fetching lab orders by status:', error);
    throw error;
  }
};

/**
 * Delete a lab order (if needed)
 */
export const deleteLabOrder = async (visitId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'labOrders', visitId);
    await deleteDoc(docRef);
    console.log('✅ Lab order deleted for visit:', visitId);
  } catch (error) {
    console.error('❌ Error deleting lab order:', error);
    throw error;
  }
};

// ============================================
// RADIOLOGY ORDER FUNCTIONS
// ============================================

import type { RadiologyOrder } from '@/types/models';

/**
 * Get a radiology order by visit ID
 * Since each visit has at most one radiology order, visitId is used as the document ID
 */
export const getRadiologyOrderByVisitId = async (visitId: string): Promise<RadiologyOrder | null> => {
  try {
    const docRef = doc(db, 'radiologyOrders', visitId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as RadiologyOrder;
    }
    return null;
  } catch (error) {
    console.error('Error fetching radiology order:', error);
    throw error;
  }
};

/**
 * Create or update a radiology order
 * Uses setDoc with merge: true so it creates if not exists, or updates if exists
 */
export const upsertRadiologyOrder = async (order: RadiologyOrder): Promise<void> => {
  try {
    const docRef = doc(db, 'radiologyOrders', order.visitId);
    const cleanedOrder = removeUndefinedValues(order);
    
    await setDoc(docRef, {
      ...cleanedOrder,
      id: order.visitId, // Ensure ID matches visitId
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    console.log('✅ Radiology order saved successfully for visit:', order.visitId);
  } catch (error) {
    console.error('❌ Error saving radiology order:', error);
    throw error;
  }
};

/**
 * Get all radiology orders (for radiology queue/list page if needed later)
 */
export const getAllRadiologyOrders = async (): Promise<RadiologyOrder[]> => {
  try {
    const q = query(
      collection(db, 'radiologyOrders'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RadiologyOrder));
  } catch (error) {
    console.error('Error fetching all radiology orders:', error);
    throw error;
  }
};

/**
 * Get radiology orders by status
 */
export const getRadiologyOrdersByStatus = async (status: 'REQUESTED' | 'COMPLETED'): Promise<RadiologyOrder[]> => {
  try {
    const q = query(
      collection(db, 'radiologyOrders'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RadiologyOrder));
  } catch (error: any) {
    // Fallback to client-side filtering if index doesn't exist
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found, using client-side filtering');
      const allOrders = await getAllRadiologyOrders();
      return allOrders.filter(order => order.status === status);
    }
    console.error('Error fetching radiology orders by status:', error);
    throw error;
  }
};

/**
 * Delete a radiology order (if needed)
 */
export const deleteRadiologyOrder = async (visitId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'radiologyOrders', visitId);
    await deleteDoc(docRef);
    console.log('✅ Radiology order deleted for visit:', visitId);
  } catch (error) {
    console.error('❌ Error deleting radiology order:', error);
    throw error;
  }
};

// ============================================
// DRUG PURCHASE FUNCTIONS
// ============================================

import type { DrugPurchase, DrugPurchaseItem } from '@/types/models';
import { runTransaction, increment } from 'firebase/firestore';

/**
 * Create a new drug purchase and update stock for all items
 * Uses a transaction to ensure atomicity
 */
export const createDrugPurchase = async (
  purchase: Omit<DrugPurchase, 'id'>
): Promise<string> => {
  try {
    // First, create the purchase document
    const purchaseRef = await addDoc(collection(db, 'drugPurchases'), {
      ...purchase,
      createdAt: new Date().toISOString(),
    });
    
    console.log('✅ Drug purchase created:', purchaseRef.id);
    
    // Then, update stock for each item using transactions
    for (const item of purchase.items) {
      await runTransaction(db, async (transaction) => {
        const drugRef = doc(db, 'drugs', item.drugId);
        const drugSnap = await transaction.get(drugRef);
        
        if (!drugSnap.exists()) {
          console.warn(`⚠️ Drug not found: ${item.drugId}, skipping stock update`);
          return;
        }
        
        const currentStock = drugSnap.data().stockQty || 0;
        const newStock = currentStock + item.quantity;
        
        transaction.update(drugRef, {
          stockQty: newStock,
          updatedAt: new Date().toISOString(),
        });
        
        console.log(`📦 Updated stock for ${item.drugName}: ${currentStock} → ${newStock}`);
      });
    }
    
    return purchaseRef.id;
  } catch (error) {
    console.error('❌ Error creating drug purchase:', error);
    throw error;
  }
};

/**
 * Calculate average purchase price (Harga Kulak) for all drugs
 * Returns a map of drugId -> average unit price from all purchases
 */
export const getAveragePurchasePrices = async (): Promise<Record<string, number>> => {
  try {
    const purchases = await getAllDrugPurchases();
    
    // Aggregate prices by drugId
    const priceData: Record<string, { totalPrice: number; totalQty: number }> = {};
    
    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        if (!priceData[item.drugId]) {
          priceData[item.drugId] = { totalPrice: 0, totalQty: 0 };
        }
        // Weighted average: sum(price * qty) / sum(qty)
        priceData[item.drugId].totalPrice += item.unitPrice * item.quantity;
        priceData[item.drugId].totalQty += item.quantity;
      });
    });
    
    // Calculate weighted average for each drug
    const averages: Record<string, number> = {};
    Object.entries(priceData).forEach(([drugId, data]) => {
      if (data.totalQty > 0) {
        averages[drugId] = Math.round(data.totalPrice / data.totalQty);
      }
    });
    
    console.log('📊 Calculated average purchase prices for', Object.keys(averages).length, 'drugs');
    return averages;
  } catch (error) {
    console.error('Error calculating average purchase prices:', error);
    return {};
  }
};

/**
 * Get all drug purchases, ordered by purchase date (newest first)
 */
export const getAllDrugPurchases = async (): Promise<DrugPurchase[]> => {
  try {
    const q = query(
      collection(db, 'drugPurchases'),
      orderBy('purchaseDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DrugPurchase));
  } catch (error: any) {
    // Fallback without ordering if index doesn't exist
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn('Firestore index not found for drugPurchases, fetching without order');
      const querySnapshot = await getDocs(collection(db, 'drugPurchases'));
      const purchases = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DrugPurchase));
      return purchases.sort((a, b) => 
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
      );
    }
    console.error('Error fetching drug purchases:', error);
    throw error;
  }
};

/**
 * Get a single drug purchase by ID
 */
export const getDrugPurchase = async (id: string): Promise<DrugPurchase | null> => {
  try {
    const docRef = doc(db, 'drugPurchases', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DrugPurchase;
    }
    return null;
  } catch (error) {
    console.error('Error fetching drug purchase:', error);
    throw error;
  }
};

/**
 * Delete a drug purchase (does NOT reverse stock changes)
 */
export const deleteDrugPurchase = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'drugPurchases', id);
    await deleteDoc(docRef);
    console.log('✅ Drug purchase deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting drug purchase:', error);
    throw error;
  }
};

