/**
 * ACCOUNTIX - Company & Multi-Entity Management Service Layer
 * Supports multi-company data isolation, company validation, financial year sequencing,
 * and database-ready abstraction for Microsoft SQL Server.
 */

import { Company, FinancialYear } from '../types/accounting';
import { INITIAL_COMPANIES, INITIAL_FINANCIAL_YEARS } from './mockInitialData';

export interface CompanyValidationError {
  field: string;
  message: string;
}

export class CompanyService {
  private companies: Company[] = [...INITIAL_COMPANIES];
  private financialYears: FinancialYear[] = [...INITIAL_FINANCIAL_YEARS];

  // --- COMPANIES ---

  public getCompanies(): Company[] {
    return [...this.companies];
  }

  public getCompanyById(id: string): Company | undefined {
    return this.companies.find((c) => c.id === id);
  }

  public getCompanyByCode(code: string): Company | undefined {
    return this.companies.find((c) => c.code.trim().toUpperCase() === code.trim().toUpperCase());
  }

  public validateCompany(
    data: Partial<Company>,
    editingCompanyId?: string
  ): CompanyValidationError[] {
    const errors: CompanyValidationError[] = [];

    // 1. Company Name Required
    if (!data.name || !data.name.trim()) {
      errors.push({ field: 'name', message: 'Company Name is required.' });
    }

    // 2. Company Code Required & Unique
    if (!data.code || !data.code.trim()) {
      errors.push({ field: 'code', message: 'Company Code is required.' });
    } else {
      const trimmedCode = data.code.trim().toUpperCase();
      const duplicate = this.companies.find(
        (c) => c.code.trim().toUpperCase() === trimmedCode && c.id !== editingCompanyId
      );
      if (duplicate) {
        errors.push({
          field: 'code',
          message: `Company Code "${trimmedCode}" is already in use by "${duplicate.name}". Company Code must be unique.`,
        });
      }
    }

    // 3. Financial Year Start Required & Valid
    if (!data.financialYearStart || !data.financialYearStart.trim()) {
      errors.push({ field: 'financialYearStart', message: 'Financial Year Start date is required.' });
    }

    // 4. Financial Year End Required & Valid
    if (!data.financialYearEnd || !data.financialYearEnd.trim()) {
      errors.push({ field: 'financialYearEnd', message: 'Financial Year End date is required.' });
    }

    // 5. Financial Year End must be after Financial Year Start
    if (data.financialYearStart && data.financialYearEnd) {
      const start = new Date(data.financialYearStart);
      const end = new Date(data.financialYearEnd);
      if (isNaN(start.getTime())) {
        errors.push({ field: 'financialYearStart', message: 'Financial Year Start date format is invalid.' });
      }
      if (isNaN(end.getTime())) {
        errors.push({ field: 'financialYearEnd', message: 'Financial Year End date format is invalid.' });
      }
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
        errors.push({
          field: 'financialYearEnd',
          message: 'Financial Year End must be after Financial Year Start.',
        });
      }
    }

    // 6. Base Currency Required
    if (!data.currency || !data.currency.trim()) {
      errors.push({ field: 'currency', message: 'Base Currency is required.' });
    }

    return errors;
  }

  public saveCompany(
    companyData: Omit<Company, 'id'> & { id?: string },
    initialFyYearCode?: string
  ): { company: Company; created: boolean; errors: CompanyValidationError[] } {
    const errors = this.validateCompany(companyData, companyData.id);
    if (errors.length > 0) {
      return { company: companyData as Company, created: false, errors };
    }

    // Update existing company
    if (companyData.id) {
      const idx = this.companies.findIndex((c) => c.id === companyData.id);
      if (idx !== -1) {
        const updated: Company = {
          ...this.companies[idx],
          ...companyData,
          id: companyData.id,
          code: companyData.code.trim().toUpperCase(),
          name: companyData.name.trim(),
        };
        this.companies[idx] = updated;
        return { company: updated, created: false, errors: [] };
      }
    }

    // Create new company
    const newId = `comp_${Date.now()}`;
    const newCompany: Company = {
      id: newId,
      code: companyData.code.trim().toUpperCase(),
      name: companyData.name.trim(),
      businessType: companyData.businessType || 'General Trading',
      address: companyData.address || '',
      city: companyData.city || '',
      state: companyData.state || '',
      postalCode: companyData.postalCode || '',
      country: companyData.country || 'Pakistan',
      phone: companyData.phone || '',
      mobile: companyData.mobile || '',
      email: companyData.email || '',
      website: companyData.website || '',
      ntn: companyData.ntn || '',
      strn: companyData.strn || '',
      registrationNumber: companyData.registrationNumber || '',
      taxId: companyData.ntn || companyData.taxId || '',
      panOrVat: companyData.panOrVat || '',
      legalTradeName: companyData.legalTradeName || companyData.name,
      currency: companyData.currency || 'PKR',
      currencySymbol: companyData.currencySymbol || 'Rs.',
      decimalPlaces: typeof companyData.decimalPlaces === 'number' ? companyData.decimalPlaces : 2,
      financialYearStart: companyData.financialYearStart,
      financialYearEnd: companyData.financialYearEnd,
      logoUrl: companyData.logoUrl || undefined,
      isActive: companyData.isActive ?? true,
    };

    this.companies.push(newCompany);

    // Automatically establish default active Financial Year for this new company
    const startYear = new Date(newCompany.financialYearStart).getFullYear() || 2026;
    const endYear = new Date(newCompany.financialYearEnd).getFullYear() || 2027;
    const computedCode = initialFyYearCode || `${startYear}-${endYear}`;

    const newFy: FinancialYear = {
      id: `fy_${newId}_01`,
      companyId: newId,
      yearCode: computedCode,
      startDate: newCompany.financialYearStart,
      endDate: newCompany.financialYearEnd,
      status: 'ACTIVE',
      isLocked: false,
      isCurrent: true,
    };
    this.financialYears.push(newFy);

    return { company: newCompany, created: true, errors: [] };
  }

  // --- FINANCIAL YEARS ---

  public getFinancialYears(companyId: string): FinancialYear[] {
    return this.financialYears.filter((fy) => fy.companyId === companyId);
  }

  public getActiveFinancialYear(companyId: string): FinancialYear | undefined {
    return this.financialYears.find((fy) => fy.companyId === companyId && fy.isCurrent);
  }

  public saveFinancialYear(
    fyData: Omit<FinancialYear, 'id'> & { id?: string }
  ): { financialYear: FinancialYear; errors: string[] } {
    const errors: string[] = [];

    if (!fyData.yearCode || !fyData.yearCode.trim()) {
      errors.push('Financial Year Name is required.');
    }
    if (!fyData.startDate) {
      errors.push('Start Date is required.');
    }
    if (!fyData.endDate) {
      errors.push('End Date is required.');
    }
    if (fyData.startDate && fyData.endDate && new Date(fyData.endDate) <= new Date(fyData.startDate)) {
      errors.push('End Date must be after Start Date.');
    }

    if (errors.length > 0) {
      return { financialYear: fyData as FinancialYear, errors };
    }

    // Only one financial year can be active/current per company at a time
    if (fyData.isCurrent) {
      this.financialYears.forEach((fy) => {
        if (fy.companyId === fyData.companyId) {
          fy.isCurrent = false;
        }
      });
    }

    if (fyData.id) {
      const idx = this.financialYears.findIndex((f) => f.id === fyData.id);
      if (idx !== -1) {
        const updated: FinancialYear = {
          ...this.financialYears[idx],
          ...fyData,
          id: fyData.id,
        };
        this.financialYears[idx] = updated;
        return { financialYear: updated, errors: [] };
      }
    }

    const newFy: FinancialYear = {
      id: `fy_${Date.now()}`,
      companyId: fyData.companyId,
      yearCode: fyData.yearCode.trim(),
      startDate: fyData.startDate,
      endDate: fyData.endDate,
      status: fyData.status || 'ACTIVE',
      isLocked: fyData.isLocked ?? false,
      isCurrent: fyData.isCurrent ?? true,
    };
    this.financialYears.push(newFy);
    return { financialYear: newFy, errors: [] };
  }

  public setActiveFinancialYear(companyId: string, fyId: string): boolean {
    let found = false;
    this.financialYears.forEach((fy) => {
      if (fy.companyId === companyId) {
        if (fy.id === fyId) {
          fy.isCurrent = true;
          found = true;
        } else {
          fy.isCurrent = false;
        }
      }
    });
    return found;
  }
}

export const companyService = new CompanyService();
