/**
 * ACCOUNTIX - Master Data Architecture Types
 * Supports Dual-Role Party (Customer + Supplier) and Hybrid Product/Service Catalog
 */

export interface PartyRoleInfo {
  isCustomer: boolean;
  isSupplier: boolean;
  customerAccountId?: string; // Sub-account in Accounts Receivable (Assets)
  supplierAccountId?: string; // Sub-account in Accounts Payable (Liabilities)
  creditPeriodDays: number;
  creditLimit: number;
}

export interface Party {
  id: string;
  code: string; // e.g. "CUST-001" or "PRTY-001"
  name: string;
  legalTradeName?: string;
  taxRegistrationNumber: string; // GSTIN / VAT / Sales Tax ID
  roles: PartyRoleInfo;
  contactPerson: string;
  phone: string;
  email: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  receivableBalance: number; // Dr balance as customer
  payableBalance: number;    // Cr balance as supplier
  netBalance: number;        // receivableBalance - payableBalance (+ = Net Dr / Receivable, - = Net Cr / Payable)
  isActive: boolean;
  notes?: string;
}

export type ItemType = 'PRODUCT' | 'SERVICE';

export interface BaseItem {
  id: string;
  code: string; // SKU or SAC/Service Code
  name: string;
  itemType: ItemType;
  categoryId: string;
  categoryName: string;
  saleRate: number;
  taxPercent: number; // 0, 5, 12, 18, 28 %
  isActive: boolean;
  description?: string;
}

export interface ProductItem extends BaseItem {
  itemType: 'PRODUCT';
  unit: string; // PCS, KGS, LTR, BOX, NOS
  purchaseRate: number;
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  storeLocation: string; // e.g. "Warehouse A", "Main Shop", "Bin 14"
  inventoryAccountId: string; // Current Assets > Stock-in-hand
  cogsAccountId: string;      // Direct Expense > Cost of Goods Sold
  saleAccountId: string;      // Revenue > Sales
}

export interface ServiceItem extends BaseItem {
  itemType: 'SERVICE';
  // Services NEVER track physical inventory or store locations
  revenueAccountId: string; // Revenue > Service Income
  serviceDurationMinutes?: number;
  hsnSacCode?: string; // Service Accounting Code
}

export type Item = ProductItem | ServiceItem;

export interface ItemCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  applicableType: 'PRODUCT' | 'SERVICE' | 'BOTH';
}

export interface UnitOfMeasurement {
  id: string;
  code: string; // PCS, KGS, LTR, NOS, MTR
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export interface CombinedPartyLedgerEntry {
  id: string;
  date: string;
  voucherNo: string;
  voucherType: string;
  roleContext: 'CUSTOMER' | 'SUPPLIER';
  narration: string;
  debit: number;
  credit: number;
  runningNetBalance: number;
}
