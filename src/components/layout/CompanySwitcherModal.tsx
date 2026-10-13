/**
 * ACCOUNTIX - Company & Financial Year Switcher Modal
 * Enables switching between enterprise entities and active fiscal periods.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Building2, Calendar, Check, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export const CompanySwitcherModal: React.FC = () => {
  const {
    activeCompany,
    setActiveCompany,
    availableCompanies,
    activeFinancialYear,
    setActiveFinancialYear,
    availableFinancialYears,
    closeModal,
    showNotification,
  } = useApp();

  const [selectedCompId, setSelectedCompId] = useState(activeCompany.id);
  const [selectedFyId, setSelectedFyId] = useState(activeFinancialYear.id);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const targetComp = availableCompanies.find((c) => c.id === selectedCompId);
    const targetFy = availableFinancialYears.find((fy) => fy.id === selectedFyId);

    if (targetComp) {
      if (!targetComp.isActive) {
        showNotification(
          'warning',
          'Cannot Select Inactive Company',
          `"${targetComp.name}" is marked as Inactive. Only Active companies can be selected for accounting operations.`
        );
        return;
      }
      setActiveCompany(targetComp);
    }
    if (targetFy) setActiveFinancialYear(targetFy);

    showNotification(
      'success',
      'Context Switched',
      `Active entity switched to ${targetComp?.name} (${targetFy?.yearCode}).`
    );
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-blue-100 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-800 text-white flex items-center justify-center border border-blue-500">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Select Operating Company & Fiscal Year</h2>
              <p className="text-[11px] text-blue-100">
                Switch active ledger company context for multi-company accounting.
              </p>
            </div>
          </div>
          <button onClick={closeModal} className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-800 cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-5 space-y-4 text-xs text-slate-700">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Registered Companies
            </label>
            <div className="space-y-2">
              {availableCompanies.map((comp) => {
                const isSelected = comp.id === selectedCompId;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompId(comp.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{comp.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
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
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tax ID: {comp.taxId} · Currency: {comp.currency} ({comp.currencySymbol})
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Financial Accounting Year
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableFinancialYears.map((fy) => {
                const isSelected = fy.id === selectedFyId;
                return (
                  <div
                    key={fy.id}
                    onClick={() => setSelectedFyId(fy.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-slate-900 font-mono">{fy.yearCode}</span>
                      <span className="block text-[10px] text-slate-500 font-mono">
                        {formatDate(fy.startDate)} to {formatDate(fy.endDate)}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold cursor-pointer shadow-xs"
            >
              Set Active Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
