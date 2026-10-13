/**
 * ACCOUNTIX - Business Accounting & Management Software
 * Main Application Shell & View Routing Engine
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppHeader } from './components/layout/AppHeader';
import { FooterStatusBar } from './components/layout/FooterStatusBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PartiesView } from './components/masters/PartiesView';
import { ProductsServicesView } from './components/masters/ProductsServicesView';
import { ChartOfAccountsView } from './components/masters/ChartOfAccountsView';
import { LedgerReportView } from './components/reports/LedgerReportView';
import { MssqlSchemaView } from './components/utilities/MssqlSchemaView';
import { ArchitectureGuideView } from './components/help/ArchitectureGuideView';
import { CompanySetupView } from './components/company/CompanySetupView';
import { JournalEntryView } from './components/transactions/JournalEntryView';
import { JournalDraftsListView } from './components/transactions/JournalDraftsListView';
import { SalesInvoiceListView } from './components/transactions/SalesInvoiceListView';
import { SalesInvoiceView } from './components/transactions/SalesInvoiceView';
import { ModulePlaceholderView } from './components/common/ModulePlaceholderView';

// Modals
import { SaleInvoiceModal } from './components/transactions/SaleInvoiceModal';
import { AddPartyModal } from './components/masters/AddPartyModal';
import { AddItemModal } from './components/masters/AddItemModal';
import { CompanySwitcherModal } from './components/layout/CompanySwitcherModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainShell: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeModal,
    openModal,
    closeModal,
    notification,
    dismissNotification,
  } = useApp();

  // If NEW_JOURNAL_ENTRY or NEW_SALE_INVOICE modal is requested, route directly to dedicated views
  useEffect(() => {
    if (activeModal === 'NEW_JOURNAL_ENTRY') {
      closeModal();
      setCurrentView('tx_journal_entry');
    } else if (activeModal === 'NEW_SALE_INVOICE') {
      closeModal();
      setCurrentView('tx_sale_invoice');
    }
  }, [activeModal, closeModal, setCurrentView]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focused inside text input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setCurrentView('help_architecture');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setCurrentView('tx_journal_entry');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setCurrentView('tx_sale_invoice');
      } else if (e.key === 'Escape') {
        setCurrentView('dashboard');
      } else if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setCurrentView('util_mssql_schema');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView]);

  // View dispatcher
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;

      // Masters
      case 'masters_company_setup':
        return <CompanySetupView />;

      case 'masters_customers':
      case 'masters_suppliers':
      case 'masters_combined_parties':
        return <PartiesView />;

      case 'masters_products':
      case 'masters_services':
      case 'masters_categories':
      case 'masters_units':
      case 'masters_stores_locations':
      case 'inv_locations':
        return <ProductsServicesView />;

      case 'masters_chart_of_accounts':
      case 'acc_chart_of_accounts':
        return <ChartOfAccountsView />;

      // Reports
      case 'rep_customer_ledger':
      case 'acc_customer_accounts':
        return <LedgerReportView initialReportType="CUSTOMER" />;
      case 'rep_supplier_ledger':
      case 'acc_supplier_accounts':
        return <LedgerReportView initialReportType="SUPPLIER" />;
      case 'rep_combined_ledger':
      case 'acc_account_ledger':
        return <LedgerReportView initialReportType="COMBINED" />;
      case 'rep_day_book':
        return <LedgerReportView initialReportType="DAY_BOOK" />;
      case 'rep_cash_book':
      case 'acc_cash_account':
        return <LedgerReportView initialReportType="CASH_BOOK" />;
      case 'rep_bank_book':
        return <LedgerReportView initialReportType="CASH_BOOK" />;

      // Utilities
      case 'util_mssql_schema':
        return <MssqlSchemaView />;

      // Help
      case 'help_center':
      case 'help_architecture':
      case 'help_double_entry_guide':
      case 'help_shortcuts':
      case 'help_about':
        return <ArchitectureGuideView />;

      // Specific transaction view requests
      case 'tx_journal_entry':
        return <JournalEntryView />;

      case 'tx_journal_drafts':
        return <JournalDraftsListView />;

      case 'tx_sale_invoice':
        return <SalesInvoiceView />;

      case 'rep_sales_report':
        return <SalesInvoiceListView defaultFilter="ALL" isReportView={true} />;

      // Other placeholder views
      default:
        return <ModulePlaceholderView viewId={currentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header (Brand + Company/FY info + Horizontal Menu Bar) */}
      <AppHeader />

      {/* 2. Notification Toast Banner */}
      {notification && (
        <div className="fixed top-28 right-4 z-50 max-w-sm w-full bg-white border border-blue-200 rounded-lg shadow-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="mt-0.5 shrink-0">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
            {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-slate-900">{notification.title}</h4>
            <p className="text-slate-600 mt-0.5">{notification.message}</p>
          </div>
          <button
            onClick={dismissNotification}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <main className={`flex-1 w-full ${currentView === 'tx_sale_invoice' ? 'p-0' : 'max-w-7xl mx-auto px-3 sm:px-6 py-5'}`}>
        {renderCurrentView()}
      </main>

      {/* 4. Active Modals */}
      {activeModal === 'NEW_SALE_INVOICE' && <SalesInvoiceView isModalMode={true} onClose={closeModal} />}
      {activeModal === 'ADD_CUSTOMER' && <AddPartyModal />}
      {activeModal === 'ADD_SUPPLIER' && <AddPartyModal />}
      {activeModal === 'ADD_PRODUCT' && <AddItemModal defaultType="PRODUCT" />}
      {activeModal === 'ADD_SERVICE' && <AddItemModal defaultType="SERVICE" />}
      {activeModal === 'SWITCH_COMPANY' && <CompanySwitcherModal />}
      {activeModal === 'ARCHITECTURE_DOCS' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-blue-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-blue-700 text-white flex items-center justify-between">
              <span className="font-bold text-sm">ACCOUNTIX Technical Architecture & Shortcuts</span>
              <button
                onClick={() => setCurrentView('help_architecture')}
                className="text-xs text-blue-200 hover:text-white cursor-pointer mr-3"
              >
                Full Roadmap View
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <ArchitectureGuideView />
            </div>
          </div>
        </div>
      )}

      {/* 5. Desktop Accounting Bottom Status Bar (hidden on Sales Invoice to match master reference and fit 1024px viewport) */}
      {currentView !== 'tx_sale_invoice' && <FooterStatusBar />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
