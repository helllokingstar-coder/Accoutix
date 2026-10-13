/**
 * ACCOUNTIX - Core Accounting & Financial Types
 * Double-Entry Accounting Engine Data Contract
 */

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type AccountType = 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses';
export type AccountClassification = 'Group Account' | 'Posting Ledger';
export type AccountNature = 'Debit' | 'Credit';

export interface Account {
  id: string; // AccountId
  accountId?: string;
  companyId?: string;
  financialYearId?: string;
  code: string; // AccountCode e.g. "1000", "1110"
  accountCode?: string;
  name: string; // AccountName e.g. "Cash", "Current Assets"
  accountName?: string;
  accountType?: AccountType;
  category?: AccountCategory;
  classification?: AccountClassification;
  subType?: string;
  parentAccountId?: string | null;
  nature?: AccountNature; // 'Debit' | 'Credit'
  isDebitNormal?: boolean;
  isGroup?: boolean; // Group Account (true) vs Ledger/Posting Account (false)
  isActive: boolean;
  availableForPosting?: boolean; // True only for active Posting Ledgers (isGroup === false && isActive === true)
  description?: string;
  openingBalance?: number;
  currentBalance?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type VoucherType =
  | 'SALE_INVOICE'
  | 'PURCHASE_INVOICE'
  | 'CASH_RECEIPT'
  | 'BANK_RECEIPT'
  | 'CASH_PAYMENT'
  | 'BANK_PAYMENT'
  | 'JOURNAL'
  | 'CONTRA'
  | 'DEBIT_NOTE'
  | 'CREDIT_NOTE';

export interface VoucherEntry {
  id: string;
  voucherId: string;
  accountId: string;
  accountName: string;
  accountCode: string;
  debitAmount: number;
  creditAmount: number;
  partyId?: string;
  partyName?: string;
  narration?: string;
}

export interface VoucherLineItem {
  id: string;
  voucherId: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemType: 'PRODUCT' | 'SERVICE';
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  taxAmount: number;
  amount: number; // Subtotal + Tax
  revenueAccountId?: string;
  expenseAccountId?: string;
}

export interface Voucher {
  id: string;
  voucherNo: string;
  voucherType: VoucherType;
  date: string; // YYYY-MM-DD
  companyId: string;
  financialYearId: string;
  referenceNo?: string;
  partyId?: string;
  partyName?: string;
  narration: string;
  totalDebit: number;
  totalCredit: number;
  status: 'DRAFT' | 'POSTED' | 'CANCELLED';
  entries: VoucherEntry[];
  lineItems?: VoucherLineItem[];
  createdAt: string;
  createdBy: string;
}

export interface Company {
  id: string;
  code: string; // Required, Unique
  name: string; // Required
  businessType?: string; // Trading, Manufacturing, Services, Retail, Wholesale, etc.
  address: string;
  city: string;
  state: string; // State / Province
  postalCode?: string;
  country: string; // Default: 'Pakistan'
  phone: string;
  mobile?: string;
  email: string;
  website?: string;
  // Tax / Registration Information (optional)
  ntn?: string; // NTN / Tax Number
  strn?: string; // STRN / Sales Tax Number
  registrationNumber?: string; // Registration Number
  taxId?: string; // General Tax ID
  panOrVat?: string;
  legalTradeName?: string;
  legalName?: string;
  // Financial Information
  financialYearStart: string; // YYYY-MM-DD or MM-DD
  financialYearEnd: string;   // YYYY-MM-DD or MM-DD
  currency: string;           // Base Currency (e.g. PKR, USD)
  currencySymbol: string;     // Currency Symbol (e.g. Rs., $)
  decimalPlaces: number;      // Default: 2
  // Company Logo
  logoUrl?: string;           // Base64 Data URL or Image URL
  // Status
  isActive: boolean;          // Active / Inactive
  // Associated Financial Years
  financialYears?: FinancialYear[];
}

export interface FinancialYear {
  id: string;
  companyId: string;
  yearCode: string; // e.g., "2026-2027"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status?: 'ACTIVE' | 'CLOSED' | 'LOCKED';
  isLocked: boolean;
  isCurrent: boolean;
}

export interface UserSession {
  userId: string;
  userName: string;
  displayName: string;
  role: 'SUPER_ADMIN' | 'ACCOUNTANT' | 'AUDITOR' | 'DATA_ENTRY';
}

export interface DashboardKPIData {
  cashBalance: number;
  bankBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  todaySales: number;
  todayPurchases: number;
  todayReceipts: number;
  todayPayments: number;
  lastUpdated: string;
}
