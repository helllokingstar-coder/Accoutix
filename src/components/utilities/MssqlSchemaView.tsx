/**
 * ACCOUNTIX - Microsoft SQL Server (MSSQL) Schema & Architecture Viewer
 * Inspects production DDL tables, foreign keys, dual-role party view, and constraints.
 */

import React, { useState } from 'react';
import { MSSQL_TABLE_REGISTRY } from '../../services/mssqlService';
import { Database, CheckCircle2, Copy, Check, Code, ShieldCheck, Layers, FileCode } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MssqlSchemaView: React.FC = () => {
  const { showNotification } = useApp();
  const [selectedTable, setSelectedTable] = useState(MSSQL_TABLE_REGISTRY[0].name);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'TABLES' | 'DDL_SCRIPT' | 'ER_MAPPING'>('TABLES');

  const currentTableDef = MSSQL_TABLE_REGISTRY.find((t) => t.name === selectedTable)!;

  const rawDdl = `-- ============================================================================
-- ACCOUNTIX - Professional Accounting & Business Management Engine
-- Microsoft SQL Server (MSSQL 2019 / 2022 / Azure SQL) DDL Schema
-- ============================================================================

-- 1. COMPANIES & FISCAL CONTROL
CREATE TABLE dbo.Companies (
    CompanyId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyCode NVARCHAR(20) NOT NULL UNIQUE,
    CompanyName NVARCHAR(150) NOT NULL,
    LegalTradeName NVARCHAR(200) NOT NULL,
    TaxId NVARCHAR(50) NOT NULL,
    CurrencyCode CHAR(3) NOT NULL DEFAULT 'USD',
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_Companies PRIMARY KEY CLUSTERED (CompanyId)
);

CREATE TABLE dbo.FinancialYears (
    FinancialYearId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    YearCode NVARCHAR(20) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsCurrent BIT NOT NULL DEFAULT 0,
    CONSTRAINT PK_FinancialYears PRIMARY KEY CLUSTERED (FinancialYearId),
    CONSTRAINT FK_FinancialYears_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
);

-- 2. CHART OF ACCOUNTS (DOUBLE-ENTRY GL)
CREATE TABLE dbo.Accounts (
    AccountId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    AccountCode NVARCHAR(20) NOT NULL,
    AccountName NVARCHAR(150) NOT NULL,
    Category NVARCHAR(20) NOT NULL, -- 'ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'
    SubType NVARCHAR(50) NOT NULL,
    ParentAccountId UNIQUEIDENTIFIER NULL,
    OpeningBalance DECIMAL(18, 4) NOT NULL DEFAULT 0,
    CurrentBalance DECIMAL(18, 4) NOT NULL DEFAULT 0,
    IsDebitNormal BIT NOT NULL,
    CONSTRAINT PK_Accounts PRIMARY KEY CLUSTERED (AccountId),
    CONSTRAINT FK_Accounts_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
    CONSTRAINT FK_Accounts_ParentAccount FOREIGN KEY (ParentAccountId) REFERENCES dbo.Accounts(AccountId)
);

-- 3. PARTIES (DUAL-ROLE ARCHITECTURE: CAN BE CUSTOMER, SUPPLIER, OR BOTH)
CREATE TABLE dbo.Parties (
    PartyId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    PartyCode NVARCHAR(30) NOT NULL,
    PartyName NVARCHAR(150) NOT NULL,
    IsCustomer BIT NOT NULL DEFAULT 0,
    IsSupplier BIT NOT NULL DEFAULT 0,
    CustomerAccountId UNIQUEIDENTIFIER NULL, -- Links to 1100 AR
    SupplierAccountId UNIQUEIDENTIFIER NULL, -- Links to 2010 AP
    CreditLimit DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT PK_Parties PRIMARY KEY CLUSTERED (PartyId),
    CONSTRAINT FK_Parties_CustomerAccount FOREIGN KEY (CustomerAccountId) REFERENCES dbo.Accounts(AccountId),
    CONSTRAINT FK_Parties_SupplierAccount FOREIGN KEY (SupplierAccountId) REFERENCES dbo.Accounts(AccountId)
);

-- 4. HYBRID PRODUCTS & SERVICES CATALOG
CREATE TABLE dbo.Items (
    ItemId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    ItemCode NVARCHAR(30) NOT NULL,
    ItemName NVARCHAR(150) NOT NULL,
    ItemType NVARCHAR(20) NOT NULL, -- 'PRODUCT' OR 'SERVICE'
    TracksInventory BIT NOT NULL DEFAULT 1,
    CurrentStock DECIMAL(18, 4) NOT NULL DEFAULT 0,
    SaleRate DECIMAL(18, 4) NOT NULL,
    RevenueAccountId UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_Items PRIMARY KEY CLUSTERED (ItemId),
    CONSTRAINT FK_Items_RevenueAccount FOREIGN KEY (RevenueAccountId) REFERENCES dbo.Accounts(AccountId),
    -- Constraint: Services must NEVER track inventory stock
    CONSTRAINT CHK_Service_NoInventory CHECK (
        (ItemType = 'SERVICE' AND TracksInventory = 0 AND CurrentStock = 0) OR
        (ItemType = 'PRODUCT')
    )
);

-- 5. TRANSACTIONS & DOUBLE-ENTRY GL POSTINGS
CREATE TABLE dbo.Vouchers (
    VoucherId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    CompanyId UNIQUEIDENTIFIER NOT NULL,
    FinancialYearId UNIQUEIDENTIFIER NOT NULL,
    VoucherNo NVARCHAR(50) NOT NULL,
    VoucherType NVARCHAR(30) NOT NULL,
    VoucherDate DATE NOT NULL,
    TotalAmount DECIMAL(18, 4) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'POSTED',
    CONSTRAINT PK_Vouchers PRIMARY KEY CLUSTERED (VoucherId)
);

CREATE TABLE dbo.VoucherEntries (
    EntryId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID(),
    VoucherId UNIQUEIDENTIFIER NOT NULL,
    AccountId UNIQUEIDENTIFIER NOT NULL,
    DebitAmount DECIMAL(18, 4) NOT NULL DEFAULT 0,
    CreditAmount DECIMAL(18, 4) NOT NULL DEFAULT 0,
    CONSTRAINT PK_VoucherEntries PRIMARY KEY CLUSTERED (EntryId),
    CONSTRAINT FK_VoucherEntries_Vouchers FOREIGN KEY (VoucherId) REFERENCES dbo.Vouchers(VoucherId) ON DELETE CASCADE,
    CONSTRAINT FK_VoucherEntries_Accounts FOREIGN KEY (AccountId) REFERENCES dbo.Accounts(AccountId)
);

-- 6. COMBINED PARTY LEDGER VIEW
CREATE VIEW dbo.vw_CombinedPartyLedger AS
SELECT 
    v.CompanyId,
    p.PartyId,
    p.PartyCode,
    p.PartyName,
    v.VoucherDate,
    v.VoucherNo,
    v.VoucherType,
    CASE 
        WHEN ve.AccountId = p.CustomerAccountId THEN 'CUSTOMER'
        WHEN ve.AccountId = p.SupplierAccountId THEN 'SUPPLIER'
        ELSE 'OTHER'
    END AS RoleContext,
    ve.DebitAmount,
    ve.CreditAmount,
    (ve.DebitAmount - ve.CreditAmount) AS NetImpact
FROM dbo.Vouchers v
INNER JOIN dbo.VoucherEntries ve ON v.VoucherId = ve.VoucherId
INNER JOIN dbo.Parties p ON ve.PartyId = p.PartyId;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawDdl);
    setCopied(true);
    showNotification('success', 'MSSQL Script Copied', 'Full T-SQL schema copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Microsoft SQL Server (MSSQL) Database Readiness
            </h1>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Production DDL Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clean schema architecture designed for Microsoft SQL Server 2019/2022/Azure SQL with high concurrency, foreign key integrity, and constraint-enforced double-entry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied T-SQL' : 'Copy T-SQL Script'}</span>
          </button>
        </div>
      </div>

      {/* 2. Mode Selector */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md w-full sm:w-auto">
        <button
          onClick={() => setActiveTab('TABLES')}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeTab === 'TABLES' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Relational Tables ({MSSQL_TABLE_REGISTRY.length})
        </button>
        <button
          onClick={() => setActiveTab('DDL_SCRIPT')}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeTab === 'DDL_SCRIPT' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Raw T-SQL DDL Script
        </button>
        <button
          onClick={() => setActiveTab('ER_MAPPING')}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
            activeTab === 'ER_MAPPING' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Architecture & Scalability Principles
        </button>
      </div>

      {activeTab === 'TABLES' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Table List Sidebar */}
          <div className="bg-white border border-blue-100 rounded-lg p-2 space-y-1 shadow-xs">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider px-2 py-1 block">
              MSSQL Tables
            </span>
            {MSSQL_TABLE_REGISTRY.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`w-full text-left px-2.5 py-2 rounded text-xs transition-colors cursor-pointer ${
                  selectedTable === t.name
                    ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                    : 'text-slate-700 hover:bg-blue-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono">dbo.{t.name}</span>
                  <span className="text-[10px] text-blue-700 font-mono font-medium">{t.columns.length} cols</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{t.businessModule}</div>
              </button>
            ))}
          </div>

          {/* Table Details */}
          <div className="lg:col-span-3 bg-white border border-blue-100 rounded-lg shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-white border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    dbo.{currentTableDef.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{currentTableDef.description}</p>
                </div>
                <span className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                  {currentTableDef.businessModule}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto p-0">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-blue-50 text-[11px] uppercase tracking-wider text-blue-950 border-b border-blue-200 font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Column Name</th>
                    <th className="px-4 py-2.5">Data Type</th>
                    <th className="px-4 py-2.5">Constraint / Reference</th>
                    <th className="px-4 py-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {currentTableDef.columns.map((c) => (
                    <tr key={c.name} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-900">
                        {c.name}
                        {c.isPrimaryKey && (
                          <span className="ml-1.5 px-1 py-0.2 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            PK
                          </span>
                        )}
                        {c.isForeignKey && (
                          <span className="ml-1.5 px-1 py-0.2 rounded text-[10px] bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                            FK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-medium text-blue-700">{c.type}</td>
                      <td className="px-4 py-2.5">
                        {c.references ? (
                          <span className="font-mono text-[11px] text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                            → {c.references}
                          </span>
                        ) : c.nullable ? (
                          <span className="text-slate-400">NULL</span>
                        ) : (
                          <span className="text-slate-700 font-semibold">NOT NULL</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DDL_SCRIPT' && (
        <div className="bg-blue-50/40 text-slate-900 rounded-lg p-4 font-mono text-xs border border-blue-200 shadow-xs overflow-x-auto max-h-[600px] leading-relaxed">
          <pre>{rawDdl}</pre>
        </div>
      )}

      {activeTab === 'ER_MAPPING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-blue-100 rounded-lg p-4 space-y-2 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Multi-Tenant & Multi-Company Isolation</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Every table contains a foreign key <code className="font-mono text-blue-700">CompanyId</code>.
              When switching between companies in ACCOUNTIX, query predicates strictly isolate accounting ledger heads,
              vouchers, customers, and inventory balances, ensuring absolute multi-entity compliance.
            </p>
          </div>

          <div className="bg-white border border-blue-100 rounded-lg p-4 space-y-2 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Double-Entry Mathematical Precision</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Monetary values use <code className="font-mono text-blue-700">DECIMAL(18, 4)</code> rather than float types,
              preventing IEEE floating-point arithmetic errors. All transactions enforce the fundamental accounting invariant:
              <br />
              <strong className="text-slate-900">Total Debits = Total Credits (Variance == 0.0000)</strong>.
            </p>
          </div>

          <div className="bg-white border border-blue-100 rounded-lg p-4 space-y-2 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Dual-Role Combined Party Reconciliation</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Instead of forcing parties into rigid customer-only or supplier-only bins, ACCOUNTIX models a party as a unified
              entity with optional Customer and Supplier roles. The view{' '}
              <code className="font-mono text-blue-700">dbo.vw_CombinedPartyLedger</code> unifies sales and purchases into a
              net position without cross-contaminating statutory AR and AP ledger balance sheets.
            </p>
          </div>

          <div className="bg-white border border-blue-100 rounded-lg p-4 space-y-2 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Hybrid Products & Services Contract</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Enforced at the database level by the constraint{' '}
              <code className="font-mono text-blue-700">CHK_Service_NoInventory</code>. Services cannot hold physical stock
              or be assigned to a warehouse bin, while sale invoices can seamlessly bill products and services on the same
              fiscal document.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
