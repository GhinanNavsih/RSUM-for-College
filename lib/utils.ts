// Utility functions

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to Indonesian locale
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format datetime to Indonesian locale
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format time only (HH:MM)
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Generate a readable visit ID for display
 */
export const generateVisitDisplayId = (visitId: string): string => {
  return `V-${visitId.substring(0, 8).toUpperCase()}`;
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Indonesian phone number
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return cleaned;
  } else {
    return `0${cleaned}`;
  }
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Role display names
 */
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    admin: 'Administrator',
    igd: 'IGD',
    kasir: 'Kasir',
    farmasi: 'Farmasi',
    resepsionis: 'Resepsionis',
    lab: 'Laboratorium',
    radiologi: 'Radiologi',
  };
  return roleNames[role] || role;
};

/**
 * Status display names and colors
 */
export const getStatusBadge = (status: string): { label: string; color: string } => {
  const statusConfig: Record<string, { label: string; color: string }> = {
    igd_in_progress: { label: 'Dalam Proses', color: 'bg-yellow-100 text-yellow-800' },
    igd_done: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
    unpaid: { label: 'Belum Bayar', color: 'bg-red-100 text-red-800' },
    paid: { label: 'Lunas', color: 'bg-green-100 text-green-800' },
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
    done: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  };
  return statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
};

