/**
 * ACCOUNTIX - Chart of Accounts (COA) View & Tree Management
 * Professional hierarchical double-entry accounting structure.
 * Company-isolated, strictly distinguishes Group Accounts from Posting Ledger Accounts.
 * Features dynamic Parent Account loading and explicit AvailableForPosting control.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Account, AccountType, AccountNature, AccountClassification } from '../../types/accounting';
import { coaService, CoaValidationError } from '../../services/coaService';
import {
  BookOpen,
  FolderTree,
  Folder,
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
  X,
  Lock,
} from 'lucide-react';

export const ChartOfAccountsView: React.FC = () => {
  const { activeCompany, activeFinancialYear, showNotification } = useApp();

  // Filters state
  const [selectedType, setSelectedType] = useState<AccountType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedPostingFilter, setSelectedPostingFilter] = useState<'All' | 'Postable' | 'NonPostable'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form Fields State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<AccountType>('Assets');
  const [formClassification, setFormClassification] = useState<AccountClassification>('Posting Ledger');
  const [formNature, setFormNature] = useState<AccountNature>('Debit');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formAvailableForPosting, setFormAvailableForPosting] = useState(true);
  const [formErrors, setFormErrors] = useState<CoaValidationError[]>([]);

  // Fetch accounts strictly isolated for the active company
  const rawAccounts = useMemo(() => {
    return coaService.getAccounts(activeCompany.id, {
      accountType: selectedType,
      status: selectedStatus,
      search: searchQuery,
    });
  }, [activeCompany.id, selectedType, selectedStatus, searchQuery, refreshKey]);

  // Apply optional AvailableForPosting filter
  const accounts = useMemo(() => {
    if (selectedPostingFilter === 'Postable') {
      return rawAccounts.filter((a) => a.availableForPosting);
    }
    if (selectedPostingFilter === 'NonPostable') {
      return rawAccounts.filter((a) => !a.availableForPosting);
    }
    return rawAccounts;
  }, [rawAccounts, selectedPostingFilter]);

  // All available group accounts in this active company (for parent selectors)
  const availableGroups = useMemo(() => {
    return coaService.getGroupAccounts(activeCompany.id);
  }, [activeCompany.id, refreshKey]);

  // Dynamically filtered parent groups based on current formType
  const validParentGroups = useMemo(() => {
    return availableGroups.filter((g) => {
      // Must match selected Account Type
      if (g.accountType !== formType) return false;
      // Cannot be itself when editing
      if (editingAccount && g.id === editingAccount.id) return false;
      return true;
    });
  }, [availableGroups, formType, editingAccount]);

  // Count summaries strictly for this active company
  const allCompanyAccounts = useMemo(() => {
    return coaService.getAccounts(activeCompany.id);
  }, [activeCompany.id, refreshKey]);

  const groupCount = allCompanyAccounts.filter((a) => a.isGroup).length;
  const ledgerCount = allCompanyAccounts.filter((a) => !a.isGroup).length;
  const activeCount = allCompanyAccounts.filter((a) => a.isActive).length;
  const postableCount = allCompanyAccounts.filter((a) => a.availableForPosting).length;

  // Auto-set default nature & update parent selection when Account Type changes
  const handleTypeChange = (newType: AccountType) => {
    setFormType(newType);
    if (newType === 'Assets' || newType === 'Expenses') {
      setFormNature('Debit');
    } else {
      setFormNature('Credit');
    }

    // Dynamic parent account resolution for the newly chosen type
    const matchingGroups = availableGroups.filter(
      (g) => g.accountType === newType && (!editingAccount || g.id !== editingAccount.id)
    );

    if (formClassification === 'Posting Ledger') {
      const isCurrentStillValid = matchingGroups.some((g) => g.id === formParentId);
      if (!isCurrentStillValid) {
        setFormParentId(matchingGroups.length > 0 ? matchingGroups[0].id : '');
      }
    } else {
      const isCurrentStillValid = matchingGroups.some((g) => g.id === formParentId);
      if (!isCurrentStillValid) {
        setFormParentId('');
      }
    }
  };

  // Handle Account Classification change (Posting Ledger vs Group Account)
  // Enforces Rule 1 & 2:
  // - Group Account -> AvailableForPosting = false
  // - Posting Ledger -> AvailableForPosting = true (if Active)
  const handleClassificationChange = (newClassification: AccountClassification) => {
    setFormClassification(newClassification);
    if (newClassification === 'Group Account') {
      setFormAvailableForPosting(false);
    } else {
      // Posting ledger: defaults to true only when active
      setFormAvailableForPosting(formIsActive);

      // Posting ledger requires a parent group
      const matchingGroups = availableGroups.filter(
        (g) => g.accountType === formType && (!editingAccount || g.id !== editingAccount.id)
      );
      const isCurrentStillValid = matchingGroups.some((g) => g.id === formParentId);
      if (!isCurrentStillValid && matchingGroups.length > 0) {
        setFormParentId(matchingGroups[0].id);
      }
    }
  };

  // Handle Active Status change [Yes / No]
  // Enforces Rule 3 & 4:
  // - Inactive Account (Active = No) -> AvailableForPosting = false
  // - Active Account (Active = Yes) -> If Posting Ledger, AvailableForPosting = true
  const handleActiveChange = (newActive: boolean) => {
    setFormIsActive(newActive);
    if (!newActive) {
      setFormAvailableForPosting(false);
    } else {
      if (formClassification === 'Posting Ledger') {
        setFormAvailableForPosting(true);
      } else {
        setFormAvailableForPosting(false);
      }
    }
  };

  // Open "New Account" Modal (defaults to Posting Ledger)
  const openNewAccountModal = (defaultParent?: Account) => {
    setEditingAccount(null);
    setFormErrors([]);
    setFormCode('');
    setFormName('');
    const targetType = defaultParent?.accountType || 'Assets';
    setFormType(targetType);
    setFormClassification('Posting Ledger');
    setFormNature(targetType === 'Assets' || targetType === 'Expenses' ? 'Debit' : 'Credit');
    setFormIsActive(true);
    setFormAvailableForPosting(true); // Posting Ledger + Active = Yes

    const matchingGroups = coaService.getGroupAccounts(activeCompany.id, targetType);
    if (defaultParent && defaultParent.isGroup) {
      setFormParentId(defaultParent.id);
    } else if (matchingGroups.length > 0) {
      setFormParentId(matchingGroups[0].id);
    } else {
      setFormParentId('');
    }

    setFormDescription('');
    setIsAccountModalOpen(true);
  };

  // Open "New Group" Modal (defaults to Group Account)
  const openNewGroupModal = (defaultParent?: Account) => {
    setEditingAccount(null);
    setFormErrors([]);
    setFormCode('');
    setFormName('');
    const targetType = defaultParent?.accountType || 'Assets';
    setFormType(targetType);
    setFormClassification('Group Account');
    setFormNature(targetType === 'Assets' || targetType === 'Expenses' ? 'Debit' : 'Credit');
    setFormParentId(defaultParent && defaultParent.isGroup ? defaultParent.id : '');
    setFormIsActive(true);
    setFormAvailableForPosting(false); // Group Account -> AvailableForPosting = false
    setFormDescription('');
    setIsAccountModalOpen(true);
  };

  // Open "Edit Account / Group" Modal (faithfully loads actual saved data)
  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormErrors([]);
    setFormCode(account.code);
    setFormName(account.name);
    const targetType = account.accountType || 'Assets';
    setFormType(targetType);
    const isGrp = Boolean(account.isGroup);
    setFormClassification(isGrp ? 'Group Account' : 'Posting Ledger');
    setFormNature(account.nature || 'Debit');
    setFormParentId(account.parentAccountId || '');
    setFormDescription(account.description || '');
    setFormIsActive(account.isActive);

    // Load actual AvailableForPosting respecting invariant rules
    if (isGrp || !account.isActive) {
      setFormAvailableForPosting(false);
    } else {
      setFormAvailableForPosting(
        account.availableForPosting !== undefined ? account.availableForPosting : true
      );
    }

    setIsAccountModalOpen(true);
  };

  // Save Account or Group handler
  const handleSave = () => {
    const isGroup = formClassification === 'Group Account';

    // Apply strict accounting rules automatically
    const resolvedPosting = !isGroup && formIsActive ? Boolean(formAvailableForPosting) : false;

    const payload: Partial<Account> = {
      code: formCode.trim(),
      name: formName.trim(),
      accountType: formType,
      classification: formClassification,
      nature: formNature,
      isGroup,
      isActive: formIsActive,
      availableForPosting: resolvedPosting,
      parentAccountId: formParentId ? formParentId : null,
      description: formDescription.trim(),
      financialYearId: activeFinancialYear.id,
    };

    const result = coaService.saveAccount(
      activeCompany.id,
      payload,
      editingAccount ? editingAccount.id : undefined
    );

    if (result.errors && result.errors.length > 0) {
      setFormErrors(result.errors);
      showNotification('warning', 'Validation Error', result.errors[0].message);
      return;
    }

    setRefreshKey((k) => k + 1);
    setIsAccountModalOpen(false);
    setEditingAccount(null);

    showNotification(
      'success',
      editingAccount
        ? isGroup
          ? 'Group Updated'
          : 'Account Updated'
        : isGroup
        ? 'New Group Created'
        : 'New Account Created',
      `"${payload.name}" (${payload.code}) saved successfully for ${activeCompany.name}. Available for Posting: ${
        resolvedPosting ? 'Yes' : 'No'
      }.`
    );
  };

  // Deactivate or Activate Account handler
  const handleToggleStatus = (account: Account) => {
    const result = coaService.toggleAccountStatus(activeCompany.id, account.id);
    if (result.error) {
      showNotification('warning', 'Action Prohibited', result.error);
      return;
    }

    setRefreshKey((k) => k + 1);
    showNotification(
      'info',
      result.account?.isActive ? 'Account Activated' : 'Account Deactivated',
      `"${account.name}" (${account.code}) is now ${
        result.account?.isActive ? 'Active' : 'Inactive'
      }. Available for Posting: ${result.account?.availableForPosting ? 'Yes' : 'No'}.`
    );
  };

  // Helper to determine hierarchical indentation level based on account code / parent
  const getHierarchyLevel = (acc: Account): number => {
    if (!acc.parentAccountId) return 0;
    const parent = coaService.getAccountById(activeCompany.id, acc.parentAccountId);
    if (!parent) return 1;
    if (!parent.parentAccountId) return 1;
    return 2;
  };

  // Type styling helpers
  const getTypeBadge = (type: AccountType) => {
    switch (type) {
      case 'Assets':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Liabilities':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Equity':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Income':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Expenses':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header with Active Company, Fiscal Year, and Actions */}
      <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-700 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Chart of Accounts (COA)
              </h1>
              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Company: {activeCompany.name}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-mono text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Financial Year: {activeFinancialYear.yearCode}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openNewAccountModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Account</span>
          </button>

          <button
            type="button"
            onClick={() => openNewGroupModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <FolderTree className="w-3.5 h-3.5 text-blue-700" />
            <span>+ New Group</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRefreshKey((k) => k + 1);
              showNotification('info', 'Refreshed', 'Chart of accounts reloaded.');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 cursor-pointer transition-colors"
            title="Reload Accounts from Registry"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Stats & Summary Cards with Available for Posting Metric */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
              Total Accounts
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {allCompanyAccounts.length}
            </span>
          </div>
          <Layers className="w-5 h-5 text-blue-600/40" />
        </div>

        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
              Group Accounts
            </span>
            <span className="text-lg font-bold text-blue-900 font-mono">{groupCount}</span>
            <span className="text-[10px] text-slate-400 block">Posting: No (Roll-up Only)</span>
          </div>
          <FolderTree className="w-5 h-5 text-blue-600/40" />
        </div>

        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
              Posting Ledgers
            </span>
            <span className="text-lg font-bold text-slate-900 font-mono">{ledgerCount}</span>
            <span className="text-[10px] text-emerald-600 block">{postableCount} Postable</span>
          </div>
          <FileText className="w-5 h-5 text-emerald-600/40" />
        </div>

        <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
              Available for Posting
            </span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              {postableCount} Yes
            </span>
            <span className="text-[10px] text-slate-500 block">{activeCount} Active</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600/40" />
        </div>
      </div>

      {/* 3. Search and Filters Toolbar */}
      <div className="bg-white border border-blue-100 rounded-lg p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Account Type Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {(['All', 'Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'] as const).map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-blue-50 text-slate-700'
                }`}
              >
                {type === 'All' ? 'All Types' : type}
              </button>
            )
          )}
        </div>

        {/* Right side: Search, Status & Posting Filter */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          {/* Available for Posting Filter */}
          <select
            value={selectedPostingFilter}
            onChange={(e) => setSelectedPostingFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600 cursor-pointer font-medium"
          >
            <option value="All">Posting: All</option>
            <option value="Postable">Posting: Yes (Ledgers)</option>
            <option value="NonPostable">Posting: No</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code or title..."
              className="w-full pl-8 pr-3 py-1.5 bg-blue-50/30 border border-blue-200 rounded text-slate-900 placeholder-slate-400 text-xs focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* 4. Chart of Accounts Tree Table with "Available for Posting" Column */}
      <div className="bg-white border border-blue-100 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-blue-50/80 text-[11px] uppercase tracking-wider text-blue-900 border-b border-blue-200 font-bold">
              <tr>
                <th className="py-2.5 px-3 w-24">Code</th>
                <th className="py-2.5 px-3 min-w-[200px]">Account Name</th>
                <th className="py-2.5 px-3 w-24">Type</th>
                <th className="py-2.5 px-3 w-20">Nature</th>
                <th className="py-2.5 px-3 w-32">Classification</th>
                <th className="py-2.5 px-3 w-20">Active</th>
                <th className="py-2.5 px-3 w-32 text-center">Available for Posting</th>
                <th className="py-2.5 px-3 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No matching accounts found for the selected filters.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const level = getHierarchyLevel(acc);

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        acc.isGroup ? 'bg-slate-50/50 font-semibold text-slate-900' : 'bg-white'
                      }`}
                    >
                      {/* Code */}
                      <td className="py-2 px-3 font-mono font-bold text-blue-950">
                        {acc.code}
                      </td>

                      {/* Name with Hierarchical Indentation */}
                      <td className="py-2 px-3">
                        <div
                          className="flex items-center gap-1.5"
                          style={{ paddingLeft: `${level * 18}px` }}
                        >
                          {acc.isGroup ? (
                            <Folder className="w-4 h-4 text-blue-700 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span
                            className={`truncate ${
                              acc.isGroup ? 'font-bold text-slate-900' : 'text-slate-800'
                            }`}
                          >
                            {acc.name}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${getTypeBadge(
                            acc.accountType || 'Assets'
                          )}`}
                        >
                          {acc.accountType || 'Assets'}
                        </span>
                      </td>

                      {/* Nature */}
                      <td className="py-2 px-3 font-mono">
                        <span
                          className={`font-semibold ${
                            acc.nature === 'Debit' ? 'text-blue-700' : 'text-purple-700'
                          }`}
                        >
                          {acc.nature}
                        </span>
                      </td>

                      {/* Classification */}
                      <td className="py-2 px-3">
                        {acc.isGroup ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-900 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded">
                            <FolderTree className="w-3 h-3 text-blue-700" />
                            Group Account
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            <FileText className="w-3 h-3 text-emerald-600" />
                            Posting Ledger
                          </span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium ${
                            acc.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {acc.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Available for Posting (Yes / No) */}
                      <td className="py-2 px-3 text-center">
                        {acc.availableForPosting ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-slate-50 text-slate-500 border border-slate-200">
                            <X className="w-3 h-3 text-slate-400" />
                            No
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(acc)}
                            className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors"
                            title="Edit Account Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(acc)}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              acc.isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={
                              acc.isActive
                                ? 'Deactivate Account (Will set AvailableForPosting = No)'
                                : 'Activate Account'
                            }
                          >
                            {acc.isActive ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {acc.isGroup && (
                            <button
                              type="button"
                              onClick={() => openNewAccountModal(acc)}
                              className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors ml-0.5"
                              title={`Add Child Account under "${acc.name}"`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Architectural Invariants Card with AvailableForPosting Rules */}
      <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-xs space-y-2 text-xs">
        <div className="flex items-center gap-2 pb-1 border-b border-blue-50">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <h3 className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
            Double-Entry Accounting Architecture Safeguards &amp; Posting Rules
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-600 leading-relaxed pt-1">
          <div>
            <p>
              1. <strong>Group Account Invariant</strong>: <code>IsGroup = true</code> &rarr; <code>AvailableForPosting = false</code>. Group Accounts can <em>never</em> receive direct transaction postings.
            </p>
            <p className="mt-1">
              2. <strong>Posting Ledger Invariant</strong>: <code>IsGroup = false</code> &rarr; <code>AvailableForPosting = true</code> only when <code>IsActive = true</code>.
            </p>
          </div>
          <div>
            <p>
              3. <strong>Inactive Account Rule</strong>: <code>IsActive = false</code> &rarr; <code>AvailableForPosting = false</code>. A Posting Ledger can never be postable while inactive.
            </p>
            <p className="mt-1">
              4. <strong>Company Isolation</strong>: Scoped strictly by <code>CompanyId: {activeCompany.id}</code>, ensuring no cross-entity ledger mixture.
            </p>
          </div>
        </div>
      </div>

      {/* 6. MODAL: New / Edit Account Master Form with AvailableForPosting Control */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl border border-blue-100 w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formClassification === 'Group Account' ? (
                  <FolderTree className="w-4.5 h-4.5 text-blue-200" />
                ) : (
                  <FileText className="w-4.5 h-4.5 text-blue-200" />
                )}
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    {editingAccount
                      ? `Edit Account: ${editingAccount.code} – ${editingAccount.name}`
                      : formClassification === 'Group Account'
                      ? 'New Account Group Master'
                      : 'New Account / Posting Ledger Master'}
                  </h3>
                  <div className="text-[11px] text-blue-100 flex items-center gap-2 mt-0.5">
                    <span>Company: {activeCompany.name} ({activeCompany.code})</span>
                    <span>•</span>
                    <span>FY: {activeFinancialYear.yearCode}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-800 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="p-5 space-y-4 text-xs text-slate-700 max-h-[80vh] overflow-y-auto"
            >
              {/* Errors Display */}
              {formErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 space-y-1">
                  {formErrors.map((err, i) => (
                    <p key={i} className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{err.message}</span>
                    </p>
                  ))}
                </div>
              )}

              {/* 1. Account Type & Account Classification (Clearly Separated) */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-lg space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/60">
                  <span className="font-bold text-blue-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-700" />
                    Account Classification &amp; Category
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-blue-200 rounded text-blue-800 font-semibold">
                    {formType} &rarr; {formClassification}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Account Type Field */}
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Account Type <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => handleTypeChange(e.target.value as AccountType)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="Assets">Assets (1000)</option>
                      <option value="Liabilities">Liabilities (2000)</option>
                      <option value="Equity">Equity (3000)</option>
                      <option value="Income">Income (4000)</option>
                      <option value="Expenses">Expenses (5000)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formType === 'Assets' && 'Normal Debit • Resources owned by company'}
                      {formType === 'Liabilities' && 'Normal Credit • Obligations due to third parties'}
                      {formType === 'Equity' && 'Normal Credit • Capital and owner equity'}
                      {formType === 'Income' && 'Normal Credit • Revenue and business earnings'}
                      {formType === 'Expenses' && 'Normal Debit • Operating & procurement expenses'}
                    </p>
                  </div>

                  {/* Account Classification Field (Posting Ledger vs Group Account) */}
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Account Classification <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={formClassification}
                      onChange={(e) =>
                        handleClassificationChange(e.target.value as AccountClassification)
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-blue-950 focus:outline-hidden focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="Posting Ledger">Posting Ledger (Transactional)</option>
                      <option value="Group Account">Group Account (Category / Roll-up)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formClassification === 'Posting Ledger'
                        ? 'Posts journal, voucher, and invoice line entries.'
                        : 'Summary folder header for grouping child accounts.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Account Code & Account Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Account Code */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Account Code <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder={
                      formClassification === 'Group Account'
                        ? formType === 'Expenses'
                          ? 'e.g. 6000'
                          : 'e.g. 1300'
                        : formType === 'Expenses'
                        ? 'e.g. 5150'
                        : 'e.g. 1115'
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Must be unique in {activeCompany.name}.
                  </p>
                </div>

                {/* Account Name */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Account Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={
                      formClassification === 'Group Account'
                        ? 'e.g. Operating Expenses'
                        : 'e.g. Office Electricity & Utilities'
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              {/* 3. Parent Account Dropdown (Dynamically loaded based on activeCompany & formType) */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Parent Account {formClassification === 'Posting Ledger' ? (
                    <span className="text-rose-600">* (Required for Ledgers)</span>
                  ) : (
                    <span className="text-slate-400 font-normal">(Optional for Top-Level Groups)</span>
                  )}
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  required={formClassification === 'Posting Ledger'}
                >
                  {formClassification === 'Group Account' ? (
                    <option value="">-- None (Primary / Top-Level Group) --</option>
                  ) : (
                    <option value="">-- Select Parent Group Account --</option>
                  )}
                  {validParentGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.code} &ndash; {g.name}
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>
                    {formClassification === 'Posting Ledger'
                      ? `Must roll up under an active "${formType}" Group in ${activeCompany.name}.`
                      : `Select an existing "${formType}" group to create a sub-group, or choose None.`}
                  </span>
                  <span className="font-semibold text-blue-700">
                    {validParentGroups.length} valid {formType} group(s) available
                  </span>
                </div>
              </div>

              {/* 4. Active [Yes/No] and Available for Posting [Yes/No] Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-lg">
                {/* Active: [Yes / No] */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Active <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formIsActive ? 'Yes' : 'No'}
                    onChange={(e) => handleActiveChange(e.target.value === 'Yes')}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {formIsActive
                      ? 'Account is active in the company general ledger registry.'
                      : 'Inactive accounts cannot be used for direct transaction posting.'}
                  </p>
                </div>

                {/* Available for Posting: [Yes / No] (With automatic rule enforcement) */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Available for Posting <span className="text-rose-600">*</span></span>
                    {formClassification === 'Group Account' ? (
                      <span className="text-[10px] font-mono text-amber-700 font-semibold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        (Disabled: Group)
                      </span>
                    ) : !formIsActive ? (
                      <span className="text-[10px] font-mono text-rose-700 font-semibold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        (Disabled: Inactive)
                      </span>
                    ) : null}
                  </label>
                  <select
                    value={formAvailableForPosting ? 'Yes' : 'No'}
                    disabled={formClassification === 'Group Account' || !formIsActive}
                    onChange={(e) => setFormAvailableForPosting(e.target.value === 'Yes')}
                    className={`w-full px-3 py-1.5 border rounded text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-600 ${
                      formClassification === 'Group Account' || !formIsActive
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-emerald-800 border-slate-300 cursor-pointer'
                    }`}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <p className="text-[10px] mt-1 text-slate-500">
                    {formClassification === 'Group Account'
                      ? 'Rule 1 & 5: Group accounts can NEVER be available for transaction posting.'
                      : !formIsActive
                      ? 'Rule 3 & 4: Inactive accounts must NEVER be available for posting.'
                      : 'Rule 2: Active Posting Ledgers are available for posting by default.'}
                  </p>
                </div>
              </div>

              {/* 5. Accounting Nature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Accounting Nature</label>
                  <select
                    value={formNature}
                    onChange={(e) => setFormNature(e.target.value as AccountNature)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="Debit">Debit Normal Balance</option>
                    <option value="Credit">Credit Normal Balance</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2 rounded border border-blue-100 w-full">
                    Posting Summary:{' '}
                    <strong>
                      {formClassification === 'Posting Ledger' && formIsActive && formAvailableForPosting
                        ? 'Eligible for Vouchers & Journals'
                        : 'Locked from Direct Posting'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 6. Description / Roll-up Notes */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Description / Operational Guidance (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Statutory classification, operational purpose, or roll-up guidelines..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  {editingAccount
                    ? `Update ${formClassification}`
                    : `Create ${formClassification}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
