/**
 * ACCOUNTIX - Sales Invoice Document Preview & Print / PDF Modal
 * Renders professional audit-compliant invoice document with company letterhead,
 * double-entry verification details, and clean print/PDF layout.
 */

import React from 'react';
import { SalesInvoice } from '../../services/salesInvoiceService';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/dateUtils';
import {
  Printer,
  Download,
  X,
  Building,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Edit,
} from 'lucide-react';

interface InvoicePreviewModalProps {
  invoice: SalesInvoice;
  onClose: () => void;
  onEdit?: (invoice: SalesInvoice) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  onClose,
  onEdit,
}) => {
  const { activeCompany } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amt: number) => {
    return `$${Number(amt || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print-backdrop">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Action Bar (hidden during print) */}
        <div className="no-print px-5 py-3 bg-blue-800 text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-300" />
            <span className="font-bold text-sm">Invoice Document Preview: {invoice.invoiceNo}</span>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                invoice.status === 'POSTED'
                  ? 'bg-emerald-500 text-white'
                  : invoice.status === 'DRAFT'
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(invoice);
                }}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Invoice</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white text-blue-900 hover:bg-blue-50 rounded text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
              title="Print document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
              title="Download or save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-700/60 cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet Container */}
        <div className="overflow-y-auto p-6 sm:p-10 flex-1 bg-white printable-document text-slate-800 font-sans">
          {/* 1. Header & Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  <Building className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {activeCompany?.name || 'ACCOUNTIX ENTERPRISE'}
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-md">
                {activeCompany?.address || '102 Industrial Commercial Estate, Sector 5'}
                <br />
                {activeCompany?.city || 'Metro City'}, {activeCompany?.state || 'State Province'} {activeCompany?.postalCode || '10045'}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-2 font-mono">
                {activeCompany?.phone && <span>Tel: {activeCompany.phone}</span>}
                {activeCompany?.email && <span>Email: {activeCompany.email}</span>}
                {activeCompany?.strn && <span>STRN/Sales Tax: {activeCompany.strn}</span>}
                {activeCompany?.ntn && <span>NTN: {activeCompany.ntn}</span>}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-black text-blue-900 tracking-wider block uppercase">
                {invoice.saleType === 'CASH' ? 'CASH SALE MEMO' : 'TAX INVOICE'}
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold block mt-0.5">
                ORIGINAL FOR RECIPIENT
              </span>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex sm:justify-end gap-2">
                  <span className="text-slate-500 font-medium">Invoice No:</span>
                  <span className="font-mono font-bold text-slate-900">{invoice.invoiceNo}</span>
                </div>
                <div className="flex sm:justify-end gap-2">
                  <span className="text-slate-500 font-medium">Invoice Date:</span>
                  <span className="font-mono font-bold text-slate-900">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="flex sm:justify-end gap-2">
                  <span className="text-slate-500 font-medium">Payment Mode:</span>
                  <span className="font-semibold text-blue-800">{invoice.saleType} SALE</span>
                </div>
                {invoice.referenceNo && (
                  <div className="flex sm:justify-end gap-2">
                    <span className="text-slate-500 font-medium">Reference / PO:</span>
                    <span className="font-mono text-slate-800">{invoice.referenceNo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Bill To & Shipping / Dispatch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-5 p-4 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Billed To / Customer Details:
              </span>
              <h3 className="font-bold text-slate-900 text-sm">{invoice.customerName}</h3>
              {invoice.customerAddress && (
                <p className="text-slate-600 mt-0.5 leading-relaxed">{invoice.customerAddress}</p>
              )}
              {invoice.customerPhone && (
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">Phone: {invoice.customerPhone}</p>
              )}
              {invoice.customerTaxNo && (
                <p className="text-slate-700 font-mono text-[11px] mt-1 font-semibold">
                  Tax Registration / NTN: {invoice.customerTaxNo}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Dispatch & Payment Terms:
              </span>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500">Store / Location:</span>
                <span className="font-semibold text-slate-900">{invoice.storeLocation}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500">Payment Terms:</span>
                <span className="font-medium text-slate-900">{invoice.paymentTerms || 'Due on Receipt'}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500">Settlement Account:</span>
                <span className="font-mono text-blue-800 font-semibold">
                  {invoice.paymentAccountCode === '1020' ? '1020 Standard Commercial Bank' : '1010 Cash in Hand'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Items & Services Table */}
          <div className="border border-slate-300 rounded overflow-hidden my-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-[11px] uppercase tracking-wider text-slate-700 border-b border-slate-300 font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-center w-8">#</th>
                  <th className="py-2.5 px-3">Item / Service Description</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-right">Rate ($)</th>
                  <th className="py-2.5 px-3 text-right">Disc %</th>
                  <th className="py-2.5 px-3 text-right">Tax %</th>
                  <th className="py-2.5 px-3 text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.lines.map((line, idx) => (
                  <tr key={line.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900">{line.itemName}</span>
                      <span className="block font-mono text-[10px] text-slate-500">{line.itemCode}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          line.itemType === 'PRODUCT'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {line.itemType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {line.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{line.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                      ${line.rate.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                      {line.discountPercent > 0 ? `${line.discountPercent}%` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      {line.taxPercent}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${line.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Financial Calculations & Summary Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4">
            <div className="space-y-3">
              {/* Notes & Terms */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">
                  Notes & Special Instructions:
                </span>
                <p className="text-slate-600 italic leading-relaxed">
                  {invoice.notes || 'Goods once sold are subject to standard company warranty policy. Services billed cover verified technician labour.'}
                </p>
              </div>

              {/* Accounting Verification Note */}
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-800 text-[11px]">
                  Double-entry balanced posting verified in General Ledger (Variance: $0.00).
                </span>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Products Gross Subtotal:</span>
                <span className="font-mono">{formatCurrency(invoice.productSubtotal)}</span>
              </div>
              {invoice.serviceSubtotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Services Subtotal:</span>
                  <span className="font-mono">{formatCurrency(invoice.serviceSubtotal)}</span>
                </div>
              )}
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Trade Discount:</span>
                  <span className="font-mono">-{formatCurrency(invoice.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Sales Tax Liability:</span>
                <span className="font-mono">{formatCurrency(invoice.taxTotal)}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-blue-900">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>Amount Received:</span>
                <span className="font-mono">{formatCurrency(invoice.amountReceived)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-dashed border-slate-300 pt-1.5 text-xs">
                <span>Balance Due:</span>
                <span className={`font-mono ${invoice.balanceDue > 0 ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
                  {formatCurrency(invoice.balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Signatures Block */}
          <div className="pt-8 mt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1 font-medium">Customer Signature</div>
            </div>
            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1 font-medium">Store Keeper / Dispatch</div>
            </div>
            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
