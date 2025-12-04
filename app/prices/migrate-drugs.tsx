/**
 * ═══════════════════════════════════════════════════════════════
 * DRUG MIGRATION UTILITY
 * ═══════════════════════════════════════════════════════════════
 * One-time utility to migrate drugs to unified pricing system
 * Run this once to copy all drugs to servicePrices collection
 * ═══════════════════════════════════════════════════════════════
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { getAllDrugs, createServicePrice } from '@/lib/firestore';
import { Drug } from '@/types/models';

export default function MigrateDrugsUtility() {
  const [migrating, setMigrating] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const migrateDrugs = async () => {
    setMigrating(true);
    setLog([]);
    setStats({ total: 0, success: 0, failed: 0 });

    try {
      addLog('🔄 Starting migration...');
      
      // Get all drugs
      const drugs = await getAllDrugs();
      addLog(`📦 Found ${drugs.length} drugs in database`);
      
      setStats(prev => ({ ...prev, total: drugs.length }));

      // Migrate each drug
      for (const drug of drugs) {
        try {
          await createServicePrice({
            category: 'BHP_OBAT_ALKES',
            serviceName: `${drug.drugName}`,
            price: drug.pricePerUnit,
            unit: drug.unit,
            code: drug.drugId,
            isActive: drug.isActive,
            description: drug.description 
              ? `${drug.description}${drug.manufacturer ? ` - ${drug.manufacturer}` : ''}`
              : drug.manufacturer || '',
          });
          
          addLog(`✅ Migrated: ${drug.drugName} (${drug.unit}) - Rp ${drug.pricePerUnit.toLocaleString()}`);
          setStats(prev => ({ ...prev, success: prev.success + 1 }));
        } catch (error: any) {
          addLog(`❌ Failed: ${drug.drugName} - ${error.message}`);
          setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        }
      }

      addLog('');
      addLog('🎉 Migration complete!');
      addLog(`📊 Total: ${drugs.length} | Success: ${stats.success + 1} | Failed: ${stats.failed}`);
      
    } catch (error: any) {
      addLog(`❌ Migration error: ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <h1 className="text-2xl font-bold mb-4">Drug Migration Utility</h1>
          <p className="text-gray-600 mb-6">
            This utility will copy all drugs from the <code className="bg-gray-100 px-2 py-1 rounded">drugs</code> collection
            to the unified pricing system under category <strong>&quot;7. BHP (OBAT &amp; ALKES)&quot;</strong>.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>This is a ONE-TIME operation</li>
              <li>The original <code>drugs</code> collection will NOT be deleted</li>
              <li>Stock tracking will continue to use the <code>drugs</code> collection</li>
              <li>Pricing for billing will use the new unified system</li>
              <li>You can run this multiple times (duplicates will be created)</li>
            </ul>
          </div>

          {stats.total > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                <div className="text-sm text-green-600">Success</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
          )}

          <Button
            onClick={migrateDrugs}
            disabled={migrating}
            className="mb-6"
          >
            {migrating ? '🔄 Migrating...' : '▶️ Start Migration'}
          </Button>

          {log.length > 0 && (
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
              {log.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}

          {!migrating && log.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Go to <a href="/prices" className="text-primary-600 hover:underline">/prices</a> page</li>
                <li>Select category &quot;7. BHP (OBAT &amp; ALKES)&quot;</li>
                <li>Verify all drugs are listed</li>
                <li>Test in Rawat Inap visit billing</li>
              </ol>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

