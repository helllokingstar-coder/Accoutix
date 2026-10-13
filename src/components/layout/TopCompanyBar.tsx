/**
 * ACCOUNTIX - Top Company & Fiscal Year Information Area
 * Displays Current Company, Financial Year, Current Date, Current User
 * and supports multi-company switching.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Calendar, Clock, User, ChevronDown, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export const TopCompanyBar: React.FC = () => {
  const {
    activeCompany,
    activeFinancialYear,
    currentDateString,
    currentUser,
    openModal,
  } = useApp();

  return (
    <div className="bg-white text-slate-800 border-b border-blue-100 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      {/* Left: Current Company & Financial Year */}
      <div className="flex items-center flex-wrap gap-4 sm:gap-6">
        {/* Company Selector Trigger */}
        <button
          onClick={() => openModal('SWITCH_COMPANY')}
          className="group flex items-center gap-2 text-left cursor-pointer focus:outline-hidden rounded-sm px-1 py-0.5 hover:bg-blue-50/60 transition-colors"
          title="Click to Switch Company"
        >
          <div className="w-6 h-6 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Company</span>
            <span className="font-bold text-slate-900 flex items-center gap-1 group-hover:text-blue-700 transition-colors">
              {activeCompany.name}
              <ChevronDown className="w-3 h-3 text-blue-600 transition-transform" />
            </span>
          </div>
        </button>

        {/* Separator */}
        <div className="hidden sm:block h-6 w-px bg-blue-100" />

        {/* Financial Year */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Financial Year</span>
            <span className="font-bold text-slate-900 font-mono">
              {activeFinancialYear?.yearCode || '2026-2027'}
              <span className="text-blue-700 font-normal ml-1.5 text-[11px]">
                ({formatDate(activeFinancialYear?.startDate || '2026-04-01')} to{' '}
                {formatDate(activeFinancialYear?.endDate || '2027-03-31')})
              </span>
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block h-6 w-px bg-blue-100" />

        {/* Current Date */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Current Date</span>
            <span className="font-semibold text-slate-800 font-mono">{formatDate(currentDateString)}</span>
          </div>
        </div>
      </div>

      {/* Right: Current User & Accounting Engine Status */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">Double-Entry Ledger Active</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight text-right sm:text-left">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Current User</span>
            <span className="font-bold text-slate-900">{currentUser.displayName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
