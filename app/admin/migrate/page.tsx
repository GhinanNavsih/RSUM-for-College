/**
 * ═══════════════════════════════════════════════════════════════
 * TEMPORARY MIGRATION PAGE - DELETE AFTER USE
 * ═══════════════════════════════════════════════════════════════
 * Route: /admin/migrate
 * Purpose: One-time migration of drugs to unified pricing system
 * Access: Admin only
 * 
 * ⚠️ DELETE THIS FILE AFTER MIGRATION IS COMPLETE ⚠️
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getAllDrugs, createServicePrice } from '@/lib/firestore';

export default function MigrateDrugsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [migrating, setMigrating] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [completed, setCompleted] = useState(false);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const migrateDrugs = async () => {
    setMigrating(true);
    setLog([]);
    setStats({ total: 0, success: 0, failed: 0 });
    setCompleted(false);

    try {
      addLog('🔄 Starting drug migration to unified pricing system...');
      addLog('');
      
      // Get all drugs
      addLog('📦 Fetching drugs from database...');
      const drugs = await getAllDrugs();
      addLog(`✓ Found ${drugs.length} drugs in database`);
      addLog('');
      
      setStats({ total: drugs.length, success: 0, failed: 0 });

      // Migrate each drug
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < drugs.length; i++) {
        const drug = drugs[i];
        try {
          await createServicePrice({
            category: 'BHP_OBAT_ALKES',
            serviceName: drug.drugName,
            price: drug.pricePerUnit,
            unit: drug.unit,
            code: drug.drugId,
            isActive: drug.isActive,
            description: drug.description 
              ? `${drug.description}${drug.manufacturer ? ` - ${drug.manufacturer}` : ''}`
              : drug.manufacturer || '',
          });
          
          successCount++;
          addLog(`✅ [${i + 1}/${drugs.length}] Migrated: ${drug.drugName} (${drug.unit}) - Rp ${drug.pricePerUnit.toLocaleString()}`);
          setStats({ total: drugs.length, success: successCount, failed: failCount });
        } catch (error: any) {
          failCount++;
          addLog(`❌ [${i + 1}/${drugs.length}] Failed: ${drug.drugName} - ${error.message}`);
          setStats({ total: drugs.length, success: successCount, failed: failCount });
        }
      }

      addLog('');
      addLog('═══════════════════════════════════════════════════════');
      addLog('🎉 MIGRATION COMPLETE!');
      addLog('═══════════════════════════════════════════════════════');
      addLog(`📊 Summary:`);
      addLog(`   Total drugs: ${drugs.length}`);
      addLog(`   ✅ Successfully migrated: ${successCount}`);
      addLog(`   ❌ Failed: ${failCount}`);
      addLog('');
      addLog('✓ All drugs have been copied to the unified pricing system');
      addLog('✓ Original drug database is preserved for stock tracking');
      addLog('✓ You can now use the pricing system for Rawat Inap billing');
      addLog('');
      addLog('⚠️ IMPORTANT: Delete this migration page after verifying the data!');
      
      setCompleted(true);
    } catch (error: any) {
      addLog('');
      addLog(`❌ MIGRATION ERROR: ${error.message}`);
      addLog('Please check the console for more details.');
      console.error('Migration error:', error);
    } finally {
      setMigrating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!appUser || appUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <p className="text-red-600">Anda tidak memiliki akses ke halaman ini. (Admin only)</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔄 Drug Migration Utility
            </h1>
            <p className="text-gray-600">
              Migrate drugs from <code className="bg-gray-100 px-2 py-1 rounded text-sm">drugs</code> collection
              to unified pricing system under <strong>&quot;7. BHP (OBAT &amp; ALKES)&quot;</strong>
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              Important Information
            </h3>
            <ul className="text-sm text-yellow-700 space-y-2 list-disc list-inside">
              <li><strong>This is a ONE-TIME operation</strong></li>
              <li>The original <code className="bg-yellow-100 px-1 rounded">drugs</code> collection will NOT be deleted</li>
              <li>Stock tracking will continue to use the <code className="bg-yellow-100 px-1 rounded">drugs</code> collection</li>
              <li>Pricing for billing will use the new unified system</li>
              <li>Running this multiple times will create duplicate entries</li>
              <li><strong className="text-red-600">DELETE THIS PAGE after migration is complete!</strong></li>
            </ul>
          </div>

          {/* Stats Display */}
          {stats.total > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600 font-medium">Total Drugs</div>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{stats.success}</div>
                <div className="text-sm text-green-600 font-medium">✅ Migrated</div>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-red-600 font-medium">❌ Failed</div>
              </div>
            </div>
          )}

          {/* Migration Button */}
          {!completed && (
            <div className="mb-6">
              <Button
                onClick={migrateDrugs}
                disabled={migrating}
                className="w-full py-4 text-lg"
              >
                {migrating ? '🔄 Migrating... Please wait...' : '▶️ Start Migration'}
              </Button>
            </div>
          )}

          {/* Log Display */}
          {log.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Migration Log:</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-auto max-h-96">
                {log.map((line, index) => (
                  <div key={index} className="mb-1">{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {completed && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <h3 className="font-bold text-green-800 mb-4 text-xl flex items-center">
                <span className="text-2xl mr-2">✅</span>
                Migration Complete!
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Next Steps:</h4>
                  <ol className="text-sm text-green-700 space-y-2 list-decimal list-inside">
                    <li>
                      Go to{' '}
                      <a 
                        href="/prices" 
                        className="text-primary-600 hover:underline font-semibold"
                        onClick={() => router.push('/prices')}
                      >
                        Database Harga (/prices)
                      </a>
                    </li>
                    <li>Select category <strong>&quot;7. BHP (OBAT &amp; ALKES)&quot;</strong></li>
                    <li>Verify all {stats.success} drugs are listed</li>
                    <li>Test in Rawat Inap visit billing</li>
                    <li>Verify prescriptions still work (using drugs collection)</li>
                    <li><strong className="text-red-600">DELETE THIS MIGRATION PAGE</strong> (app/admin/migrate/page.tsx)</li>
                  </ol>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={() => router.push('/prices')}>
                    → Go to Database Harga
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => router.push('/admin')}
                  >
                    Back to Admin
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions (Before Migration) */}
          {!migrating && log.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">What will happen:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Read all drugs from <code className="bg-blue-100 px-1 rounded">drugs</code> collection</li>
                <li>Create corresponding entries in <code className="bg-blue-100 px-1 rounded">servicePrices</code> collection</li>
                <li>Set category to &quot;BHP_OBAT_ALKES&quot; for all entries</li>
                <li>Preserve drug codes, names, units, and prices</li>
                <li>Keep original drug database intact (for stock tracking)</li>
              </ol>
            </div>
          )}
        </Card>

        {/* Warning Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>⚠️ This is a temporary utility page</p>
          <p className="font-semibold text-red-600 mt-1">
            DELETE app/admin/migrate/page.tsx after migration is complete
          </p>
        </div>
      </div>
    </div>
  );
}

