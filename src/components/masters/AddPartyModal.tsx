/**
 * ACCOUNTIX - Add Party Modal
 * Supports Customer, Supplier, and Dual-Role (both Customer and Supplier) registration.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, CheckSquare, Square, Building2, ShieldCheck } from 'lucide-react';
import { Party } from '../../types/masters';
import { mastersService } from '../../services/mastersService';

export const AddPartyModal: React.FC = () => {
  const { closeModal, refreshParties, showNotification } = useApp();

  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [code, setCode] = useState(`PRTY-00${Math.floor(Math.random() * 90 + 10)}`);
  const [taxId, setTaxId] = useState('27AABC' + Math.floor(Math.random() * 8999 + 1000) + 'K1Z1');
  const [isCustomer, setIsCustomer] = useState(true);
  const [isSupplier, setIsSupplier] = useState(false);
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+1 (555) 789-0123');
  const [email, setEmail] = useState('');
  const [creditPeriod, setCreditPeriod] = useState(30);
  const [creditLimit, setCreditLimit] = useState(50000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!isCustomer && !isSupplier) {
      alert('A party must be selected as either a Customer, a Supplier, or Both.');
      return;
    }

    const newParty: Party = {
      id: `party_${Date.now()}`,
      code,
      name,
      legalTradeName: legalName || undefined,
      taxRegistrationNumber: taxId,
      roles: {
        isCustomer,
        isSupplier,
        customerAccountId: isCustomer ? 'acc_1100' : undefined,
        supplierAccountId: isSupplier ? 'acc_2010' : undefined,
        creditPeriodDays: Number(creditPeriod),
        creditLimit: Number(creditLimit),
      },
      contactPerson: contactPerson || 'Principal Contact',
      phone,
      email: email || `${code.toLowerCase()}@partnercorp.com`,
      billingAddress: {
        street: 'Commercial District, Industrial Sector',
        city: 'Metro City',
        state: 'State Province',
        postalCode: '90001',
        country: 'United States',
      },
      receivableBalance: 0,
      payableBalance: 0,
      netBalance: 0,
      isActive: true,
      notes: isCustomer && isSupplier ? 'Dual-role entity acting as both Customer and Supplier.' : '',
    };

    mastersService.addParty(newParty);
    refreshParties();
    showNotification(
      'success',
      'Party Registered',
      `${name} registered with ${isCustomer && isSupplier ? 'Dual-Role (Customer & Supplier)' : isCustomer ? 'Customer' : 'Supplier'} architecture.`
    );
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-blue-100 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-800 text-white flex items-center justify-center border border-blue-500">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Register Master Party</h2>
              <p className="text-[11px] text-blue-100">
                Configure commercial partner roles and double-entry subledger links.
              </p>
            </div>
          </div>
          <button onClick={closeModal} className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-800 cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Dual-role flags */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
            <span className="font-semibold text-blue-900 text-xs block">Party Role Designation:</span>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCustomer}
                  onChange={(e) => setIsCustomer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Customer (Sundry Debtor)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSupplier}
                  onChange={(e) => setIsSupplier(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Supplier (Sundry Creditor)</span>
              </label>
            </div>

            {isCustomer && isSupplier && (
              <div className="pt-1.5 text-[11px] text-blue-800 flex items-center gap-1.5 border-t border-blue-200/60 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  <strong>Dual-Role Enabled:</strong> Linked to both 1100 Accounts Receivable & 2010 Accounts Payable for future Combined Party Ledger reconciliation.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Party Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tax Registration (GSTIN / VAT)</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Party Trading Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Industrial Solutions Ltd."
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-blue-500 text-slate-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Legal Trade Name (Incorporated Title)</label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Full registered company title"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Finance manager or procurement officer"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Credit Period (Days)</label>
              <input
                type="number"
                value={creditPeriod}
                onChange={(e) => setCreditPeriod(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Credit Limit ($)</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded focus:border-blue-500"
              />
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
              Save Party Master
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
