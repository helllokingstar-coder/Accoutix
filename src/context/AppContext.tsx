/**
 * ACCOUNTIX - Global Application State Context
 * Handles Active Company, Financial Year, Navigation Views, and Modals
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, FinancialYear, UserSession, DashboardKPIData, Voucher } from '../types/accounting';
import { Party, Item } from '../types/masters';
import { AppViewId, ModalType } from '../types/navigation';
import { INITIAL_COMPANIES, INITIAL_FINANCIAL_YEARS } from '../services/mockInitialData';
import { accountingService } from '../services/accountingService';
import { mastersService } from '../services/mastersService';
import { companyService } from '../services/companyService';
import { formatDate } from '../utils/dateUtils';

interface NotificationInfo {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  activeCompany: Company;
  setActiveCompany: (company: Company) => boolean;
  availableCompanies: Company[];
  refreshCompanies: () => void;
  activeFinancialYear: FinancialYear;
  setActiveFinancialYear: (fy: FinancialYear) => void;
  availableFinancialYears: FinancialYear[];
  refreshFinancialYears: () => void;
  currentDateString: string;
  currentUser: UserSession;
  currentView: AppViewId;
  setCurrentView: (view: AppViewId) => void;
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  kpis: DashboardKPIData;
  refreshKPIs: () => void;
  parties: Party[];
  refreshParties: () => void;
  items: Item[];
  refreshItems: () => void;
  vouchers: Voucher[];
  refreshVouchers: () => void;
  notification: NotificationInfo | null;
  showNotification: (type: 'info' | 'success' | 'warning', title: string, message: string) => void;
  dismissNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>(companyService.getCompanies());
  const [activeCompany, setActiveCompanyState] = useState<Company>(
    companyService.getCompanies()[0] || INITIAL_COMPANIES[0]
  );

  const [availableFinancialYears, setAvailableFinancialYears] = useState<FinancialYear[]>(
    companyService.getFinancialYears(activeCompany.id)
  );
  const [activeFinancialYear, setActiveFinancialYearState] = useState<FinancialYear>(
    companyService.getActiveFinancialYear(activeCompany.id) || INITIAL_FINANCIAL_YEARS[0]
  );

  const refreshCompanies = () => {
    const list = companyService.getCompanies();
    setAvailableCompanies(list);
    // Sync active company with updated details if already selected
    const updatedActive = list.find((c) => c.id === activeCompany.id);
    if (updatedActive) {
      setActiveCompanyState(updatedActive);
    }
  };

  const refreshFinancialYears = () => {
    const list = companyService.getFinancialYears(activeCompany.id);
    setAvailableFinancialYears(list);
    const updatedActiveFy = companyService.getActiveFinancialYear(activeCompany.id);
    if (updatedActiveFy) {
      setActiveFinancialYearState(updatedActiveFy);
    }
  };

  const setActiveCompany = (company: Company): boolean => {
    if (!company.isActive) {
      showNotification(
        'warning',
        'Inactive Company',
        `"${company.name}" is marked as Inactive. Only Active companies can be selected for accounting operations.`
      );
      return false;
    }

    setActiveCompanyState(company);
    // Load associated financial years for the newly selected company
    const compFys = companyService.getFinancialYears(company.id);
    setAvailableFinancialYears(compFys);
    const currentFy = compFys.find((f) => f.isCurrent) || compFys[0];
    if (currentFy) {
      setActiveFinancialYearState(currentFy);
    }
    return true;
  };

  const setActiveFinancialYear = (fy: FinancialYear) => {
    companyService.setActiveFinancialYear(fy.companyId, fy.id);
    setActiveFinancialYearState(fy);
    setAvailableFinancialYears(companyService.getFinancialYears(fy.companyId));
  };

  const [currentUser] = useState<UserSession>({
    userId: 'usr_001',
    userName: 'admin',
    displayName: 'Admin (Super User)',
    role: 'SUPER_ADMIN',
  });

  // Current system date formatted professionally as DD/MM/YYYY
  const currentDateString = formatDate(new Date()) || '08/10/2026';

  const [currentView, setCurrentView] = useState<AppViewId>('tx_sale_invoice');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [kpis, setKpis] = useState<DashboardKPIData>(accountingService.getDashboardKPIs());
  const [parties, setParties] = useState<Party[]>(mastersService.getParties());
  const [items, setItems] = useState<Item[]>(mastersService.getItems());
  const [vouchers, setVouchers] = useState<Voucher[]>(accountingService.getVouchers());

  const [notification, setNotification] = useState<NotificationInfo | null>(null);

  const refreshKPIs = () => {
    setKpis(accountingService.getDashboardKPIs());
  };

  const refreshParties = () => {
    setParties(mastersService.getParties());
  };

  const refreshItems = () => {
    setItems(mastersService.getItems());
  };

  const refreshVouchers = () => {
    setVouchers(accountingService.getVouchers());
  };

  const showNotification = (type: 'info' | 'success' | 'warning', title: string, message: string) => {
    setNotification({
      id: String(Date.now()),
      type,
      title,
      message,
    });
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <AppContext.Provider
      value={{
        activeCompany,
        setActiveCompany,
        availableCompanies,
        refreshCompanies,
        activeFinancialYear,
        setActiveFinancialYear,
        availableFinancialYears,
        refreshFinancialYears,
        currentDateString,
        currentUser,
        currentView,
        setCurrentView,
        activeModal,
        openModal,
        closeModal,
        kpis,
        refreshKPIs,
        parties,
        refreshParties,
        items,
        refreshItems,
        vouchers,
        refreshVouchers,
        notification,
        showNotification,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
