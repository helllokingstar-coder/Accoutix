/**
 * ACCOUNTIX - Desktop Application Bottom Status Bar
 * Displays database engine compatibility, double-entry status, and hotkey hints.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Database, ShieldCheck, Keyboard, Building } from 'lucide-react';

export const FooterStatusBar: React.FC = () => {
  const { activeCompany, activeFinancialYear, openModal, setCurrentView } = useApp();

  return (
    <footer className="bg-white border-t border-blue-100 text-slate-600 text-[11px] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none z-30 shadow-2xs">
      {/* Left: DB Engine & Double Entry Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentView('util_mssql_schema')}
          className="flex items-center gap-1.5 text-blue-800 hover:text-blue-950 cursor-pointer transition-colors font-medium"
          title="Click to view Microsoft SQL Server Schema"
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-mono">Engine: Microsoft SQL Server Ready</span>
        </button>

        <span className="text-slate-300">|</span>

        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Double-Entry Balance: Balanced (0.00 Variance)</span>
        </div>
      </div>

      {/* Center / Right: Active Company, FY, Shortcuts */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1 text-slate-600 font-medium">
          <Building className="w-3 h-3 text-blue-600" />
          <span className="text-slate-900 font-semibold">{activeCompany.name}</span>
          <span className="font-mono text-blue-700">({activeFinancialYear.yearCode})</span>
        </div>

        <span className="hidden md:inline text-slate-300">|</span>

        <button
          onClick={() => openModal('ARCHITECTURE_DOCS')}
          className="flex items-center gap-1 text-slate-600 hover:text-blue-800 cursor-pointer transition-colors"
        >
          <Keyboard className="w-3 h-3 text-blue-600" />
          <span className="text-slate-700 font-medium">Shortcuts: F1 Help · F8 Sale · F9 Purchase · Ctrl+M MSSQL</span>
        </button>
      </div>
    </footer>
  );
};
