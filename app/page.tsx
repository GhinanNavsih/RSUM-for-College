'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Home() {
  const { appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!appUser) {
        router.push('/login');
      } else {
        // Redirect based on role
        switch (appUser.role) {
          case 'admin':
            router.push('/patients');
            break;
          case 'igd':
            router.push('/igd');
            break;
          case 'kasir':
            router.push('/kasir');
            break;
          case 'farmasi':
            router.push('/farmasi');
            break;
          default:
            router.push('/patients');
        }
      }
    }
  }, [appUser, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

