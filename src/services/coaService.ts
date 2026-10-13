/**
 * ACCOUNTIX - Chart of Accounts (COA) Service Layer
 * Multi-company isolated hierarchical accounts registry.
 * Distinguishes Group Accounts from Posting Ledger Accounts.
 */

import { Account, AccountType, AccountNature } from '../types/accounting';

export interface CoaValidationError {
  field: string;
  message: string;
}

export interface CoaFilterParams {
  accountType?: AccountType | 'All';
  status?: 'All' | 'Active' | 'Inactive';
  search?: string;
}

// Starter templates for new companies
const createDefaultCompanyAccounts = (companyId: string, fyId = 'fy_2026_27'): Account[] => {
  const baseAccounts: Account[] = [
  // 1000 - ASSETS
  {
    id: `acc_${companyId}_1000`,
    accountId: `acc_${companyId}_1000`,
    companyId,
    financialYearId: fyId,
    code: '1000',
    accountCode: '1000',
    name: 'Assets',
    accountName: 'Assets',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: true,
    isActive: true,
    parentAccountId: null,
    description: 'Economic resources controlled by the entity resulting from past transactions',
  },
  {
    id: `acc_${companyId}_1100`,
    accountId: `acc_${companyId}_1100`,
    companyId,
    financialYearId: fyId,
    code: '1100',
    accountCode: '1100',
    name: 'Current Assets',
    accountName: 'Current Assets',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: true,
    isActive: true,
    parentAccountId: `acc_${companyId}_1000`,
    description: 'Cash and assets expected to be converted to cash within 12 months',
  },
  {
    id: `acc_${companyId}_1110`,
    accountId: `acc_${companyId}_1110`,
    companyId,
    financialYearId: fyId,
    code: '1110',
    accountCode: '1110',
    name: 'Cash in Hand',
    accountName: 'Cash in Hand',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1100`,
    description: 'Physical vault and petty cash liquidity',
  },
  {
    id: `acc_${companyId}_1120`,
    accountId: `acc_${companyId}_1120`,
    companyId,
    financialYearId: fyId,
    code: '1120',
    accountCode: '1120',
    name: 'Bank Accounts',
    accountName: 'Bank Accounts',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1100`,
    description: 'Operating corporate bank demand deposit accounts',
  },
  {
    id: `acc_${companyId}_1130`,
    accountId: `acc_${companyId}_1130`,
    companyId,
    financialYearId: fyId,
    code: '1130',
    accountCode: '1130',
    name: 'Accounts Receivable (Debtors)',
    accountName: 'Accounts Receivable (Debtors)',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1100`,
    description: 'Short-term trade receivables from customers',
  },
  {
    id: `acc_${companyId}_1140`,
    accountId: `acc_${companyId}_1140`,
    companyId,
    financialYearId: fyId,
    code: '1140',
    accountCode: '1140',
    name: 'Inventory (Stock-in-Hand)',
    accountName: 'Inventory (Stock-in-Hand)',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1100`,
    description: 'Valuation of physical unsold merchandise and spares',
  },
  {
    id: `acc_${companyId}_1150`,
    accountId: `acc_${companyId}_1150`,
    companyId,
    financialYearId: fyId,
    code: '1150',
    accountCode: '1150',
    name: 'Other Current Assets',
    accountName: 'Other Current Assets',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1100`,
    description: 'Prepaid expenses, employee advances, and short-term deposits',
  },
  {
    id: `acc_${companyId}_1200`,
    accountId: `acc_${companyId}_1200`,
    companyId,
    financialYearId: fyId,
    code: '1200',
    accountCode: '1200',
    name: 'Fixed Assets',
    accountName: 'Fixed Assets',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: true,
    isActive: true,
    parentAccountId: `acc_${companyId}_1000`,
    description: 'Tangible long-term capital assets used in operations',
  },
  {
    id: `acc_${companyId}_1210`,
    accountId: `acc_${companyId}_1210`,
    companyId,
    financialYearId: fyId,
    code: '1210',
    accountCode: '1210',
    name: 'Furniture & Fixtures',
    accountName: 'Furniture & Fixtures',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1200`,
    description: 'Office desks, chairs, storage racks, and furnishings',
  },
  {
    id: `acc_${companyId}_1220`,
    accountId: `acc_${companyId}_1220`,
    companyId,
    financialYearId: fyId,
    code: '1220',
    accountCode: '1220',
    name: 'Office Equipment',
    accountName: 'Office Equipment',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1200`,
    description: 'Computers, printers, servers, and telecommunications equipment',
  },
  {
    id: `acc_${companyId}_1230`,
    accountId: `acc_${companyId}_1230`,
    companyId,
    financialYearId: fyId,
    code: '1230',
    accountCode: '1230',
    name: 'Vehicles',
    accountName: 'Vehicles',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1200`,
    description: 'Commercial delivery vans and corporate transportation fleet',
  },
  {
    id: `acc_${companyId}_1240`,
    accountId: `acc_${companyId}_1240`,
    companyId,
    financialYearId: fyId,
    code: '1240',
    accountCode: '1240',
    name: 'Machinery & Workshop Tools',
    accountName: 'Machinery & Workshop Tools',
    accountType: 'Assets',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1200`,
    description: 'Industrial machinery, power tools, and diagnostic systems',
  },
  {
    id: `acc_${companyId}_1290`,
    accountId: `acc_${companyId}_1290`,
    companyId,
    financialYearId: fyId,
    code: '1290',
    accountCode: '1290',
    name: 'Accumulated Depreciation',
    accountName: 'Accumulated Depreciation',
    accountType: 'Assets',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_1200`,
    description: 'Contra-asset account reflecting cumulative depreciation write-offs',
  },

  // 2000 - LIABILITIES
  {
    id: `acc_${companyId}_2000`,
    accountId: `acc_${companyId}_2000`,
    companyId,
    financialYearId: fyId,
    code: '2000',
    accountCode: '2000',
    name: 'Liabilities',
    accountName: 'Liabilities',
    accountType: 'Liabilities',
    nature: 'Credit',
    isGroup: true,
    isActive: true,
    parentAccountId: null,
    description: 'Present obligations of the entity arising from past events',
  },
  {
    id: `acc_${companyId}_2100`,
    accountId: `acc_${companyId}_2100`,
    companyId,
    financialYearId: fyId,
    code: '2100',
    accountCode: '2100',
    name: 'Current Liabilities',
    accountName: 'Current Liabilities',
    accountType: 'Liabilities',
    nature: 'Credit',
    isGroup: true,
    isActive: true,
    parentAccountId: `acc_${companyId}_2000`,
    description: 'Obligations due for settlement within 12 months',
  },
  {
    id: `acc_${companyId}_2110`,
    accountId: `acc_${companyId}_2110`,
    companyId,
    financialYearId: fyId,
    code: '2110',
    accountCode: '2110',
    name: 'Accounts Payable (Creditors)',
    accountName: 'Accounts Payable (Creditors)',
    accountType: 'Liabilities',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_2100`,
    description: 'Amounts owed to trade suppliers for inventory and services',
  },
  {
    id: `acc_${companyId}_2120`,
    accountId: `acc_${companyId}_2120`,
    companyId,
    financialYearId: fyId,
    code: '2120',
    accountCode: '2120',
    name: 'Taxes Payable (GST / Withholding)',
    accountName: 'Taxes Payable (GST / Withholding)',
    accountType: 'Liabilities',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_2100`,
    description: 'Statutory sales tax and withholding tax collected awaiting remittance',
  },
  {
    id: `acc_${companyId}_2130`,
    accountId: `acc_${companyId}_2130`,
    companyId,
    financialYearId: fyId,
    code: '2130',
    accountCode: '2130',
    name: 'Other Current Liabilities',
    accountName: 'Other Current Liabilities',
    accountType: 'Liabilities',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_2100`,
    description: 'Accrued wages, utility bills payable, and short-term provisions',
  },
  {
    id: `acc_${companyId}_2200`,
    accountId: `acc_${companyId}_2200`,
    companyId,
    financialYearId: fyId,
    code: '2200',
    accountCode: '2200',
    name: 'Long Term Liabilities',
    accountName: 'Long Term Liabilities',
    accountType: 'Liabilities',
    nature: 'Credit',
    isGroup: true,
    isActive: true,
    parentAccountId: `acc_${companyId}_2000`,
    description: 'Debts and obligations maturing beyond one year',
  },
  {
    id: `acc_${companyId}_2210`,
    accountId: `acc_${companyId}_2210`,
    companyId,
    financialYearId: fyId,
    code: '2210',
    accountCode: '2210',
    name: 'Bank Loans',
    accountName: 'Bank Loans',
    accountType: 'Liabilities',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_2200`,
    description: 'Long-term corporate debt facilities and term loans',
  },
  {
    id: `acc_${companyId}_2220`,
    accountId: `acc_${companyId}_2220`,
    companyId,
    financialYearId: fyId,
    code: '2220',
    accountCode: '2220',
    name: 'Other Long Term Loans',
    accountName: 'Other Long Term Loans',
    accountType: 'Liabilities',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_2200`,
    description: 'Directors loans and long-term uncollateralized financing',
  },

  // 3000 - EQUITY
  {
    id: `acc_${companyId}_3000`,
    accountId: `acc_${companyId}_3000`,
    companyId,
    financialYearId: fyId,
    code: '3000',
    accountCode: '3000',
    name: 'Equity',
    accountName: 'Equity',
    accountType: 'Equity',
    nature: 'Credit',
    isGroup: true,
    isActive: true,
    parentAccountId: null,
    description: 'Residual interest in assets after deducting all liabilities',
  },
  {
    id: `acc_${companyId}_3100`,
    accountId: `acc_${companyId}_3100`,
    companyId,
    financialYearId: fyId,
    code: '3100',
    accountCode: '3100',
    name: "Owner's Capital",
    accountName: "Owner's Capital",
    accountType: 'Equity',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_3000`,
    description: 'Paid-in equity capital invested by proprietors/partners',
  },
  {
    id: `acc_${companyId}_3200`,
    accountId: `acc_${companyId}_3200`,
    companyId,
    financialYearId: fyId,
    code: '3200',
    accountCode: '3200',
    name: "Owner's Drawings",
    accountName: "Owner's Drawings",
    accountType: 'Equity',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_3000`,
    description: 'Distributions and cash withdrawals made by owners for personal use',
  },
  {
    id: `acc_${companyId}_3300`,
    accountId: `acc_${companyId}_3300`,
    companyId,
    financialYearId: fyId,
    code: '3300',
    accountCode: '3300',
    name: 'Retained Earnings',
    accountName: 'Retained Earnings',
    accountType: 'Equity',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_3000`,
    description: 'Accumulated undistributed net profits carried over from prior years',
  },
  {
    id: `acc_${companyId}_3400`,
    accountId: `acc_${companyId}_3400`,
    companyId,
    financialYearId: fyId,
    code: '3400',
    accountCode: '3400',
    name: 'Current Year Profit/Loss',
    accountName: 'Current Year Profit/Loss',
    accountType: 'Equity',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_3000`,
    description: 'Net income summary roll-up account for the active financial period',
  },

  // 4000 - INCOME
  {
    id: `acc_${companyId}_4000`,
    accountId: `acc_${companyId}_4000`,
    companyId,
    financialYearId: fyId,
    code: '4000',
    accountCode: '4000',
    name: 'Income',
    accountName: 'Income',
    accountType: 'Income',
    nature: 'Credit',
    isGroup: true,
    isActive: true,
    parentAccountId: null,
    description: 'Gross inflows of economic benefits from ordinary business operations',
  },
  {
    id: `acc_${companyId}_4100`,
    accountId: `acc_${companyId}_4100`,
    companyId,
    financialYearId: fyId,
    code: '4100',
    accountCode: '4100',
    name: 'Sales Revenue',
    accountName: 'Sales Revenue',
    accountType: 'Income',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_4000`,
    description: 'Gross billing from retail and wholesale merchandising sales',
  },
  {
    id: `acc_${companyId}_4200`,
    accountId: `acc_${companyId}_4200`,
    companyId,
    financialYearId: fyId,
    code: '4200',
    accountCode: '4200',
    name: 'Service Revenue',
    accountName: 'Service Revenue',
    accountType: 'Income',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_4000`,
    description: 'Billing from labour, consulting, installation, and repair services',
  },
  {
    id: `acc_${companyId}_4300`,
    accountId: `acc_${companyId}_4300`,
    companyId,
    financialYearId: fyId,
    code: '4300',
    accountCode: '4300',
    name: 'Other Income',
    accountName: 'Other Income',
    accountType: 'Income',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_4000`,
    description: 'Interest earned, scrap sales, and incidental non-operating gains',
  },
  {
    id: `acc_${companyId}_4400`,
    accountId: `acc_${companyId}_4400`,
    companyId,
    financialYearId: fyId,
    code: '4400',
    accountCode: '4400',
    name: 'Discount Received',
    accountName: 'Discount Received',
    accountType: 'Income',
    nature: 'Credit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_4000`,
    description: 'Cash settlement discounts granted by suppliers on prompt payment',
  },

  // 5000 - EXPENSES
  {
    id: `acc_${companyId}_5000`,
    accountId: `acc_${companyId}_5000`,
    companyId,
    financialYearId: fyId,
    code: '5000',
    accountCode: '5000',
    name: 'Expenses',
    accountName: 'Expenses',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: true,
    isActive: true,
    parentAccountId: null,
    description: 'Outflows and resource depletion incurred in generating revenue',
  },
  {
    id: `acc_${companyId}_5100`,
    accountId: `acc_${companyId}_5100`,
    companyId,
    financialYearId: fyId,
    code: '5100',
    accountCode: '5100',
    name: 'Cost of Goods Sold (COGS)',
    accountName: 'Cost of Goods Sold (COGS)',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Direct procurement acquisition cost of merchandise sold',
  },
  {
    id: `acc_${companyId}_5110`,
    accountId: `acc_${companyId}_5110`,
    companyId,
    financialYearId: fyId,
    code: '5110',
    accountCode: '5110',
    name: 'Purchase Expenses & Inward Freight',
    accountName: 'Purchase Expenses & Inward Freight',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Transportation, unloading, and customs clearance on incoming stock',
  },
  {
    id: `acc_${companyId}_5200`,
    accountId: `acc_${companyId}_5200`,
    companyId,
    financialYearId: fyId,
    code: '5200',
    accountCode: '5200',
    name: 'Salaries & Wages',
    accountName: 'Salaries & Wages',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Remuneration, commissions, and staff payroll compensation',
  },
  {
    id: `acc_${companyId}_5300`,
    accountId: `acc_${companyId}_5300`,
    companyId,
    financialYearId: fyId,
    code: '5300',
    accountCode: '5300',
    name: 'Rent Expense',
    accountName: 'Rent Expense',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Monthly office, warehouse, and retail shop tenancy lease',
  },
  {
    id: `acc_${companyId}_5400`,
    accountId: `acc_${companyId}_5400`,
    companyId,
    financialYearId: fyId,
    code: '5400',
    accountCode: '5400',
    name: 'Electricity Expense',
    accountName: 'Electricity Expense',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Power grid electricity utility billing',
  },
  {
    id: `acc_${companyId}_5410`,
    accountId: `acc_${companyId}_5410`,
    companyId,
    financialYearId: fyId,
    code: '5410',
    accountCode: '5410',
    name: 'Utilities Expense (Water & Gas)',
    accountName: 'Utilities Expense (Water & Gas)',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Water sewerage, natural gas, and municipal charges',
  },
  {
    id: `acc_${companyId}_5420`,
    accountId: `acc_${companyId}_5420`,
    companyId,
    financialYearId: fyId,
    code: '5420',
    accountCode: '5420',
    name: 'Telephone & Internet',
    accountName: 'Telephone & Internet',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Broadband internet connectivity, landline, and corporate mobiles',
  },
  {
    id: `acc_${companyId}_5500`,
    accountId: `acc_${companyId}_5500`,
    companyId,
    financialYearId: fyId,
    code: '5500',
    accountCode: '5500',
    name: 'Transport & Outward Freight',
    accountName: 'Transport & Outward Freight',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Courier delivery, logistics, and dispatch expenses to customers',
  },
  {
    id: `acc_${companyId}_5600`,
    accountId: `acc_${companyId}_5600`,
    companyId,
    financialYearId: fyId,
    code: '5600',
    accountCode: '5600',
    name: 'Repairs & Maintenance',
    accountName: 'Repairs & Maintenance',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Workshop tool repairs, building maintenance, and vehicle upkeep',
  },
  {
    id: `acc_${companyId}_5700`,
    accountId: `acc_${companyId}_5700`,
    companyId,
    financialYearId: fyId,
    code: '5700',
    accountCode: '5700',
    name: 'Office Expenses',
    accountName: 'Office Expenses',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Stationery, refreshments, cleaning supplies, and office sundries',
  },
  {
    id: `acc_${companyId}_5800`,
    accountId: `acc_${companyId}_5800`,
    companyId,
    financialYearId: fyId,
    code: '5800',
    accountCode: '5800',
    name: 'Advertising & Marketing',
    accountName: 'Advertising & Marketing',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Signage boards, online advertising, pamphlets, and customer promos',
  },
  {
    id: `acc_${companyId}_5900`,
    accountId: `acc_${companyId}_5900`,
    companyId,
    financialYearId: fyId,
    code: '5900',
    accountCode: '5900',
    name: 'Bank Charges',
    accountName: 'Bank Charges',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Cheque book fees, RTGS/wire transfer charges, and bank account fees',
  },
  {
    id: `acc_${companyId}_5950`,
    accountId: `acc_${companyId}_5950`,
    companyId,
    financialYearId: fyId,
    code: '5950',
    accountCode: '5950',
    name: 'Depreciation Expense',
    accountName: 'Depreciation Expense',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Annual statutory depreciation on tangible capital assets',
  },
  {
    id: `acc_${companyId}_5960`,
    accountId: `acc_${companyId}_5960`,
    companyId,
    financialYearId: fyId,
    code: '5960',
    accountCode: '5960',
    name: 'Discount Allowed',
    accountName: 'Discount Allowed',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Discounts granted to credit customers on accelerated settlement',
  },
  {
    id: `acc_${companyId}_5990`,
    accountId: `acc_${companyId}_5990`,
    companyId,
    financialYearId: fyId,
    code: '5990',
    accountCode: '5990',
    name: 'Other Expenses',
    accountName: 'Other Expenses',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: false,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'General miscellaneous operating charges and unexpected expenses',
  },
  {
    id: `acc_${companyId}_6000`,
    accountId: `acc_${companyId}_6000`,
    companyId,
    financialYearId: fyId,
    code: '6000',
    accountCode: '6000',
    name: 'Operating Expenses',
    accountName: 'Operating Expenses',
    accountType: 'Expenses',
    nature: 'Debit',
    isGroup: true,
    isActive: true,
    parentAccountId: `acc_${companyId}_5000`,
    description: 'Operating expenses, administrative overheads, and selling expenses',
  },
  ];

  return baseAccounts.map((acc) => ({
    ...acc,
    classification: acc.isGroup ? ('Group Account' as const) : ('Posting Ledger' as const),
    availableForPosting: !acc.isGroup && acc.isActive,
  }));
};

export class CoaService {
  // Map of companyId -> accounts list
  private accountsMap: Map<string, Account[]> = new Map();

  constructor() {
    // Seed initial companies (comp_01 and comp_02)
    this.accountsMap.set('comp_01', createDefaultCompanyAccounts('comp_01', 'fy_2026_27'));
    this.accountsMap.set('comp_02', createDefaultCompanyAccounts('comp_02', 'fy_hz_2026'));
  }

  /**
   * Returns accounts strictly isolated for the active company
   */
  public getAccounts(companyId: string, filter?: CoaFilterParams): Account[] {
    if (!this.accountsMap.has(companyId)) {
      // Auto-initialize standard COA template for new company
      this.accountsMap.set(companyId, createDefaultCompanyAccounts(companyId));
    }

    const all = this.accountsMap.get(companyId) || [];
    let list = [...all];

    // Filter by Account Type
    if (filter?.accountType && filter.accountType !== 'All') {
      list = list.filter((a) => a.accountType === filter.accountType);
    }

    // Filter by Status
    if (filter?.status && filter.status !== 'All') {
      const wantActive = filter.status === 'Active';
      list = list.filter((a) => a.isActive === wantActive);
    }

    // Search query
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // Sort logically by Account Code
    return list.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }

  public getAccountById(companyId: string, id: string): Account | undefined {
    if (!this.accountsMap.has(companyId)) {
      this.accountsMap.set(companyId, createDefaultCompanyAccounts(companyId));
    }
    const list = this.accountsMap.get(companyId) || [];
    return list.find((a) => a.id === id);
  }

  public getAccountByCode(companyId: string, code: string): Account | undefined {
    if (!this.accountsMap.has(companyId)) {
      this.accountsMap.set(companyId, createDefaultCompanyAccounts(companyId));
    }
    const list = this.accountsMap.get(companyId) || [];
    return list.find((a) => a.code.trim() === code.trim());
  }

  /**
   * Returns only Group accounts (isGroup === true) for parent dropdown selectors
   */
  public getGroupAccounts(companyId: string, type?: AccountType): Account[] {
    if (!this.accountsMap.has(companyId)) {
      this.accountsMap.set(companyId, createDefaultCompanyAccounts(companyId));
    }
    const list = this.accountsMap.get(companyId) || [];
    return list
      .filter((a) => a.isGroup && (type ? a.accountType === type : true))
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }

  /**
   * Returns only accounts eligible for voucher and journal transaction posting:
   * Rule: IsActive === true AND IsGroup === false AND AvailableForPosting === true
   */
  public getPostableAccounts(companyId: string, type?: AccountType): Account[] {
    if (!this.accountsMap.has(companyId)) {
      this.accountsMap.set(companyId, createDefaultCompanyAccounts(companyId));
    }
    const list = this.accountsMap.get(companyId) || [];
    return list
      .filter(
        (a) =>
          a.isActive &&
          !a.isGroup &&
          Boolean(a.availableForPosting) &&
          (type ? a.accountType === type : true)
      )
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }

  /**
   * Validates account data
   */
  public validateAccount(
    companyId: string,
    data: Partial<Account>,
    editingId?: string
  ): CoaValidationError[] {
    const errors: CoaValidationError[] = [];

    // 1. Account Name Required
    if (!data.name || !data.name.trim()) {
      errors.push({ field: 'name', message: 'Account Name is required.' });
    }

    // 2. Account Code Required & Unique within company
    if (!data.code || !data.code.trim()) {
      errors.push({ field: 'code', message: 'Account Code is required.' });
    } else {
      const trimmed = data.code.trim();
      const existing = this.getAccountByCode(companyId, trimmed);
      if (existing && existing.id !== editingId) {
        errors.push({
          field: 'code',
          message: `Account Code "${trimmed}" is already assigned to "${existing.name}". Account codes must be unique within this company.`,
        });
      }
    }

    // 3. Account Type Required
    const validTypes: AccountType[] = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];
    if (!data.accountType || !validTypes.includes(data.accountType)) {
      errors.push({ field: 'accountType', message: 'Please select a valid Account Type.' });
    }

    // 4. Nature Required
    if (!data.nature || (data.nature !== 'Debit' && data.nature !== 'Credit')) {
      errors.push({ field: 'nature', message: 'Please select a valid accounting nature (Debit or Credit).' });
    }

    // 5. Parent Account Validation
    // Posting Ledger accounts MUST roll up into a parent group
    if (!data.isGroup && !data.parentAccountId) {
      errors.push({
        field: 'parentAccountId',
        message: 'Posting Ledger accounts must roll up into a Parent Group Account.',
      });
    }

    if (data.parentAccountId) {
      if (editingId && data.parentAccountId === editingId) {
        errors.push({
          field: 'parentAccountId',
          message: 'An account cannot be selected as its own parent.',
        });
      } else {
        const parent = this.getAccountById(companyId, data.parentAccountId);
        if (!parent) {
          errors.push({ field: 'parentAccountId', message: 'Selected Parent Account does not exist.' });
        } else if (!parent.isGroup) {
          errors.push({
            field: 'parentAccountId',
            message: `Parent account "${parent.name}" is a ledger account. Accounts can only belong under Group accounts.`,
          });
        } else if (data.accountType && parent.accountType !== data.accountType) {
          errors.push({
            field: 'parentAccountId',
            message: `Parent account belongs to "${parent.accountType}", which does not match "${data.accountType}".`,
          });
        }
      }
    }

    // 6. AvailableForPosting Invariant Enforcements:
    // Rule 1 & 5: Group Account must NEVER be available for posting
    if (data.isGroup && data.availableForPosting === true) {
      errors.push({
        field: 'availableForPosting',
        message: 'Group Accounts can never be marked as Available for Posting.',
      });
    }

    // Rule 3 & 4: Inactive accounts must NEVER be available for posting
    if (data.isActive === false && data.availableForPosting === true) {
      errors.push({
        field: 'availableForPosting',
        message: 'Inactive accounts cannot be marked as Available for Posting.',
      });
    }

    return errors;
  }

  /**
   * Saves or updates an account or group
   */
  public saveAccount(
    companyId: string,
    accountData: Partial<Account>,
    editingId?: string
  ): { account?: Account; errors: CoaValidationError[] } {
    const errors = this.validateAccount(companyId, accountData, editingId);
    if (errors.length > 0) {
      return { errors };
    }

    if (!this.accountsMap.has(companyId)) {
      this.accountsMap.set(companyId, createDefaultCompanyAccounts(companyId));
    }
    const list = this.accountsMap.get(companyId)!;

    const now = new Date().toISOString();

    if (editingId) {
      const idx = list.findIndex((a) => a.id === editingId);
      if (idx !== -1) {
        const existing = list[idx];

        // Safety check: cannot demote group to ledger if it already has child accounts
        if (existing.isGroup && accountData.isGroup === false) {
          const hasChildren = list.some((a) => a.parentAccountId === existing.id);
          if (hasChildren) {
            return {
              errors: [
                {
                  field: 'isGroup',
                  message: 'Cannot convert this group to a ledger because other accounts belong under it.',
                },
              ],
            };
          }
        }

        const isGroupFinal = accountData.isGroup !== undefined ? accountData.isGroup : existing.isGroup;
        const isActiveFinal = accountData.isActive !== undefined ? accountData.isActive : existing.isActive;

        // Apply AvailableForPosting rules:
        // Rule 1: Group -> false
        // Rule 2 & 3: Inactive -> false
        // Rule 4: Active Posting Ledger -> respects explicit boolean or defaults to true
        let availableForPostingFinal = false;
        if (!isGroupFinal && isActiveFinal) {
          availableForPostingFinal =
            accountData.availableForPosting !== undefined
              ? Boolean(accountData.availableForPosting)
              : true;
        } else {
          availableForPostingFinal = false;
        }

        const updated: Account = {
          ...existing,
          code: accountData.code!.trim(),
          accountCode: accountData.code!.trim(),
          name: accountData.name!.trim(),
          accountName: accountData.name!.trim(),
          accountType: accountData.accountType!,
          classification: isGroupFinal ? 'Group Account' : 'Posting Ledger',
          nature: accountData.nature!,
          isGroup: isGroupFinal,
          isActive: isActiveFinal,
          availableForPosting: availableForPostingFinal,
          parentAccountId: accountData.parentAccountId !== undefined ? accountData.parentAccountId : existing.parentAccountId,
          description: accountData.description !== undefined ? accountData.description : existing.description,
          updatedAt: now,
        };
        list[idx] = updated;
        return { account: updated, errors: [] };
      }
    }

    // Create New Account or Group
    const newId = `acc_${companyId}_${Date.now()}`;
    const isGroupNew = Boolean(accountData.isGroup);
    const isActiveNew = accountData.isActive ?? true;

    // Apply AvailableForPosting rules for new accounts:
    let availableForPostingNew = false;
    if (!isGroupNew && isActiveNew) {
      availableForPostingNew =
        accountData.availableForPosting !== undefined
          ? Boolean(accountData.availableForPosting)
          : true;
    } else {
      availableForPostingNew = false;
    }

    const newAccount: Account = {
      id: newId,
      accountId: newId,
      companyId,
      financialYearId: accountData.financialYearId || 'fy_2026_27',
      code: accountData.code!.trim(),
      accountCode: accountData.code!.trim(),
      name: accountData.name!.trim(),
      accountName: accountData.name!.trim(),
      accountType: accountData.accountType!,
      classification: isGroupNew ? 'Group Account' : 'Posting Ledger',
      nature: accountData.nature!,
      isGroup: isGroupNew,
      isActive: isActiveNew,
      availableForPosting: availableForPostingNew,
      parentAccountId: accountData.parentAccountId || null,
      description: accountData.description || '',
      createdAt: now,
      updatedAt: now,
    };

    list.push(newAccount);
    return { account: newAccount, errors: [] };
  }

  /**
   * Deactivates or reactivates an account
   */
  public toggleAccountStatus(
    companyId: string,
    id: string
  ): { account?: Account; error?: string } {
    const list = this.accountsMap.get(companyId) || [];
    const target = list.find((a) => a.id === id);

    if (!target) {
      return { error: 'Account not found.' };
    }

    // Safety: if deactivating a group, warn/check if child accounts are still active
    if (target.isGroup && target.isActive) {
      const activeChildren = list.filter((a) => a.parentAccountId === target.id && a.isActive);
      if (activeChildren.length > 0) {
        return {
          error: `Cannot deactivate Group "${target.name}" because it still has ${activeChildren.length} active child accounts. Please deactivate or reassign child accounts first.`,
        };
      }
    }

    target.isActive = !target.isActive;

    // Inactive account must have availableForPosting = false
    // Reactivated posting ledger regains availableForPosting = true; Group accounts remain false
    if (!target.isActive) {
      target.availableForPosting = false;
    } else {
      target.availableForPosting = !target.isGroup;
    }

    target.updatedAt = new Date().toISOString();
    return { account: target };
  }
}

export const coaService = new CoaService();
