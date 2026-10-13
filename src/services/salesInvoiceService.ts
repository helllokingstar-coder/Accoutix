/**
 * ACCOUNTIX - Sales Invoicing Service Layer
 * Manages Cash Sales, Credit Sales, Drafts, Product Stock validations,
 * and Double-Entry General Ledger posting.
 */

import { Voucher } from '../types/accounting';
import { accountingService } from './accountingService';
import { mastersService } from './mastersService';

export interface SalesInvoiceLine {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemType: 'PRODUCT' | 'SERVICE';
  storeLocation: string;
  quantity: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string; // YYYY-MM-DD
  companyId: string;
  financialYearId: string;
  saleType: 'CASH' | 'CREDIT' | 'BANK';
  partyId?: string; // Empty for walk-in cash customer
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxNo?: string;
  storeLocation: string;
  paymentAccountCode: '1010' | '1020'; // 1010 Cash in Hand, 1020 Bank Account
  paymentTerms: string;
  referenceNo?: string;
  lines: SalesInvoiceLine[];
  productSubtotal: number;
  serviceSubtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountReceived: number;
  balanceDue: number;
  previousBalance: number; // Customer balance before this invoice
  newBalance: number;      // Customer balance after this invoice
  notes?: string;
  status: 'POSTED' | 'DRAFT' | 'CANCELLED';
  voucherId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PostInvoiceResult {
  success: boolean;
  message: string;
  invoice?: SalesInvoice;
}

type InvoiceListener = () => void;

class SalesInvoiceService {
  private invoices: SalesInvoice[] = [];
  private listeners: Set<InvoiceListener> = new Set();

  constructor() {
    this.seedInitialInvoices();
  }

  private seedInitialInvoices() {
    this.invoices = [
      {
        id: 'inv_01',
        invoiceNo: 'INV-2026-0042',
        invoiceDate: '2026-10-07',
        companyId: 'comp_01',
        financialYearId: 'fy_2026_27',
        saleType: 'CREDIT',
        partyId: 'party_01',
        customerName: 'Apex Engineering & Auto Supplies',
        customerPhone: '+1 (555) 341-9920',
        customerAddress: '102 Industrial Crescent, West Zone, Metro City',
        customerTaxNo: '27AABCA9101L1Z8',
        storeLocation: 'Warehouse A - Bin 08',
        paymentAccountCode: '1010',
        paymentTerms: 'Net 30 Days',
        referenceNo: 'PO-APX-8821',
        lines: [
          {
            id: 'line_inv01_1',
            itemId: 'item_prd_01',
            itemCode: 'PRD-OIL-5W40',
            itemName: 'Full Synthetic Motor Oil 5W-40',
            itemType: 'PRODUCT',
            storeLocation: 'Warehouse A - Bin 08',
            quantity: 343,
            unit: 'LTR',
            rate: 28.5,
            discountPercent: 0,
            taxPercent: 18.0,
            taxAmount: 1760.4,
            lineTotal: 11535.9,
          },
          {
            id: 'line_inv01_2',
            itemId: 'item_srv_01',
            itemCode: 'SRV-OIL-CHG',
            itemName: 'Express Oil Change & Filter Replacement',
            itemType: 'SERVICE',
            storeLocation: 'Main Shop Counter',
            quantity: 93,
            unit: 'SRV',
            rate: 25.0,
            discountPercent: 0,
            taxPercent: 18.0,
            taxAmount: 418.5,
            lineTotal: 2743.5,
          },
          {
            id: 'line_inv01_3',
            itemId: 'item_srv_03',
            itemCode: 'SRV-BRK-SRV',
            itemName: 'Full Brake System Inspection & Service',
            itemType: 'SERVICE',
            storeLocation: 'Main Shop Counter',
            quantity: 7,
            unit: 'SRV',
            rate: 60.0,
            discountPercent: 0,
            taxPercent: 18.0,
            taxAmount: 75.6,
            lineTotal: 495.6,
          },
        ],
        productSubtotal: 9775.5,
        serviceSubtotal: 2745.0,
        discountTotal: 0,
        taxTotal: 2299.5,
        grandTotal: 14820.0,
        amountReceived: 0,
        balanceDue: 14820.0,
        previousBalance: 0,
        newBalance: 14820.0,
        notes: 'Fleet Service Invoice: Engine oil + Oil change services for commercial fleet',
        status: 'POSTED',
        voucherId: 'vch_01',
        createdAt: '2026-10-07T08:15:00Z',
      },
      {
        id: 'inv_02',
        invoiceNo: 'INV-2026-0040',
        invoiceDate: '2026-10-06',
        companyId: 'comp_01',
        financialYearId: 'fy_2026_27',
        saleType: 'CASH',
        customerName: 'Walk-in Counter Customer (Cash Sale)',
        customerPhone: '+1 (555) 778-9921',
        customerAddress: 'Counter Delivery',
        storeLocation: 'Main Shop Counter',
        paymentAccountCode: '1010',
        paymentTerms: 'Immediate Cash Receipt',
        referenceNo: 'CS-OCT-094',
        lines: [
          {
            id: 'line_inv02_1',
            itemId: 'item_prd_01',
            itemCode: 'PRD-OIL-5W40',
            itemName: 'Full Synthetic Motor Oil 5W-40',
            itemType: 'PRODUCT',
            storeLocation: 'Main Shop Counter',
            quantity: 2,
            unit: 'LTR',
            rate: 28.5,
            discountPercent: 0,
            taxPercent: 18.0,
            taxAmount: 10.26,
            lineTotal: 67.26,
          },
          {
            id: 'line_inv02_2',
            itemId: 'item_srv_01',
            itemCode: 'SRV-OIL-CHG',
            itemName: 'Express Oil Change & Filter Replacement',
            itemType: 'SERVICE',
            storeLocation: 'Main Shop Counter',
            quantity: 1,
            unit: 'SRV',
            rate: 25.0,
            discountPercent: 0,
            taxPercent: 18.0,
            taxAmount: 4.5,
            lineTotal: 29.5,
          },
        ],
        productSubtotal: 57.0,
        serviceSubtotal: 25.0,
        discountTotal: 0,
        taxTotal: 14.76,
        grandTotal: 96.76,
        amountReceived: 96.76,
        balanceDue: 0,
        previousBalance: 0,
        newBalance: 0,
        notes: 'Counter Cash Memo - Paid in full at cashier desk',
        status: 'POSTED',
        createdAt: '2026-10-06T14:30:00Z',
      },
      {
        id: 'inv_03',
        invoiceNo: 'INV-2026-0045',
        invoiceDate: '2026-10-08',
        companyId: 'comp_01',
        financialYearId: 'fy_2026_27',
        saleType: 'CREDIT',
        partyId: 'party_02',
        customerName: 'Metro Fleet Logistics Ltd.',
        customerPhone: '+1 (555) 902-3344',
        customerAddress: '88 Logistics Hub, Depot 4, Capital City',
        customerTaxNo: '27AABCM6742N1Z4',
        storeLocation: 'Warehouse A - Bin 08',
        paymentAccountCode: '1010',
        paymentTerms: 'Net 45 Days',
        referenceNo: 'DRAFT-METRO-01',
        lines: [
          {
            id: 'line_inv03_1',
            itemId: 'item_prd_02',
            itemCode: 'PRD-FLT-OF10',
            itemName: 'Heavy Duty Spin-On Oil Filter',
            itemType: 'PRODUCT',
            storeLocation: 'Warehouse A - Bin 08',
            quantity: 10,
            unit: 'PCS',
            rate: 12.0,
            discountPercent: 0,
            taxPercent: 18.0,
            taxAmount: 21.6,
            lineTotal: 141.6,
          },
        ],
        productSubtotal: 120.0,
        serviceSubtotal: 0,
        discountTotal: 0,
        taxTotal: 21.6,
        grandTotal: 141.6,
        amountReceived: 0,
        balanceDue: 141.6,
        previousBalance: 45200.0,
        newBalance: 45341.6,
        notes: 'Monthly fleet filters replenishment requisition',
        status: 'DRAFT',
        createdAt: '2026-10-08T11:00:00Z',
      },
    ];
  }

  public subscribe(listener: InvoiceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getInvoices(filters?: {
    companyId?: string;
    financialYearId?: string;
    saleType?: string;
    status?: string;
    searchQuery?: string;
  }): SalesInvoice[] {
    let result = [...this.invoices];

    if (filters?.companyId) {
      result = result.filter((i) => i.companyId === filters.companyId);
    }
    if (filters?.financialYearId) {
      result = result.filter((i) => i.financialYearId === filters.financialYearId);
    }
    if (filters?.saleType && filters.saleType !== 'ALL') {
      result = result.filter((i) => i.saleType === filters.saleType);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((i) => i.status === filters.status);
    }
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.invoiceNo.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          (i.referenceNo && i.referenceNo.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public getInvoiceById(id: string): SalesInvoice | undefined {
    return this.invoices.find((i) => i.id === id);
  }

  public getInvoiceByNo(invoiceNo: string): SalesInvoice | undefined {
    return this.invoices.find((i) => i.invoiceNo === invoiceNo);
  }

  /**
   * Generates next invoice number safely
   */
  public generateNextInvoiceNo(companyId: string): string {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const matching = this.invoices
      .filter((i) => i.invoiceNo.startsWith(prefix))
      .map((i) => {
        const numPart = parseInt(i.invoiceNo.replace(prefix, ''), 10);
        return isNaN(numPart) ? 0 : numPart;
      });
    const maxNum = matching.length > 0 ? Math.max(...matching) : 45;
    const nextNum = String(maxNum + 1).padStart(4, '0');
    return `${prefix}${nextNum}`;
  }

  /**
   * Validates invoice line items and business invariants
   */
  public validateInvoice(invoice: Partial<SalesInvoice>): { isValid: boolean; error?: string } {
    if (!invoice.invoiceNo || !invoice.invoiceNo.trim()) {
      return { isValid: false, error: 'Invoice number is required.' };
    }
    if (!invoice.invoiceDate || !invoice.invoiceDate.trim()) {
      return { isValid: false, error: 'Invoice date is required.' };
    }
    if (!invoice.lines || invoice.lines.length === 0) {
      return { isValid: false, error: 'Please add at least one product or service line item.' };
    }

    for (let idx = 0; idx < invoice.lines.length; idx++) {
      const line = invoice.lines[idx];
      if (!line.itemId) {
        return { isValid: false, error: `Line #${idx + 1} has no item selected.` };
      }
      if (line.quantity <= 0 || isNaN(line.quantity)) {
        return { isValid: false, error: `Line #${idx + 1} (${line.itemName}) must have quantity greater than 0.` };
      }
      if (line.rate < 0 || isNaN(line.rate)) {
        return { isValid: false, error: `Line #${idx + 1} (${line.itemName}) must have a valid non-negative rate.` };
      }
      if (line.discountPercent < 0 || line.discountPercent > 100) {
        return { isValid: false, error: `Line #${idx + 1} discount must be between 0% and 100%.` };
      }
      if (line.taxPercent < 0 || line.taxPercent > 100) {
        return { isValid: false, error: `Line #${idx + 1} tax must be between 0% and 100%.` };
      }
    }

    if (invoice.saleType === 'CREDIT' && !invoice.partyId) {
      return { isValid: false, error: 'Credit sale requires an existing customer selection from records.' };
    }

    if (invoice.amountReceived !== undefined && invoice.amountReceived < 0) {
      return { isValid: false, error: 'Amount received cannot be negative.' };
    }

    return { isValid: true };
  }

  /**
   * Saves or updates a draft invoice (does NOT affect ledgers or stock)
   */
  public saveDraft(invoice: SalesInvoice): PostInvoiceResult {
    const val = this.validateInvoice(invoice);
    if (!val.isValid) {
      return { success: false, message: val.error || 'Invalid invoice data' };
    }

    invoice.status = 'DRAFT';
    invoice.updatedAt = new Date().toISOString();

    const existingIndex = this.invoices.findIndex(
      (i) => i.id === invoice.id || i.invoiceNo === invoice.invoiceNo
    );

    if (existingIndex >= 0) {
      this.invoices[existingIndex] = invoice;
    } else {
      this.invoices.unshift(invoice);
    }

    this.notify();
    return {
      success: true,
      message: `Draft invoice ${invoice.invoiceNo} saved successfully.`,
      invoice,
    };
  }

  /**
   * Posts an invoice to General Ledger:
   * - Enforces double-entry debits == credits
   * - Deducts physical product stock
   * - Updates customer balance if Credit sale
   * - Never updates customer balance if Cash sale
   * - Creates/updates balanced GL Voucher
   */
  public postInvoice(invoice: SalesInvoice): PostInvoiceResult {
    const val = this.validateInvoice(invoice);
    if (!val.isValid) {
      return { success: false, message: val.error || 'Invalid invoice data' };
    }

    // Check if this is an update to an already-posted invoice
    const existingIndex = this.invoices.findIndex(
      (i) => i.id === invoice.id || i.invoiceNo === invoice.invoiceNo
    );
    const existing = existingIndex >= 0 ? this.invoices[existingIndex] : null;

    // Rollback previous impact if updating an already-posted invoice
    if (existing && existing.status === 'POSTED') {
      // 1. Revert stock
      for (const line of existing.lines) {
        if (line.itemType === 'PRODUCT') {
          mastersService.adjustItemStock(line.itemId, line.quantity);
        }
      }
      // 2. Revert customer balance if credit
      if (existing.saleType === 'CREDIT' && existing.partyId && existing.balanceDue > 0) {
        mastersService.updatePartyBalance(existing.partyId, -existing.balanceDue);
      }
    }

    // 1. Validate physical stock availability
    for (let idx = 0; idx < invoice.lines.length; idx++) {
      const line = invoice.lines[idx];
      if (line.itemType === 'PRODUCT') {
        const item = mastersService.getItems().find((i) => i.id === line.itemId);
        if (item && item.itemType === 'PRODUCT') {
          if (item.currentStock < line.quantity) {
            return {
              success: false,
              message: `Insufficient stock for "${line.itemName}". Available: ${item.currentStock} ${line.unit}, Requested: ${line.quantity} ${line.unit}.`,
            };
          }
        }
      }
    }

    // 2. Build double-entry balanced voucher entries
    const voucherEntries = [];
    let entrySeq = 1;

    // A. Cash / Bank Received (Debit)
    if (invoice.amountReceived > 0) {
      const isBank = invoice.paymentAccountCode === '1020' || invoice.saleType === 'BANK';
      voucherEntries.push({
        id: `ve_${invoice.invoiceNo}_${entrySeq++}`,
        voucherId: invoice.voucherId || `vch_${invoice.id}`,
        accountId: isBank ? 'acc_1020' : 'acc_1010',
        accountName: isBank ? 'Standard Commercial Bank - Main A/c' : 'Cash in Hand',
        accountCode: isBank ? '1020' : '1010',
        debitAmount: Number(invoice.amountReceived.toFixed(2)),
        creditAmount: 0.0,
        partyId: invoice.partyId,
        partyName: invoice.customerName,
        narration: `Immediate payment received against invoice ${invoice.invoiceNo}`,
      });
    }

    // B. Accounts Receivable for unpaid balance (Debit)
    if (invoice.balanceDue > 0) {
      voucherEntries.push({
        id: `ve_${invoice.invoiceNo}_${entrySeq++}`,
        voucherId: invoice.voucherId || `vch_${invoice.id}`,
        accountId: 'acc_1100',
        accountName: 'Accounts Receivable (Sundry Debtors)',
        accountCode: '1100',
        debitAmount: Number(invoice.balanceDue.toFixed(2)),
        creditAmount: 0.0,
        partyId: invoice.partyId,
        partyName: invoice.customerName,
        narration: `Net credit balance billed to customer on invoice ${invoice.invoiceNo}`,
      });
    }

    // C. Revenue Credits
    const netProductSubtotal = invoice.productSubtotal - (invoice.discountTotal * (invoice.productSubtotal / (invoice.productSubtotal + invoice.serviceSubtotal || 1)));
    const netServiceSubtotal = invoice.serviceSubtotal - (invoice.discountTotal * (invoice.serviceSubtotal / (invoice.productSubtotal + invoice.serviceSubtotal || 1)));

    if (invoice.productSubtotal > 0) {
      voucherEntries.push({
        id: `ve_${invoice.invoiceNo}_${entrySeq++}`,
        voucherId: invoice.voucherId || `vch_${invoice.id}`,
        accountId: 'acc_4010',
        accountName: 'Product Sales Revenue',
        accountCode: '4010',
        debitAmount: 0.0,
        creditAmount: Number(netProductSubtotal.toFixed(2)),
        narration: `Sales revenue from physical merchandise on ${invoice.invoiceNo}`,
      });
    }

    if (invoice.serviceSubtotal > 0) {
      voucherEntries.push({
        id: `ve_${invoice.invoiceNo}_${entrySeq++}`,
        voucherId: invoice.voucherId || `vch_${invoice.id}`,
        accountId: 'acc_4020',
        accountName: 'Service Income & Labour Charges',
        accountCode: '4020',
        debitAmount: 0.0,
        creditAmount: Number(netServiceSubtotal.toFixed(2)),
        narration: `Service income from labour charges on ${invoice.invoiceNo}`,
      });
    }

    // D. Output Sales Tax (Credit)
    if (invoice.taxTotal > 0) {
      voucherEntries.push({
        id: `ve_${invoice.invoiceNo}_${entrySeq++}`,
        voucherId: invoice.voucherId || `vch_${invoice.id}`,
        accountId: 'acc_2050',
        accountName: 'Sales Tax / Output Tax Payable',
        accountCode: '2050',
        debitAmount: 0.0,
        creditAmount: Number(invoice.taxTotal.toFixed(2)),
        narration: `Sales tax output liability on ${invoice.invoiceNo}`,
      });
    }

    // Mathematical sanity balance rounding guard
    const totalDr = voucherEntries.reduce((s, e) => s + e.debitAmount, 0);
    const totalCr = voucherEntries.reduce((s, e) => s + e.creditAmount, 0);
    const diff = Number((totalDr - totalCr).toFixed(2));
    if (Math.abs(diff) > 0 && Math.abs(diff) <= 0.05 && voucherEntries.length > 0) {
      // Adjust small roundoff to revenue or tax
      voucherEntries[voucherEntries.length - 1].creditAmount += diff;
    }

    const voucherId = invoice.voucherId || `vch_${invoice.id || Date.now()}`;
    const voucher: Voucher = {
      id: voucherId,
      voucherNo: invoice.invoiceNo,
      voucherType: 'SALE_INVOICE',
      date: invoice.invoiceDate,
      companyId: invoice.companyId,
      financialYearId: invoice.financialYearId,
      referenceNo: invoice.referenceNo,
      partyId: invoice.partyId,
      partyName: invoice.customerName,
      narration: invoice.notes || `Sales Invoice ${invoice.invoiceNo} (${invoice.saleType})`,
      totalDebit: Number(invoice.grandTotal.toFixed(2)),
      totalCredit: Number(invoice.grandTotal.toFixed(2)),
      status: 'POSTED',
      createdAt: invoice.createdAt || new Date().toISOString(),
      createdBy: 'Admin (Super User)',
      entries: voucherEntries,
    };

    // Post to accounting service
    const postResult = existing && existing.status === 'POSTED'
      ? accountingService.updateVoucher(voucher)
      : accountingService.postVoucher(voucher);

    if (!postResult.success) {
      return { success: false, message: postResult.message };
    }

    // 3. Deduct physical stock
    for (const line of invoice.lines) {
      if (line.itemType === 'PRODUCT') {
        mastersService.adjustItemStock(line.itemId, -line.quantity);
      }
    }

    // 4. Update Customer Balance
    // RULE: Only Credit sales with unpaid balance update customer balance!
    // Cash Sales NEVER update or inflate customer balance!
    if (invoice.saleType === 'CREDIT' && invoice.partyId && invoice.balanceDue > 0) {
      mastersService.updatePartyBalance(invoice.partyId, invoice.balanceDue);
    }

    // 5. Update invoice record state
    invoice.status = 'POSTED';
    invoice.voucherId = voucherId;
    invoice.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      this.invoices[existingIndex] = invoice;
    } else {
      this.invoices.unshift(invoice);
    }

    this.notify();
    return {
      success: true,
      message: `Sale Invoice ${invoice.invoiceNo} ($${invoice.grandTotal.toFixed(2)}) posted successfully to General Ledger.`,
      invoice,
    };
  }

  /**
   * Cancels/Reverses an invoice safely
   */
  public cancelInvoice(id: string): PostInvoiceResult {
    const invoice = this.invoices.find((i) => i.id === id);
    if (!invoice) {
      return { success: false, message: 'Invoice not found.' };
    }

    if (invoice.status === 'CANCELLED') {
      return { success: false, message: 'Invoice is already cancelled.' };
    }

    // If posted, reverse inventory and customer balances
    if (invoice.status === 'POSTED') {
      for (const line of invoice.lines) {
        if (line.itemType === 'PRODUCT') {
          mastersService.adjustItemStock(line.itemId, line.quantity);
        }
      }

      if (invoice.saleType === 'CREDIT' && invoice.partyId && invoice.balanceDue > 0) {
        mastersService.updatePartyBalance(invoice.partyId, -invoice.balanceDue);
      }

      if (invoice.voucherId || invoice.invoiceNo) {
        accountingService.cancelVoucher(invoice.voucherId || invoice.invoiceNo);
      }
    }

    invoice.status = 'CANCELLED';
    invoice.updatedAt = new Date().toISOString();
    this.notify();

    return {
      success: true,
      message: `Invoice ${invoice.invoiceNo} has been cancelled and its inventory/balances reversed.`,
      invoice,
    };
  }

  /**
   * Deletes a draft invoice
   */
  public deleteDraft(id: string): boolean {
    const idx = this.invoices.findIndex((i) => i.id === id);
    if (idx >= 0 && this.invoices[idx].status === 'DRAFT') {
      this.invoices.splice(idx, 1);
      this.notify();
      return true;
    }
    return false;
  }
}

export const salesInvoiceService = new SalesInvoiceService();
