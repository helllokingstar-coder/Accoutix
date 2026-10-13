/**
 * ACCOUNTIX - Architecture & Foundation Roadmap View
 * Documents the extensible architectural layers, MSSQL readiness, and design principles.
 */

import React from 'react';
import {
  Layers,
  Database,
  Building,
  CheckCircle2,
  Package,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ArchitectureGuideView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            ACCOUNTIX Foundation Architecture & Technical Roadmap
          </h1>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            Stage 1: Core Shell
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Clean, scalable, enterprise-grade architecture engineered for modular expansion, double-entry mathematical rigor,
          and native Microsoft SQL Server database readiness.
        </p>
      </div>

      {/* 2. Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1 */}
        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Building className="w-4 h-4" />
            <span>1. Dual-Role Party Architecture</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In traditional systems, customers and suppliers are siloed into conflicting entities. ACCOUNTIX models parties
            with flexible dual roles:
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>Customer-side transactions post to <strong>1100 Accounts Receivable</strong> (Asset).</li>
            <li>Supplier-side transactions post to <strong>2010 Accounts Payable</strong> (Liability).</li>
            <li>Combined Party Ledger joins both sides to display the net settlement position without violating standard statutory reporting.</li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Package className="w-4 h-4" />
            <span>2. Hybrid Products & Services Catalog</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Businesses commonly invoice goods and services concurrently (e.g. automotive repair shop selling Engine Oil and charging for Oil Change service):
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li><strong>Products</strong> track Opening Stock, Current Stock, Reorder Levels, and Warehouses.</li>
            <li><strong>Services</strong> possess zero stock, never create physical inventory, and directly credit Service Income.</li>
            <li>Sale Invoices bill both within a single verified double-entry document.</li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Double-Entry General Ledger Engine</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Statutory double-entry accounting guarantees every transaction balances mathematically:
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>Total Debits = Total Credits (Zero variance enforced).</li>
            <li>Asset and Expense accounts maintain natural debit balances.</li>
            <li>Liability, Equity, and Revenue accounts maintain natural credit balances.</li>
          </ul>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>4. Microsoft SQL Server Database Readiness</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The data models and schema files in <code className="font-mono text-blue-700">/src/database/mssql-schema.sql</code> match
            production Microsoft SQL Server standards:
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>Clustered UUIDs / <code className="font-mono">UNIQUEIDENTIFIER</code> primary keys with foreign key cascade rules.</li>
            <li>Exact monetary precision using <code className="font-mono">DECIMAL(18, 4)</code>.</li>
            <li>Multi-tenant enterprise company separation via <code className="font-mono">CompanyId</code>.</li>
          </ul>
        </div>
      </div>

      {/* 3. Action button */}
      <div className="p-4 bg-blue-50/70 rounded-lg border border-blue-200 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Review Database Architecture</h3>
          <p className="text-[11px] text-slate-600">
            Inspect the full T-SQL schema definitions, relational constraints, and view statements.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('util_mssql_schema')}
          className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <span>Open MSSQL Inspector</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
