/**
 * ACCOUNTIX - Module Foundation Preview View
 * Displays clear architectural specifications, data contracts, and quick actions
 * for modules scheduled for upcoming stage expansions.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  CheckCircle2,
  Database,
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';
import { AppViewId } from '../../types/navigation';

interface ModuleConfig {
  title: string;
  category: string;
  description: string;
  mssqlTables: string[];
  keyInvariants: string[];
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export const ModulePlaceholderView: React.FC<{ viewId: AppViewId }> = ({ viewId }) => {
  const { setCurrentView, openModal } = useApp();

  const getModuleConfig = (): ModuleConfig => {
    switch (viewId) {
      case 'tx_purchase_invoice':
        return {
          title: 'Purchase Invoice (Procurement Voucher)',
          category: 'Transactions',
          description:
            'Inward billing for stock goods and operational services with automatic supplier credit and input tax recognition.',
          mssqlTables: ['dbo.Vouchers', 'dbo.VoucherEntries', 'dbo.VoucherLineItems', 'dbo.Items'],
          keyInvariants: [
            'Debits 1200 Inventory Asset or Expense account',
            'Credits 2010 Accounts Payable (Sundry Creditors)',
            'Increases CurrentStock for physical Products only',
          ],
          primaryActionLabel: 'Open Sample Sale Invoice',
          onPrimaryAction: () => setCurrentView('tx_sale_invoice'),
        };
      case 'tx_cash_receipt':
        return {
          title: 'Cash Receipt Voucher (F6)',
          category: 'Transactions',
          description:
            'Direct receipt of physical vault currency against customer invoices, loans, or miscellaneous income.',
          mssqlTables: ['dbo.Vouchers', 'dbo.VoucherEntries', 'dbo.Parties', 'dbo.Accounts'],
          keyInvariants: [
            'Debits 1010 Cash in Hand',
            'Credits 1100 Accounts Receivable (Sundry Debtors)',
            'Real-time verification: Total Debit == Total Credit',
          ],
        };
      case 'tx_cash_payment':
        return {
          title: 'Cash Payment Voucher (F5)',
          category: 'Transactions',
          description:
            'Disbursement of cash funds to trade suppliers, utility vendors, or operational expense heads.',
          mssqlTables: ['dbo.Vouchers', 'dbo.VoucherEntries', 'dbo.Parties', 'dbo.Accounts'],
          keyInvariants: [
            'Debits 2010 Accounts Payable or Expense Account',
            'Credits 1010 Cash in Hand',
            'Requires cash drawer balance sufficiency check',
          ],
        };
      case 'tx_journal_entry':
        return {
          title: 'General Journal Entry (F7)',
          category: 'Transactions',
          description:
            'Manual multi-legged double-entry journal vouchers for accruals, adjustments, and year-end depreciation.',
          mssqlTables: ['dbo.Vouchers', 'dbo.VoucherEntries', 'dbo.Accounts'],
          keyInvariants: [
            'Strict equation check: sum(debit) == sum(credit)',
            'Supports compound entries with arbitrary accounts',
            'Requires line-level narrations for audit trails',
          ],
        };
      case 'tx_contra_entry':
        return {
          title: 'Contra Voucher (F4)',
          category: 'Transactions',
          description:
            'Internal cash-to-bank and bank-to-bank liquidity transfers without affecting income or expense.',
          mssqlTables: ['dbo.Vouchers', 'dbo.VoucherEntries', 'dbo.Accounts'],
          keyInvariants: [
            'Permits only Cash (1010) and Bank (1020) accounts',
            'Neutralizes net liquid asset delta',
          ],
        };
      case 'banking_accounts':
      case 'banking_receipt':
      case 'banking_payment':
      case 'banking_transfer':
      case 'banking_other_tx':
      case 'banking_reconciliation':
      case 'banking_cheque_register':
        return {
          title: 'Banking & Liquidity Management',
          category: 'Banking',
          description:
            'Corporate bank accounts, cheque book registries, and automated bank reconciliation statements.',
          mssqlTables: ['dbo.Accounts', 'dbo.Vouchers', 'dbo.VoucherEntries'],
          keyInvariants: [
            'Reconciliation statement calculates difference between ledger and bank balance',
            'Supports unpresented cheques and uncredited deposits',
          ],
        };
      case 'inv_stock_summary':
      case 'inv_stock_adjustment':
      case 'inv_stock_transfer':
      case 'inv_stock_in':
      case 'inv_stock_out':
      case 'inv_stock_ledger':
      case 'inv_valuation':
      case 'inv_locations':
      case 'inv_reorder_status':
        return {
          title: 'Inventory & Store Management',
          category: 'Inventory',
          description:
            'Multi-warehouse stock valuation, physical inventory adjustments, and automated reorder tracking.',
          mssqlTables: ['dbo.Items', 'dbo.ItemCategories', 'dbo.UnitsOfMeasurement'],
          keyInvariants: [
            'Applies exclusively to physical Products; Services are excluded',
            'FIFO / Weighted Average stock valuation engine',
          ],
          primaryActionLabel: 'View Products & Services Catalog',
          onPrimaryAction: () => setCurrentView('masters_products'),
        };
      case 'mfg_raw_materials':
        return {
          title: 'Raw Materials Master',
          category: 'Manufacturing',
          description:
            'Raw materials inventory classification, procurement lead times, storage requirements, and minimum reorder buffers.',
          mssqlTables: ['dbo.Items', 'dbo.ItemCategories', 'dbo.BillOfMaterialsItems', 'dbo.StockLedger'],
          keyInvariants: [
            'Classified under Raw Materials inventory asset (1210 Raw Materials)',
            'Direct input components for Bill of Materials (BOM) formulas',
            'Tracked by standard physical Units of Measurement (UOM)',
          ],
          primaryActionLabel: 'View Products Catalog',
          onPrimaryAction: () => setCurrentView('masters_products'),
        };
      case 'mfg_finished_goods':
        return {
          title: 'Finished Goods Master',
          category: 'Manufacturing',
          description:
            'Finished products manufactured in-house, bill of materials linkage, batch coding, and standard production valuation.',
          mssqlTables: ['dbo.Items', 'dbo.BillOfMaterials', 'dbo.StockLedger', 'dbo.Vouchers'],
          keyInvariants: [
            'Classified under Finished Goods inventory asset (1220 Finished Goods)',
            'Target output item generated by Production Entry vouchers',
            'Available for commercial sales invoicing and dispatch',
          ],
          primaryActionLabel: 'View Products Catalog',
          onPrimaryAction: () => setCurrentView('masters_products'),
        };
      case 'mfg_bom':
        return {
          title: 'Bill of Materials (BOM)',
          category: 'Manufacturing',
          description:
            'Multi-level manufacturing recipes, standard quantity inputs, raw material proportions, and auxiliary production overheads.',
          mssqlTables: ['dbo.BillOfMaterials', 'dbo.BillOfMaterialsItems', 'dbo.Items'],
          keyInvariants: [
            'Defines exact raw material consumption required per unit of finished good',
            'Supports percentage-based standard scrap/wastage allowances',
            'Includes machine hours and direct labor overhead rates',
          ],
        };
      case 'mfg_production_entry':
        return {
          title: 'Production Entry',
          category: 'Manufacturing',
          description:
            'Record manufacturing runs: consumes raw materials from stock, issues to WIP, and credits finished goods inventory.',
          mssqlTables: ['dbo.ProductionOrders', 'dbo.Vouchers', 'dbo.VoucherEntries', 'dbo.StockLedger'],
          keyInvariants: [
            'Debits 1220 Finished Goods inventory asset',
            'Credits 1210 Raw Materials inventory asset',
            'Maintains strict double-entry balance: Material Cost + Overheads = Output Valuation',
          ],
        };
      case 'mfg_production_reversal':
        return {
          title: 'Production Reversal / Cancellation',
          category: 'Manufacturing',
          description:
            'Rollback erroneous or canceled production batches: reverses stock consumption and finished good additions.',
          mssqlTables: ['dbo.ProductionOrders', 'dbo.Vouchers', 'dbo.VoucherEntries', 'dbo.StockLedger'],
          keyInvariants: [
            'Restores raw materials back into warehouse stock balance',
            'Decrements finished goods stock with rigorous audit trail',
            'Generates balanced counter-journal vouchers in General Ledger',
          ],
        };
      case 'mfg_wastage_scrap':
        return {
          title: 'Wastage / Scrap',
          category: 'Manufacturing',
          description:
            'Log production spoilage, abnormal shrinkage, defect rejects, and secondary scrap inventory generation.',
          mssqlTables: ['dbo.StockAdjustments', 'dbo.Items', 'dbo.Vouchers', 'dbo.VoucherEntries'],
          keyInvariants: [
            'Normal wastage absorbed into finished goods cost per unit',
            'Abnormal wastage debited directly to 5090 Manufacturing Loss / Scrap Expense',
            'Segregates recyclable byproduct scrap for secondary resale',
          ],
        };
      case 'mfg_costing':
        return {
          title: 'Manufacturing Costing',
          category: 'Manufacturing',
          description:
            'Detailed unit cost breakdown: direct material, direct labor, factory power, depreciation, and absorption overheads.',
          mssqlTables: ['dbo.ProductionCosting', 'dbo.Accounts', 'dbo.CostCentres'],
          keyInvariants: [
            'Total Production Cost = Direct Materials + Direct Labor + Factory Overheads',
            'Variance analysis compares Standard BOM Cost against Actual Run Cost',
            'Computes Gross Margin potential against target sale price',
          ],
        };
      case 'mfg_reports':
        return {
          title: 'Manufacturing Reports',
          category: 'Manufacturing',
          description:
            'Comprehensive production logs, BOM consumption variance registers, WIP ledger balances, and scrap summaries.',
          mssqlTables: ['dbo.ProductionOrders', 'dbo.Vouchers', 'dbo.StockLedger'],
          keyInvariants: [
            'Daily/Monthly production batch register with date filters',
            'Reconciles physical inventory movement with accounting ledger balances',
            'Standardized DD/MM/YYYY date formatting across all registers',
          ],
        };
      case 'acc_trial_balance':
      case 'acc_opening_balances':
      case 'acc_cost_centres':
      case 'rep_trial_balance':
        return {
          title: 'General Ledger Accounts & Trial Balance',
          category: 'Accounts',
          description:
            'Complete Trial Balance listing all ledger heads with mathematical debit and credit totals.',
          mssqlTables: ['dbo.Accounts', 'dbo.VoucherEntries', 'dbo.Companies'],
          keyInvariants: [
            'Total Debit Column == Total Credit Column',
            'Rolls up into Balance Sheet and Profit & Loss',
          ],
          primaryActionLabel: 'View Chart of Accounts',
          onPrimaryAction: () => setCurrentView('masters_chart_of_accounts'),
        };
      case 'file_print_setup':
        return {
          title: 'Print Setup & Stationery Layouts',
          category: 'File',
          description:
            'Configure document printers, page sizes (A4, A5, 80mm POS thermal roll), and pre-printed voucher stationery formats.',
          mssqlTables: ['dbo.Companies', 'dbo.SystemConfig'],
          keyInvariants: [
            'Supports ESC/POS thermal printers and Windows GDI printers',
            'Company-specific letterhead and tax declaration notes',
          ],
        };
      case 'util_calculator':
      case 'util_date_calculator':
        return {
          title: 'Financial & Fiscal Date Calculator',
          category: 'Utilities',
          description:
            'Precision decimal calculator with sales tax computation, compound interest, and fiscal period maturity calculations.',
          mssqlTables: ['dbo.SystemConfig'],
          keyInvariants: [
            'Four-decimal precision rounding compliant with standard accounting practices',
            'Handles leap years and multi-year fiscal boundaries',
          ],
        };
      case 'util_import_data':
      case 'util_export_data':
        return {
          title: 'Data Migration & Bulk Interchange',
          category: 'Utilities',
          description:
            'Bulk import/export of Master records (Customers, Suppliers, Items) and Transaction journals in Excel/CSV/JSON formats.',
          mssqlTables: ['dbo.Parties', 'dbo.Items', 'dbo.Vouchers', 'dbo.VoucherEntries'],
          keyInvariants: [
            'Pre-validation verifies foreign keys before committing transaction batches',
            'Prevents unbalanced journal voucher imports',
          ],
        };
      case 'util_system_settings':
        return {
          title: 'ACCOUNTIX System Configuration',
          category: 'Utilities',
          description:
            'Enterprise accounting parameters, currency symbols, default GL accounts, invoice prefixes, and decimal precision.',
          mssqlTables: ['dbo.Companies', 'dbo.SystemConfig'],
          keyInvariants: [
            'Audit-logged changes to fiscal lock dates',
            'Enforces valid default accounts for cash and bank',
          ],
        };
      default:
        return {
          title: viewId.replace(/_/g, ' ').toUpperCase(),
          category: 'Accounting Foundation',
          description:
            'Architectural module prepared for expansion in the next development stage of ACCOUNTIX.',
          mssqlTables: ['dbo.Companies', 'dbo.Vouchers', 'dbo.Accounts'],
          keyInvariants: [
            'Double-entry mathematical integrity',
            'Microsoft SQL Server schema alignment',
          ],
        };
    }
  };

  const config = getModuleConfig();

  return (
    <div className="space-y-5 pb-12 max-w-4xl">
      {/* 1. Header with back button */}
      <div className="flex items-center gap-3 border-b border-blue-100 pb-4">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="p-1.5 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors"
          title="Return to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
              {config.category}
            </span>
            <span className="text-slate-300">/</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{config.title}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>
        </div>
      </div>

      {/* 2. Architecture Readiness Card */}
      <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">
              Architecture & Data Contract Prepared
            </span>
          </div>
          <span className="text-xs font-mono text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 font-semibold">
            Foundation Ready
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          As part of the initial foundation stage, the underlying business logic, state management, and database tables for{' '}
          <strong>{config.title}</strong> have been architected. When this module is expanded, it plugs directly into the
          existing shell without altering navigation or rebuilding core models.
        </p>

        {/* Database Tables */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Underlying Microsoft SQL Server Tables</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {config.mssqlTables.map((tbl) => (
              <span
                key={tbl}
                className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200"
              >
                {tbl}
              </span>
            ))}
          </div>
        </div>

        {/* Invariants */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Accounting Invariants Enforced</span>
          </span>
          <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
            {config.keyInvariants.map((inv, idx) => (
              <li key={idx}>{inv}</li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          {config.onPrimaryAction && (
            <button
              onClick={config.onPrimaryAction}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
            >
              {config.primaryActionLabel}
            </button>
          )}

          <button
            onClick={() => setCurrentView('util_mssql_schema')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium cursor-pointer"
          >
            Inspect MSSQL Table Schema
          </button>

          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 rounded text-xs font-medium cursor-pointer ml-auto"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
