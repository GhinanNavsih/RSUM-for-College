/**
 * ═══════════════════════════════════════════════════════════════
 * DATABASE RSUM - LANDING PAGE
 * ═══════════════════════════════════════════════════════════════
 * Route: /database
 * Purpose: Central hub for all master data databases
 * Features: Quick access cards to Patients, Prices, Doctors, Drugs
 * Access: All authenticated users (with role-based card visibility)
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function DatabasePage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
  }, [appUser, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!appUser) return null;

  // Define database cards with access control
  const databaseCards = [
    {
      title: 'Database Pasien',
      description: 'Data pasien, rekam medis, dan informasi lengkap',
      icon: '👥',
      href: '/patients',
      color: 'bg-blue-500 hover:bg-blue-600',
      roles: ['admin', 'igd', 'kasir', 'farmasi', 'resepsionis'],
    },
    {
      title: 'Database Harga',
      description: 'Tarif layanan, tindakan, dan billing',
      icon: '💰',
      href: '/prices',
      color: 'bg-green-500 hover:bg-green-600',
      roles: ['admin', 'farmasi'],
    },
    {
      title: 'Database Dokter',
      description: 'Master data dokter dan spesialisasi',
      icon: '⚕️',
      href: '/doctors',
      color: 'bg-purple-500 hover:bg-purple-600',
      roles: ['admin'],
    },
    {
      title: 'Database Obat',
      description: 'Master data obat, stok, dan harga',
      icon: '💊',
      href: '/drugs',
      color: 'bg-red-500 hover:bg-red-600',
      roles: ['admin', 'farmasi'],
    },
  ];

  // Filter cards based on user role
  const visibleCards = databaseCards.filter(card => 
    card.roles.includes(appUser.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Database RSUM</h1>
          <p className="text-gray-600 mt-2">
            Sistem Informasi dan Master Data RS UNIPDU Medika
          </p>
        </div>

        {/* Database Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <div className={`${card.color} rounded-lg shadow-lg p-6 text-white transition-all duration-200 transform hover:scale-105 cursor-pointer h-full`}>
                <div className="flex flex-col items-center text-center h-full justify-between">
                  {/* Icon */}
                  <div className="text-6xl mb-4">
                    {card.icon}
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-2">
                    {card.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-white text-opacity-90 text-sm">
                    {card.description}
                  </p>
                  
                  {/* Arrow indicator */}
                  <div className="mt-4 text-xl">
                    →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Banner */}
        {visibleCards.length < databaseCards.length && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Info:</strong> Anda melihat {visibleCards.length} dari {databaseCards.length} database yang tersedia. 
              Akses ke database lainnya dibatasi berdasarkan role Anda.
            </p>
          </div>
        )}

        {/* Quick Stats (Optional) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-blue-100 p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Master Data</h3>
                <p className="text-2xl font-semibold text-gray-900">Terintegrasi</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Keamanan Data</h3>
                <p className="text-2xl font-semibold text-gray-900">Terjamin</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-purple-100 p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Akses</h3>
                <p className="text-2xl font-semibold text-gray-900">Real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

