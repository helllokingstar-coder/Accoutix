/**
 * ACCOUNTIX - Financial Reports & Ledger View
 * Supports Customer Ledger, Supplier Ledger, Combined Party Ledger, Day Book, and Cash Book.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';
import { Voucher } from '../../types/accounting';
import {
  FileSpreadsheet,
  Calendar,
  Wallet,
  Users,
  Search,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Building,
} from 'lucide-react';

interface LedgerReportViewProps {
  initialReportType?: 'CUSTOMER' | 'SUPPLIER' | 'COMBINED' | 'DAY_BOOK' | 'CASH_BOOK';
}

export const LedgerReportView: React.FC<LedgerReportViewProps> = ({
  initialReportType = 'COMBINED',
}) => {
  const { parties, vouchers, activeFinancialYear } = useApp();
  const [reportType, setReportType] = useState(initialReportType);

  // Default to dual-role party (Apex Engineering) for combined ledger demo
  const dualRoleParty = parties.find((p) => p.roles.isCustomer && p.roles.isSupplier) || parties[0];
  const [selectedPartyId, setSelectedPartyId] = useState(dualRoleParty.id);

  const selectedParty = parties.find((p) => p.id === selectedPartyId) || parties[0];

  const formatCurrency = (amt: number) => {
    return `$${Math.abs(amt).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Filter vouchers according to active report type
  const relevantVouchers = useMemo(() => {
    const postedOnly = vouchers.filter((v) => v.status === 'POSTED');

    if (reportType === 'CUSTOMER') {
      return postedOnly.filter(
        (v) =>
          v.partyId === selectedPartyId ||
          v.entries.some((e) => e.partyId === selectedPartyId && e.accountCode === '1100')
      );
    }

    if (reportType === 'SUPPLIER') {
      return postedOnly.filter(
        (v) =>
          v.partyId === selectedPartyId ||
          v.entries.some((e) => e.partyId === selectedPartyId && e.accountCode === '2010')
      );
    }

    if (reportType === 'COMBINED') {
      return postedOnly.filter(
        (v) =>
          v.partyId === selectedPartyId ||
          v.entries.some((e) => e.partyId === selectedPartyId)
      );
    }

    if (reportType === 'CASH_BOOK') {
      return postedOnly.filter((v) =>
        v.entries.some((e) => e.accountCode === '1010')
      );
    }

    // DAY_BOOK: all posted financial vouchers
    return postedOnly;
  }, [vouchers, reportType, selectedPartyId]);

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              General Ledger & Books of Accounts
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Audited Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time transaction registers, subledger balances, and combined customer/supplier accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. Report Type Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md overflow-x-auto no-scrollbar">
          <button
            onClick={() => setReportType('COMBINED')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'COMBINED'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Combined Party Ledger (Dual-Role)
          </button>
          <button
            onClick={() => setReportType('CUSTOMER')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'CUSTOMER'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer Ledger
          </button>
          <button
            onClick={() => setReportType('SUPPLIER')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'SUPPLIER'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Supplier Ledger
          </button>
          <button
            onClick={() => setReportType('DAY_BOOK')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'DAY_BOOK'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Day Book (All Vouchers)
          </button>
          <button
            onClick={() => setReportType('CASH_BOOK')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              reportType === 'CASH_BOOK'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cash Book
          </button>
        </div>

        {/* Party selector when viewing party ledgers */}
        {(reportType === 'COMBINED' || reportType === 'CUSTOMER' || reportType === 'SUPPLIER') && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Party:</span>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="px-2.5 py-1 text-xs bg-blue-50/40 border border-blue-100 rounded text-slate-900 font-semibold"
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.roles.isCustomer && p.roles.isSupplier ? '★ Dual-Role' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Combined Party Ledger Notice if active */}
      {reportType === 'COMBINED' && (
        <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
          <Building className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 text-sm">
                Combined Statement: {selectedParty.name} ({selectedParty.code})
              </span>
              <span className="font-mono text-xs px-2 py-0.5 bg-blue-200 text-blue-900 rounded font-semibold">
                Net Position: {selectedParty.netBalance > 0 ? `${formatCurrency(selectedParty.netBalance)} Dr (Receivable)` : `${formatCurrency(selectedParty.netBalance)} Cr (Payable)`}
              </span>
            </div>
            <p className="text-slate-600">
              This statement merges customer-side sales/receipts with supplier-side purchases/payments.
              Underlying statutory accounting entries remain strictly separated in <strong>Accounts Receivable</strong> and{' '}
              <strong>Accounts Payable</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 4. Ledger Data Table */}
      <div className="bg-white border border-blue-100 rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-white border-b border-blue-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">
            {reportType === 'COMBINED' && `Combined Ledger for ${selectedParty.name}`}
            {reportType === 'CUSTOMER' && `Customer Subledger for ${selectedParty.name}`}
            {reportType === 'SUPPLIER' && `Supplier Subledger for ${selectedParty.name}`}
            {reportType === 'DAY_BOOK' && `Day Book - All Posted Financial Vouchers`}
            {reportType === 'CASH_BOOK' && `Cash Book - Liquid Vault Receipts & Payments`}
          </span>
          <span className="font-mono text-blue-700 text-[11px] font-medium">
            Period: {formatDate(activeFinancialYear?.startDate || '2026-04-01')} to {formatDate(activeFinancialYear?.endDate || '2027-03-31')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-50 text-[11px] uppercase tracking-wider text-blue-950 border-b border-blue-200 font-bold">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Voucher No</th>
                <th className="px-4 py-2.5">Type</th>
                {reportType === 'COMBINED' && <th className="px-4 py-2.5">Role Context</th>}
                <th className="px-4 py-2.5">Account / Particulars</th>
                <th className="px-4 py-2.5 text-right">Debit ($)</th>
                <th className="px-4 py-2.5 text-right">Credit ($)</th>
                <th className="px-4 py-2.5 text-right">Net Balance ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {relevantVouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={reportType === 'COMBINED' ? 8 : 7}
                    className="py-8 text-center text-slate-400"
                  >
                    No posted ledger vouchers found for this selection.
                  </td>
                </tr>
              ) : (
                relevantVouchers.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-700">{formatDate(v.date)}</td>
                    <td className="px-4 py-3 font-mono font-medium text-blue-700">{v.voucherNo}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {v.voucherType.replace('_', ' ')}
                      </span>
                    </td>
                    {reportType === 'COMBINED' && (
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          {v.voucherType.includes('SALE') || v.voucherType.includes('RECEIPT') ? 'CUSTOMER' : 'SUPPLIER'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{v.partyName || 'General Account'}</div>
                      <div className="text-[11px] text-slate-500">{v.narration}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {formatCurrency(v.totalDebit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {formatCurrency(v.totalCredit)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(v.totalDebit)} Dr
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
