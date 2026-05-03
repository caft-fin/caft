'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { api, type DangerTableInfo, ApiError } from '@/lib/apiClient';
import {
  Skull, Database, Trash2, AlertTriangle, Loader2, ChevronLeft, ChevronRight,
  ShieldAlert, RefreshCcw, X, Search, Eye
} from 'lucide-react';

export default function DangerZonePage() {
  const isSuperAdmin = useStore(state => state.isSuperAdmin);
  const isAuthenticated = useStore(state => state.isAuthenticated);
  const router = useRouter();

  const [tables, setTables] = useState<DangerTableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ table: string; id: string; } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);

  // Access guard
  useEffect(() => {
    if (isAuthenticated && !isSuperAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, isSuperAdmin, router]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await api.admin.danger.tables();
      setTables(res.data);
      if (res.data.length > 0) setSelectedTable(res.data[0].name);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTables(); }, []);

  const loadRecords = useCallback(async (tableName: string, page = 1) => {
    try {
      setRecordsLoading(true);
      setError('');
      const res = await api.admin.danger.records(tableName, page);
      setRecords(res.data);
      setMeta({ total: res.meta.total, page: res.meta.page, totalPages: res.meta.totalPages });
      if (res.data.length > 0) {
        setColumns(Object.keys(res.data[0]));
      } else {
        setColumns([]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load records');
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTable) loadRecords(selectedTable);
  }, [selectedTable, loadRecords]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await api.admin.danger.deleteRecord(deleteConfirm.table, deleteConfirm.id);
      setDeleteConfirm(null);
      loadRecords(selectedTable, meta.page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete record');
      setDeleteConfirm(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'object') {
      try { return JSON.stringify(value); } catch { return '[Object]'; }
    }
    const str = String(value);
    if (str.length > 60) return str.slice(0, 57) + '…';
    return str;
  };

  const formatFullValue = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') {
      try { return JSON.stringify(value, null, 2); } catch { return '[Object]'; }
    }
    return String(value);
  };

  const getTableDbName = (modelName: string) =>
    tables.find(t => t.name === modelName)?.dbTable || modelName;

  const filteredRecords = searchFilter
    ? records.filter(record =>
        Object.values(record).some(v =>
          String(v ?? '').toLowerCase().includes(searchFilter.toLowerCase())
        )
      )
    : records;

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">Only the Superadmin can access the Danger Zone.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
              <Skull className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-[36px] font-extrabold text-red-900 tracking-tight">Danger Zone</h1>
              <p className="text-red-600 font-medium">Direct database access — Superadmin only</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm border border-red-100">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-label-md font-semibold text-red-600">LIVE DATABASE</span>
          </div>
        </div>
      </section>

      {/* Warning Banner */}
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-4">
        <AlertTriangle className="text-red-600 w-6 h-6 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-900">⚠ Irreversible Actions Ahead</p>
          <p className="text-sm text-red-700 mt-1">
            Deleting records here is <strong>permanent</strong> and cannot be undone. All actions are logged to the audit trail.
            Click any row to inspect the full record data.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Table List Sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 bg-red-50/50 border-b border-red-100">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database Tables
              </h3>
              <p className="text-xs text-red-600 mt-1">{tables.length} tables</p>
            </div>
            <div className="divide-y divide-red-50 max-h-[600px] overflow-y-auto">
              {tables.map(table => (
                <button
                  key={table.name}
                  onClick={() => { setSelectedTable(table.name); setSearchFilter(''); }}
                  className={`w-full text-left px-4 py-3 transition-all text-sm ${
                    selectedTable === table.name
                      ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-500'
                      : 'text-gray-600 hover:bg-red-50/30 hover:text-red-600 border-l-4 border-transparent'
                  }`}
                >
                  <p className="font-semibold">{table.name}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{table.dbTable}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Records Panel */}
        <main className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            {/* Records Header */}
            <div className="p-5 bg-red-50/30 border-b border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-red-900 text-lg">
                  {selectedTable}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({getTableDbName(selectedTable)})
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {meta.total} total record{meta.total !== 1 ? 's' : ''} • Page {meta.page} of {meta.totalPages}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    className="bg-white border border-red-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/20 w-56"
                    placeholder="Filter records..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => loadRecords(selectedTable, meta.page)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Refresh"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Records Table */}
            {recordsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Database className="w-12 h-12 mb-4 text-gray-200" />
                <p className="font-semibold text-gray-500">No records found</p>
                <p className="text-sm">{searchFilter ? 'Try a different filter' : 'This table is empty'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-red-50/50">
                      {columns.map(col => (
                        <th key={col} className="px-4 py-3 text-[10px] font-black text-red-400 uppercase tracking-widest whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-[10px] font-black text-red-400 uppercase tracking-widest text-right sticky right-0 bg-red-50/50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {filteredRecords.map((record, idx) => {
                      const recordId = String(record.id || record.key || idx);
                      return (
                        <tr
                          key={recordId}
                          className="hover:bg-red-50/30 transition-colors group cursor-pointer"
                          onClick={() => setViewRecord(record)}
                        >
                          {columns.map(col => (
                            <td key={col} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis" title={String(record[col] ?? '')}>
                              {col === 'id' ? (
                                <span className="font-mono text-xs text-gray-400">{formatCellValue(record[col])}</span>
                              ) : (
                                formatCellValue(record[col])
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right sticky right-0 bg-white group-hover:bg-red-50/30">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setViewRecord(record); }}
                                className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="View full record"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!!record.id && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ table: selectedTable, id: String(record.id) }); }}
                                  className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete record permanently"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="p-4 bg-red-50/20 border-t border-red-100 flex items-center justify-between">
                <button
                  onClick={() => loadRecords(selectedTable, meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Previous
                </button>
                <span className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</span>
                <button
                  onClick={() => loadRecords(selectedTable, meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Record View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewRecord(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-gray-200 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Record Details
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedTable} • <span className="font-mono text-xs">{String(viewRecord.id || 'N/A')}</span>
                </p>
              </div>
              <button onClick={() => setViewRecord(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {Object.entries(viewRecord).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="col-span-1">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{key}</span>
                    </div>
                    <div className="col-span-2">
                      {typeof value === 'boolean' ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {value ? 'true' : 'false'}
                        </span>
                      ) : value === null || value === undefined ? (
                        <span className="text-gray-300 italic text-sm">null</span>
                      ) : key === 'id' || key.endsWith('Id') ? (
                        <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">{String(value)}</span>
                      ) : (
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all font-sans">{formatFullValue(value)}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-between items-center shrink-0 bg-gray-50">
              {!!viewRecord.id && (
                <button
                  onClick={() => {
                    setViewRecord(null);
                    setDeleteConfirm({ table: selectedTable, id: String(viewRecord.id) });
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete This Record
                </button>
              )}
              <button
                onClick={() => setViewRecord(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg">Confirm Permanent Deletion</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm text-red-800">
                <strong>Table:</strong> {getTableDbName(deleteConfirm.table)}
              </p>
              <p className="text-sm text-red-800 mt-1">
                <strong>Record ID:</strong> <span className="font-mono text-xs">{deleteConfirm.id}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-button hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-button hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleteLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete Forever</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
