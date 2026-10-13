/**
 * ACCOUNTIX - Company Setup & Multi-Entity Administration
 * Foundation for multi-company isolation, financial year management,
 * tax registration, and Microsoft SQL Server ready data architecture.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Company, FinancialYear } from '../../types/accounting';
import { companyService, CompanyValidationError } from '../../services/companyService';
import { formatDate } from '../../utils/dateUtils';
import { AccountixDatePicker } from '../common/AccountixDatePicker';
import {
  Building2,
  Calendar,
  Save,
  Plus,
  RotateCcw,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  FileText,
  DollarSign,
  ArrowRight,
  Layers,
  Database,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export const CompanySetupView: React.FC = () => {
  const {
    activeCompany,
    setActiveCompany,
    availableCompanies,
    refreshCompanies,
    activeFinancialYear,
    setActiveFinancialYear,
    availableFinancialYears,
    refreshFinancialYears,
    setCurrentView,
    showNotification,
  } = useApp();

  // Selected company being viewed/edited in the form
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(activeCompany.id);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Company>>({
    name: activeCompany.name,
    code: activeCompany.code,
    businessType: activeCompany.businessType || 'General Trading & Wholesale',
    address: activeCompany.address,
    city: activeCompany.city,
    state: activeCompany.state,
    postalCode: activeCompany.postalCode || '54000',
    country: activeCompany.country || 'Pakistan',
    phone: activeCompany.phone,
    mobile: activeCompany.mobile || '',
    email: activeCompany.email,
    website: activeCompany.website || '',
    ntn: activeCompany.ntn || activeCompany.taxId || '',
    strn: activeCompany.strn || '',
    registrationNumber: activeCompany.registrationNumber || '',
    financialYearStart: activeCompany.financialYearStart || '2026-04-01',
    financialYearEnd: activeCompany.financialYearEnd || '2027-03-31',
    currency: activeCompany.currency || 'PKR',
    currencySymbol: activeCompany.currencySymbol || 'Rs.',
    decimalPlaces: typeof activeCompany.decimalPlaces === 'number' ? activeCompany.decimalPlaces : 2,
    logoUrl: activeCompany.logoUrl,
    isActive: activeCompany.isActive ?? true,
  });

  // Validation Errors
  const [errors, setErrors] = useState<CompanyValidationError[]>([]);

  // Financial Years state for the currently loaded company
  const [companyFys, setCompanyFys] = useState<FinancialYear[]>(
    companyService.getFinancialYears(activeCompany.id)
  );

  // New FY inline form toggle
  const [showAddFy, setShowAddFy] = useState<boolean>(false);
  const [newFyCode, setNewFyCode] = useState<string>('');
  const [newFyStart, setNewFyStart] = useState<string>('2027-04-01');
  const [newFyEnd, setNewFyEnd] = useState<string>('2028-03-31');
  const [newFyError, setNewFyError] = useState<string>('');

  // Logo file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form when selected company changes
  const loadCompanyIntoForm = (company: Company) => {
    setIsCreatingNew(false);
    setSelectedCompanyId(company.id);
    setErrors([]);
    setFormData({
      id: company.id,
      name: company.name,
      code: company.code,
      businessType: company.businessType || 'General Trading & Wholesale',
      address: company.address,
      city: company.city,
      state: company.state,
      postalCode: company.postalCode || '',
      country: company.country || 'Pakistan',
      phone: company.phone,
      mobile: company.mobile || '',
      email: company.email,
      website: company.website || '',
      ntn: company.ntn || company.taxId || '',
      strn: company.strn || '',
      registrationNumber: company.registrationNumber || '',
      financialYearStart: company.financialYearStart || '2026-04-01',
      financialYearEnd: company.financialYearEnd || '2027-03-31',
      currency: company.currency || 'PKR',
      currencySymbol: company.currencySymbol || 'Rs.',
      decimalPlaces: typeof company.decimalPlaces === 'number' ? company.decimalPlaces : 2,
      logoUrl: company.logoUrl,
      isActive: company.isActive ?? true,
    });
    setCompanyFys(companyService.getFinancialYears(company.id));
  };

  useEffect(() => {
    const current = companyService.getCompanyById(selectedCompanyId);
    if (current && !isCreatingNew) {
      loadCompanyIntoForm(current);
    }
  }, [selectedCompanyId]);

  // Form input change helper
  const handleInputChange = (field: keyof Company, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error on change
    if (errors.some((e) => e.field === field)) {
      setErrors((prev) => prev.filter((e) => e.field !== field));
    }
  };

  // Action: New Company
  const handleNewCompany = () => {
    setIsCreatingNew(true);
    setSelectedCompanyId('');
    setErrors([]);
    setFormData({
      name: '',
      code: '',
      businessType: 'General Trading & Distribution',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Pakistan',
      phone: '',
      mobile: '',
      email: '',
      website: '',
      ntn: '',
      strn: '',
      registrationNumber: '',
      financialYearStart: '2026-04-01',
      financialYearEnd: '2027-03-31',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      decimalPlaces: 2,
      logoUrl: undefined,
      isActive: true,
    });
    setCompanyFys([]);
  };

  // Action: Clear form fields
  const handleClear = () => {
    setFormData((prev) => ({
      ...prev,
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      phone: '',
      mobile: '',
      email: '',
      website: '',
      ntn: '',
      strn: '',
      registrationNumber: '',
    }));
    setErrors([]);
  };

  // Action: Cancel
  const handleCancel = () => {
    const active = companyService.getCompanyById(activeCompany.id) || availableCompanies[0];
    if (active) {
      loadCompanyIntoForm(active);
    }
  };

  // Action: Save Company (and optionally activate)
  const handleSave = (makeActive = false): boolean => {
    const payload = {
      ...formData,
      id: isCreatingNew ? undefined : selectedCompanyId,
    };

    const result = companyService.saveCompany(payload as any);

    if (result.errors.length > 0) {
      setErrors(result.errors);
      showNotification('warning', 'Validation Failed', result.errors[0].message);
      return false;
    }

    refreshCompanies();
    refreshFinancialYears();
    setErrors([]);
    setIsCreatingNew(false);
    setSelectedCompanyId(result.company.id);
    loadCompanyIntoForm(result.company);

    if (makeActive) {
      const switched = setActiveCompany(result.company);
      if (switched) {
        showNotification(
          'success',
          'Company Saved & Activated',
          `"${result.company.name}" is now the active operating entity.`
        );
      }
    } else {
      showNotification(
        'success',
        result.created ? 'Company Registered' : 'Company Updated',
        `Entity "${result.company.name}" (${result.company.code}) saved successfully.`
      );
    }

    return true;
  };

  // Handle Logo Upload (FileReader data URL)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('warning', 'Invalid File Type', 'Please upload a valid image (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotification('warning', 'File Too Large', 'Logo image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: result }));
      showNotification('info', 'Logo Ready', 'Company logo loaded. Click Save to persist.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Logo Remove
  const handleLogoRemove = () => {
    setFormData((prev) => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    showNotification('info', 'Logo Removed', 'Company logo cleared.');
  };

  // Action: Add new financial year to currently loaded company
  const handleAddNewFinancialYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      setNewFyError('Please save the company before adding additional financial years.');
      return;
    }
    if (!newFyCode.trim()) {
      setNewFyError('Financial Year Name (e.g. 2027-2028) is required.');
      return;
    }

    const result = companyService.saveFinancialYear({
      companyId: selectedCompanyId,
      yearCode: newFyCode.trim(),
      startDate: newFyStart,
      endDate: newFyEnd,
      status: 'ACTIVE',
      isLocked: false,
      isCurrent: false,
    });

    if (result.errors.length > 0) {
      setNewFyError(result.errors[0]);
      return;
    }

    setCompanyFys(companyService.getFinancialYears(selectedCompanyId));
    setShowAddFy(false);
    setNewFyCode('');
    setNewFyError('');
    showNotification('success', 'Financial Year Created', `Fiscal year "${result.financialYear.yearCode}" registered.`);
  };

  // Action: Set Active Financial Year
  const handleSetActiveFy = (fy: FinancialYear) => {
    companyService.setActiveFinancialYear(fy.companyId, fy.id);
    setCompanyFys(companyService.getFinancialYears(fy.companyId));
    if (fy.companyId === activeCompany.id) {
      setActiveFinancialYear(fy);
    }
    showNotification('success', 'Fiscal Year Activated', `Active financial year set to ${fy.yearCode}.`);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header & Primary Action Bar */}
      <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Company Setup & Entity Administration
              </h1>
              <p className="text-xs text-slate-500">
                Core multi-company architecture, financial periods, tax registrations, and data isolation.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleNewCompany}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors shadow-xs ${
              isCreatingNew
                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-blue-700" />
            <span>New Company</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            title="Save and set this entity as the active operating company"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save & Continue</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Validation Banner if errors exist */}
      {errors.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-3 animate-in fade-in duration-100">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-900">Please correct the following errors:</h4>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {errors.map((err, idx) => (
                <li key={idx}>{err.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 2. Registered Companies Directory Card */}
      <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-blue-50">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Company Registry ({availableCompanies.length} Entities)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Current Operating Entity:{' '}
            <strong className="text-blue-900 font-semibold">{activeCompany.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableCompanies.map((comp) => {
            const isSelectedInForm = comp.id === selectedCompanyId && !isCreatingNew;
            const isContextActive = comp.id === activeCompany.id;

            return (
              <div
                key={comp.id}
                onClick={() => loadCompanyIntoForm(comp)}
                className={`p-3 rounded-lg border text-xs transition-all cursor-pointer relative ${
                  isSelectedInForm
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 leading-snug">{comp.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded border border-blue-200">
                        {comp.code}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                          comp.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {comp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {isContextActive && (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>OPERATING</span>
                    </span>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-2">
                  <div className="truncate">
                    <span className="text-slate-400">Currency:</span> {comp.currency} ({comp.currencySymbol}) ·{' '}
                    <span className="text-slate-400">City:</span> {comp.city || 'N/A'}
                  </div>
                  <div className="truncate text-slate-500">
                    <span className="text-slate-400">NTN:</span> {comp.ntn || comp.taxId || 'Not registered'}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                  <span className="text-blue-700 font-semibold">
                    {isSelectedInForm ? 'Editing in form' : 'Click to view / edit'}
                  </span>
                  {!isContextActive && comp.isActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCompany(comp);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
                    >
                      Make Operating
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Main Form Grid: Structured Professional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Cards 1 & 2 (Company Details & Tax Information) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card 1: Basic Company Information */}
          <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">1. Basic Company Information</h2>
              </div>
              <span className="text-[11px] text-slate-500">
                {isCreatingNew ? (
                  <span className="text-blue-700 font-semibold">+ Creating New Company</span>
                ) : (
                  <span>
                    Editing: <strong className="text-slate-900">{formData.name || 'Company'}</strong>
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Company Name */}
              <div className="md:col-span-2 space-y-1">
                <label className="block font-semibold text-slate-800">
                  Company Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. ABC Traders Pvt. Ltd."
                  className={`w-full px-3 py-2 bg-white border rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600 ${
                    errors.some((e) => e.field === 'name') ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
              </div>

              {/* Company Code */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">
                  Company Code <span className="text-rose-600">*</span>{' '}
                  <span className="text-[10px] text-slate-400 font-normal">(Unique identifier)</span>
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g. ABCT"
                  className={`w-full px-3 py-2 bg-white border rounded text-slate-900 font-mono text-xs uppercase focus:outline-hidden focus:ring-1 focus:ring-blue-600 ${
                    errors.some((e) => e.field === 'code') ? 'border-rose-500 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
              </div>

              {/* Business Type */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Business Type</label>
                <select
                  value={formData.businessType || 'General Trading'}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                >
                  <option value="General Trading & Wholesale">General Trading & Wholesale Distribution</option>
                  <option value="Retail & POS Store">Retail & POS Store</option>
                  <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                  <option value="Services & Consultancy">Services & Consultancy</option>
                  <option value="Import & Export">Import & Export</option>
                  <option value="E-Commerce & Digital">E-Commerce & Digital Commerce</option>
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-1">
                <label className="block font-semibold text-slate-800">Official Street Address</label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address, building, suite number"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* State / Province */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">State / Province</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="e.g. Punjab, Sindh, KPK"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Postal / ZIP Code</label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="e.g. 54000"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Country</label>
                <input
                  type="text"
                  value={formData.country || 'Pakistan'}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="e.g. Pakistan"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Phone (Landline)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+92 (42) 3578-9000"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Mobile / WhatsApp</label>
                <input
                  type="text"
                  value={formData.mobile || ''}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Official Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="accounts@company.com"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Website URL</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.company.com"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Tax / Registration Information */}
          <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">2. Tax / Legal Registration Information</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">(Optional for initial setup)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* NTN / Tax Number */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">NTN / Tax Number</label>
                <input
                  type="text"
                  value={formData.ntn || ''}
                  onChange={(e) => handleInputChange('ntn', e.target.value)}
                  placeholder="e.g. 7289104-5"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* STRN / Sales Tax Number */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">STRN / Sales Tax Number</label>
                <input
                  type="text"
                  value={formData.strn || ''}
                  onChange={(e) => handleInputChange('strn', e.target.value)}
                  placeholder="e.g. 32-77-8761-123-45"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Registration Number */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Corporate Registration No.</label>
                <input
                  type="text"
                  value={formData.registrationNumber || ''}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  placeholder="e.g. 0192837"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cards 3, 4, 5 (Financial Information, Logo, Company Status) */}
        <div className="space-y-5">
          {/* Card 3: Financial Parameters */}
          <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-blue-50">
              <Calendar className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900">3. Financial Parameters & Currency</h2>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Financial Year Start */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">
                  Financial Year Start <span className="text-rose-600">*</span>
                  {formData.financialYearStart && (
                    <span className="text-blue-700 font-mono text-[11px] font-normal ml-1">
                      ({formatDate(formData.financialYearStart)})
                    </span>
                  )}
                </label>
                <AccountixDatePicker
                  value={formData.financialYearStart || ''}
                  onChange={(newDate) => handleInputChange('financialYearStart', newDate)}
                  required
                />
              </div>

              {/* Financial Year End */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">
                  Financial Year End <span className="text-rose-600">*</span>
                  {formData.financialYearEnd && (
                    <span className="text-blue-700 font-mono text-[11px] font-normal ml-1">
                      ({formatDate(formData.financialYearEnd)})
                    </span>
                  )}
                </label>
                <AccountixDatePicker
                  value={formData.financialYearEnd || ''}
                  onChange={(newDate) => handleInputChange('financialYearEnd', newDate)}
                  required
                />
              </div>

              {/* Currency & Symbol */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-800">
                    Base Currency <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.currency || 'PKR'}
                    onChange={(e) => handleInputChange('currency', e.target.value.toUpperCase())}
                    placeholder="PKR"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono text-xs uppercase focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-800">Currency Symbol</label>
                  <input
                    type="text"
                    value={formData.currencySymbol || 'Rs.'}
                    onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                    placeholder="Rs."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Decimal Places */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-800">Decimal Places</label>
                <select
                  value={formData.decimalPlaces ?? 2}
                  onChange={(e) => handleInputChange('decimalPlaces', parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                >
                  <option value={0}>0 (Whole numbers e.g. 100)</option>
                  <option value={2}>2 (Standard currency e.g. 100.50)</option>
                  <option value={3}>3 (Precision rate e.g. 100.505)</option>
                  <option value={4}>4 (High-precision foreign forex)</option>
                </select>
              </div>

              <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  <span>Multi-Currency Ready Architecture</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Default currency is set to <strong>{formData.currency} ({formData.currencySymbol})</strong>. The system architecture supports upcoming multi-currency foreign invoices and bank accounts.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Company Logo Upload */}
          <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-50">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">4. Company Logo</h2>
              </div>
              <span className="text-[10px] text-slate-400">Max 2MB</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />

            {formData.logoUrl ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                  <img
                    src={formData.logoUrl}
                    alt="Company Logo Preview"
                    className="max-h-24 max-w-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Change Logo
                  </button>
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="py-1.5 px-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 rounded-lg p-5 text-center cursor-pointer transition-colors space-y-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                  <Upload className="w-4 h-4" />
                </div>
                <span className="block text-xs font-bold text-blue-900">Upload Company Logo</span>
                <p className="text-[11px] text-slate-500">
                  Click to select PNG, JPG or SVG. Logo will be rendered on Invoices, Vouchers & Reports.
                </p>
              </div>
            )}
          </div>

          {/* Card 5: Company Status (Active / Inactive) */}
          <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-blue-50">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <h2 className="text-sm font-bold text-slate-900">5. Operating Status</h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    {formData.isActive ? 'Active Operating Company' : 'Inactive / Archived Entity'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formData.isActive
                      ? 'Company is available for daily vouchers, transactions, and sales.'
                      : 'Locked. Inactive companies cannot be selected for normal accounting.'}
                  </span>
                </div>
              </label>

              {!formData.isActive && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed">
                  <strong>Warning:</strong> Inactive companies are preserved for historical audit only. Users will not be allowed to record transactions or post journal vouchers against this company.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Financial Years Registry for this Company */}
      <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-blue-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Financial Accounting Years for "{formData.name || 'Company'}"
              </h2>
              <p className="text-xs text-slate-500">
                Only one financial year can be active for an enterprise at a time.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddFy(!showAddFy)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddFy ? 'Close Form' : 'Add Financial Year'}</span>
          </button>
        </div>

        {/* Inline Add Financial Year Form */}
        {showAddFy && (
          <form
            onSubmit={handleAddNewFinancialYear}
            className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg space-y-3 text-xs animate-in fade-in duration-150"
          >
            <h3 className="font-bold text-blue-900 text-xs">Register Next Fiscal Accounting Year</h3>
            {newFyError && <p className="text-rose-600 font-semibold">{newFyError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Financial Year Name</label>
                <input
                  type="text"
                  value={newFyCode}
                  onChange={(e) => setNewFyCode(e.target.value)}
                  placeholder="e.g. 2027-2028"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Start Date {newFyStart && <span className="text-blue-700 font-mono text-[11px] font-normal">({formatDate(newFyStart)})</span>}
                </label>
                <AccountixDatePicker
                  value={newFyStart}
                  onChange={(newDate) => setNewFyStart(newDate)}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  End Date {newFyEnd && <span className="text-blue-700 font-mono text-[11px] font-normal">({formatDate(newFyEnd)})</span>}
                </label>
                <AccountixDatePicker
                  value={newFyEnd}
                  onChange={(newDate) => setNewFyEnd(newDate)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFy(false)}
                className="px-3 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold cursor-pointer"
              >
                Save Fiscal Year
              </button>
            </div>
          </form>
        )}

        {/* Financial Years Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Year Name</th>
                <th className="py-2.5 px-3">Start Date</th>
                <th className="py-2.5 px-3">End Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Current Active</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companyFys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">
                    No financial years configured yet for this company.
                  </td>
                </tr>
              ) : (
                companyFys.map((fy) => {
                  const isCurrentActive = fy.isCurrent;
                  return (
                    <tr
                      key={fy.id}
                      className={`hover:bg-slate-50 ${isCurrentActive ? 'bg-blue-50/40 font-medium' : ''}`}
                    >
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{fy.yearCode}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{formatDate(fy.startDate)}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{formatDate(fy.endDate)}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            fy.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {fy.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {isCurrentActive ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active FY</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Inactive</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {!isCurrentActive && (
                          <button
                            type="button"
                            onClick={() => handleSetActiveFy(fy)}
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Architectural Assurance Card (Multi-Company Isolation) */}
      <div className="bg-white border border-blue-100 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-blue-50">
          <Database className="w-4 h-4 text-blue-700" />
          <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Multi-Company Isolation Architecture (MSSQL Ready)
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          ACCOUNTIX strictly isolates all business data by <strong>CompanyId</strong> and <strong>FinancialYearId</strong>.
          Every future master and transaction entity (Customers, Suppliers, Products, Invoices, Vouchers, Chart of Accounts, Bank Accounts) is scoped to the active company context.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block text-[11px]">Masters Isolation</span>
            <span className="text-[10px] text-slate-500 font-mono">WHERE CompanyId = @ActiveComp</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block text-[11px]">Ledgers & Vouchers</span>
            <span className="text-[10px] text-slate-500 font-mono">WHERE CompanyId + FY_Id</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block text-[11px]">Scope Separation</span>
            <span className="text-[10px] text-slate-500">Zero data mixing across entities</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-slate-800 block text-[11px]">Future Backup</span>
            <span className="text-[10px] text-slate-500">Company-specific database export</span>
          </div>
        </div>
      </div>
    </div>
  );
};
