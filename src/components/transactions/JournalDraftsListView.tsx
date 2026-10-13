/**
 * ACCOUNTIX - Transactions -> Journal Entries / Drafts View
 * Day 2.3: Displays the saved Journal Vouchers & Drafts Registry.
 * Provides Open / Edit (loading full original data into Journal Entry screen)
 * and Delete Draft with confirmation dialog.
 * Guarantees zero ledger/financial posting side effects for drafts.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  journalDraftService,
  JournalVoucherDraft,
} from '../../services/journalDraftService';
import { formatDate } from '../../utils/dateUtils';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  Building2,
  Calendar,
  AlertTriangle,
  X,
  Check,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const JournalDraftsListView: React.FC = () => {
  const { activeCompany, activeFinancialYear, setCurrentView, showNotification } = useApp();

  const [drafts, setDrafts] = useState<JournalVoucherDraft[]>(() =>
    journalDraftService.getDrafts(activeCompany.id)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Delete confirmation modal state
  const [draftToDelete, setDraftToDelete] = useState<JournalVoucherDraft | null>(null);

  // Quick view detail modal state
  const [selectedPreview, setSelectedPreview] = useState<JournalVoucherDraft | null>(null);

  // Subscribe to changes in journalDraftService
  useEffect(() => {
    const updateList = () => {
      setDrafts(journalDraftService.getDrafts(activeCompany.id));
    };

    updateList();
    const unsubscribe = journalDraftService.subscribe(updateList);
    return () => unsubscribe();
  }, [activeCompany.id]);

  // Unique categories for filtering
  const categories = useMemo(() => {
    const set = new Set<string>();
    drafts.forEach((d) => set.add(d.journalType));
    return ['ALL', ...Array.from(set)];
  }, [drafts]);

  // Filtered drafts
  const filteredDrafts = useMemo(() => {
    return drafts.filter((d) => {
      if (categoryFilter !== 'ALL' && d.journalType !== categoryFilter) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const inVoucherNo = d.voucherNo.toLowerCase().includes(q);
      const inRef = d.referenceNo.toLowerCase().includes(q);
      const inNarration = d.narration.toLowerCase().includes(q);
      const inCategory = d.journalType.toLowerCase().includes(q);
      const inLines = d.lines.some(
        (l) =>
          l.accountCode.toLowerCase().includes(q) ||
          l.accountName.toLowerCase().includes(q) ||
          l.narration.toLowerCase().includes(q)
      );
      return inVoucherNo || inRef || inNarration || inCategory || inLines;
    });
  }, [drafts, categoryFilter, searchTerm]);

  // Action: Open / Edit
  const handleOpenEdit = (draft: JournalVoucherDraft) => {
    journalDraftService.setActiveDraftToEdit(draft);
    setCurrentView('tx_journal_entry');
  };

  // Action: Delete confirmed
  const confirmDelete = () => {
    if (!draftToDelete) return;
    const deleted = journalDraftService.deleteDraft(activeCompany.id, draftToDelete.id);
    if (deleted) {
      showNotification(
        'info',
        'Draft Deleted',
        `Journal Draft "${draftToDelete.voucherNo}" has been removed from the drafts register.`
      );
    }
    setDraftToDelete(null);
  };

  // Action: Create New Entry (Clean blank form)
  const handleCreateNew = () => {
    journalDraftService.clearActiveDraftToEdit();
    setCurrentView('tx_journal_entry');
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Section */}
      <div className="bg-white rounded-lg border border-blue-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Journal Entries / Drafts
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Transactions / Day 2.3
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved journal drafts repository. Open & edit existing draft vouchers with complete original lines or remove unneeded drafts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Active Company context badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-medium text-slate-900">{activeCompany.name}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 font-mono text-[11px]">{activeFinancialYear.yearCode}</span>
            </div>

            {/* Create New Journal Entry Button */}
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Journal Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search, Filter & Quick Statistics Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto flex-1">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Voucher No, Ref, Narration, or Account Code..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600 self-end md:self-center">
          <span>
            Total Drafts: <strong className="text-blue-900 font-bold">{drafts.length}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            Showing: <strong className="text-blue-700 font-bold">{filteredDrafts.length}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Ledger Safe (Unposted)
          </span>
        </div>
      </div>

      {/* 3. Draft List Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-blue-50/90 text-blue-900 font-semibold border-b border-blue-100">
                <th className="py-2.5 px-3 w-32">Voucher No</th>
                <th className="py-2.5 px-3 w-28">Voucher Date</th>
                <th className="py-2.5 px-3 w-40">Journal Category</th>
                <th className="py-2.5 px-3 w-36">Reference</th>
                <th className="py-2.5 px-3 min-w-[220px]">Narration</th>
                <th className="py-2.5 px-3 w-32 text-right">Total Debit ($)</th>
                <th className="py-2.5 px-3 w-32 text-right">Total Credit ($)</th>
                <th className="py-2.5 px-3 w-24 text-center">Status</th>
                <th className="py-2.5 px-3 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrafts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <div className="font-medium text-slate-600">No Journal Drafts Found</div>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchTerm || categoryFilter !== 'ALL'
                          ? 'No drafts match the search criteria. Try clearing filters.'
                          : 'You currently have no saved journal drafts. Click "New Journal Entry" to create a voucher and save as draft.'}
                      </p>
                      <button
                        type="button"
                        onClick={handleCreateNew}
                        className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded border border-blue-200 cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create New Journal Entry</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDrafts.map((draft) => (
                  <tr key={draft.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* 1. Voucher No */}
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200/80">
                          {draft.voucherNo}
                        </span>
                      </div>
                    </td>

                    {/* 2. Voucher Date */}
                    <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {formatDate(draft.date)}
                    </td>

                    {/* 3. Journal Category */}
                    <td className="py-2.5 px-3 text-slate-800 font-medium whitespace-nowrap">
                      {draft.journalType}
                    </td>

                    {/* 4. Reference */}
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {draft.referenceNo || 'N/A'}
                    </td>

                    {/* 5. Narration & line summary */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 truncate max-w-xs lg:max-w-md" title={draft.narration}>
                        {draft.narration}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs lg:max-w-md">
                        {draft.lines.map((l) => `${l.accountCode} (${l.debit > 0 ? `Dr $${l.debit}` : `Cr $${l.credit}`})`).join(' | ')}
                      </div>
                    </td>

                    {/* 6. Total Debit */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-900 whitespace-nowrap">
                      ${draft.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* 7. Total Credit */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-900 whitespace-nowrap">
                      ${draft.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* 8. Status (Status = Draft) */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {draft.status || 'Draft'}
                      </span>
                    </td>

                    {/* 9. Actions (Open / Edit & Delete Draft) */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Open / Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(draft)}
                          title="Open & Edit Saved Draft with full original lines"
                          className="px-2 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-blue-600" />
                          <span>Open / Edit</span>
                        </button>

                        {/* Quick View */}
                        <button
                          type="button"
                          onClick={() => setSelectedPreview(draft)}
                          title="Inspect lines"
                          className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Draft Button */}
                        <button
                          type="button"
                          onClick={() => setDraftToDelete(draft)}
                          title="Delete Draft"
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Accounting Safety:</span>
            <span>
              Drafts remain completely unposted and will never affect General Ledger, Customer/Supplier Ledgers, Trial Balance, P&L, or Balance Sheet.
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Company: {activeCompany.id} | Period: {activeFinancialYear.yearCode}
          </div>
        </div>
      </div>

      {/* 4. Delete Confirmation Dialog Modal */}
      {draftToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-red-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Delete Draft</span>
              </div>
              <button
                type="button"
                onClick={() => setDraftToDelete(null)}
                className="text-red-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700">
              <p className="font-medium text-slate-900 text-sm">
                Are you sure you want to delete this Journal Draft?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono space-y-1">
                <div>
                  <span className="text-slate-500 font-sans">Voucher No:</span>{' '}
                  <strong className="text-blue-900">{draftToDelete.voucherNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-sans">Date:</span> {formatDate(draftToDelete.date)}
                </div>
                <div>
                  <span className="text-slate-500 font-sans">Category:</span> {draftToDelete.journalType}
                </div>
                <div>
                  <span className="text-slate-500 font-sans">Amount:</span> $
                  {draftToDelete.totalDebit.toFixed(2)}
                </div>
                <div className="truncate">
                  <span className="text-slate-500 font-sans">Narration:</span>{' '}
                  <span className="font-sans text-slate-700">{draftToDelete.narration}</span>
                </div>
              </div>
              <p className="text-red-600 font-medium">
                This action is permanent and cannot be undone. The draft will be removed from your drafts registry.
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraftToDelete(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Quick View Lines Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg shadow-xl border border-blue-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Draft Details — {selectedPreview.voucherNo}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="text-blue-200 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Voucher Date</span>
                  <span className="font-semibold font-mono">{formatDate(selectedPreview.date)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Category</span>
                  <span className="font-semibold">{selectedPreview.journalType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Reference</span>
                  <span className="font-semibold font-mono">{selectedPreview.referenceNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Status</span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                    {selectedPreview.status}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <span className="text-slate-500 block text-[11px]">General Narration</span>
                  <span className="font-medium">{selectedPreview.narration}</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-blue-900 mb-2">Voucher Lines:</div>
                <table className="w-full text-left text-xs border border-slate-200 rounded">
                  <thead className="bg-blue-50 text-blue-900 font-semibold border-b border-blue-100">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      <th className="py-2 px-3 w-28">Account Code</th>
                      <th className="py-2 px-3">Account Title / Description</th>
                      <th className="py-2 px-3 w-28 text-right">Debit ($)</th>
                      <th className="py-2 px-3 w-28 text-right">Credit ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPreview.lines.map((l, i) => (
                      <tr key={l.id}>
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{i + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-800">{l.accountCode}</td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-slate-900">{l.accountName}</div>
                          {l.narration && (
                            <div className="text-[11px] text-slate-500 italic">{l.narration}</div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-blue-900">
                          {l.debit > 0 ? l.debit.toFixed(2) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-900">
                          {l.credit > 0 ? l.credit.toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold border-t border-slate-300">
                      <td colSpan={3} className="py-2 px-3 text-right uppercase">
                        Totals:
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-blue-900">
                        ${selectedPreview.totalDebit.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-900">
                        ${selectedPreview.totalCredit.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const draft = selectedPreview;
                  setSelectedPreview(null);
                  handleOpenEdit(draft);
                }}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open in Journal Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
