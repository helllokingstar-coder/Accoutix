/**
 * ACCOUNTIX - Double-Entry Accounting Service Layer
 * Prepared for future MSSQL backend integration via API proxy/database driver.
 */

import { Voucher, DashboardKPIData, Account } from '../types/accounting';
import { CombinedPartyLedgerEntry } from '../types/masters';
import {
  INITIAL_VOUCHERS,
  INITIAL_CHART_OF_ACCOUNTS,
} from './mockInitialData';

export class AccountingService {
  private vouchers: Voucher[] = [...INITIAL_VOUCHERS];
  private accounts: Account[] = [...INITIAL_CHART_OF_ACCOUNTS];

  /**
   * Retrieves live computed KPI figures for the primary dashboard
   */
  public getDashboardKPIs(): DashboardKPIData {
    const cashAcc = this.accounts.find((a) => a.code === '1010');
    const bankAcc = this.accounts.find((a) => a.code === '1020');
    const arAcc = this.accounts.find((a) => a.code === '1100');
    const apAcc = this.accounts.find((a) => a.code === '2010');

    // Aggregate today's activity from posted vouchers
    const today = '2026-10-07';
    let todaySales = 0;
    let todayPurchases = 0;
    let todayReceipts = 0;
    let todayPayments = 0;

    for (const v of this.vouchers) {
      if (v.date === today && v.status === 'POSTED') {
        if (v.voucherType === 'SALE_INVOICE') {
          todaySales += v.totalDebit;
        } else if (v.voucherType === 'PURCHASE_INVOICE') {
          todayPurchases += v.totalCredit;
        } else if (v.voucherType === 'CASH_RECEIPT' || v.voucherType === 'BANK_RECEIPT') {
          todayReceipts += v.totalDebit;
        } else if (v.voucherType === 'CASH_PAYMENT' || v.voucherType === 'BANK_PAYMENT') {
          todayPayments += v.totalDebit;
        }
      }
    }

    return {
      cashBalance: cashAcc?.currentBalance ?? 42850.0,
      bankBalance: bankAcc?.currentBalance ?? 385420.5,
      accountsReceivable: arAcc?.currentBalance ?? 124900.0,
      accountsPayable: apAcc?.currentBalance ?? 68340.0,
      todaySales,
      todayPurchases,
      todayReceipts,
      todayPayments,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Retrieves all vouchers filtered by date or voucher type
   */
  public getVouchers(type?: string): Voucher[] {
    if (!type || type === 'ALL') return [...this.vouchers];
    return this.vouchers.filter((v) => v.voucherType === type);
  }

  /**
   * Enforces double-entry equation rule: Total Debits must precisely equal Total Credits
   */
  public validateDoubleEntry(entries: { debitAmount: number; creditAmount: number }[]): {
    isValid: boolean;
    totalDebit: number;
    totalCredit: number;
    difference: number;
  } {
    const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debitAmount) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (Number(e.creditAmount) || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isValid = difference < 0.0001 && totalDebit > 0;

    return {
      isValid,
      totalDebit,
      totalCredit,
      difference,
    };
  }

  /**
   * Post new balanced voucher
   */
  public postVoucher(voucher: Voucher): { success: boolean; message: string; voucher?: Voucher } {
    const check = this.validateDoubleEntry(voucher.entries);
    if (!check.isValid) {
      return {
        success: false,
        message: `Voucher unbalanced: Debit ($${check.totalDebit.toFixed(2)}) must equal Credit ($${check.totalCredit.toFixed(2)}). Variance: $${check.difference.toFixed(2)}`,
      };
    }

    this.vouchers.unshift(voucher);

    // Update account balances based on entries
    for (const entry of voucher.entries) {
      const acc = this.accounts.find((a) => a.code === entry.accountCode || a.id === entry.accountId);
      if (acc) {
        if (acc.isDebitNormal) {
          acc.currentBalance = (acc.currentBalance || 0) + entry.debitAmount - entry.creditAmount;
        } else {
          acc.currentBalance = (acc.currentBalance || 0) + entry.creditAmount - entry.debitAmount;
        }
      }
    }

    return {
      success: true,
      message: `Voucher ${voucher.voucherNo} posted successfully to General Ledger.`,
      voucher,
    };
  }

  /**
   * Updates an existing voucher in place rather than creating duplicates
   */
  public updateVoucher(voucher: Voucher): { success: boolean; message: string; voucher?: Voucher } {
    const check = this.validateDoubleEntry(voucher.entries);
    if (!check.isValid) {
      return {
        success: false,
        message: `Voucher unbalanced: Debit ($${check.totalDebit.toFixed(2)}) must equal Credit ($${check.totalCredit.toFixed(2)}). Variance: $${check.difference.toFixed(2)}`,
      };
    }

    const idx = this.vouchers.findIndex((v) => v.id === voucher.id || v.voucherNo === voucher.voucherNo);
    if (idx >= 0) {
      this.vouchers[idx] = voucher;
    } else {
      this.vouchers.unshift(voucher);
    }

    return {
      success: true,
      message: `Voucher ${voucher.voucherNo} updated successfully.`,
      voucher,
    };
  }

  /**
   * Cancels a voucher and marks its status as CANCELLED
   */
  public cancelVoucher(idOrNo: string): boolean {
    const v = this.vouchers.find((item) => item.id === idOrNo || item.voucherNo === idOrNo);
    if (v) {
      v.status = 'CANCELLED';
      return true;
    }
    return false;
  }

  public getVoucherById(idOrNo: string): Voucher | undefined {
    return this.vouchers.find((v) => v.id === idOrNo || v.voucherNo === idOrNo);
  }

  /**
   * Generates Combined Party Ledger: Merges both Customer and Supplier vouchers
   * for a party that acts in dual roles, computing net balance!
   */
  public getCombinedPartyLedger(partyId: string): CombinedPartyLedgerEntry[] {
    const records: CombinedPartyLedgerEntry[] = [];
    let runningNet = 0;

    for (const v of this.vouchers) {
      if (v.partyId === partyId && v.status === 'POSTED') {
        let isCustomerSide = false;
        let debit = 0;
        let credit = 0;

        for (const entry of v.entries) {
          if (entry.partyId === partyId || v.partyId === partyId) {
            if (entry.accountCode === '1100') {
              // Receivable / Customer side
              isCustomerSide = true;
              debit += entry.debitAmount;
              credit += entry.creditAmount;
            } else if (entry.accountCode === '2010') {
              // Payable / Supplier side
              isCustomerSide = false;
              debit += entry.debitAmount;
              credit += entry.creditAmount;
            }
          }
        }

        // Net impact: customer debit increases receivable (+), supplier credit increases payable (-)
        const netChange = isCustomerSide ? debit - credit : -(credit - debit);
        runningNet += netChange;

        records.push({
          id: `cpl_${v.id}`,
          date: v.date,
          voucherNo: v.voucherNo,
          voucherType: v.voucherType,
          roleContext: isCustomerSide ? 'CUSTOMER' : 'SUPPLIER',
          narration: v.narration,
          debit,
          credit,
          runningNetBalance: runningNet,
        });
      }
    }

    return records;
  }
}

export const accountingService = new AccountingService();
