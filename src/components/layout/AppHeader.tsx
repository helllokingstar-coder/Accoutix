/**
 * ACCOUNTIX - Primary Application Header
 * Matches master design specification for desktop accounting workspace
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { TopCompanyBar } from './TopCompanyBar';
import { TopMenuBar } from './TopMenuBar';
import { BarChart3, Minus, Maximize2, X, Search, PlusCircle, HelpCircle } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { currentView, setCurrentView, openModal } = useApp();
  const isSaleInvoice = currentView === 'tx_sale_invoice';

  return (
    <header className="sticky top-0 z-50 shadow-xs select-none">
      {/* ROW 1: Deep Blue Title Bar with ACCOUNTIX branding and Window Controls */}
      <div className="bg-[#1b5886] text-white px-3 sm:px-4 py-1 flex items-center justify-between border-b border-[#14476d]">
        {/* Left: Brand Icon + ACCOUNTIX Wordmark */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 cursor-pointer focus:outline-hidden"
          >
            <BarChart3 className="w-4 h-4 text-white" />
            <span className="text-sm font-bold tracking-wider text-white uppercase font-sans">
              ACCOUNTIX
            </span>
          </button>
        </div>

        {/* Center / Non-invoice search bar */}
        {!isSaleInvoice && (
          <div className="flex-1 max-w-md hidden md:block mx-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-200" />
              <input
                type="text"
                readOnly
                onClick={() => openModal('ARCHITECTURE_DOCS')}
                placeholder="Search accounts, parties, invoices or commands (F1 for Help)..."
                className="w-full pl-8 pr-3 py-0.5 text-xs bg-[#163D61] border border-blue-400/30 rounded text-blue-100 placeholder-blue-300 focus:outline-hidden focus:border-blue-300 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Right: Window Controls (— □ ✕) */}
        <div className="flex items-center gap-1">
          {!isSaleInvoice && (
            <button
              onClick={() => setCurrentView('tx_sale_invoice')}
              className="mr-2 flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-white bg-[#2B6CB0] hover:bg-[#205D90] border border-blue-300/30 rounded cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              <span>New Sale (F8)</span>
            </button>
          )}

          <button
            type="button"
            className="w-5 h-5 rounded flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-5 h-5 rounded flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
            title="Maximize"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="w-5 h-5 rounded flex items-center justify-center text-blue-100 hover:text-white hover:bg-red-500 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional Top Company bar on standard views */}
      {!isSaleInvoice && <TopCompanyBar />}

      {/* ROW 2: Main Navigation Menu */}
      <TopMenuBar />
    </header>
  );
};
