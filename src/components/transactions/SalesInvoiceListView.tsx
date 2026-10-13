/**
 * ACCOUNTIX - Sales Invoicing Workspace & Report View
 * Real-time ledger-connected register of all Cash & Credit Sales,
 * Drafts, Invoice Document Previews, and Cancellation/Reversals.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';
import {
  salesInvoiceService,
  SalesInvoice,
} from '../../services/salesInvoiceService';
import {
  Plus,
  Search,
  Printer,
  Eye,
  Edit,
  Trash2,
  FileText,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building,
  User,
  CreditCard,
  Banknote,
  Calendar,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { SaleInvoiceModal } from './SaleInvoiceModal';
import { InvoicePreviewModal } from './InvoicePreviewModal';

interface SalesInvoiceListViewProps {
  defaultFilter?: 'ALL' | 'CASH' | 'CREDIT' | 'DRAFT';
  isReportView?: boolean;
}

export const SalesInvoiceListView: React.FC<SalesInvoiceListViewProps> = ({
  defaultFilter = 'ALL',
  isReportView = false,
}) => {
  const {
    activeCompany,
    activeFinancialYear,
    openModal,
    showNotification,
    refreshKPIs,
    refreshParties,
    refreshItems,
    refreshVouchers,
    setCurrentView,
  } = useApp();

  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CASH' | 'CREDIT' | 'DRAFT'>(
    defaultFilter
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'POSTED' | 'DRAFT' | 'CANCELLED'>('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<SalesInvoice | null>(null);
  const [invoiceToPreview, setInvoiceToPreview] = useState<SalesInvoice | null>(null);
  const [invoiceToCancel, setInvoiceToCancel] = useState<SalesInvoice | null>(null);

  // Load invoices & subscribe to changes
  useEffect(() => {
    const load = () => {
      setInvoices(
        salesInvoiceService.getInvoices({
          companyId: activeCompany?.id,
          financialYearId: activeFinancialYear?.id,
        })
      );
    };

    load();
    const unsubscribe = salesInvoiceService.subscribe(load);
    return () => unsubscribe();
  }, [activeCompany, activeFinancialYear]);

  // Filtered List
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Tab filter
      if (activeTab === 'CASH' && inv.saleType !== 'CASH') return false;
      if (activeTab === 'CREDIT' && inv.saleType !== 'CREDIT') return false;
      if (activeTab === 'DRAFT' && inv.status !== 'DRAFT') return false;

      // Status filter
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;

      // Location filter
      if (locationFilter !== 'ALL' && inv.storeLocation !== locationFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNo = inv.invoiceNo.toLowerCase().includes(q);
        const matchesCustomer = inv.customerName.toLowerCase().includes(q);
        const matchesRef = inv.referenceNo?.toLowerCase().includes(q);
        if (!matchesNo && !matchesCustomer && !matchesRef) return false;
      }

      return true;
    });
  }, [invoices, activeTab, statusFilter, locationFilter, searchQuery]);

  // Summary KPIs
  const totalSalesVolume = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'POSTED')
        .reduce((sum, i) => sum + i.grandTotal, 0),
    [invoices]
  );

  const totalCashCollected = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'POSTED')
        .reduce((sum, i) => sum + i.amountReceived, 0),
    [invoices]
  );

  const totalReceivableBalance = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'POSTED' && i.saleType === 'CREDIT')
        .reduce((sum, i) => sum + i.balanceDue, 0),
    [invoices]
  );

  const totalTaxOutput = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'POSTED')
        .reduce((sum, i) => sum + i.taxTotal, 0),
    [invoices]
  );

  // Cancellation handler
  const handleConfirmCancel = () => {
    if (!invoiceToCancel) return;
    const result = salesInvoiceService.cancelInvoice(invoiceToCancel.id);
    setInvoiceToCancel(null);

    if (result.success) {
      refreshKPIs();
      refreshParties();
      refreshItems();
      refreshVouchers();
      showNotification(
        'warning',
        'Invoice Cancelled',
        result.message
      );
    } else {
      showNotification('warning', 'Cancellation Failed', result.message);
    }
  };

  const formatCurrency = (amt: number) => {
    return `$${Number(amt || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isReportView ? 'Sales Register & Transaction Report' : 'Sales Invoicing Management'}
            </h1>
            <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Audited Books
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cash & Credit sales registers, product stock adjustments, and double-entry General Ledger verification.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Register</span>
          </button>
          {!isReportView && (
            <button
              type="button"
              onClick={() => setCurrentView('tx_sale_invoice')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Sale Invoice (F8)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-lg border border-blue-100 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Total Posted Sales:</span>
          <span className="text-lg font-black text-slate-900 font-mono">
            {formatCurrency(totalSalesVolume)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {invoices.filter((i) => i.status === 'POSTED').length} Posted Vouchers
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-lg border border-blue-100 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Cash Received:</span>
          <span className="text-lg font-black text-emerald-700 font-mono">
            {formatCurrency(totalCashCollected)}
          </span>
          <span className="text-[10px] text-emerald-600 block">Vault & Bank Liquidity</span>
        </div>

        <div className="p-3.5 bg-white rounded-lg border border-blue-100 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Receivables / Credit:</span>
          <span className="text-lg font-black text-amber-700 font-mono">
            {formatCurrency(totalReceivableBalance)}
          </span>
          <span className="text-[10px] text-amber-600 block">Customer Trade Balance</span>
        </div>

        <div className="p-3.5 bg-white rounded-lg border border-blue-100 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Sales Tax Liability:</span>
          <span className="text-lg font-black text-blue-800 font-mono">
            {formatCurrency(totalTaxOutput)}
          </span>
          <span className="text-[10px] text-blue-600 block">Output Tax (Acc 2050)</span>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs no-print">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('CASH')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'CASH'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cash Sales ({invoices.filter((i) => i.saleType === 'CASH').length})
          </button>
          <button
            onClick={() => setActiveTab('CREDIT')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'CREDIT'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Credit Sales ({invoices.filter((i) => i.saleType === 'CREDIT').length})
          </button>
          <button
            onClick={() => setActiveTab('DRAFT')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'DRAFT'
                ? 'bg-white text-blue-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Drafts ({invoices.filter((i) => i.status === 'DRAFT').length})
          </button>
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice or customer..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="POSTED">POSTED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* 4. Invoices Data Table */}
      <div className="bg-white border border-blue-100 rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-white border-b border-blue-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">
            Registered Sales Invoices ({filteredInvoices.length} Records)
          </span>
          <span className="font-mono text-blue-700 text-[11px] font-medium">
            Company: {activeCompany?.name} | FY: {activeFinancialYear?.yearCode}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-blue-50/70 text-[11px] uppercase tracking-wider text-blue-950 border-b border-blue-200 font-bold">
              <tr>
                <th className="px-3.5 py-2.5">Date</th>
                <th className="px-3.5 py-2.5">Invoice No</th>
                <th className="px-3.5 py-2.5">Customer / Party Name</th>
                <th className="px-3.5 py-2.5">Type</th>
                <th className="px-3.5 py-2.5">Store / Location</th>
                <th className="px-3.5 py-2.5 text-center">Lines</th>
                <th className="px-3.5 py-2.5 text-right">Total ($)</th>
                <th className="px-3.5 py-2.5 text-right">Received ($)</th>
                <th className="px-3.5 py-2.5 text-right">Balance ($)</th>
                <th className="px-3.5 py-2.5 text-center">Status</th>
                <th className="px-3.5 py-2.5 text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No sales invoices found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                      {formatDate(inv.invoiceDate)}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-bold text-blue-800 whitespace-nowrap">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="font-medium text-slate-900">{inv.customerName}</div>
                      {inv.referenceNo && (
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {inv.referenceNo}</div>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          inv.saleType === 'CASH'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : inv.saleType === 'CREDIT'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {inv.saleType}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-500 text-[11px] max-w-36 truncate">
                      {inv.storeLocation}
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-mono text-[11px] text-slate-600">
                      {inv.lines.length}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-emerald-700 tabular-nums font-semibold">
                      {formatCurrency(inv.amountReceived)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold tabular-nums">
                      <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        {formatCurrency(inv.balanceDue)}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'POSTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center whitespace-nowrap no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setInvoiceToPreview(inv)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                          title="Preview & Print Invoice Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceToEdit(inv)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                          title="Open & Edit Invoice"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {inv.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => setInvoiceToCancel(inv)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            title="Cancel / Reverse Invoice"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modals */}
      {/* Create Modal */}
      {isCreateModalOpen && (
        <SaleInvoiceModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {/* Edit Modal */}
      {invoiceToEdit && (
        <SaleInvoiceModal
          initialInvoice={invoiceToEdit}
          onClose={() => setInvoiceToEdit(null)}
        />
      )}

      {/* Preview & Print Modal */}
      {invoiceToPreview && (
        <InvoicePreviewModal
          invoice={invoiceToPreview}
          onClose={() => setInvoiceToPreview(null)}
          onEdit={(inv) => {
            setInvoiceToPreview(null);
            setInvoiceToEdit(inv);
          }}
        />
      )}

      {/* Cancellation Confirmation Dialog */}
      {invoiceToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">
                Cancel & Reverse Invoice {invoiceToCancel.invoiceNo}?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this invoice?
              {invoiceToCancel.status === 'POSTED' && (
                <span className="block mt-1 font-medium text-slate-800">
                  This will restore deducted inventory back into stock and reverse the unpaid customer balance of ${invoiceToCancel.balanceDue.toFixed(2)}.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInvoiceToCancel(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
              >
                No, Keep Invoice
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded cursor-pointer shadow-xs"
              >
                Yes, Cancel Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
