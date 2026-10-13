/**
 * ACCOUNTIX - Parties Master View (Customers, Suppliers & Dual-Role)
 * Implements the architecture where a party can be both Customer and Supplier.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  Building,
} from 'lucide-react';

export const PartiesView: React.FC = () => {
  const { parties, openModal, setCurrentView } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'CUSTOMERS' | 'SUPPLIERS' | 'DUAL_ROLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredParties = parties.filter((p) => {
    // Role filter
    if (filter === 'CUSTOMERS' && !p.roles.isCustomer) return false;
    if (filter === 'SUPPLIERS' && !p.roles.isSupplier) return false;
    if (filter === 'DUAL_ROLE' && (!p.roles.isCustomer || !p.roles.isSupplier)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.taxRegistrationNumber.toLowerCase().includes(q) ||
        p.contactPerson.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatCurrency = (amt: number) => {
    return `$${Math.abs(amt).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Parties Directory (Customers & Suppliers)
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Dual-Role Master Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Commercial partners with separate Customer and Supplier GL subledgers and unified net reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('ADD_CUSTOMER')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Party</span>
          </button>
        </div>
      </div>

      {/* 2. Architecture Notice Box */}
      <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
        <Building className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-900">
            Dual-Role Architecture Invariant: Customer & Supplier Segregation
          </p>
          <p className="text-slate-600 leading-relaxed">
            When a party is designated as both Customer and Supplier (e.g. Apex Engineering), ACCOUNTIX creates and manages
            two discrete GL accounts: a <strong>Trade Debtor subledger in 1100 Accounts Receivable</strong> and a{' '}
            <strong>Trade Creditor subledger in 2010 Accounts Payable</strong>. The <em>Combined Party Ledger</em> provides
            a combined net statement for settlements without corrupting standard statutory accounting rules.
          </p>
        </div>
      </div>

      {/* 3. Search and Segmented Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md w-full sm:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Parties ({parties.length})
          </button>
          <button
            onClick={() => setFilter('CUSTOMERS')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'CUSTOMERS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customers ({parties.filter((p) => p.roles.isCustomer).length})
          </button>
          <button
            onClick={() => setFilter('SUPPLIERS')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'SUPPLIERS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suppliers ({parties.filter((p) => p.roles.isSupplier).length})
          </button>
          <button
            onClick={() => setFilter('DUAL_ROLE')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'DUAL_ROLE' ? 'bg-white text-blue-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dual-Role Parties ({parties.filter((p) => p.roles.isCustomer && p.roles.isSupplier).length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search party name, code, tax ID..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-blue-50/30 border border-blue-100 rounded text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* 4. Parties Data Grid */}
      <div className="bg-white border border-blue-100 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-50 text-[11px] uppercase tracking-wider text-blue-950 border-b border-blue-200 font-bold">
              <tr>
                <th className="px-4 py-2.5">Party Code</th>
                <th className="px-4 py-2.5">Party Name & Registration</th>
                <th className="px-4 py-2.5">Roles</th>
                <th className="px-4 py-2.5">Contact Details</th>
                <th className="px-4 py-2.5 text-right">Customer Dues (Dr)</th>
                <th className="px-4 py-2.5 text-right">Supplier Dues (Cr)</th>
                <th className="px-4 py-2.5 text-right">Combined Net Position</th>
                <th className="px-4 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParties.map((p) => {
                const isDual = p.roles.isCustomer && p.roles.isSupplier;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-blue-700">{p.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Tax ID: {p.taxRegistrationNumber}</span>
                        {p.legalTradeName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate max-w-xs">{p.legalTradeName}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.roles.isCustomer && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Customer
                          </span>
                        )}
                        {p.roles.isSupplier && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Supplier
                          </span>
                        )}
                        {isDual && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                            Dual-Role
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{p.contactPerson}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {p.roles.isCustomer ? formatCurrency(p.receivableBalance) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {p.roles.isSupplier ? formatCurrency(p.payableBalance) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                      {p.netBalance > 0 ? (
                        <span className="text-emerald-700">+{formatCurrency(p.netBalance)} Dr (Receivable)</span>
                      ) : p.netBalance < 0 ? (
                        <span className="text-amber-800">-{formatCurrency(p.netBalance)} Cr (Payable)</span>
                      ) : (
                        <span className="text-slate-400">$0.00 (Settled)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setCurrentView('rep_combined_ledger')}
                        className="px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded border border-blue-200 cursor-pointer transition-colors"
                        title="View Combined Party Ledger"
                      >
                        Ledger
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
