/**
 * ACCOUNTIX - Transactions -> Journal Entry (JV) UI Foundation
 * Double-entry multi-line general journal voucher interface.
 * Strictly enforces company isolation and COA AvailableForPosting rules.
 * Does NOT alter or post to financial ledgers yet (Day 2.1 UI foundation).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { coaService } from '../../services/coaService';
import { Account } from '../../types/accounting';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  Search,
  Building2,
  Calendar,
  FileText,
  Save,
  Eye,
  Check,
  X,
  ArrowRightLeft,
  Info,
  Layers,
  Sparkles,
  Edit3,
  AlertTriangle,
} from 'lucide-react';
import {
  journalDraftService,
  JournalVoucherDraft,
} from '../../services/journalDraftService';
import { formatDate } from '../../utils/dateUtils';
import { AccountixDatePicker } from '../common/AccountixDatePicker';

interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType?: string;
  narration: string;
  debit: number;
  credit: number;
}

export const JournalEntryView: React.FC = () => {
  const { activeCompany, activeFinancialYear, showNotification } = useApp();

  // Active view tab: 'NEW_ENTRY' or 'REGISTER'
  const [activeTab, setActiveTab] = useState<'NEW_ENTRY' | 'REGISTER'>('NEW_ENTRY');

  // Currently editing draft ID (null if creating fresh voucher)
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  // Voucher Header State
  const [voucherNo, setVoucherNo] = useState(`JV-${new Date().getFullYear()}-0001`);
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalType, setJournalType] = useState('General Journal');
  const [referenceNo, setReferenceNo] = useState('');
  const [narration, setNarration] = useState('');

  // Voucher Lines State (minimum 2 lines)
  const [lines, setLines] = useState<JournalLine[]>([
    {
      id: 'line_1',
      accountId: '',
      accountCode: '',
      accountName: '',
      accountType: '',
      narration: '',
      debit: 0,
      credit: 0,
    },
    {
      id: 'line_2',
      accountId: '',
      accountCode: '',
      accountName: '',
      accountType: '',
      narration: '',
      debit: 0,
      credit: 0,
    },
  ]);

  // Validation / warning messages
  const [validationError, setValidationError] = useState<string | null>(null);

  // Inspection / Print preview modal
  const [previewVoucher, setPreviewVoucher] = useState<JournalVoucherDraft | null>(null);

  // Delete draft confirmation modal
  const [draftToDelete, setDraftToDelete] = useState<JournalVoucherDraft | null>(null);

  // Fetch accounts strictly for active company
  const companyAccounts = useMemo(() => {
    return coaService.getAccounts(activeCompany.id);
  }, [activeCompany.id]);

  // Only postable accounts (AvailableForPosting === true)
  const postableAccounts = useMemo(() => {
    return companyAccounts.filter((a) => a.availableForPosting);
  }, [companyAccounts]);

  // Group accounts (for user education if selected)
  const groupAccounts = useMemo(() => {
    return companyAccounts.filter((a) => a.isGroup);
  }, [companyAccounts]);

  // Saved vouchers / drafts registry from shared service
  const [voucherHistory, setVoucherHistory] = useState<JournalVoucherDraft[]>(() =>
    journalDraftService.getDrafts(activeCompany.id)
  );

  // Subscribe to journalDraftService updates
  useEffect(() => {
    const syncDrafts = () => {
      setVoucherHistory(journalDraftService.getDrafts(activeCompany.id));
    };
    syncDrafts();
    const unsub = journalDraftService.subscribe(syncDrafts);
    return () => unsub();
  }, [activeCompany.id]);

  // Check if an external "Open / Edit" was requested from another view
  useEffect(() => {
    const draft = journalDraftService.getActiveDraftToEdit();
    if (draft) {
      loadDraftIntoForm(draft);
      journalDraftService.clearActiveDraftToEdit();
    }
  }, []);

  // Helper to load a draft's original data into the form (Rule 3)
  const loadDraftIntoForm = (draft: JournalVoucherDraft) => {
    setEditingDraftId(draft.id);
    setVoucherNo(draft.voucherNo);
    setVoucherDate(draft.date);
    setJournalType(draft.journalType);
    setReferenceNo(draft.referenceNo === 'N/A' ? '' : draft.referenceNo);
    setNarration(draft.narration);
    setLines(
      draft.lines && draft.lines.length > 0
        ? draft.lines.map((l, idx) => ({
            id: l.id || `line_${Date.now()}_${idx}`,
            accountId: l.accountId || '',
            accountCode: l.accountCode || '',
            accountName: l.accountName || '',
            accountType: l.accountType || '',
            narration: l.narration || '',
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
          }))
        : [
            { id: 'l1', accountId: '', accountCode: '', accountName: '', accountType: '', narration: '', debit: 0, credit: 0 },
            { id: 'l2', accountId: '', accountCode: '', accountName: '', accountType: '', narration: '', debit: 0, credit: 0 },
          ]
    );
    setValidationError(null);
    setActiveTab('NEW_ENTRY');
    showNotification(
      'info',
      'Draft Loaded',
      `Loaded original draft data for "${draft.voucherNo}". You can edit lines, amounts, re-save draft, or post when balanced.`
    );
  };

  // Calculate totals
  const totalDebit = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  }, [lines]);

  const totalCredit = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  }, [lines]);

  const difference = useMemo(() => {
    return Math.abs(totalDebit - totalCredit);
  }, [totalDebit, totalCredit]);

  // Comprehensive validation evaluation for each line and overall status (Day 2.2)
  const validationSummary = useMemo(() => {
    let validLineCount = 0;
    let hasEmptyAccount = false;
    let hasEmptyAmount = false;
    let hasNegativeAmount = false;
    let hasDualEntry = false;
    let firstIssueMsg = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasAccount = Boolean(line.accountId && line.accountId.trim() !== '');
      const d = Number(line.debit) || 0;
      const c = Number(line.credit) || 0;

      if (d < 0 || c < 0) {
        hasNegativeAmount = true;
        if (!firstIssueMsg) firstIssueMsg = `Line #${i + 1} has a negative amount. Only non-negative amounts are allowed.`;
      }

      if (d > 0 && c > 0) {
        hasDualEntry = true;
        if (!firstIssueMsg) firstIssueMsg = `Line #${i + 1} has both Debit and Credit amounts. Only one side is allowed per row.`;
      }

      const isSingleSidedAmount = (d > 0 && c === 0) || (c > 0 && d === 0);

      if (hasAccount && isSingleSidedAmount && d >= 0 && c >= 0) {
        validLineCount++;
      } else {
        if (!hasAccount && (d > 0 || c > 0)) {
          hasEmptyAccount = true;
          if (!firstIssueMsg) firstIssueMsg = `Line #${i + 1} has an amount entered but no account selected.`;
        } else if (hasAccount && d === 0 && c === 0) {
          hasEmptyAmount = true;
          if (!firstIssueMsg) firstIssueMsg = `Line #${i + 1} has an account selected but zero Debit and Credit amount.`;
        } else if (!hasAccount && d === 0 && c === 0) {
          if (!firstIssueMsg) firstIssueMsg = `Line #${i + 1} is empty (select account and enter amount).`;
        }
      }
    }

    // Determine status:
    // Rule 9: INCOMPLETE if account missing, amount missing/zero, or minimum 2 valid lines not met
    // Rule 7: BALANCED if min 2 valid lines, all lines valid, single-sided amounts, and Total Debit == Total Credit
    // Rule 8: UNBALANCED if lines are complete but Total Debit != Total Credit
    let status: 'BALANCED' | 'UNBALANCED' | 'INCOMPLETE' = 'INCOMPLETE';
    let statusMessage = '';

    const hasAnyIncompleteLine =
      validLineCount < lines.length ||
      hasEmptyAccount ||
      hasEmptyAmount ||
      hasNegativeAmount ||
      hasDualEntry;

    if (validLineCount < 2 || hasAnyIncompleteLine) {
      status = 'INCOMPLETE';
      statusMessage =
        validLineCount < 2
          ? `Minimum 2 valid journal lines required (currently ${validLineCount} valid line${validLineCount === 1 ? '' : 's'}).`
          : firstIssueMsg || 'All journal lines must have a valid account and a positive Debit or Credit amount.';
    } else {
      // At least 2 valid lines and all lines in grid are valid
      if (difference < 0.005 && totalDebit > 0) {
        status = 'BALANCED';
        statusMessage = `Double-Entry Equation Verified: Total Debits ($${totalDebit.toFixed(2)}) equals Total Credits ($${totalCredit.toFixed(2)}).`;
      } else {
        status = 'UNBALANCED';
        statusMessage = `Total Debits ($${totalDebit.toFixed(2)}) does not equal Total Credits ($${totalCredit.toFixed(2)}). Difference: $${difference.toFixed(2)}.`;
      }
    }

    return {
      validLineCount,
      hasEmptyAccount,
      hasEmptyAmount,
      hasNegativeAmount,
      hasDualEntry,
      status,
      statusMessage,
      isBalanced: status === 'BALANCED',
    };
  }, [lines, totalDebit, totalCredit, difference]);

  const isBalanced = validationSummary.isBalanced;

  // Auto-fill account selection
  const handleAccountSelect = (lineIndex: number, accountId: string) => {
    setValidationError(null);

    if (!accountId) {
      setLines((prev) =>
        prev.map((line, idx) =>
          idx === lineIndex
            ? { ...line, accountId: '', accountCode: '', accountName: '', accountType: '' }
            : line
        )
      );
      return;
    }

    // Check if user accidentally selected a group account
    const groupCheck = groupAccounts.find((g) => g.id === accountId);
    if (groupCheck) {
      setValidationError(
        `Account "${groupCheck.code} - ${groupCheck.name}" is a Group Account and is NOT available for posting. Please select a Posting Ledger (e.g., 5410 Utility Expenses, 1010 Cash).`
      );
      return;
    }

    const selected = postableAccounts.find((a) => a.id === accountId);
    if (!selected) {
      setValidationError('Selected account is not available for transaction posting.');
      return;
    }

    setLines((prev) =>
      prev.map((line, idx) =>
        idx === lineIndex
          ? {
              ...line,
              accountId: selected.id,
              accountCode: selected.code,
              accountName: selected.name,
              accountType: selected.accountType || '',
            }
          : line
      )
    );
  };

  // Debit input change:
  // Rule 1: One side only (if Debit > 0, Credit becomes 0/blank)
  // Rule 2: Negative amounts not allowed (clamped to >= 0)
  const handleDebitChange = (lineIndex: number, val: string) => {
    setValidationError(null);
    if (val === '') {
      setLines((prev) =>
        prev.map((line, idx) => (idx === lineIndex ? { ...line, debit: 0 } : line))
      );
      return;
    }

    // Strip any negative sign or invalid chars
    const clean = val.replace(/[^0-9.]/g, '');
    const num = Math.max(0, parseFloat(clean) || 0);

    setLines((prev) =>
      prev.map((line, idx) =>
        idx === lineIndex
          ? {
              ...line,
              debit: num,
              credit: num > 0 ? 0 : line.credit, // Debit > 0 forces Credit to 0
            }
          : line
      )
    );
  };

  // Credit input change:
  // Rule 1: One side only (if Credit > 0, Debit becomes 0/blank)
  // Rule 2: Negative amounts not allowed (clamped to >= 0)
  const handleCreditChange = (lineIndex: number, val: string) => {
    setValidationError(null);
    if (val === '') {
      setLines((prev) =>
        prev.map((line, idx) => (idx === lineIndex ? { ...line, credit: 0 } : line))
      );
      return;
    }

    // Strip any negative sign or invalid chars
    const clean = val.replace(/[^0-9.]/g, '');
    const num = Math.max(0, parseFloat(clean) || 0);

    setLines((prev) =>
      prev.map((line, idx) =>
        idx === lineIndex
          ? {
              ...line,
              credit: num,
              debit: num > 0 ? 0 : line.debit, // Credit > 0 forces Debit to 0
            }
          : line
      )
    );
  };

  // Line narration change
  const handleLineNarrationChange = (lineIndex: number, text: string) => {
    setLines((prev) =>
      prev.map((line, idx) => (idx === lineIndex ? { ...line, narration: text } : line))
    );
  };

  // Add new row (Rule 12: dynamically recalculates totals and status)
  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line_${Date.now()}_${prev.length + 1}`,
        accountId: '',
        accountCode: '',
        accountName: '',
        accountType: '',
        narration: '',
        debit: 0,
        credit: 0,
      },
    ]);
  };

  // Remove row (Rule 12: dynamically recalculates totals and status, preserves minimum 2 rows)
  const handleRemoveLine = (lineIndex: number) => {
    if (lines.length <= 2) {
      showNotification('warning', 'Minimum Lines', 'A journal entry requires at least two lines for double-entry.');
      return;
    }
    setLines((prev) => prev.filter((_, idx) => idx !== lineIndex));
  };

  // Auto-balance feature for quick reconciliation
  const handleAutoBalance = (lineIndex: number) => {
    if (difference < 0.01) return;

    if (totalDebit > totalCredit) {
      setLines((prev) =>
        prev.map((line, idx) =>
          idx === lineIndex
            ? { ...line, credit: Number((line.credit + difference).toFixed(2)), debit: 0 }
            : line
        )
      );
    } else {
      setLines((prev) =>
        prev.map((line, idx) =>
          idx === lineIndex
            ? { ...line, debit: Number((line.debit + difference).toFixed(2)), credit: 0 }
            : line
        )
      );
    }
  };

  // Reset form
  const handleResetForm = () => {
    setEditingDraftId(null);
    setVoucherNo(`JV-${new Date().getFullYear()}-0001`);
    setVoucherDate(new Date().toISOString().split('T')[0]);
    setJournalType('General Journal');
    setReferenceNo('');
    setNarration('');
    setLines([
      {
        id: `line_${Date.now()}_1`,
        accountId: '',
        accountCode: '',
        accountName: '',
        accountType: '',
        narration: '',
        debit: 0,
        credit: 0,
      },
      {
        id: `line_${Date.now()}_2`,
        accountId: '',
        accountCode: '',
        accountName: '',
        accountType: '',
        narration: '',
        debit: 0,
        credit: 0,
      },
    ]);
    setValidationError(null);
  };

  // Rule 11 & Day 2.3: Save Draft (Compatible with validation, does NOT post to GL, Ledgers, Trial Balance, P&L, or Balance Sheet)
  const handleSaveDraft = () => {
    const filledLines = lines.filter((l) => l.accountId || l.debit > 0 || l.credit > 0);
    if (filledLines.length === 0) {
      showNotification('warning', 'Draft Empty', 'Please enter at least one account or amount before saving draft.');
      return;
    }

    const draftId = editingDraftId || `jv_draft_${Date.now()}`;
    const cleanVoucherNo = voucherNo.trim() || `JV-${new Date().getFullYear()}-0001`;

    const draftVoucher: JournalVoucherDraft = {
      id: draftId,
      voucherNo: cleanVoucherNo,
      date: voucherDate,
      companyId: activeCompany.id,
      financialYearId: activeFinancialYear.id,
      journalType,
      referenceNo: referenceNo.trim() || 'N/A',
      narration: narration.trim() || 'Draft Journal Voucher',
      totalDebit,
      totalCredit,
      lines: [...lines],
      status: 'Draft',
      createdAt: new Date().toISOString(),
    };

    journalDraftService.saveDraft(draftVoucher);
    setEditingDraftId(draftId);

    showNotification(
      'info',
      'Draft Saved',
      `Voucher "${draftVoucher.voucherNo}" saved with status "Draft" in the drafts registry (no ledger or financial posting occurred).`
    );
  };

  // Rule 10: Post Entry (Blocked when status is UNBALANCED or INCOMPLETE)
  const handlePostEntry = () => {
    setValidationError(null);

    // Guard: block if not balanced
    if (validationSummary.status !== 'BALANCED') {
      showNotification(
        'warning',
        'Posting Blocked',
        `Cannot post journal voucher with status ${validationSummary.status}. ${validationSummary.statusMessage}`
      );
      setValidationError(`Posting blocked: ${validationSummary.statusMessage}`);
      return;
    }

    // Check Date
    if (!voucherDate) {
      setValidationError('Please specify a valid voucher date.');
      return;
    }

    // Create verified voucher record (Local Day 2.2 only, no live GL posting)
    const newVoucher: JournalVoucherDraft = {
      id: editingDraftId || `jv_${Date.now()}`,
      voucherNo,
      date: voucherDate,
      companyId: activeCompany.id,
      financialYearId: activeFinancialYear.id,
      journalType,
      referenceNo: referenceNo.trim() || 'N/A',
      narration: narration.trim() || 'General Journal adjustment',
      totalDebit,
      totalCredit,
      lines: [...lines],
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
    };

    journalDraftService.saveDraft(newVoucher);

    showNotification(
      'success',
      'Journal Entry Verified',
      `Voucher ${voucherNo} ($${totalDebit.toFixed(2)}) verified and saved to local register with status BALANCED. (Final ledger posting will be connected in Day 3).`
    );

    // Increment voucher number for next entry
    const match = voucherNo.match(/(\d+)$/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      const padded = String(nextNum).padStart(match[1].length, '0');
      setVoucherNo(voucherNo.replace(/(\d+)$/, padded));
    }

    // Reset lines
    handleResetForm();
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Context Navigation */}
      <div className="bg-white rounded-lg border border-blue-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Journal Entry (JV)</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Transactions / Day 2.2
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Double-entry General Journal voucher with strict Debit/Credit validation, balancing controls & draft saving.
              </p>
            </div>
          </div>

          {/* Active Company Context Tag & Navigation Tabs */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-medium text-slate-900">{activeCompany.name}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 font-mono text-[11px]">{activeFinancialYear.yearCode}</span>
            </div>

            <div className="flex rounded-md bg-blue-50 p-0.5 border border-blue-200">
              <button
                type="button"
                onClick={() => setActiveTab('NEW_ENTRY')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'NEW_ENTRY'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-blue-900 hover:text-blue-700'
                }`}
              >
                New Journal Entry
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('REGISTER')}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'REGISTER'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-blue-900 hover:text-blue-700'
                }`}
              >
                <span>Journal Register</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200 text-blue-900 font-bold">
                  {voucherHistory.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'NEW_ENTRY' ? (
        /* ================= NEW / EDIT JOURNAL ENTRY SCREEN ================= */
        <div className="space-y-4">
          {/* Active Draft Editing Banner (Rule 3) */}
          {editingDraftId && (
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-blue-950 shadow-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-700 text-white rounded">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span>Editing Saved Draft:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900 font-bold">
                      {voucherNo}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Draft
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Original draft data loaded. You can modify fields, add/delete rows, update debits/credits, re-save draft, or post when balanced.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 rounded text-xs cursor-pointer shadow-xs whitespace-nowrap self-end sm:self-auto"
              >
                Start New Blank Entry
              </button>
            </div>
          )}

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Validation Warning: </span>
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-red-400 hover:text-red-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. Voucher Header Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Voucher Header Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Voucher Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Voucher No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-semibold text-blue-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  placeholder="JV-2026-0001"
                />
              </div>

              {/* Voucher Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Voucher Date <span className="text-red-500">*</span>
                  <span className="text-blue-700 font-mono text-[11px] ml-1.5 font-normal">
                    ({formatDate(voucherDate)})
                  </span>
                </label>
                <AccountixDatePicker
                  value={voucherDate}
                  onChange={(newDate) => setVoucherDate(newDate)}
                  required
                />
              </div>

              {/* Journal Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Journal Category</label>
                <select
                  value={journalType}
                  onChange={(e) => setJournalType(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                >
                  <option value="General Journal">General Journal</option>
                  <option value="Accrual & Adjustment">Accrual & Adjustment</option>
                  <option value="Depreciation">Depreciation & Amortization</option>
                  <option value="Prepaid Expense Amortization">Prepaid Expense Amortization</option>
                  <option value="Opening Balance Entry">Opening Balance Entry</option>
                  <option value="Correction / Rectification">Correction / Rectification</option>
                </select>
              </div>

              {/* Document Reference No */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference / Cheque No</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. DOC-9941, CHQ#2481"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Narration (Spans Full Width) */}
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block font-semibold text-slate-700 mb-1">
                  General Narration / Remarks
                </label>
                <input
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Explain the purpose of this accounting transaction (e.g. Accrual of monthly electricity bill for October)..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* 3. Journal Entry Multi-Line Grid */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Transaction Lines (Debits & Credits)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Rule: Only accounts with <span className="font-semibold text-blue-700">AvailableForPosting = True</span> can be selected.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-50/90 text-blue-900 font-semibold border-b border-blue-100">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Account (Posting Ledger)</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Line Description / Memo</th>
                    <th className="py-2.5 px-3 w-36 text-right">Debit ($)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Credit ($)</th>
                    <th className="py-2.5 px-3 w-28 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, index) => {
                    const isDebitFilled = (line.debit || 0) > 0;
                    const isCreditFilled = (line.credit || 0) > 0;

                    return (
                      <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Line number */}
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono font-medium">
                          {index + 1}
                        </td>

                        {/* Account selection dropdown strictly enforcing AvailableForPosting */}
                        <td className="py-2 px-3">
                          <select
                            value={line.accountId}
                            onChange={(e) => handleAccountSelect(index, e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium"
                          >
                            <option value="">-- Select Posting Account --</option>
                            {postableAccounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.code} – {acc.name} ({acc.accountType})
                              </option>
                            ))}
                          </select>
                          {line.accountCode ? (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                              <span className="font-mono bg-blue-50 text-blue-700 px-1 rounded font-semibold border border-blue-100">
                                Code: {line.accountCode}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">{line.accountType}</span>
                              <span className="text-emerald-700 font-medium text-[10px]">
                                (✓ Postable)
                              </span>
                            </div>
                          ) : (line.debit > 0 || line.credit > 0) ? (
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-600 font-medium">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>Account selection required</span>
                            </div>
                          ) : null}
                        </td>

                        {/* Line Narration */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={line.narration}
                            onChange={(e) => handleLineNarrationChange(index, e.target.value)}
                            placeholder="Optional line memo..."
                            className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                          />
                        </td>

                        {/* Debit Input (Rule 1 & Rule 2: Non-negative, single side only) */}
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={line.debit === 0 ? '' : line.debit}
                            onChange={(e) => handleDebitChange(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                            onPaste={(e) => {
                              const paste = e.clipboardData.getData('text');
                              if (paste.includes('-')) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="0.00"
                            className={`w-full px-2.5 py-1.5 border rounded text-xs text-right font-mono font-semibold transition-colors focus:outline-hidden focus:ring-1 focus:ring-blue-600 ${
                              isDebitFilled
                                ? 'bg-blue-50/70 text-blue-900 border-blue-300'
                                : 'border-slate-300 text-slate-700'
                            }`}
                          />
                          {line.accountId && line.debit === 0 && line.credit === 0 && (
                            <span className="text-[10px] text-amber-600 block text-right font-medium mt-0.5">
                              Amount required
                            </span>
                          )}
                        </td>

                        {/* Credit Input (Rule 1 & Rule 2: Non-negative, single side only) */}
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={line.credit === 0 ? '' : line.credit}
                            onChange={(e) => handleCreditChange(index, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                              }
                            }}
                            onPaste={(e) => {
                              const paste = e.clipboardData.getData('text');
                              if (paste.includes('-')) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="0.00"
                            className={`w-full px-2.5 py-1.5 border rounded text-xs text-right font-mono font-semibold transition-colors focus:outline-hidden focus:ring-1 focus:ring-blue-600 ${
                              isCreditFilled
                                ? 'bg-emerald-50/70 text-emerald-900 border-emerald-300'
                                : 'border-slate-300 text-slate-700'
                            }`}
                          />
                          {line.accountId && line.debit === 0 && line.credit === 0 && (
                            <span className="text-[10px] text-amber-600 block text-right font-medium mt-0.5">
                              Amount required
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Auto balance helper */}
                            {difference > 0 && (line.debit === 0 || line.credit === 0) && (
                              <button
                                type="button"
                                title="Auto-fill difference onto this row"
                                onClick={() => handleAutoBalance(index)}
                                className="px-1.5 py-1 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded cursor-pointer transition-colors"
                              >
                                Balance
                              </button>
                            )}

                            {/* Delete line */}
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(index)}
                              disabled={lines.length <= 2}
                              title={lines.length <= 2 ? 'Minimum 2 lines required' : 'Delete line'}
                              className={`p-1.5 rounded transition-colors ${
                                lines.length <= 2
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Grid Bottom Bar: Add Row & Quick Guidelines */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 rounded cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>

              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>Total Lines: <strong className="text-slate-800">{lines.length}</strong></span>
                <span className="text-slate-300">|</span>
                <span>Valid Lines: <strong className="text-blue-700">{validationSummary.validLineCount}</strong> of {lines.length}</span>
                <span className="text-slate-300">|</span>
                <span>Posting Accounts: <strong className="text-blue-700">{postableAccounts.length}</strong></span>
              </div>
            </div>
          </div>

          {/* 4. Double-Entry Balancing & Summary Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Double-Entry Equation Status (Rule 7, 8, 9: BALANCED, UNBALANCED, INCOMPLETE) */}
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Double-Entry Equation Status
                </span>
                {validationSummary.status === 'BALANCED' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold tracking-wide">STATUS: BALANCED</div>
                      <div className="text-[10px] text-emerald-700 font-normal">
                        {validationSummary.validLineCount} valid lines • Total Debits ($ {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) = Total Credits ($ {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </div>
                    </div>
                  </div>
                )}

                {validationSummary.status === 'UNBALANCED' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <div className="font-bold tracking-wide">STATUS: UNBALANCED</div>
                      <div className="text-[10px] text-red-700 font-normal">
                        Difference of ${difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • Total Debits must equal Total Credits before posting
                      </div>
                    </div>
                  </div>
                )}

                {validationSummary.status === 'INCOMPLETE' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold tracking-wide">STATUS: INCOMPLETE</div>
                      <div className="text-[10px] text-amber-700 font-normal">
                        {validationSummary.statusMessage}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Debits & Total Credits Cards */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-3 justify-end">
                <div className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-right min-w-[150px]">
                  <span className="text-[10px] uppercase tracking-wider text-blue-700 font-bold block">
                    Total Debit
                  </span>
                  <span className="text-base font-bold font-mono text-blue-900">
                    ${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-right min-w-[150px]">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold block">
                    Total Credit
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-900">
                    ${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className={`w-full sm:w-auto px-4 py-2.5 rounded-lg border text-right min-w-[130px] ${
                  validationSummary.status === 'BALANCED'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                    : validationSummary.status === 'UNBALANCED'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <span className="text-[10px] uppercase tracking-wider font-bold block">
                    Difference
                  </span>
                  <span className="text-base font-bold font-mono">
                    ${difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Form Bottom Actions Toolbar (Rule 10 & 11) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Accountix Notice:</span>
              <span>Day 2.2 Debit/Credit Validation enforces double-entry balancing and prevents posting of unbalanced or incomplete entries.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3.5 py-2 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (lines.some((l) => l.accountId && (l.debit > 0 || l.credit > 0))) {
                    setPreviewVoucher({
                      id: 'draft_preview',
                      voucherNo,
                      date: voucherDate,
                      companyId: activeCompany.id,
                      financialYearId: activeFinancialYear.id,
                      journalType,
                      referenceNo: referenceNo || 'N/A',
                      narration: narration || 'General Journal entry preview',
                      totalDebit,
                      totalCredit,
                      lines: lines.filter((l) => l.accountId),
                      status: validationSummary.isBalanced ? 'VERIFIED' : 'Draft',
                      createdAt: new Date().toISOString(),
                    });
                  } else {
                    showNotification('info', 'Preview Unavailable', 'Please select at least one account line to preview voucher.');
                  }
                }}
                className="px-3.5 py-2 rounded text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Preview</span>
              </button>

              {/* Rule 11: Save Draft (Compatible with validation, no ledger update) */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                title="Save as Draft without ledger posting"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </button>

              {/* Rule 10: Post Entry (Disabled/blocked when status is UNBALANCED or INCOMPLETE) */}
              <button
                type="button"
                onClick={handlePostEntry}
                disabled={validationSummary.status !== 'BALANCED'}
                title={
                  validationSummary.status !== 'BALANCED'
                    ? `Posting blocked: Entry status is ${validationSummary.status}. ${validationSummary.statusMessage}`
                    : 'Post balanced journal voucher'
                }
                className={`px-4 py-2 rounded text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all ${
                  validationSummary.status === 'BALANCED'
                    ? 'text-white bg-blue-700 hover:bg-blue-800 cursor-pointer shadow-sm'
                    : 'text-slate-400 bg-slate-100 border border-slate-300 cursor-not-allowed opacity-75'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Post Entry</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= JOURNAL REGISTER (HISTORY) SCREEN ================= */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50/40">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Journal Voucher Register (JV Book)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Archived journal entries for {activeCompany.name} ({activeFinancialYear.yearCode})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('NEW_ENTRY')}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Entry</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-blue-50/90 text-blue-900 font-semibold border-b border-blue-100">
                  <th className="py-2.5 px-3 w-32">Voucher No</th>
                  <th className="py-2.5 px-3 w-28">Voucher Date</th>
                  <th className="py-2.5 px-3 w-36">Journal Category</th>
                  <th className="py-2.5 px-3 w-32">Reference</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Narration</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total Debit ($)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total Credit ($)</th>
                  <th className="py-2.5 px-3 w-24 text-center">Status</th>
                  <th className="py-2.5 px-3 w-36 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {voucherHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No journal vouchers recorded yet. Click "Create New Entry" to prepare your first entry.
                    </td>
                  </tr>
                ) : (
                  voucherHistory.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200/80">
                          {v.voucherNo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono whitespace-nowrap">
                        {formatDate(v.date)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {v.journalType}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {v.referenceNo || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900 truncate max-w-xs md:max-w-md">{v.narration}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs md:max-w-md font-mono">
                          {v.lines.map((l) => `${l.accountCode} (${l.debit > 0 ? `Dr $${l.debit}` : `Cr $${l.credit}`})`).join(' | ')}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-900 whitespace-nowrap">
                        ${v.totalDebit.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-900 whitespace-nowrap">
                        ${v.totalCredit.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          v.status === 'Draft'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {v.status || 'Draft'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Open / Edit Button */}
                          <button
                            type="button"
                            onClick={() => loadDraftIntoForm(v)}
                            title="Open & Edit Saved Draft with original lines"
                            className="px-2 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-blue-600" />
                            <span>Open / Edit</span>
                          </button>

                          {/* Print / Inspect */}
                          <button
                            type="button"
                            onClick={() => setPreviewVoucher(v)}
                            title="Inspect & Print Voucher"
                            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Draft Button */}
                          <button
                            type="button"
                            onClick={() => setDraftToDelete(v)}
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
        </div>
      )}

      {/* ================= DELETE DRAFT CONFIRMATION MODAL ================= */}
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
                  <span className="text-slate-500 font-sans">Amount:</span> ${draftToDelete.totalDebit.toFixed(2)}
                </div>
                <div className="truncate">
                  <span className="text-slate-500 font-sans">Narration:</span>{' '}
                  <span className="font-sans text-slate-700">{draftToDelete.narration}</span>
                </div>
              </div>
              <p className="text-red-600 font-medium">
                This action is permanent. The draft will be permanently removed from your register.
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
                onClick={() => {
                  const deleted = journalDraftService.deleteDraft(activeCompany.id, draftToDelete.id);
                  if (deleted) {
                    showNotification(
                      'info',
                      'Draft Deleted',
                      `Journal Draft "${draftToDelete.voucherNo}" has been removed from the drafts register.`
                    );
                    if (editingDraftId === draftToDelete.id) {
                      handleResetForm();
                    }
                  }
                  setDraftToDelete(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINT / INSPECT MODAL ================= */}
      {previewVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-blue-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-bold text-sm">Accounting Voucher — Journal Voucher (JV)</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVoucher(null)}
                className="text-blue-200 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voucher Printable Layout */}
            <div className="p-6 bg-white space-y-5 text-xs text-slate-800">
              {/* Organization Header */}
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-blue-900">{activeCompany.name}</h2>
                  <p className="text-slate-600 mt-0.5">{activeCompany.address}, {activeCompany.city}</p>
                  <p className="text-slate-500 text-[11px]">Tax NTN: {activeCompany.ntn || '102934-8'} | Currency: {activeCompany.currency || 'USD'}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold text-xs uppercase tracking-wider border border-blue-200">
                    JOURNAL VOUCHER
                  </span>
                  <div className="font-mono font-bold text-sm text-slate-900 mt-2">{previewVoucher.voucherNo}</div>
                  <div className="text-slate-500 text-[11px] font-mono">Date: {formatDate(previewVoucher.date)}</div>
                </div>
              </div>

              {/* Voucher Meta details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Financial Period:</span>
                  <span className="font-semibold text-slate-800">{activeFinancialYear.yearCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Reference / Document #:</span>
                  <span className="font-semibold text-slate-800">{previewVoucher.referenceNo || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[11px]">General Narration:</span>
                  <span className="font-medium text-slate-800">{previewVoucher.narration}</span>
                </div>
              </div>

              {/* Voucher Lines Table */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-50 text-blue-900 font-bold border-b border-blue-100">
                    <tr>
                      <th className="py-2 px-3 w-12 text-center">#</th>
                      <th className="py-2 px-3 w-28">Code</th>
                      <th className="py-2 px-3">Account Title & Particulars</th>
                      <th className="py-2 px-3 w-28 text-right">Debit ($)</th>
                      <th className="py-2 px-3 w-28 text-right">Credit ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {previewVoucher.lines.map((l, i) => (
                      <tr key={l.id}>
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{i + 1}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-blue-900">{l.accountCode}</td>
                        <td className="py-2 px-3">
                          <div className="text-slate-900">{l.accountName}</div>
                          {l.narration && (
                            <div className="text-[11px] text-slate-500 italic mt-0.5">{l.narration}</div>
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
                    {/* Totals row */}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-slate-700">
                        Total Voucher Amount:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-900 text-sm">
                        ${previewVoucher.totalDebit.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-900 text-sm">
                        ${previewVoucher.totalCredit.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures block */}
              <div className="pt-8 grid grid-cols-4 gap-4 text-center text-[11px] text-slate-600">
                <div className="border-t border-slate-300 pt-1.5 font-medium">Prepared By</div>
                <div className="border-t border-slate-300 pt-1.5 font-medium">Checked By</div>
                <div className="border-t border-slate-300 pt-1.5 font-medium">Approved By</div>
                <div className="border-t border-slate-300 pt-1.5 font-medium">Audited By</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                System Status: {previewVoucher.status} | Company ID: {previewVoucher.companyId}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewVoucher(null)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
