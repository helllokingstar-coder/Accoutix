/**
 * ACCOUNTIX - Journal Entry Drafts & Voucher Store Service
 * Day 2.3 - Manages saved journal drafts, multi-line entries, and persistence.
 * Strictly company-isolated; drafts do NOT affect General Ledger, Customer/Supplier Ledgers,
 * Trial Balance, P&L, or Balance Sheet until formal posting.
 */

export interface JournalLineItem {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType?: string;
  narration: string;
  debit: number;
  credit: number;
}

export interface JournalVoucherDraft {
  id: string;
  voucherNo: string;
  date: string;
  companyId: string;
  financialYearId: string;
  journalType: string; // Journal Category
  referenceNo: string;
  narration: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalLineItem[];
  status: 'Draft' | 'VERIFIED';
  createdAt: string;
  updatedAt?: string;
}

type DraftListener = () => void;

class JournalDraftService {
  private draftsMap: Map<string, JournalVoucherDraft[]> = new Map();
  private activeDraftToEdit: JournalVoucherDraft | null = null;
  private listeners: Set<DraftListener> = new Set();

  constructor() {
    this.seedInitialDrafts();
  }

  /**
   * Initializes initial saved draft for default companies
   * Uses real COA accounts (e.g. 5410 Utility Expenses, 2020 Accrued Expenses)
   */
  private seedInitialDrafts() {
    const comp01Drafts: JournalVoucherDraft[] = [
      {
        id: 'jv_draft_0001',
        voucherNo: 'JV-0001',
        date: '2026-10-08',
        companyId: 'comp_01',
        financialYearId: 'fy_2026_27',
        journalType: 'Accrual & Adjustment',
        referenceNo: 'UTIL-OCT26-REF',
        narration: 'Provision for monthly utility expenses (Water, Gas & Electricity bills accrued for October)',
        totalDebit: 850.0,
        totalCredit: 850.0,
        status: 'Draft',
        createdAt: '2026-10-08T10:00:00.000Z',
        lines: [
          {
            id: 'l1',
            accountId: 'acc_comp_01_5410',
            accountCode: '5410',
            accountName: 'Utility Expenses – Water & Gas',
            accountType: 'Expenses',
            narration: 'Provision for estimated electricity and pipeline gas charges',
            debit: 850.0,
            credit: 0,
          },
          {
            id: 'l2',
            accountId: 'acc_comp_01_2020',
            accountCode: '2020',
            accountName: 'Accrued Expenses & Provisions',
            accountType: 'Liabilities',
            narration: 'Current utility liabilities payable next month',
            debit: 0,
            credit: 850.0,
          },
        ],
      },
      {
        id: 'jv_draft_0002',
        voucherNo: 'JV-0002',
        date: '2026-10-07',
        companyId: 'comp_01',
        financialYearId: 'fy_2026_27',
        journalType: 'General Journal',
        referenceNo: 'PREPAID-INS-99',
        narration: 'Monthly amortization of commercial property insurance premium',
        totalDebit: 1200.0,
        totalCredit: 1200.0,
        status: 'Draft',
        createdAt: '2026-10-07T09:30:00.000Z',
        lines: [
          {
            id: 'l3',
            accountId: 'acc_comp_01_5300',
            accountCode: '5300',
            accountName: 'Insurance Expense',
            accountType: 'Expenses',
            narration: 'Monthly recognized insurance coverage portion',
            debit: 1200.0,
            credit: 0,
          },
          {
            id: 'l4',
            accountId: 'acc_comp_01_1300',
            accountCode: '1300',
            accountName: 'Prepaid Expenses',
            accountType: 'Assets',
            narration: 'Reduction of advance insurance deposit asset',
            debit: 0,
            credit: 1200.0,
          },
        ],
      },
      {
        id: 'jv_draft_0003',
        voucherNo: 'JV-0003',
        date: '2026-01-05',
        companyId: 'comp_01',
        financialYearId: 'fy_2026_27',
        journalType: 'Correction / Rectification',
        referenceNo: 'RECT-JAN05',
        narration: 'Prior period reclassification adjustment',
        totalDebit: 450.0,
        totalCredit: 450.0,
        status: 'Draft',
        createdAt: '2026-01-05T08:00:00.000Z',
        lines: [
          {
            id: 'l5',
            accountId: 'acc_comp_01_5300',
            accountCode: '5300',
            accountName: 'Insurance Expense',
            accountType: 'Expenses',
            narration: 'Reclassified portion',
            debit: 450.0,
            credit: 0,
          },
          {
            id: 'l6',
            accountId: 'acc_comp_01_1300',
            accountCode: '1300',
            accountName: 'Prepaid Expenses',
            accountType: 'Assets',
            narration: 'Adjusted from prepayment balance',
            debit: 0,
            credit: 450.0,
          },
        ],
      },
      {
        id: 'jv_draft_0004',
        voucherNo: 'JV-0004',
        date: '2026-02-01',
        companyId: 'comp_01',
        financialYearId: 'fy_2026_27',
        journalType: 'Accrual & Adjustment',
        referenceNo: 'ACCR-FEB01',
        narration: 'Interest accrual on short term commercial paper deposit',
        totalDebit: 620.0,
        totalCredit: 620.0,
        status: 'Draft',
        createdAt: '2026-02-01T08:00:00.000Z',
        lines: [
          {
            id: 'l7',
            accountId: 'acc_comp_01_1100',
            accountCode: '1100',
            accountName: 'Current Assets',
            accountType: 'Assets',
            narration: 'Accrued interest receivable',
            debit: 620.0,
            credit: 0,
          },
          {
            id: 'l8',
            accountId: 'acc_comp_01_2020',
            accountCode: '2020',
            accountName: 'Accrued Expenses & Provisions',
            accountType: 'Liabilities',
            narration: 'Offset provision',
            debit: 0,
            credit: 620.0,
          },
        ],
      },
      {
        id: 'jv_draft_0005',
        voucherNo: 'JV-0005',
        date: '2026-12-31',
        companyId: 'comp_01',
        financialYearId: 'fy_2026_27',
        journalType: 'Depreciation',
        referenceNo: 'DEP-YEAREND',
        narration: 'Year-end equipment depreciation provision',
        totalDebit: 3500.0,
        totalCredit: 3500.0,
        status: 'Draft',
        createdAt: '2026-12-31T23:59:00.000Z',
        lines: [
          {
            id: 'l9',
            accountId: 'acc_comp_01_5410',
            accountCode: '5410',
            accountName: 'Utility Expenses – Water & Gas',
            accountType: 'Expenses',
            narration: 'Year end expense recognized',
            debit: 3500.0,
            credit: 0,
          },
          {
            id: 'l10',
            accountId: 'acc_comp_01_2020',
            accountCode: '2020',
            accountName: 'Accrued Expenses & Provisions',
            accountType: 'Liabilities',
            narration: 'Accrued provision year end',
            debit: 0,
            credit: 3500.0,
          },
        ],
      },
    ];

    this.draftsMap.set('comp_01', comp01Drafts);
  }

  public subscribe(listener: DraftListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Draft listener error:', err);
      }
    });
  }

  /**
   * Retrieves all drafts for a given company
   */
  public getDrafts(companyId: string): JournalVoucherDraft[] {
    const list = this.draftsMap.get(companyId);
    if (!list) {
      this.draftsMap.set(companyId, []);
      return [];
    }
    return [...list];
  }

  /**
   * Retrieves a draft by ID
   */
  public getDraftById(companyId: string, id: string): JournalVoucherDraft | undefined {
    const list = this.getDrafts(companyId);
    return list.find((d) => d.id === id);
  }

  /**
   * Saves or updates a draft in the store
   */
  public saveDraft(draft: JournalVoucherDraft): JournalVoucherDraft {
    const companyId = draft.companyId;
    const list = this.getDrafts(companyId);
    const existingIndex = list.findIndex((d) => d.id === draft.id);

    const updatedDraft: JournalVoucherDraft = {
      ...draft,
      status: 'Draft',
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedDraft;
    } else {
      list.unshift(updatedDraft);
    }

    this.draftsMap.set(companyId, list);
    this.notify();
    return updatedDraft;
  }

  /**
   * Deletes a draft from the store permanently
   */
  public deleteDraft(companyId: string, id: string): boolean {
    const list = this.getDrafts(companyId);
    const nextList = list.filter((d) => d.id !== id);
    if (nextList.length !== list.length) {
      this.draftsMap.set(companyId, nextList);
      if (this.activeDraftToEdit?.id === id) {
        this.activeDraftToEdit = null;
      }
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Sets the active draft to load into JournalEntryView
   */
  public setActiveDraftToEdit(draft: JournalVoucherDraft | null) {
    this.activeDraftToEdit = draft ? JSON.parse(JSON.stringify(draft)) : null;
  }

  /**
   * Gets and optionally keeps/clears the active draft to edit
   */
  public getActiveDraftToEdit(): JournalVoucherDraft | null {
    return this.activeDraftToEdit;
  }

  public clearActiveDraftToEdit() {
    this.activeDraftToEdit = null;
  }
}

export const journalDraftService = new JournalDraftService();
