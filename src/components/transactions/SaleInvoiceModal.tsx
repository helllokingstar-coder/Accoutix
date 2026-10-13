/**
 * ACCOUNTIX - Sale Invoice Modal Wrapper
 * Direct integration with SalesInvoiceView
 */

import React from 'react';
import { SalesInvoice } from '../../services/salesInvoiceService';
import { SalesInvoiceView } from './SalesInvoiceView';

interface SaleInvoiceModalProps {
  initialInvoice?: SalesInvoice | null;
  onClose?: () => void;
}

export const SaleInvoiceModal: React.FC<SaleInvoiceModalProps> = ({
  initialInvoice,
  onClose,
}) => {
  return (
    <SalesInvoiceView
      initialInvoice={initialInvoice}
      onClose={onClose}
      isModalMode={true}
    />
  );
};
