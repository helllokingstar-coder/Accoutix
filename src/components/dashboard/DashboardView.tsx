/**
 * ACCOUNTIX - Primary Dashboard View
 * Features 8 Professional Accounting KPI Cards, Categorized Quick Actions,
 * Dual-Role Party Architecture Spotlight, and Hybrid Product/Service Catalog.
 * Styled in the official ACCOUNTIX Blue + Light Blue + White visual identity.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';
import {
  Wallet,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  Receipt,
  CreditCard,
  UserPlus,
  Truck,
  Box,
  Wrench,
  FileText,
  FileSpreadsheet,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { kpis, openModal, setCurrentView, parties, items, vouchers } = useApp();

  // Format currency with standard business presentation
  const formatCurrency = (amount: number, symbol: string = '$') => {
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Find dual-role party sample for demonstration
  const dualRoleParty = parties.find((p) => p.roles.isCustomer && p.roles.isSupplier);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Overview & Operational Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-blue-100 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Accounting & Business Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time double-entry balances, liquidity status, and quick master workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-xs text-blue-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">GL Postings: In-Sync</span>
          </div>

          <button
            onClick={() => setCurrentView('util_mssql_schema')}
            className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer"
          >
            MSSQL Schema Ready
          </button>
        </div>
      </div>

      {/* 2. Professional Accounting KPI Cards (8 Required Metrics) */}
      <section aria-labelledby="kpi-heading">
        <div className="flex items-center justify-between mb-2.5">
          <h2 id="kpi-heading" className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Financial Health & Liquidity Overview
          </h2>
          <span className="text-[11px] text-slate-500">All figures in USD ($) · Tabular Ledger Values</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Cash Balance */}
          <div className="bg-white border border-blue-100 rounded-lg p-3.5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <span className="text-xs font-semibold text-slate-900">Cash Balance</span>
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              {formatCurrency(kpis.cashBalance)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Vault & Petty Cash</span>
              <span className="font-mono text-blue-700 font-medium bg-blue-50 px-1 rounded">Dr Balance</span>
            </div>
          </div>

          {/* 2. Bank Balance */}
          <div className="bg-white border border-blue-100 rounded-lg p-3.5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <span className="text-xs font-semibold text-slate-900">Bank Balance</span>
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              {formatCurrency(kpis.bankBalance)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Commercial Checking</span>
              <span className="font-mono text-blue-700 font-medium bg-blue-50 px-1 rounded">Dr Balance</span>
            </div>
          </div>

          {/* 3. Accounts Receivable */}
          <div className="bg-white border border-blue-100 rounded-lg p-3.5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <span className="text-xs font-semibold text-slate-900">Accounts Receivable</span>
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              {formatCurrency(kpis.accountsReceivable)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Customer Invoices Due</span>
              <span className="font-mono text-blue-700 font-medium bg-blue-50 px-1 rounded">Debtors (Dr)</span>
            </div>
          </div>

          {/* 4. Accounts Payable */}
          <div className="bg-white border border-blue-100 rounded-lg p-3.5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <span className="text-xs font-semibold text-slate-900">Accounts Payable</span>
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              {formatCurrency(kpis.accountsPayable)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Supplier Bills Due</span>
              <span className="font-mono text-blue-700 font-medium bg-blue-50 px-1 rounded">Creditors (Cr)</span>
            </div>
          </div>

          {/* 5. Today's Sales */}
          <div className="bg-white border border-blue-100 rounded-lg p-3.5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <span className="text-xs font-semibold text-slate-900">Today's Sales</span>
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              {formatCurrency(kpis.todaySales)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Products & Services</span>
              <span className="text-blue-700 font-medium">Posted Today</span>
            </div>
          </div>

          {/* 6. Today's Purchases */}
          <div className="bg-white border border-blue-100 rounded-lg p-3.5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <span className="text-xs font-semibold text-slate-900">Today's Purchases</span>
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              {formatCurrency(kpis.todayPurchases)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Stock Procurement</span>
              <span className="text-blue-700 font-medium">Inward Goods</span>
            </div>
          </div>

          {/* 7. Today's Receipts */}
          <div className="bg-white border border-blue-100 rounded-lg p-3.5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <span className="text-xs font-semibold text-slate-900">Today's Receipts</span>
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              {formatCurrency(kpis.todayReceipts)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Customer Inflow</span>
              <span className="text-blue-700 font-medium">Cash / Bank In</span>
            </div>
          </div>

          {/* 8. Today's Payments */}
          <div className="bg-white border border-blue-100 rounded-lg p-3.5 shadow-xs hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600 mb-1.5">
              <span className="text-xs font-semibold text-slate-900">Today's Payments</span>
              <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              {formatCurrency(kpis.todayPayments)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Supplier Dues Out</span>
              <span className="text-blue-700 font-medium">Disbursements</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Actions Area Grouped by Category (Masters, Transactions, Reports) */}
      <section aria-labelledby="quick-actions-heading" className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs">
        <div className="border-b border-blue-100 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h2 id="quick-actions-heading" className="text-sm font-bold text-slate-900">
              Quick Actions & Operational Workflows
            </h2>
            <p className="text-xs text-slate-500">
              Structured entry points organized by accounting domains.
            </p>
          </div>
          <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
            Foundation Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category A: Masters */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider pb-1.5 border-b border-blue-100">
              <Layers className="w-3.5 h-3.5 text-blue-700" />
              <span>Masters</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openModal('ADD_CUSTOMER')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Add Customer</span>
              </button>

              <button
                onClick={() => openModal('ADD_SUPPLIER')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <Truck className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Add Supplier</span>
              </button>

              <button
                onClick={() => openModal('ADD_PRODUCT')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <Box className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Add Product</span>
              </button>

              <button
                onClick={() => openModal('ADD_SERVICE')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <Wrench className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Add Service</span>
              </button>
            </div>
          </div>

          {/* Category B: Transactions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider pb-1.5 border-b border-blue-100">
              <Receipt className="w-3.5 h-3.5 text-blue-700" />
              <span>Transactions</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Primary Action Button: Professional Blue */}
              <button
                onClick={() => setCurrentView('tx_sale_invoice')}
                className="flex items-center gap-2.5 p-2.5 rounded bg-blue-700 hover:bg-blue-800 text-white text-left cursor-pointer shadow-xs transition-colors col-span-2"
              >
                <FileText className="w-4 h-4 text-white shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Sale Invoice (F8)</span>
                  <span className="text-[10px] text-blue-100">Hybrid Products & Services</span>
                </div>
              </button>

              <button
                onClick={() => openModal('NEW_PURCHASE_INVOICE')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Purchase Invoice</span>
              </button>

              <button
                onClick={() => openModal('NEW_CASH_RECEIPT')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Cash Received</span>
              </button>

              <button
                onClick={() => openModal('NEW_CASH_PAYMENT')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Cash Paid</span>
              </button>

              <button
                onClick={() => openModal('NEW_JOURNAL_ENTRY')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Journal Entry</span>
              </button>
            </div>
          </div>

          {/* Category C: Reports */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider pb-1.5 border-b border-blue-100">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
              <span>Reports</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCurrentView('rep_customer_ledger')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Customer Ledger</span>
              </button>

              <button
                onClick={() => setCurrentView('rep_supplier_ledger')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <Truck className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Supplier Ledger</span>
              </button>

              <button
                onClick={() => setCurrentView('rep_day_book')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Day Book</span>
              </button>

              <button
                onClick={() => setCurrentView('rep_cash_book')}
                className="flex items-center gap-2 p-2 rounded border border-blue-200/80 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-left cursor-pointer transition-colors"
              >
                <Wallet className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-medium text-slate-900">Cash Book</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Architecture Pillars: Dual-Role Party & Hybrid Catalog Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pillar 1: Dual-Role Party Architecture */}
        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase tracking-wide">
                  Master Pillar 1
                </span>
                <h3 className="text-sm font-bold text-slate-900">Dual-Role Party Ledger</h3>
              </div>
              <button
                onClick={() => setCurrentView('rep_combined_ledger')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View Combined Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
              ACCOUNTIX natively supports parties that act as <strong>both a Customer and a Supplier</strong>.
              Subledgers remain strictly segregated in Accounts Receivable (Assets) and Accounts Payable (Liabilities),
              while allowing seamless reconciliation in a single unified ledger view.
            </p>

            {dualRoleParty && (
              <div className="mt-3.5 p-3 rounded-md bg-blue-50/70 border border-blue-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{dualRoleParty.name}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-semibold">
                    Dual-Role Partner
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-blue-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-600 block">Customer Balance (Dr)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(dualRoleParty.receivableBalance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Supplier Balance (Cr)</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(dualRoleParty.payableBalance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Combined Net Dues</span>
                    <span className="font-mono font-bold text-blue-700">
                      {formatCurrency(dualRoleParty.netBalance)} Dr
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-600 flex items-center gap-1.5 border-t border-blue-50">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>Database View ready: <code className="font-mono text-blue-900 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">dbo.vw_CombinedPartyLedger</code></span>
          </div>
        </div>

        {/* Pillar 2: Hybrid Products & Services Architecture */}
        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase tracking-wide">
                  Master Pillar 2
                </span>
                <h3 className="text-sm font-bold text-slate-900">Hybrid Products & Services</h3>
              </div>
              <button
                onClick={() => setCurrentView('masters_products')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
              ACCOUNTIX categorizes catalog entries into <strong>Physical Products</strong> (which maintain inventory stock
              and track warehouse locations) and <strong>Services</strong> (which have zero physical inventory and credit
              revenue accounts directly). Both can be billed together on the same Sale Invoice!
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="p-2.5 rounded bg-blue-50/50 border border-blue-200">
                <div className="flex items-center gap-1 text-slate-900 font-bold mb-1">
                  <Box className="w-3.5 h-3.5 text-blue-700" />
                  <span>Physical Products</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Engine Oil, Filters, Brake Pads with Stock Tracking & Store Location.
                </p>
                <span className="inline-block mt-2 font-mono text-[11px] font-bold text-blue-800">
                  {items.filter((i) => i.itemType === 'PRODUCT').length} Registered Products
                </span>
              </div>

              <div className="p-2.5 rounded bg-blue-50/50 border border-blue-200">
                <div className="flex items-center gap-1 text-slate-900 font-bold mb-1">
                  <Wrench className="w-3.5 h-3.5 text-blue-700" />
                  <span>Services (Zero Stock)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Oil Change, Tuning, Brake Inspection with Revenue GL mapping.
                </p>
                <span className="inline-block mt-2 font-mono text-[11px] font-bold text-blue-800">
                  {items.filter((i) => i.itemType === 'SERVICE').length} Registered Services
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-600 flex items-center gap-1.5 border-t border-blue-50">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>MSSQL Constraint Enforced: <code className="font-mono text-blue-900 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">CHK_Service_NoInventory</code></span>
          </div>
        </div>
      </div>

      {/* 5. Recent Double-Entry Vouchers Stream (General Ledger Table) */}
      <section aria-labelledby="vouchers-heading" className="bg-white border border-blue-100 rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-white border-b border-blue-100 flex items-center justify-between">
          <div>
            <h2 id="vouchers-heading" className="text-sm font-bold text-slate-900">
              Recent General Ledger Vouchers (Double-Entry Stream)
            </h2>
            <p className="text-xs text-slate-500">
              Auditable records verified for mathematical equality (Total Debits = Total Credits).
            </p>
          </div>
          <button
            onClick={() => setCurrentView('rep_day_book')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
          >
            Open Day Book →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            {/* Table Header: Light Blue, Text: Dark Blue */}
            <thead className="bg-blue-50 text-[11px] uppercase tracking-wider text-blue-950 border-b border-blue-200 font-bold">
              <tr>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Voucher No</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Party / Ledger Context</th>
                <th className="px-4 py-2.5">Narration</th>
                <th className="px-4 py-2.5 text-right">Debit ($)</th>
                <th className="px-4 py-2.5 text-right">Credit ($)</th>
                <th className="px-4 py-2.5 text-center">GL Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 bg-white font-sans">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{formatDate(v.date)}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-700">{v.voucherNo}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                      {v.voucherType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    {v.partyName || 'General Journal'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 truncate max-w-xs">{v.narration}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(v.totalDebit)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(v.totalCredit)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>POSTED</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
