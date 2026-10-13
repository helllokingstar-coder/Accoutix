/**
 * ACCOUNTIX - Account Posting Select Component
 * Reusable dropdown component for future transaction, journal, and invoice modules.
 * Strictly enforces that only accounts where:
 *   IsActive = true AND IsGroup = false AND AvailableForPosting = true
 * are presented for selection.
 * Group Accounts and Inactive accounts are never displayed.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { coaService } from '../../services/coaService';
import { Account, AccountType } from '../../types/accounting';

interface AccountPostingSelectProps {
  value: string;
  onChange: (accountId: string, account?: Account) => void;
  accountType?: AccountType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const AccountPostingSelect: React.FC<AccountPostingSelectProps> = ({
  value,
  onChange,
  accountType,
  placeholder = '-- Select Posting Account --',
  required = false,
  disabled = false,
  className = '',
}) => {
  const { activeCompany } = useApp();

  // Load only postable accounts strictly scoped to active company
  const postableAccounts = React.useMemo(() => {
    return coaService.getPostableAccounts(activeCompany.id, accountType);
  }, [activeCompany.id, accountType]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedAcc = postableAccounts.find((a) => a.id === selectedId);
    onChange(selectedId, selectedAcc);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
    >
      <option value="">{placeholder}</option>
      {postableAccounts.map((acc) => (
        <option key={acc.id} value={acc.id}>
          {acc.code} – {acc.name} ({acc.accountType})
        </option>
      ))}
    </select>
  );
};
