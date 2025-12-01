'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './Button';
import { getRoleDisplayName } from '@/lib/utils';

export const Navbar = () => {
  const { appUser, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (!appUser) return null;

  const getNavLinks = () => {
    const links = [
      { href: '/patients', label: 'Pasien', roles: ['admin', 'igd', 'kasir', 'farmasi'] },
    ];

    if (appUser.role === 'admin') {
      links.push(
        { href: '/igd', label: 'IGD', roles: ['admin', 'igd'] },
        { href: '/kasir', label: 'Kasir', roles: ['admin', 'kasir'] },
        { href: '/farmasi', label: 'Farmasi', roles: ['admin', 'farmasi'] },
        { href: '/prices', label: 'Database Harga', roles: ['admin', 'farmasi'] },
        { href: '/drugs', label: 'Database Obat', roles: ['admin', 'farmasi'] },
        { href: '/doctors', label: 'Database Dokter', roles: ['admin'] },
        { href: '/admin/users', label: 'Manajemen User', roles: ['admin'] }
      );
    } else if (appUser.role === 'igd') {
      links.push({ href: '/igd', label: 'IGD', roles: ['admin', 'igd'] });
    } else if (appUser.role === 'kasir') {
      links.push({ href: '/kasir', label: 'Kasir', roles: ['admin', 'kasir'] });
    } else if (appUser.role === 'farmasi') {
      links.push(
        { href: '/farmasi', label: 'Farmasi', roles: ['admin', 'farmasi'] },
        { href: '/prices', label: 'Database Harga', roles: ['admin', 'farmasi'] },
        { href: '/drugs', label: 'Database Obat', roles: ['admin', 'farmasi'] }
      );
    }

    return links.filter(link => link.roles.includes(appUser.role));
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Image
                src="/rsum-logo.png"
                alt="RS UNIPDU Medika"
                width={120}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname.startsWith(link.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <div className="font-medium">{appUser.displayName || appUser.email}</div>
              <div className="text-xs text-gray-500">{getRoleDisplayName(appUser.role)}</div>
            </div>
            <Button variant="secondary" onClick={handleSignOut}>
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

