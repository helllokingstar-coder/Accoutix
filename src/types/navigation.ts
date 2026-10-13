/**
 * ACCOUNTIX - Navigation & Menu System Architecture
 * Clean horizontal top category-based navigation without mega menus or duplicated links
 */

export type MenuCategory =
  | 'File'
  | 'Masters'
  | 'Transactions'
  | 'Inventory'
  | 'Banking'
  | 'Accounts'
  | 'Manufacturing'
  | 'Payroll'
  | 'Reports'
  | 'Utilities'
  | 'Help';

export type AppViewId =
  | 'dashboard'
  // Masters
  | 'masters_customers'
  | 'masters_suppliers'
  | 'masters_combined_parties'
  | 'masters_products'
  | 'masters_services'
  | 'masters_categories'
  | 'masters_units'
  | 'masters_stores_locations'
  | 'masters_chart_of_accounts'
  | 'masters_company_setup'
  // Transactions
  | 'tx_sale_invoice'
  | 'tx_sales_return'
  | 'tx_sales_quotation'
  | 'tx_sales_order'
  | 'tx_purchase_invoice'
  | 'tx_purchase_return'
  | 'tx_purchase_quotation'
  | 'tx_purchase_order'
  | 'tx_cash_receipt'
  | 'tx_cash_payment'
  | 'tx_journal_entry'
  | 'tx_journal_drafts'
  | 'tx_expense'
  | 'tx_income'
  | 'tx_contra_entry'
  // Banking
  | 'banking_accounts'
  | 'banking_receipt'
  | 'banking_payment'
  | 'banking_transfer'
  | 'banking_contra'
  | 'banking_other_tx'
  | 'banking_reconciliation'
  | 'banking_cheque_register'
  // Inventory
  | 'inv_stock_summary'
  | 'inv_stock_adjustment'
  | 'inv_stock_transfer'
  | 'inv_stock_in'
  | 'inv_stock_out'
  | 'inv_stock_ledger'
  | 'inv_valuation'
  | 'inv_locations'
  | 'inv_reorder_status'
  // Manufacturing
  | 'mfg_raw_materials'
  | 'mfg_finished_goods'
  | 'mfg_bom'
  | 'mfg_production_entry'
  | 'mfg_production_reversal'
  | 'mfg_wastage_scrap'
  | 'mfg_costing'
  | 'mfg_reports'
  // Accounts
  | 'acc_chart_of_accounts'
  | 'acc_customer_accounts'
  | 'acc_supplier_accounts'
  | 'acc_cash_account'
  | 'acc_bank_accounts'
  | 'acc_journal'
  | 'acc_account_ledger'
  | 'acc_trial_balance'
  | 'acc_opening_balances'
  | 'acc_cost_centres'
  // Reports
  | 'rep_sales_report'
  | 'rep_sales_return'
  | 'rep_sales_quotation'
  | 'rep_purchase_report'
  | 'rep_purchase_return'
  | 'rep_purchase_quotation'
  | 'rep_customer_ledger'
  | 'rep_supplier_ledger'
  | 'rep_combined_ledger'
  | 'rep_day_book'
  | 'rep_cash_book'
  | 'rep_bank_book'
  | 'rep_trial_balance'
  | 'rep_profit_loss'
  | 'rep_balance_sheet'
  | 'rep_stock_report'
  | 'rep_stock_ledger'
  // File
  | 'file_financial_year'
  | 'file_print_setup'
  // Utilities
  | 'util_calculator'
  | 'util_date_calculator'
  | 'util_import_data'
  | 'util_export_data'
  | 'util_audit_log'
  | 'util_system_settings'
  | 'util_mssql_schema'
  | 'util_data_health'
  | 'util_backup_restore'
  // Help
  | 'help_center'
  | 'help_shortcuts'
  | 'help_about'
  | 'help_architecture'
  | 'help_double_entry_guide';

export interface MenuItem {
  id: string;
  label: string;
  viewId: AppViewId;
  shortcut?: string;
  description?: string;
  isSeparator?: boolean;
}

export interface MenuGroup {
  category: MenuCategory;
  items: MenuItem[];
}

export type ModalType =
  | null
  | 'ADD_CUSTOMER'
  | 'ADD_SUPPLIER'
  | 'ADD_PRODUCT'
  | 'ADD_SERVICE'
  | 'NEW_SALE_INVOICE'
  | 'NEW_PURCHASE_INVOICE'
  | 'NEW_CASH_RECEIPT'
  | 'NEW_CASH_PAYMENT'
  | 'NEW_JOURNAL_ENTRY'
  | 'SWITCH_COMPANY'
  | 'MSSQL_SCHEMA_MODAL'
  | 'ARCHITECTURE_DOCS';
