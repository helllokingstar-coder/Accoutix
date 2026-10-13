/**
 * ACCOUNTIX - Microsoft SQL Server (MSSQL) Schema Architecture Service
 * Provides relational schema definitions, entity relationship mappings,
 * and database readiness diagnostics.
 */

export interface MssqlTableColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
  description: string;
}

export interface MssqlTableDefinition {
  name: string;
  schema: string;
  description: string;
  businessModule: string;
  columns: MssqlTableColumn[];
}

export const MSSQL_TABLE_REGISTRY: MssqlTableDefinition[] = [
  {
    name: 'Companies',
    schema: 'dbo',
    businessModule: 'Core Company Setup',
    description: 'Multi-tenant enterprise company entities with fiscal calendar and statutory registrations.',
    columns: [
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isPrimaryKey: true, description: 'Clustered UUID primary key' },
      { name: 'CompanyCode', type: 'NVARCHAR(20)', nullable: false, description: 'Unique enterprise short code' },
      { name: 'CompanyName', type: 'NVARCHAR(150)', nullable: false, description: 'Primary trading organization name' },
      { name: 'LegalTradeName', type: 'NVARCHAR(200)', nullable: false, description: 'Registered legal incorporation title' },
      { name: 'TaxId', type: 'NVARCHAR(50)', nullable: false, description: 'GSTIN, VAT, or Federal Employer Tax ID' },
      { name: 'CurrencyCode', type: 'CHAR(3)', nullable: false, description: 'ISO 4217 currency code (USD, EUR, GBP)' },
      { name: 'IsActive', type: 'BIT', nullable: false, description: 'Active trading flag' },
    ],
  },
  {
    name: 'Accounts',
    schema: 'dbo',
    businessModule: 'General Ledger (Double-Entry)',
    description: 'Chart of accounts hierarchical tree implementing Assets, Liabilities, Equity, Revenue, Expense.',
    columns: [
      { name: 'AccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isPrimaryKey: true, description: 'Primary account surrogate key' },
      { name: 'CompanyId', type: 'UNIQUEIDENTIFIER', nullable: false, isForeignKey: true, references: 'Companies.CompanyId', description: 'Tenant company isolation' },
      { name: 'AccountCode', type: 'NVARCHAR(20)', nullable: false, description: 'Standard accounting code (e.g., 1010, 2010)' },
      { name: 'AccountName', type: 'NVARCHAR(150)', nullable: false, description: 'Account title in financial statements' },
      { name: 'Category', type: 'NVARCHAR(20)', nullable: false, description: 'ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE' },
      { name: 'ParentAccountId', type: 'UNIQUEIDENTIFIER', nullable: true, isForeignKey: true, references: 'Accounts.AccountId', description: 'Parent head in chart of accounts tree' },
      { name: 'CurrentBalance', type: 'DECIMAL(18, 4)', nullable: false, description: 'Live cumulative debit/credit balance' },
      { name: 'IsDebitNormal', type: 'BIT', nullable: false, description: '1 for Assets/Expenses, 0 for Liabilities/Equity/Revenue' },
    ],
  },
  {
    name: 'Parties',
    schema: 'dbo',
    businessModule: 'Parties & Combined Ledger',
    description: 'Unified commercial party master supporting simultaneous Customer and Supplier roles with separated accounting subledgers.',
    columns: [
      { name: 'PartyId', type: 'UNIQUEIDENTIFIER', nullable: false, isPrimaryKey: true, description: 'Party surrogate key' },
      { name: 'PartyCode', type: 'NVARCHAR(30)', nullable: false, description: 'Unique party identifier' },
      { name: 'PartyName', type: 'NVARCHAR(150)', nullable: false, description: 'Company or trade partner name' },
      { name: 'IsCustomer', type: 'BIT', nullable: false, description: 'Flag enabling sales and receivables' },
      { name: 'IsSupplier', type: 'BIT', nullable: false, description: 'Flag enabling procurement and payables' },
      { name: 'CustomerAccountId', type: 'UNIQUEIDENTIFIER', nullable: true, isForeignKey: true, references: 'Accounts.AccountId', description: 'Sub-ledger in Accounts Receivable (Assets)' },
      { name: 'SupplierAccountId', type: 'UNIQUEIDENTIFIER', nullable: true, isForeignKey: true, references: 'Accounts.AccountId', description: 'Sub-ledger in Accounts Payable (Liabilities)' },
      { name: 'CreditLimit', type: 'DECIMAL(18, 2)', nullable: false, description: 'Maximum allowed unbilled credit exposure' },
    ],
  },
  {
    name: 'Items',
    schema: 'dbo',
    businessModule: 'Inventory & Service Catalog',
    description: 'Hybrid item master supporting physical merchandise with stock tracking, and non-inventory billable services.',
    columns: [
      { name: 'ItemId', type: 'UNIQUEIDENTIFIER', nullable: false, isPrimaryKey: true, description: 'Master item primary key' },
      { name: 'ItemCode', type: 'NVARCHAR(30)', nullable: false, description: 'SKU or Service Accounting Code' },
      { name: 'ItemName', type: 'NVARCHAR(150)', nullable: false, description: 'Item or service name' },
      { name: 'ItemType', type: 'NVARCHAR(20)', nullable: false, description: 'PRODUCT (physical) or SERVICE (no stock)' },
      { name: 'TracksInventory', type: 'BIT', nullable: false, description: '1 for Products, 0 for Services (enforced by CHECK)' },
      { name: 'CurrentStock', type: 'DECIMAL(18, 4)', nullable: false, description: 'Stock-in-hand quantity (0 for services)' },
      { name: 'SaleRate', type: 'DECIMAL(18, 4)', nullable: false, description: 'Standard billing price per unit' },
      { name: 'RevenueAccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isForeignKey: true, references: 'Accounts.AccountId', description: 'Target revenue head in Chart of Accounts' },
    ],
  },
  {
    name: 'Vouchers',
    schema: 'dbo',
    businessModule: 'Transactions Engine',
    description: 'Header records for all transactional double-entry vouchers (Sales, Purchases, Receipts, Payments, Journals, Contras).',
    columns: [
      { name: 'VoucherId', type: 'UNIQUEIDENTIFIER', nullable: false, isPrimaryKey: true, description: 'Unique voucher identity' },
      { name: 'VoucherNo', type: 'NVARCHAR(50)', nullable: false, description: 'Sequential fiscal document number' },
      { name: 'VoucherType', type: 'NVARCHAR(30)', nullable: false, description: 'SALE_INVOICE, PURCHASE_INVOICE, etc.' },
      { name: 'VoucherDate', type: 'DATE', nullable: false, description: 'Transaction posting date' },
      { name: 'PartyId', type: 'UNIQUEIDENTIFIER', nullable: true, isForeignKey: true, references: 'Parties.PartyId', description: 'Associated customer/supplier party' },
      { name: 'TotalAmount', type: 'DECIMAL(18, 4)', nullable: false, description: 'Total document gross value' },
      { name: 'Status', type: 'NVARCHAR(20)', nullable: false, description: 'DRAFT | POSTED | CANCELLED' },
    ],
  },
  {
    name: 'VoucherEntries',
    schema: 'dbo',
    businessModule: 'General Ledger Postings',
    description: 'Double-entry journal lines ensuring mathematical equality between Debits and Credits.',
    columns: [
      { name: 'EntryId', type: 'UNIQUEIDENTIFIER', nullable: false, isPrimaryKey: true, description: 'Line surrogate key' },
      { name: 'VoucherId', type: 'UNIQUEIDENTIFIER', nullable: false, isForeignKey: true, references: 'Vouchers.VoucherId', description: 'Parent voucher header' },
      { name: 'AccountId', type: 'UNIQUEIDENTIFIER', nullable: false, isForeignKey: true, references: 'Accounts.AccountId', description: 'Chart of accounts ledger head' },
      { name: 'DebitAmount', type: 'DECIMAL(18, 4)', nullable: false, description: 'Debit column (must be >= 0)' },
      { name: 'CreditAmount', type: 'DECIMAL(18, 4)', nullable: false, description: 'Credit column (must be >= 0)' },
    ],
  },
  {
    name: 'VoucherLineItems',
    schema: 'dbo',
    businessModule: 'Billing & Invoice Breakdown',
    description: 'Hybrid item lines allowing both physical products and non-inventory services on the same sale invoice.',
    columns: [
      { name: 'LineItemId', type: 'UNIQUEIDENTIFIER', nullable: false, isPrimaryKey: true, description: 'Line item primary key' },
      { name: 'VoucherId', type: 'UNIQUEIDENTIFIER', nullable: false, isForeignKey: true, references: 'Vouchers.VoucherId', description: 'Sale/Purchase voucher link' },
      { name: 'ItemId', type: 'UNIQUEIDENTIFIER', nullable: false, isForeignKey: true, references: 'Items.ItemId', description: 'Referenced Product or Service' },
      { name: 'ItemType', type: 'NVARCHAR(20)', nullable: false, description: 'PRODUCT or SERVICE' },
      { name: 'Quantity', type: 'DECIMAL(18, 4)', nullable: false, description: 'Billed quantity or units' },
      { name: 'Rate', type: 'DECIMAL(18, 4)', nullable: false, description: 'Agreed unit rate' },
      { name: 'LineTotal', type: 'DECIMAL(18, 4)', nullable: false, description: 'Calculated subtotal + statutory tax' },
    ],
  },
];
