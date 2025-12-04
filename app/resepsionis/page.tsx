/**
 * ═══════════════════════════════════════════════════════════════
 * RESEPSIONIS DASHBOARD (Redirect to patients list)
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ResepsionisPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/resepsionis/patients');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

