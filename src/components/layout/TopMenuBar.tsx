/**
 * ACCOUNTIX - Horizontal Top Menu Bar
 * Real functional interactive dropdown panels for all 9 menu categories.
 * Strict unclipped positioning and keyboard/mouse interaction.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuCategory, AppViewId, ModalType } from '../../types/navigation';
import {
  Folder,
  Layers,
  ArrowLeftRight,
  Landmark,
  Package,
  Factory,
  BookOpen,
  Users,
  BarChart3,
  Wrench,
  HelpCircle,
  ChevronDown,
  LayoutDashboard,
  Database,
  User,
} from 'lucide-react';

export interface MenuItemEntry {
  id: string;
  label: string;
  groupHeader?: string;
  shortcut?: string;
  viewId?: AppViewId;
  modalType?: ModalType;
  action?: 'EXIT' | 'PRINT_SETUP';
  isSeparator?: boolean;
}

export interface MenuGroupConfig {
  category: MenuCategory;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItemEntry[];
}

export const TopMenuBar: React.FC = () => {
  const { currentView, setCurrentView, openModal, showNotification } = useApp();
  const [openMenu, setOpenMenu] = useState<MenuCategory | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const navBarRef = useRef<HTMLDivElement>(null);

  // Exact 9 categories with exact items specified in ACCOUNTIX requirements
  const menuGroups: MenuGroupConfig[] = [
    {
      category: 'File',
      icon: Folder,
      items: [
        { id: 'f_comp_setup', label: 'Company Setup', viewId: 'masters_company_setup', shortcut: 'F2' },
        { id: 'f_fin_year', label: 'Financial Year', modalType: 'SWITCH_COMPANY', shortcut: 'Ctrl+S' },
        { id: 'f_backup', label: 'Backup', viewId: 'util_backup_restore' },
        { id: 'f_restore', label: 'Restore', viewId: 'util_backup_restore' },
        { id: 'f_print_setup', label: 'Print Setup', action: 'PRINT_SETUP', viewId: 'file_print_setup' },
        { id: 'f_sep_1', label: '', isSeparator: true },
        { id: 'f_exit', label: 'Exit', action: 'EXIT', shortcut: 'Alt+F4' },
      ],
    },
    {
      category: 'Masters',
      icon: Layers,
      items: [
        // Customers
        { id: 'm_grp_cust', label: 'Customers', groupHeader: 'Customers' },
        { id: 'm_cust_list', label: 'Customer List', viewId: 'masters_customers', shortcut: 'Alt+C' },
        { id: 'm_add_cust', label: 'Add Customer', modalType: 'ADD_CUSTOMER' },
        // Suppliers
        { id: 'm_grp_supp', label: 'Suppliers', groupHeader: 'Suppliers' },
        { id: 'm_supp_list', label: 'Supplier List', viewId: 'masters_suppliers', shortcut: 'Alt+S' },
        { id: 'm_add_supp', label: 'Add Supplier', modalType: 'ADD_SUPPLIER' },
        // Products
        { id: 'm_grp_prod', label: 'Products', groupHeader: 'Products' },
        { id: 'm_prod_list', label: 'Product List', viewId: 'masters_products', shortcut: 'Alt+P' },
        { id: 'm_add_prod', label: 'Add Product', modalType: 'ADD_PRODUCT' },
        // Services
        { id: 'm_grp_serv', label: 'Services', groupHeader: 'Services' },
        { id: 'm_serv_list', label: 'Service List', viewId: 'masters_services', shortcut: 'Alt+V' },
        { id: 'm_add_serv', label: 'Add Service', modalType: 'ADD_SERVICE' },
        // Other Masters
        { id: 'm_grp_other', label: 'Other Masters', groupHeader: 'Other Masters' },
        { id: 'm_categories', label: 'Categories', viewId: 'masters_categories' },
        { id: 'm_units', label: 'Units', viewId: 'masters_units' },
        { id: 'm_stores', label: 'Stores / Locations', viewId: 'masters_stores_locations' },
      ],
    },
    {
      category: 'Transactions',
      icon: ArrowLeftRight,
      items: [
        // Sales
        { id: 't_grp_sales', label: 'Sales', groupHeader: 'Sales' },
        { id: 't_sale_inv', label: 'Sale Invoice', viewId: 'tx_sale_invoice', shortcut: 'F8' },
        { id: 't_sale_reg', label: 'Sales Invoices Register / List', viewId: 'rep_sales_report' },
        { id: 't_sale_ret', label: 'Sales Return', viewId: 'tx_sales_return' },
        { id: 't_sale_quo', label: 'Sales Quotation', viewId: 'tx_sales_quotation' },
        { id: 't_sale_ord', label: 'Sales Order', viewId: 'tx_sales_order' },
        // Purchases
        { id: 't_grp_pur', label: 'Purchases', groupHeader: 'Purchases' },
        { id: 't_pur_inv', label: 'Purchase Invoice', viewId: 'tx_purchase_invoice', shortcut: 'F9' },
        { id: 't_pur_ret', label: 'Purchase Return', viewId: 'tx_purchase_return' },
        { id: 't_pur_quo', label: 'Purchase Quotation', viewId: 'tx_purchase_quotation' },
        { id: 't_pur_ord', label: 'Purchase Order', viewId: 'tx_purchase_order' },
        // Cash & Accounting
        { id: 't_grp_cash', label: 'Cash & Accounting', groupHeader: 'Cash & Accounting' },
        { id: 't_cash_rcp', label: 'Cash Received', modalType: 'NEW_CASH_RECEIPT', shortcut: 'F6' },
        { id: 't_cash_pay', label: 'Cash Paid', modalType: 'NEW_CASH_PAYMENT', shortcut: 'F5' },
        { id: 't_journal', label: 'Journal Entry', viewId: 'tx_journal_entry', shortcut: 'F7' },
        { id: 't_journal_drafts', label: 'Journal Entries / Drafts', viewId: 'tx_journal_drafts' },
        { id: 't_expense', label: 'Expense', viewId: 'tx_expense' },
        { id: 't_income', label: 'Income', viewId: 'tx_income' },
      ],
    },
    {
      category: 'Inventory',
      icon: Package,
      items: [
        { id: 'i_dash', label: 'Stock Dashboard', viewId: 'inv_stock_summary' },
        { id: 'i_adj', label: 'Stock Adjustment', viewId: 'inv_stock_adjustment' },
        { id: 'i_transfer', label: 'Stock Transfer', viewId: 'inv_stock_transfer' },
        { id: 'i_in', label: 'Stock In', viewId: 'inv_stock_in' },
        { id: 'i_out', label: 'Stock Out', viewId: 'inv_stock_out' },
        { id: 'i_sep_1', label: '', isSeparator: true },
        { id: 'i_ledger', label: 'Stock Ledger', viewId: 'inv_stock_ledger' },
        { id: 'i_val', label: 'Inventory Valuation', viewId: 'inv_valuation' },
      ],
    },
    {
      category: 'Banking',
      icon: Landmark,
      items: [
        { id: 'b_accounts', label: 'Bank Accounts', viewId: 'banking_accounts' },
        { id: 'b_rcp', label: 'Bank Receipt', viewId: 'banking_receipt' },
        { id: 'b_pay', label: 'Bank Payment', viewId: 'banking_payment' },
        { id: 'b_trans', label: 'Bank Transfer', viewId: 'banking_transfer' },
        { id: 'b_contra', label: 'Contra', viewId: 'tx_contra_entry', shortcut: 'F4' },
        { id: 'b_other', label: 'Other Bank Transactions', viewId: 'banking_other_tx' },
        { id: 'b_sep_1', label: '', isSeparator: true },
        { id: 'b_rec', label: 'Bank Reconciliation', viewId: 'banking_reconciliation' },
      ],
    },
    {
      category: 'Accounts',
      icon: BookOpen,
      items: [
        { id: 'a_coa', label: 'Chart of Accounts', viewId: 'masters_chart_of_accounts', shortcut: 'Alt+A' },
        { id: 'a_cust_acc', label: 'Customer Accounts', viewId: 'rep_customer_ledger' },
        { id: 'a_supp_acc', label: 'Supplier Accounts', viewId: 'rep_supplier_ledger' },
        { id: 'a_sep_1', label: '', isSeparator: true },
        { id: 'a_cash_acc', label: 'Cash Account', viewId: 'rep_cash_book' },
        { id: 'a_bank_acc', label: 'Bank Accounts', viewId: 'banking_accounts' },
        { id: 'a_sep_2', label: '', isSeparator: true },
        { id: 'a_journal', label: 'Journal Entry', viewId: 'tx_journal_entry' },
        { id: 'a_journal_drafts', label: 'Journal Entries / Drafts', viewId: 'tx_journal_drafts' },
        { id: 'a_ledger', label: 'Account Ledger', viewId: 'rep_combined_ledger' },
      ],
    },
    {
      category: 'Manufacturing',
      icon: Factory,
      items: [
        { id: 'mfg_raw_materials', label: 'Raw Materials', viewId: 'mfg_raw_materials' },
        { id: 'mfg_finished_goods', label: 'Finished Goods', viewId: 'mfg_finished_goods' },
        { id: 'mfg_bom', label: 'Bill of Materials (BOM)', viewId: 'mfg_bom' },
        { id: 'mfg_production_entry', label: 'Production Entry', viewId: 'mfg_production_entry' },
        { id: 'mfg_production_reversal', label: 'Production Reversal / Cancellation', viewId: 'mfg_production_reversal' },
        { id: 'mfg_wastage_scrap', label: 'Wastage / Scrap', viewId: 'mfg_wastage_scrap' },
        { id: 'mfg_costing', label: 'Manufacturing Costing', viewId: 'mfg_costing' },
        { id: 'mfg_reports', label: 'Manufacturing Reports', viewId: 'mfg_reports' },
      ],
    },
    {
      category: 'Payroll',
      icon: Users,
      items: [
        { id: 'pay_employees', label: 'Employee Master', viewId: 'masters_customers' },
        { id: 'pay_attendance', label: 'Attendance & Leave Entry', viewId: 'tx_expense' },
        { id: 'pay_salary_sheet', label: 'Monthly Salary Sheet', viewId: 'tx_journal_entry' },
        { id: 'pay_disbursement', label: 'Salary Disbursement / Payment', modalType: 'NEW_CASH_PAYMENT' },
        { id: 'pay_sep_1', label: '', isSeparator: true },
        { id: 'pay_reports', label: 'Payroll & Gratuity Reports', viewId: 'rep_day_book' },
      ],
    },
    {
      category: 'Reports',
      icon: BarChart3,
      items: [
        // Sales Reports
        { id: 'r_grp_sales', label: 'Sales Reports', groupHeader: 'Sales Reports' },
        { id: 'r_sale_rep', label: 'Sales Report', viewId: 'rep_sales_report' },
        { id: 'r_sale_ret_rep', label: 'Sales Return Report', viewId: 'rep_sales_return' },
        { id: 'r_sale_quo_rep', label: 'Sales Quotation Report', viewId: 'rep_sales_quotation' },
        // Purchase Reports
        { id: 'r_grp_pur', label: 'Purchase Reports', groupHeader: 'Purchase Reports' },
        { id: 'r_pur_rep', label: 'Purchase Report', viewId: 'rep_purchase_report' },
        { id: 'r_pur_ret_rep', label: 'Purchase Return Report', viewId: 'rep_purchase_return' },
        { id: 'r_pur_quo_rep', label: 'Purchase Quotation Report', viewId: 'rep_purchase_quotation' },
        // Ledger Reports
        { id: 'r_grp_ledgers', label: 'Ledger Reports', groupHeader: 'Ledger Reports' },
        { id: 'r_cust_led', label: 'Customer Ledger', viewId: 'rep_customer_ledger' },
        { id: 'r_supp_led', label: 'Supplier Ledger', viewId: 'rep_supplier_ledger' },
        { id: 'r_comb_led', label: 'Combined Party Ledger', viewId: 'rep_combined_ledger' },
        { id: 'r_cash_bk', label: 'Cash Book', viewId: 'rep_cash_book' },
        { id: 'r_bank_bk', label: 'Bank Book', viewId: 'rep_bank_book' },
        { id: 'r_day_bk', label: 'Day Book', viewId: 'rep_day_book' },
        // Financial Reports
        { id: 'r_grp_fin', label: 'Financial Reports', groupHeader: 'Financial Reports' },
        { id: 'r_tb', label: 'Trial Balance', viewId: 'acc_trial_balance' },
        { id: 'r_pnl', label: 'Profit & Loss', viewId: 'rep_profit_loss' },
        { id: 'r_bs', label: 'Balance Sheet', viewId: 'rep_balance_sheet' },
        // Inventory Reports
        { id: 'r_grp_inv', label: 'Inventory Reports', groupHeader: 'Inventory Reports' },
        { id: 'r_stk_rep', label: 'Stock Report', viewId: 'rep_stock_report' },
        { id: 'r_stk_led', label: 'Stock Ledger', viewId: 'rep_stock_ledger' },
        { id: 'r_inv_val', label: 'Inventory Valuation', viewId: 'inv_valuation' },
      ],
    },
    {
      category: 'Utilities',
      icon: Wrench,
      items: [
        { id: 'u_calc', label: 'Calculator', viewId: 'util_calculator' },
        { id: 'u_date_calc', label: 'Date Calculator', viewId: 'util_date_calculator' },
        { id: 'u_import', label: 'Import Data', viewId: 'util_import_data' },
        { id: 'u_export', label: 'Export Data', viewId: 'util_export_data' },
        { id: 'u_audit', label: 'Audit Log', viewId: 'util_audit_log' },
        { id: 'u_settings', label: 'System Settings', viewId: 'util_system_settings' },
        { id: 'u_sep_1', label: '', isSeparator: true },
        { id: 'u_mssql', label: 'Microsoft SQL Server Schema & DDL', viewId: 'util_mssql_schema', shortcut: 'Ctrl+M' },
      ],
    },
    {
      category: 'Help',
      icon: HelpCircle,
      items: [
        { id: 'h_center', label: 'Help Center', viewId: 'help_center', shortcut: 'F1' },
        { id: 'h_shortcuts', label: 'Keyboard Shortcuts', viewId: 'help_shortcuts' },
        { id: 'h_about', label: 'About ACCOUNTIX', viewId: 'help_about' },
      ],
    },
  ];

  // Category click handler: toggles active menu or switches to clicked menu
  const handleCategoryClick = (cat: MenuCategory) => {
    setOpenMenu((prev) => (prev === cat ? null : cat));
    setFocusedIndex(-1);
  };

  // Category hover handler: when a menu is already open, hovering switches cleanly to the new menu
  const handleCategoryMouseEnter = (cat: MenuCategory) => {
    if (openMenu !== null && openMenu !== cat) {
      setOpenMenu(cat);
      setFocusedIndex(-1);
    }
  };

  // Item click handler
  const handleItemClick = (item: MenuItemEntry) => {
    setOpenMenu(null);
    setFocusedIndex(-1);

    if (item.action === 'EXIT') {
      showNotification(
        'info',
        'ACCOUNTIX Session Protected',
        'In a desktop client, Exit closes the workspace. All accounting transactions remain persisted.'
      );
      setCurrentView('dashboard');
      return;
    }

    if (item.action === 'PRINT_SETUP') {
      showNotification(
        'info',
        'Print Configuration',
        'Voucher and Invoice Print Setup module: 80mm POS Thermal, Laser A4/A5, and Pre-printed stationery.'
      );
      setCurrentView('file_print_setup');
      return;
    }

    if (item.modalType) {
      openModal(item.modalType);
    } else if (item.viewId) {
      setCurrentView(item.viewId);
    }
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navBarRef.current && !navBarRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
        setFocusedIndex(-1);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Keyboard navigation within the active open dropdown
  const activeSection = menuGroups.find((g) => g.category === openMenu);
  const navigableItems = activeSection
    ? activeSection.items.filter((it) => !it.isSeparator && !it.groupHeader)
    : [];

  const handleMenuKeyDown = (e: React.KeyboardEvent, cat: MenuCategory) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (openMenu !== cat) {
        setOpenMenu(cat);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => (prev + 1) % navigableItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (openMenu === cat) {
        setFocusedIndex((prev) => (prev <= 0 ? navigableItems.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (openMenu === cat && focusedIndex >= 0 && navigableItems[focusedIndex]) {
        e.preventDefault();
        handleItemClick(navigableItems[focusedIndex]);
      } else if (openMenu !== cat) {
        e.preventDefault();
        setOpenMenu(cat);
        setFocusedIndex(0);
      }
    }
  };

  const isSaleInvoice = currentView === 'tx_sale_invoice';

  return (
    <div
      ref={navBarRef}
      className={`${
        isSaleInvoice
          ? 'bg-[#e2ebf4] border-b border-[#c5d7e8] text-slate-800'
          : 'bg-blue-800 border-b border-blue-900 text-white'
      } px-3 py-0.5 flex items-center justify-between shadow-xs select-none relative z-50 text-xs`}
    >
      {/* 
        CRITICAL: Never put overflow-hidden or overflow-x-auto on this container! 
        Overflow clipping would prevent absolute dropdowns from rendering outside the menu bar.
      */}
      <div className="flex items-center gap-1 py-0.5 flex-wrap">
        {/* Quick Return to Dashboard Button (hidden on invoice to match exact reference menu) */}
        {!isSaleInvoice && (
          <>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setOpenMenu(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'dashboard' && openMenu === null
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-white hover:bg-blue-700/80 hover:text-white'
              }`}
              title="Return to Dashboard (Esc)"
            >
              <LayoutDashboard className={`w-3.5 h-3.5 ${currentView === 'dashboard' && openMenu === null ? 'text-blue-800' : 'text-blue-200'}`} />
              <span>Dashboard</span>
            </button>
            <div className="h-4 w-px bg-blue-700/80 mx-1" />
          </>
        )}

        {/* 11 Category Dropdown Menus */}
        {menuGroups.map((section) => {
          const isOpen = openMenu === section.category;
          const isCategoryActive = section.items.some(
            (item) => item.viewId && item.viewId === currentView
          );

          return (
            <div
              key={section.category}
              className="relative"
              onMouseEnter={() => handleCategoryMouseEnter(section.category)}
            >
              {/* Category Trigger Button */}
              <button
                type="button"
                id={`menu-btn-${section.category.toLowerCase()}`}
                onClick={() => handleCategoryClick(section.category)}
                onKeyDown={(e) => handleMenuKeyDown(e, section.category)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors outline-hidden ${
                  isSaleInvoice
                    ? isOpen
                      ? 'bg-[#c5dcee] text-blue-950 font-bold shadow-2xs'
                      : isCategoryActive
                      ? 'bg-[#bcd7ee] text-blue-950 font-bold'
                      : 'text-slate-800 hover:bg-[#d5e4f2]'
                    : isOpen
                    ? 'bg-blue-950 text-white shadow-xs'
                    : isCategoryActive
                    ? 'bg-blue-900/90 text-white font-bold ring-1 ring-blue-400/50'
                    : 'text-white hover:bg-blue-700/80 hover:text-white'
                }`}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <span>{section.category}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-150 ${
                    isOpen
                      ? 'rotate-180 ' + (isSaleInvoice ? 'text-blue-900' : 'text-white')
                      : isSaleInvoice
                      ? 'text-slate-500'
                      : 'text-blue-200'
                  }`}
                />
              </button>

              {/* ACTUAL FUNCTIONAL DROPDOWN PANEL */}
              {isOpen && (
                <div
                  id={`menu-dropdown-${section.category.toLowerCase()}`}
                  className="absolute left-0 top-full mt-1 w-64 sm:w-72 max-h-[calc(100vh-140px)] overflow-y-auto bg-white border border-slate-200 rounded-md shadow-2xl py-1 z-[9999] text-slate-800 animate-in fade-in zoom-in-98 duration-100"
                  style={{ minWidth: '240px', zIndex: 9999 }}
                  role="menu"
                  aria-label={`${section.category} Menu Panel`}
                >
                  {/* Category Header Bar */}
                  <div className="px-3 py-1.5 border-b border-blue-50 bg-blue-50/80 text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <section.icon className="w-3.5 h-3.5 text-blue-700" />
                      <span>{section.category}</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-normal lowercase">ACCOUNTIX</span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {section.items.map((item, idx) => {
                      // 1. Group Header (e.g., Customers, Suppliers, Sales, etc.)
                      if (item.groupHeader) {
                        return (
                          <div
                            key={`grp-${idx}`}
                            className="px-3 py-1.5 mt-1.5 first:mt-0 text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50/50 border-y border-blue-100/60 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span>{item.groupHeader}</span>
                          </div>
                        );
                      }

                      // 2. Separator Line
                      if (item.isSeparator) {
                        return (
                          <div
                            key={`sep-${idx}`}
                            className="h-px bg-slate-100 my-1 mx-2"
                          />
                        );
                      }

                      // 3. Actionable Dropdown Item
                      const isSelected = item.viewId && item.viewId === currentView;
                      const isFocused =
                        navigableItems[focusedIndex] &&
                        navigableItems[focusedIndex].id === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between cursor-pointer transition-colors outline-hidden ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-semibold border-l-2 border-blue-700 pl-3'
                              : isFocused
                              ? 'bg-blue-50/80 text-blue-900 pl-3.5'
                              : 'text-slate-800 hover:bg-blue-50 hover:text-blue-900'
                          }`}
                          role="menuitem"
                        >
                          <span className="truncate pr-2">{item.label}</span>
                          {item.shortcut && (
                            <kbd className="shrink-0 text-[10px] font-mono text-slate-500 px-1 py-0.2 rounded bg-slate-100 border border-slate-200">
                              {item.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right side user or helper quick link */}
      <div className="flex items-center gap-2 text-xs">
        {isSaleInvoice ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#c8dcee] cursor-pointer text-slate-800">
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-xs text-slate-800">admin</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>
        ) : (
          <button
            onClick={() => {
              setCurrentView('util_mssql_schema');
              setOpenMenu(null);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-white hover:bg-blue-700 cursor-pointer border border-blue-600/70 bg-blue-900/60 transition-colors"
            title="Inspect Microsoft SQL Server DDL Schema"
          >
            <Database className="w-3 h-3 text-sky-300" />
            <span>MSSQL Schema</span>
          </button>
        )}
      </div>
    </div>
  );
};
