'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Select } from '@/components/Select';
import { getAllUsers, updateUserRole } from '@/lib/firestore';
import { AppUser, UserRole } from '@/types/models';
import { getRoleDisplayName } from '@/lib/utils';

export default function AdminUsersPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('igd');

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login');
    }
    if (!authLoading && appUser && appUser.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, authLoading, router]);

  useEffect(() => {
    if (appUser && appUser.role === 'admin') {
      loadUsers();
    }
  }, [appUser]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: AppUser) => {
    setEditingUser(user.id);
    setNewRole(user.role);
  };

  const handleSaveRole = async (userId: string) => {
    try {
      await updateUserRole(userId, newRole);
      alert('Role berhasil diubah!');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Gagal mengubah role. Silakan coba lagi.');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewRole('igd');
  };

  if (authLoading || !appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (appUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <p className="text-red-600">Anda tidak memiliki akses ke halaman ini.</p>
          </Card>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-purple-100 text-purple-800',
      igd: 'bg-blue-100 text-blue-800',
      kasir: 'bg-green-100 text-green-800',
      farmasi: 'bg-orange-100 text-orange-800',
      resepsionis: 'bg-teal-100 text-teal-800',
      lab: 'bg-cyan-100 text-cyan-800',
      radiologi: 'bg-indigo-100 text-indigo-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600 mt-2">Kelola pengguna dan hak akses sistem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total User</p>
              <p className="text-4xl font-bold text-primary-600">{users.length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Admin</p>
              <p className="text-3xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">IGD</p>
              <p className="text-3xl font-bold text-blue-600">
                {users.filter(u => u.role === 'igd').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Kasir + Farmasi</p>
              <p className="text-3xl font-bold text-green-600">
                {users.filter(u => u.role === 'kasir' || u.role === 'farmasi').length}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Daftar Pengguna</h2>
            <p className="text-sm text-gray-600 mt-1">
              Klik &quot;Edit Role&quot; untuk mengubah hak akses pengguna
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Tidak ada data pengguna.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm">
                        {user.email}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {user.displayName || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {editingUser === user.id ? (
                          <Select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as UserRole)}
                            options={[
                              { value: 'admin', label: 'Administrator' },
                              { value: 'igd', label: 'IGD' },
                              { value: 'kasir', label: 'Kasir' },
                              { value: 'farmasi', label: 'Farmasi' },
                            ]}
                            className="mb-0"
                          />
                        ) : (
                          <Badge color={getRoleBadgeColor(user.role)}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {editingUser === user.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              className="text-xs py-1 px-3"
                              onClick={() => handleSaveRole(user.id)}
                            >
                              Simpan
                            </Button>
                            <Button
                              variant="secondary"
                              className="text-xs py-1 px-3"
                              onClick={handleCancelEdit}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            className="text-xs py-1 px-3"
                            onClick={() => handleEditRole(user)}
                            disabled={user.id === appUser.id}
                          >
                            {user.id === appUser.id ? 'Anda' : 'Edit Role'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="mt-6">
          <h3 className="font-semibold mb-3">ℹ️ Informasi Tambahan</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Cara menambah user baru:</strong> User baru harus didaftarkan melalui Firebase Authentication Console terlebih dahulu.
            </p>
            <p>
              Setelah user login pertama kali, data user akan otomatis tersimpan di Firestore dan akan muncul di halaman ini.
            </p>
            <p className="mt-4">
              <strong>Deskripsi Role:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Admin:</strong> Akses penuh ke semua fitur sistem</li>
              <li><strong>IGD:</strong> Dapat mengelola pasien dan kunjungan, membuat tindakan dan resep</li>
              <li><strong>Kasir:</strong> Dapat memproses pembayaran pasien</li>
              <li><strong>Farmasi:</strong> Dapat memproses resep dan pemberian obat</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

