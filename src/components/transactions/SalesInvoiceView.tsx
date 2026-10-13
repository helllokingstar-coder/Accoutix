/**
 * ACCOUNTIX - Sales Invoice Workspace
 * Final Master Design Reference Match: "Sales Invoice final design.png"
 * 
 * Target Viewport: 1536 x 1024 (Fits complete invoice without page scrolling)
 * Strict Section-Based Architecture (No Cards)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  User,
  Users,
  CreditCard,
  Truck,
  Search,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Save,
  Printer,
  Eye,
  BookOpen,
  X,
  Minus,
  Maximize2,
  FolderOpen,
  Calculator,
  ChevronDown,
} from 'lucide-react';
import {
  salesInvoiceService,
  SalesInvoice,
  SalesInvoiceLine,
} from '../../services/salesInvoiceService';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { Party, Item, ProductItem } from '../../types/masters';

interface SalesInvoiceViewProps {
  initialInvoice?: SalesInvoice | null;
  onClose?: () => void;
  isModalMode?: boolean;
}

export const SalesInvoiceView: React.FC<SalesInvoiceViewProps> = ({
  initialInvoice,
  onClose,
  isModalMode = false,
}) => {
  const {
    closeModal,
    openModal,
    parties,
    items,
    activeCompany,
    activeFinancialYear,
    showNotification,
    refreshKPIs,
    refreshParties,
    refreshItems,
    refreshVouchers,
    setCurrentView,
  } = useApp();

  const handleClose = onClose || (() => setCurrentView('dashboard'));

  // Invoice Header State
  const [invoiceNo, setInvoiceNo] = useState(initialInvoice?.invoiceNo || 'SI-000125');
  const [invoiceStatus, setInvoiceStatus] = useState<'Draft' | 'Posted'>(
    initialInvoice?.status === 'POSTED' ? 'Posted' : 'Draft'
  );

  // Customer Panel State (defaults to reference: ABC Traders, CUST-00125, Main Market, Lahore, 0300-1234567)
  const [selectedPartyId, setSelectedPartyId] = useState<string | undefined>(
    initialInvoice?.partyId || 'party_abc'
  );
  const [customerName, setCustomerName] = useState(initialInvoice?.customerName || 'ABC Traders');
  const [customerCode, setCustomerCode] = useState(
    initialInvoice?.partyId ? (parties.find(p => p.id === initialInvoice?.partyId)?.code || 'CUST-00125') : 'CUST-00125'
  );
  const [customerAddress, setCustomerAddress] = useState(initialInvoice?.customerAddress || 'Main Market, Lahore');
  const [customerPhone, setCustomerPhone] = useState(initialInvoice?.customerPhone || '0300-1234567');
  const [customerStatus, setCustomerStatus] = useState('Active');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Customer Financial Summary State
  const [previousBalance, setPreviousBalance] = useState<number>(initialInvoice?.previousBalance ?? 45000.0);
  const [creditLimit, setCreditLimit] = useState<number>(100000.0);
  const [availableCredit, setAvailableCredit] = useState<number>(55000.0);
  const [creditStatus, setCreditStatus] = useState<'Within Limit' | 'Exceeded'>('Within Limit');

  // Invoice Details State
  const [saleType, setSaleType] = useState(initialInvoice?.saleType === 'CASH' ? 'Cash Sale' : 'Credit Sale');
  const [paymentMethod, setPaymentMethod] = useState(initialInvoice?.paymentAccountCode === '1010' ? 'Cash' : 'Bank');
  const [salesPerson, setSalesPerson] = useState('Imran Khan');
  const [storeLocation, setStoreLocation] = useState(initialInvoice?.storeLocation || 'Main Store');
  const [priceLevel, setPriceLevel] = useState('Retail');
  const [referenceNo, setReferenceNo] = useState(initialInvoice?.referenceNo || 'PO-1025');
  const [arAccount, setArAccount] = useState('Accounts Receivable');
  const [invoiceDate, setInvoiceDate] = useState(initialInvoice?.invoiceDate || '07-10-2026');
  const [dueDate, setDueDate] = useState('07-11-2026');

  // Shipment / Additional Information State
  const [shipTo, setShipTo] = useState('Lahore Branch');
  const [shippingAddress, setShippingAddress] = useState('Lahore Branch, Main Road, Lahore');
  const [shipDate, setShipDate] = useState('07-10-2026');
  const [terms, setTerms] = useState(initialInvoice?.paymentTerms || 'Net 30 Days');
  const [salesRep, setSalesRep] = useState('Imran Khan');

  // Product Search & Quick Info State
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [selectedProductCode, setSelectedProductCode] = useState('PROD-001');
  const [quickSalePrice, setQuickSalePrice] = useState('3,500.00');
  const [quickStock, setQuickStock] = useState('50 Pcs');
  const [quickUnit, setQuickUnit] = useState('Pcs');
  const [quickStore, setQuickStore] = useState('Main Store');
  const [quickBatch, setQuickBatch] = useState('BATCH-2026-01 (Exp: 31-12-2026)');

  // Stock Check State
  const [stockAvailable, setStockAvailable] = useState('50 Pcs');
  const [stockRequired, setStockRequired] = useState('2 Pcs');
  const [selectedBatchOption, setSelectedBatchOption] = useState('BATCH-2026-01 (Exp: 31-12-2026)');
  const [batchAvailable, setBatchAvailable] = useState('30 Pcs');

  // Table Lines State (Reopens existing lines or initializes reference lines)
  const [tableLines, setTableLines] = useState<Array<{
    id: string;
    product: string;
    description: string;
    qty: number;
    unit: string;
    rate: number;
    discount: number;
    tax: number;
    amount: number;
    store: string;
    batch: string;
    status: string;
  }>>(() => {
    if (initialInvoice && initialInvoice.lines && initialInvoice.lines.length > 0) {
      return initialInvoice.lines.map((l, i) => ({
        id: l.id || `row-${i + 1}`,
        product: l.itemCode || l.itemId,
        description: l.itemName,
        qty: l.quantity,
        unit: l.unit,
        rate: l.rate,
        discount: 0,
        tax: l.taxAmount,
        amount: l.lineTotal,
        store: l.storeLocation || 'Main Store',
        batch: (l as any).batch || '-',
        status: 'Available',
      }));
    }
    return [
      {
        id: 'row-1',
        product: 'PROD-001',
        description: 'Laptop Bag',
        qty: 2,
      unit: 'Pcs',
      rate: 3500.0,
      discount: 200.0,
      tax: 0.0,
      amount: 6800.0,
      store: 'Main Store',
      batch: 'BATCH-2026-01',
      status: 'Available',
    },
    {
      id: 'row-2',
      product: 'PROD-002',
      description: 'Wireless Mouse',
      qty: 3,
      unit: 'Pcs',
      rate: 1200.0,
      discount: 0.0,
      tax: 0.0,
      amount: 3600.0,
      store: 'Main Store',
      batch: '-',
      status: 'Available',
    },
    {
      id: 'row-3',
      product: 'PROD-003',
      description: 'Laptop Stand',
      qty: 1,
      unit: 'Pcs',
      rate: 2800.0,
      discount: 100.0,
      tax: 0.0,
      amount: 2700.0,
      store: 'Main Store',
      batch: '-',
      status: 'Available',
    },
  ];
});

  const [selectedRowId, setSelectedRowId] = useState<string>('row-1');

  // Notes tab state
  const [activeNoteTab, setActiveNoteTab] = useState<'terms' | 'internal' | 'customer'>('terms');
  const [notesText, setNotesText] = useState(
    'Please make payment within 14 days of invoice date.\nThank you for your business.'
  );

  // Settlement & Summary State
  const [freightCharges, setFreightCharges] = useState<number>(200.0);
  const [cashReceivedAtSale, setCashReceivedAtSale] = useState<number>(initialInvoice?.amountReceived ?? 5000.0);
  const [receivedOther, setReceivedOther] = useState<number>(0.0);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Live Calculations
  const {
    calculatedSubtotal,
    calculatedDiscount,
    calculatedTax,
    calculatedCurrentInvoice,
    calculatedBalanceDue,
    calculatedNewBalance,
  } = useMemo(() => {
    let sub = 0;
    let disc = 0;
    let taxVal = 0;

    tableLines.forEach((row) => {
      const gross = (Number(row.qty) || 0) * (Number(row.rate) || 0);
      sub += gross;
      disc += Number(row.discount) || 0;
      taxVal += Number(row.tax) || 0;
    });

    const currentInv = sub - disc + taxVal + (Number(freightCharges) || 0);
    const balDue = Math.max(0, currentInv - (Number(cashReceivedAtSale) || 0) - (Number(receivedOther) || 0));
    const newBal = previousBalance + currentInv - (Number(cashReceivedAtSale) || 0) - (Number(receivedOther) || 0);

    return {
      calculatedSubtotal: sub,
      calculatedDiscount: disc,
      calculatedTax: taxVal,
      calculatedCurrentInvoice: currentInv,
      calculatedBalanceDue: balDue,
      calculatedNewBalance: newBal,
    };
  }, [tableLines, freightCharges, cashReceivedAtSale, receivedOther, previousBalance]);

  // Recalculate row amounts
  const handleUpdateRow = (index: number, field: string, value: any) => {
    setTableLines((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], [field]: value };
      const gross = (Number(row.qty) || 0) * (Number(row.rate) || 0);
      const disc = Number(row.discount) || 0;
      const tax = Number(row.tax) || 0;
      row.amount = Math.max(0, gross - disc + tax);
      copy[index] = row;
      return copy;
    });
  };

  // --- CUSTOMER SELECTION LOGIC ---
  const customerParties = useMemo(() => {
    return parties.filter((p) => p.roles.isCustomer || p.id === 'party_abc');
  }, [parties]);

  const filteredCustomers = useMemo(() => {
    const q = customerName.toLowerCase().trim();
    if (!q) return customerParties;
    return customerParties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.phone && p.phone.toLowerCase().includes(q))
    );
  }, [customerParties, customerName]);

  const handleSelectCustomer = (party: Party) => {
    setSelectedPartyId(party.id);
    setCustomerName(party.name);
    setCustomerCode(party.code);
    const addr = party.billingAddress
      ? `${party.billingAddress.street}, ${party.billingAddress.city}`
      : '';
    setCustomerAddress(addr);
    setCustomerPhone(party.phone || '');
    setCustomerStatus(party.isActive ? 'Active' : 'Inactive');

    const prevBal = party.receivableBalance ?? 0;
    const credLim = party.roles.creditLimit ?? 0;
    const availCred = Math.max(0, credLim - prevBal);

    setPreviousBalance(prevBal);
    setCreditLimit(credLim);
    setAvailableCredit(availCred);
    setCreditStatus(prevBal > credLim ? 'Exceeded' : 'Within Limit');
    setIsCustomerDropdownOpen(false);
  };

  const handleSelectCashBuyer = () => {
    setSelectedPartyId(undefined);
    setCustomerName('Cash Buyer (Walk-in)');
    setCustomerCode('CASH-WALKIN');
    setCustomerAddress('Counter Sale');
    setCustomerPhone('');
    setCustomerStatus('Active');
    setPreviousBalance(0);
    setCreditLimit(0);
    setAvailableCredit(0);
    setCreditStatus('Within Limit');
    setSaleType('Cash Sale');
    setPaymentMethod('Cash');
    setIsCustomerDropdownOpen(false);
  };

  // Auto-select newly registered customer from modal
  const prevPartiesCountRef = React.useRef(parties.length);
  useEffect(() => {
    if (parties.length > prevPartiesCountRef.current) {
      const newest = parties[0];
      if (newest && (newest.roles.isCustomer || newest.roles.isSupplier)) {
        handleSelectCustomer(newest);
      }
    }
    prevPartiesCountRef.current = parties.length;
  }, [parties]);

  // --- PRODUCT SELECTION & INVENTORY LOGIC ---
  const productCatalog = useMemo(() => {
    return items.filter((i) => i.isActive);
  }, [items]);

  const filteredProducts = useMemo(() => {
    const q = searchProductQuery.toLowerCase().trim();
    if (!q) return productCatalog;
    return productCatalog.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
    );
  }, [productCatalog, searchProductQuery]);

  const handleSelectProduct = (item: Item) => {
    const isProduct = item.itemType === 'PRODUCT';
    const prodItem = item as ProductItem;
    const stock = isProduct ? (prodItem.currentStock ?? 0) : 999;
    const unit = isProduct ? (prodItem.unit || 'Pcs') : 'Service';
    const store = isProduct ? (prodItem.storeLocation || storeLocation) : storeLocation;
    const batch = 'BATCH-2026-01 (Exp: 31-12-2026)';

    // 1. Update Quick Info & Stock Check displays
    setSelectedProductCode(item.code);
    setQuickSalePrice(formatNumber(item.saleRate));
    setQuickUnit(unit);
    setQuickStore(store);
    setQuickStock(`${stock} ${unit}`);
    setQuickBatch(batch);

    setStockAvailable(`${stock} ${unit}`);
    setStockRequired(`1 ${unit}`);
    setSelectedBatchOption(batch);
    setBatchAvailable(`${Math.min(stock, 30)} ${unit}`);

    // 2. Validate stock availability using inventory rules
    if (isProduct && stock <= 0) {
      showNotification(
        'warning',
        'Stock Alert',
        `Item "${item.name}" (${item.code}) is out of stock in ${store}.`
      );
    }

    // 3. Prevent accidental duplicate rows unless user intends
    const existingIndex = tableLines.findIndex(
      (r) =>
        r.product.toLowerCase() === item.code.toLowerCase() ||
        r.product.toLowerCase() === item.id.toLowerCase()
    );

    if (existingIndex >= 0) {
      setTableLines((prev) => {
        const copy = [...prev];
        const row = copy[existingIndex];
        const newQty = (Number(row.qty) || 0) + 1;
        const gross = newQty * (Number(row.rate) || 0);
        const disc = Number(row.discount) || 0;
        const tax = Number(row.tax) || 0;
        copy[existingIndex] = {
          ...row,
          qty: newQty,
          amount: Math.max(0, gross - disc + tax),
          status: isProduct && stock < newQty ? 'Low Stock' : 'Available',
        };
        return copy;
      });
      setSelectedRowId(tableLines[existingIndex].id);
      showNotification(
        'info',
        'Quantity Updated',
        `"${item.name}" already in invoice — quantity increased to ${tableLines[existingIndex].qty + 1}.`
      );
    } else {
      const newId = `row-${Date.now()}`;
      const taxVal = item.taxPercent ? (item.saleRate * item.taxPercent) / 100 : 0.0;
      const newRow = {
        id: newId,
        product: item.code,
        description: item.name,
        qty: 1,
        unit,
        rate: item.saleRate,
        discount: 0.0,
        tax: taxVal,
        amount: item.saleRate + taxVal,
        store,
        batch: 'BATCH-2026-01',
        status: isProduct && stock <= 0 ? 'Out of Stock' : 'Available',
      };
      setTableLines((prev) => [...prev, newRow]);
      setSelectedRowId(newId);
      showNotification('success', 'Product Added', `Added "${item.name}" (${item.code}) to invoice lines.`);
    }

    setSearchProductQuery('');
    setIsProductDropdownOpen(false);
  };

  // Add Product button: selects top searched or catalog item
  const handleAddProduct = () => {
    if (filteredProducts.length > 0 && searchProductQuery.trim()) {
      handleSelectProduct(filteredProducts[0]);
      return;
    }
    const unadded = items.find((i) => !tableLines.some((r) => r.product === i.code || r.product === i.id));
    if (unadded) {
      handleSelectProduct(unadded);
      return;
    }
    const selected = items.find((i) => i.code === selectedProductCode);
    if (selected) {
      handleSelectProduct(selected);
      return;
    }
    if (items.length > 0) {
      handleSelectProduct(items[0]);
    }
  };

  // Delete Row button
  const handleDeleteRow = (idToDelete?: string) => {
    const targetId = idToDelete || selectedRowId;
    if (tableLines.length <= 1) {
      showNotification('warning', 'Row Required', 'Invoice must have at least one line item.');
      return;
    }
    setTableLines((prev) => prev.filter((r) => r.id !== targetId));
  };

  // Outside click listener for floating dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.customer-dropdown-container')) {
        setIsCustomerDropdownOpen(false);
      }
      if (!target.closest('.product-dropdown-container')) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resolved customer entity for general ledger integration
  const resolvedParty = useMemo(() => {
    if (selectedPartyId) {
      const found = parties.find((p) => p.id === selectedPartyId);
      if (found) return found;
    }
    return (
      parties.find(
        (p) =>
          p.id === initialInvoice?.partyId ||
          p.name.toLowerCase() === customerName.toLowerCase() ||
          p.code.toLowerCase() === customerCode.toLowerCase()
      ) ||
      parties.find((p) => p.roles.isCustomer) ||
      parties[0]
    );
  }, [parties, selectedPartyId, customerName, customerCode, initialInvoice]);

  // Dynamically constructed SalesInvoice model matching application service contracts
  const currentSalesInvoiceObject = useMemo<SalesInvoice>(() => {
    // Parse/format date as ISO YYYY-MM-DD
    let isoDate = invoiceDate;
    if (invoiceDate && invoiceDate.includes('-') && invoiceDate.length === 10) {
      const parts = invoiceDate.split('-');
      if (parts[0].length === 2 && parts[2].length === 4) {
        isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    return {
      id: initialInvoice?.id || `inv_${Date.now()}`,
      invoiceNo,
      invoiceDate: isoDate || '2026-10-07',
      companyId: activeCompany?.id || 'comp_01',
      financialYearId: activeFinancialYear?.id || 'fy_2026_27',
      saleType: saleType === 'Cash Sale' ? 'CASH' : 'CREDIT',
      partyId: saleType === 'Cash Sale' && !selectedPartyId ? undefined : (selectedPartyId || resolvedParty?.id),
      customerName: customerName || (saleType === 'Cash Sale' ? 'Cash Buyer' : 'Walk-in Customer'),
      customerPhone,
      customerAddress,
      customerTaxNo: 'TAX-PK-98102',
      storeLocation,
      paymentAccountCode: paymentMethod === 'Bank' ? '1020' : '1010',
      paymentTerms: terms,
      referenceNo,
      notes: notesText,
      lines: tableLines.map((l) => {
        const matchedItem = items.find((i) => i.code === l.product || i.id === l.product);
        return {
          id: l.id,
          itemId: matchedItem?.id || l.product,
          itemCode: matchedItem?.code || l.product,
          itemName: l.description,
          itemType: (matchedItem?.itemType || 'PRODUCT') as any,
          storeLocation: l.store || storeLocation,
          quantity: Number(l.qty) || 1,
          unit: l.unit || 'Pcs',
          rate: Number(l.rate) || 0,
          discountPercent:
            (Number(l.discount) || 0) > 0 && (Number(l.rate) || 0) > 0
              ? Number(((Number(l.discount) / ((Number(l.qty) || 1) * Number(l.rate))) * 100).toFixed(2))
              : 0,
          taxPercent: (Number(l.tax) || 0) > 0 ? 18.0 : 0.0,
          taxAmount: Number(l.tax) || 0,
          lineTotal: Number(l.amount) || 0,
        };
      }),
      productSubtotal: calculatedSubtotal,
      serviceSubtotal: 0,
      discountTotal: calculatedDiscount,
      taxTotal: calculatedTax,
      grandTotal: calculatedCurrentInvoice,
      amountReceived: Number(cashReceivedAtSale) || 0,
      balanceDue: calculatedBalanceDue,
      previousBalance,
      newBalance: calculatedNewBalance,
      status: invoiceStatus === 'Posted' ? 'POSTED' : 'DRAFT',
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    initialInvoice,
    invoiceNo,
    invoiceDate,
    activeCompany,
    activeFinancialYear,
    saleType,
    resolvedParty,
    customerName,
    customerPhone,
    customerAddress,
    storeLocation,
    paymentMethod,
    terms,
    referenceNo,
    notesText,
    tableLines,
    calculatedSubtotal,
    calculatedDiscount,
    calculatedTax,
    calculatedCurrentInvoice,
    cashReceivedAtSale,
    calculatedBalanceDue,
    previousBalance,
    calculatedNewBalance,
    invoiceStatus,
  ]);

  // Save Draft Handler (persists draft without impacting stock or GL)
  const handleSaveDraft = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const draftPayload: SalesInvoice = {
        ...currentSalesInvoiceObject,
        status: 'DRAFT',
      };
      const result = salesInvoiceService.saveDraft(draftPayload);
      if (result.success) {
        setInvoiceStatus('Draft');
        showNotification('success', 'Draft Saved', result.message);
        refreshKPIs();
        refreshVouchers();
      } else {
        showNotification('warning', 'Save Draft Failed', result.message);
      }
    } catch (err: any) {
      showNotification('warning', 'Error', err.message || 'Failed to save draft invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save / Post Handler (runs double-entry validation, GL posting, and inventory deductions)
  const handlePostInvoice = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const postPayload: SalesInvoice = {
        ...currentSalesInvoiceObject,
        status: 'POSTED',
      };
      const result = salesInvoiceService.postInvoice(postPayload);
      if (result.success) {
        setInvoiceStatus('Posted');
        showNotification('success', 'Invoice Posted', result.message);
        refreshKPIs();
        refreshParties();
        refreshItems();
        refreshVouchers();
      } else {
        showNotification('warning', 'Posting Failed', result.message);
      }
    } catch (err: any) {
      showNotification('warning', 'Error', err.message || 'Failed to post invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndPrint = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const postPayload: SalesInvoice = {
        ...currentSalesInvoiceObject,
        status: 'POSTED',
      };
      const result = salesInvoiceService.postInvoice(postPayload);
      if (result.success) {
        setInvoiceStatus('Posted');
        showNotification('success', 'Invoice Posted', result.message);
        refreshKPIs();
        refreshParties();
        refreshItems();
        refreshVouchers();
        setPreviewModalOpen(true);
      } else {
        showNotification('warning', 'Posting Failed', result.message);
      }
    } catch (err: any) {
      showNotification('warning', 'Error', err.message || 'Failed to post invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (num: number) => {
    return Number(num || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full flex flex-col bg-[#e9f0f8] text-slate-800 text-[11px] leading-tight select-none">

      {/* ========================================================
          ROW 3: SALES INVOICE HEADER BAR
          Gradient Blue `#1f6ea9` to `#165380`, Title, Invoice #, Status, Window Controls
      ======================================================== */}
      <section className="bg-gradient-to-r from-[#1f6ea9] via-[#1a6196] to-[#154f7c] text-white px-3 py-1 flex items-center justify-between border-b border-[#124166] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white text-[#1a6196] flex items-center justify-center shadow-xs">
            <FileText className="w-3.5 h-3.5 fill-[#1a6196]/20" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
              Sales Invoice
            </h1>
            <p className="text-[9px] text-blue-100 font-normal leading-none">
              Create Sales Invoice
            </p>
          </div>
        </div>

        {/* Right side controls: Invoice No, Reload button, Status Pill, Window Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-white">
            <span className="text-[11px] text-blue-100 font-medium">Invoice No:</span>
            <div className="flex items-center bg-white rounded border border-blue-200 px-2 py-0.5 shadow-2xs text-slate-800">
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-24 text-xs font-mono font-bold text-slate-800 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setInvoiceNo(`SI-000${Math.floor(100 + Math.random() * 900)}`)}
                title="Regenerate Invoice Number"
                className="text-slate-400 hover:text-blue-700 cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] text-blue-100 font-medium">Status:</span>
            <span className="bg-[#2ecc71] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              {invoiceStatus}
            </span>
          </div>

          {/* Window control icons (— □ ✕) */}
          <div className="flex items-center gap-0.5 ml-2 border-l border-blue-400/30 pl-2">
            <button
              type="button"
              className="w-4.5 h-4.5 rounded flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10"
              title="Minimize"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              className="w-4.5 h-4.5 rounded flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10"
              title="Maximize"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-4.5 h-4.5 rounded flex items-center justify-center text-blue-100 hover:text-white hover:bg-red-500"
              title="Close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Form Content Container: Ultra-dense, fitted for 1536x1024 single screen */}
      <div className="p-1.5 space-y-1.5 flex-1 flex flex-col justify-between">

        {/* ========================================================
            ROW 4: THREE TOP PANELS
            1. Bill To / Customer
            2. Customer Financial Summary
            3. Invoice Details
        ======================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-1.5 shrink-0">
          
          {/* Panel 1: Bill To / Customer (approx 4 cols) */}
          <section className="md:col-span-4 bg-white rounded border border-[#bce1f5] flex flex-col shadow-2xs relative z-20">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px] rounded-t">
              <User className="w-3.5 h-3.5 text-[#1b5e94]" />
              <span>Bill To / Customer</span>
            </div>

            <div className="p-1.5 space-y-1 text-[11px]">
              {/* Customer Selector */}
              <div className="grid grid-cols-12 items-center gap-1 relative customer-dropdown-container">
                <label className="col-span-3 text-slate-600 font-medium text-[10px]">Customer:</label>
                <div className="col-span-9 flex items-center gap-1">
                  <div className="flex-1 relative">
                    <div
                      onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                      className="flex items-center bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 cursor-pointer hover:border-blue-400 focus-within:border-blue-500"
                    >
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          setIsCustomerDropdownOpen(true);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCustomerDropdownOpen(true);
                        }}
                        placeholder="Select or search customer..."
                        className="w-full text-[11px] font-semibold text-slate-800 focus:outline-hidden"
                      />
                      <Search className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>

                    {/* Customer Dropdown suggestions */}
                    {isCustomerDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-[#bce1f5] rounded shadow-lg z-50 max-h-52 overflow-y-auto">
                        {/* Quick Option for Cash Sale Walk-in */}
                        <div
                          onClick={handleSelectCashBuyer}
                          className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 flex items-center justify-between text-[10px]"
                        >
                          <div>
                            <span className="font-bold text-blue-700">Cash Buyer (Walk-in / Counter Sale)</span>
                            <span className="text-slate-400 ml-1 font-mono">[CASH-WALKIN]</span>
                          </div>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">No Ledger</span>
                        </div>

                        {filteredCustomers.length === 0 ? (
                          <div className="p-2 text-center text-slate-400 text-[10px]">
                            No registered customers match "{customerName}"
                          </div>
                        ) : (
                          filteredCustomers.map((cust) => (
                            <div
                              key={cust.id}
                              onClick={() => handleSelectCustomer(cust)}
                              className={`px-2 py-1.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-[10px] ${
                                cust.id === selectedPartyId ? 'bg-blue-50/70 font-semibold' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{cust.name}</span>
                                <span className="font-mono text-[9px] text-[#1b5e94] font-semibold">{cust.code}</span>
                              </div>
                              <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                                <span>Bal: <strong className="font-mono text-slate-700">PKR {formatNumber(cust.receivableBalance)}</strong></span>
                                <span>Limit: <strong className="font-mono text-slate-700">PKR {formatNumber(cust.roles.creditLimit)}</strong></span>
                                <span className={`px-1 rounded text-[8px] font-bold ${
                                  cust.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {cust.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal('ADD_CUSTOMER')}
                    className="px-1.5 py-0.5 bg-[#2b72a9] hover:bg-[#1f5a87] text-white rounded text-[10px] font-bold flex items-center gap-0.5 shrink-0 cursor-pointer shadow-2xs"
                    title="Create New Customer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>New</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                    className="p-1 bg-[#2b72a9] hover:bg-[#1f5a87] text-white rounded shrink-0 cursor-pointer shadow-2xs"
                    title="Browse Customers"
                  >
                    <FolderOpen className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Customer Code */}
              <div className="grid grid-cols-12 items-center gap-1">
                <label className="col-span-3 text-slate-600 font-medium text-[10px]">Customer Code:</label>
                <div className="col-span-9">
                  <input
                    type="text"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[11px] text-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-12 items-center gap-1">
                <label className="col-span-3 text-slate-600 font-medium text-[10px]">Address:</label>
                <div className="col-span-9">
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[11px] text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-12 items-center gap-1">
                <label className="col-span-3 text-slate-600 font-medium text-[10px]">Phone:</label>
                <div className="col-span-9">
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[11px] text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Customer Status */}
              <div className="grid grid-cols-12 items-center gap-1">
                <label className="col-span-3 text-slate-600 font-medium text-[10px]">Customer Status:</label>
                <div className="col-span-9">
                  <div className="inline-flex items-center gap-1 bg-[#2ecc71] text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer">
                    <span>Active</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 2: Customer Financial Summary (approx 3 cols) */}
          <section className="md:col-span-3 bg-white rounded border border-[#bce1f5] flex flex-col overflow-hidden shadow-2xs">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px]">
              <Users className="w-3.5 h-3.5 text-[#1b5e94]" />
              <span>Customer Financial Summary</span>
            </div>

            <div className="p-1.5 space-y-1 text-[11px]">
              <div className="grid grid-cols-12 items-center gap-1">
                <label className="col-span-6 text-slate-600 text-[10px]">Previous Balance:</label>
                <div className="col-span-6">
                  <input
                    type="text"
                    value={formatNumber(previousBalance)}
                    onChange={(e) => setPreviousBalance(parseFloat(e.target.value.replace(/,/g, '')) || 0)}
                    className="w-full text-right bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-1">
                <label className="col-span-6 text-slate-600 text-[10px]">Credit Limit:</label>
                <div className="col-span-6">
                  <input
                    type="text"
                    value={formatNumber(creditLimit)}
                    onChange={(e) => setCreditLimit(parseFloat(e.target.value.replace(/,/g, '')) || 0)}
                    className="w-full text-right bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[11px] text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-1">
                <label className="col-span-6 text-slate-600 text-[10px]">Available Credit:</label>
                <div className="col-span-6">
                  <input
                    type="text"
                    value={formatNumber(availableCredit)}
                    onChange={(e) => setAvailableCredit(parseFloat(e.target.value.replace(/,/g, '')) || 0)}
                    className="w-full text-right bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[11px] text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-1 pt-0.5">
                <label className="col-span-6 text-slate-600 text-[10px]">Credit Status:</label>
                <div className="col-span-6">
                  <span className="inline-block bg-[#2ecc71] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {creditStatus}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 3: Invoice Details (approx 5 cols) */}
          <section className="md:col-span-5 bg-white rounded border border-[#bce1f5] flex flex-col overflow-hidden shadow-2xs">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px]">
              <FileText className="w-3.5 h-3.5 text-[#1b5e94]" />
              <span>Invoice Details</span>
            </div>

            <div className="p-1.5 space-y-1 text-[11px]">
              {/* Row 1: Sale Type, Store/Location, Invoice Date */}
              <div className="grid grid-cols-12 gap-1.5 items-center">
                <div className="col-span-4 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-16 shrink-0">Sale Type:</label>
                  <select
                    value={saleType}
                    onChange={(e) => setSaleType(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] font-semibold text-slate-800"
                  >
                    <option value="Credit Sale">Credit Sale</option>
                    <option value="Cash Sale">Cash Sale</option>
                  </select>
                </div>
                <div className="col-span-4 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-20 shrink-0">Store / Location:</label>
                  <select
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] font-semibold text-slate-800"
                  >
                    <option value="Main Store">Main Store</option>
                    <option value="Warehouse A">Warehouse A</option>
                  </select>
                </div>
                <div className="col-span-4 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-16 shrink-0">Invoice Date:</label>
                  <div className="flex items-center bg-white border border-[#c4dcfa] rounded px-1 py-0.5 w-full">
                    <input
                      type="text"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full text-[10px] text-slate-800 focus:outline-hidden"
                    />
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Row 2: Payment Method, Price Level, Due Date */}
              <div className="grid grid-cols-12 gap-1.5 items-center">
                <div className="col-span-4 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-16 shrink-0">Payment Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] text-slate-800"
                  >
                    <option value="Bank">Bank</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="col-span-4 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-20 shrink-0">Price Level:</label>
                  <select
                    value={priceLevel}
                    onChange={(e) => setPriceLevel(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] text-slate-800"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
                <div className="col-span-4 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-16 shrink-0">Due Date:</label>
                  <div className="flex items-center bg-white border border-[#c4dcfa] rounded px-1 py-0.5 w-full">
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full text-[10px] text-slate-800 focus:outline-hidden"
                    />
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Row 3: Sales Person, Reference */}
              <div className="grid grid-cols-12 gap-1.5 items-center">
                <div className="col-span-4 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-16 shrink-0">Sales Person:</label>
                  <select
                    value={salesPerson}
                    onChange={(e) => setSalesPerson(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] text-slate-800"
                  >
                    <option value="Imran Khan">Imran Khan</option>
                    <option value="Alex Mercer">Alex Mercer</option>
                  </select>
                </div>
                <div className="col-span-8 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-16 shrink-0">Reference:</label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[10px] text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 4: A/R Account */}
              <div className="grid grid-cols-12 gap-1.5 items-center">
                <div className="col-span-12 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-16 shrink-0">A/R Account:</label>
                  <select
                    value={arAccount}
                    onChange={(e) => setArAccount(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[10px] text-slate-800 font-semibold"
                  >
                    <option value="Accounts Receivable">Accounts Receivable</option>
                    <option value="Trade Debtors">Trade Debtors</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

        </section>

        {/* ========================================================
            ROW 5: CUSTOMER BALANCE CALCULATION BAR
            Horizontal stream: Previous Balance + Current Invoice - Cash Received - Received (Other) = New Balance
        ======================================================== */}
        <section className="bg-[#e5f0fa] border border-[#bce1f5] rounded px-3 py-1 flex items-center justify-between text-xs shrink-0 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px] mr-2">
            <Calculator className="w-3.5 h-3.5 text-[#1b5e94]" />
            <span>Customer Balance Calculation</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="text-center">
              <span className="block text-[9px] text-slate-500 font-medium leading-none">Previous Balance</span>
              <span className="font-bold text-xs text-[#1f6ea9] font-mono leading-tight">
                {formatNumber(previousBalance)}
              </span>
            </div>

            <span className="text-[#1f6ea9] font-bold text-sm">+</span>

            <div className="text-center">
              <span className="block text-[9px] text-slate-500 font-medium leading-none">Current Invoice</span>
              <span className="font-bold text-xs text-[#1f6ea9] font-mono leading-tight">
                {formatNumber(calculatedCurrentInvoice)}
              </span>
            </div>

            <span className="text-[#1f6ea9] font-bold text-sm">-</span>

            <div className="text-center">
              <span className="block text-[9px] text-slate-500 font-medium leading-none">Cash Received at Sale</span>
              <span className="font-bold text-xs text-[#1f6ea9] font-mono leading-tight">
                {formatNumber(cashReceivedAtSale)}
              </span>
            </div>

            <span className="text-[#1f6ea9] font-bold text-sm">-</span>

            <div className="text-center">
              <span className="block text-[9px] text-slate-500 font-medium leading-none">Received (Other)</span>
              <span className="font-bold text-xs text-[#1f6ea9] font-mono leading-tight">
                {formatNumber(receivedOther)}
              </span>
            </div>

            <span className="text-[#1f6ea9] font-bold text-sm">=</span>
          </div>

          {/* New Balance Blue Callout Box */}
          <div className="bg-[#3498db] text-white px-3 py-0.5 rounded text-center shrink-0 shadow-2xs">
            <span className="block text-[8px] uppercase tracking-wider text-blue-100 font-semibold leading-none">
              New Balance (Customer Outstanding)
            </span>
            <span className="font-black text-sm font-mono leading-tight">
              {formatNumber(calculatedNewBalance)}
            </span>
          </div>
        </section>

        {/* ========================================================
            ROW 6: THREE MIDDLE PANELS
            1. Shipment / Additional Information
            2. Product Selection / Search
            3. Stock Check
        ======================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-1.5 shrink-0">
          
          {/* Panel 1: Shipment / Additional Information (4 cols) */}
          <section className="md:col-span-4 bg-white rounded border border-[#bce1f5] flex flex-col overflow-hidden shadow-2xs">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px]">
              <Truck className="w-3.5 h-3.5 text-[#1b5e94]" />
              <span>Shipment / Additional Information</span>
            </div>

            <div className="p-1.5 space-y-1 text-[11px]">
              <div className="grid grid-cols-12 gap-1 items-center">
                <div className="col-span-6 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-14 shrink-0">Ship To:</label>
                  <select
                    value={shipTo}
                    onChange={(e) => setShipTo(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] text-slate-800"
                  >
                    <option value="Lahore Branch">Lahore Branch</option>
                    <option value="Main Warehouse">Main Warehouse</option>
                  </select>
                </div>
                <div className="col-span-6 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-12 shrink-0">Terms:</label>
                  <select
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] text-slate-800"
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-1 items-start">
                <label className="col-span-3 text-[10px] text-slate-600">Shipping Address:</label>
                <div className="col-span-9">
                  <textarea
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1.5 py-0.5 text-[10px] text-slate-800 resize-none focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-1 items-center">
                <div className="col-span-6 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-14 shrink-0">Ship Date:</label>
                  <div className="flex items-center bg-white border border-[#c4dcfa] rounded px-1 py-0.5 w-full">
                    <input
                      type="text"
                      value={shipDate}
                      onChange={(e) => setShipDate(e.target.value)}
                      className="w-full text-[10px] text-slate-800 focus:outline-hidden"
                    />
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  </div>
                </div>
                <div className="col-span-6 flex items-center gap-1">
                  <label className="text-[10px] text-slate-600 w-12 shrink-0">A/R Acc:</label>
                  <select
                    className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] text-slate-800"
                  >
                    <option value="Accounts Receivable">Accounts Receivable</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 2: Product Selection / Search (5 cols) */}
          <section className="md:col-span-5 bg-white rounded border border-[#bce1f5] flex flex-col shadow-2xs relative z-20">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px] rounded-t">
              <Search className="w-3.5 h-3.5 text-[#1b5e94]" />
              <span>Product Selection / Search</span>
            </div>

            <div className="p-1.5 space-y-1 text-[11px]">
              {/* Search input with icon and dropdown */}
              <div className="relative product-dropdown-container">
                <div className="flex items-center bg-white border border-[#c4dcfa] rounded px-2 py-0.5 focus-within:border-blue-500">
                  <input
                    type="text"
                    value={searchProductQuery}
                    onChange={(e) => {
                      setSearchProductQuery(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    placeholder="Search product (e.g. Laptop, PROD-001, Mouse...)"
                    className="w-full text-[11px] text-slate-800 placeholder-slate-400 focus:outline-hidden"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>

                {/* Product Suggestions Dropdown */}
                {isProductDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-[#bce1f5] rounded shadow-lg z-50 max-h-56 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-2 text-center text-slate-400 text-[10px]">
                        No inventory products match "{searchProductQuery}"
                      </div>
                    ) : (
                      filteredProducts.map((prod) => {
                        const isProd = prod.itemType === 'PRODUCT';
                        const pItem = prod as ProductItem;
                        const stock = isProd ? (pItem.currentStock ?? 0) : 999;
                        const unit = isProd ? (pItem.unit || 'Pcs') : 'Service';
                        const store = isProd ? (pItem.storeLocation || 'Main Store') : 'N/A';
                        const isSelected = selectedProductCode === prod.code;

                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleSelectProduct(prod)}
                            className={`px-2 py-1.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 text-[10px] ${
                              isSelected ? 'bg-blue-50/70 font-semibold' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{prod.name}</span>
                              <span className="font-mono text-[9px] text-[#1b5e94] font-semibold">{prod.code}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-[9px] text-slate-500 mt-0.5">
                              <div>Rate: <strong className="font-mono text-slate-700">PKR {formatNumber(prod.saleRate)}</strong></div>
                              <div>Unit: <strong className="text-slate-700">{unit}</strong></div>
                              <div>
                                Stock: <strong className={`font-mono ${stock > 0 ? 'text-emerald-700' : 'text-rose-600 font-bold'}`}>
                                  {stock} {unit}
                                </strong>
                              </div>
                              <div className="text-right truncate">Store: <strong className="text-slate-700">{store}</strong></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Quick Info Box */}
              <div className="bg-[#f2f7fc] border border-[#d5e7f7] rounded p-1.5 text-[10px] space-y-0.5">
                <div className="text-[10px] font-bold text-[#1b5e94] border-b border-[#d5e7f7] pb-0.5 mb-1 flex items-center justify-between">
                  <span>Quick Info</span>
                  <span className="text-[9px] text-slate-500 font-normal">Active Item: {selectedProductCode}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2">
                  <div>Product Code: <strong className="text-slate-800">{selectedProductCode}</strong></div>
                  <div>Unit: <strong className="text-slate-800">{quickUnit}</strong></div>
                  <div>Sale Price: <strong className="text-slate-800">{quickSalePrice}</strong></div>
                  <div>Store: <strong className="text-slate-800">{quickStore}</strong></div>
                  <div>Stock: <strong className="text-slate-800">{quickStock}</strong></div>
                  <div className="truncate">Batch: <strong className="text-slate-800">{quickBatch}</strong></div>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 3: Stock Check (3 cols) */}
          <section className="md:col-span-3 bg-white rounded border border-[#bce1f5] flex flex-col shadow-2xs">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px] rounded-t">
              <AlertTriangle className={`w-3.5 h-3.5 ${stockAvailable.startsWith('0') ? 'text-rose-500' : 'text-amber-500'}`} />
              <span>Stock Check</span>
            </div>

            <div className="p-1.5 space-y-1.5 text-[11px]">
              {/* Sufficient / Out of Stock badge & figures */}
              <div>
                <div className={`flex items-center gap-1 font-bold text-[11px] ${
                  stockAvailable.startsWith('0') ? 'text-rose-600' : 'text-[#27ae60]'
                }`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${stockAvailable.startsWith('0') ? 'text-rose-600' : 'text-[#27ae60]'}`} />
                  <span>{stockAvailable.startsWith('0') ? 'Out of Stock' : 'Sufficient Stock'}</span>
                </div>
                <div className="grid grid-cols-2 text-[10px] text-slate-600 pl-4 mt-0.5">
                  <div>Available: <strong className="text-slate-800">{stockAvailable}</strong></div>
                  <div>Required: <strong className="text-slate-800">{stockRequired}</strong></div>
                </div>
              </div>

              {/* Batch Selection */}
              <div className="pt-0.5 border-t border-slate-100">
                <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Batch Selection</label>
                <select
                  value={selectedBatchOption}
                  onChange={(e) => {
                    setSelectedBatchOption(e.target.value);
                    const rowIdx = tableLines.findIndex((r) => r.id === selectedRowId);
                    if (rowIdx >= 0) {
                      handleUpdateRow(rowIdx, 'batch', e.target.value.split(' ')[0]);
                    }
                  }}
                  className="w-full bg-white border border-[#c4dcfa] rounded px-1 py-0.5 text-[10px] text-slate-800"
                >
                  <option value="BATCH-2026-01 (Exp: 31-12-2026)">BATCH-2026-01 (Exp: 31-12-2026)</option>
                  <option value="BATCH-2026-02 (Exp: 30-06-2027)">BATCH-2026-02 (Exp: 30-06-2027)</option>
                </select>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Available: <strong className="text-slate-700">{batchAvailable}</strong>
                </div>
              </div>
            </div>
          </section>

        </section>

        {/* ========================================================
            ROW 7: EDITABLE ITEMS TABLE
            Headers: #, Product, Description, Qty, Unit, Rate, Discount, Tax, Amount, Store, Batch, Stock Status, Action
        ======================================================== */}
        <section className="bg-white rounded border border-[#bce1f5] flex-1 flex flex-col overflow-hidden shadow-2xs min-h-[140px]">
          <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[140px]">
            <table className="w-full border-collapse text-[11px] text-left">
              <thead>
                <tr className="bg-[#dbe6f1] text-[#1b5e94] border-b border-[#c5d7e8] font-bold text-[10px] whitespace-nowrap">
                  <th className="py-1 px-1.5 text-center w-7">#</th>
                  <th className="py-1 px-1.5 w-24">Product</th>
                  <th className="py-1 px-1.5 min-w-[160px]">Description</th>
                  <th className="py-1 px-1.5 text-right w-12">Qty</th>
                  <th className="py-1 px-1.5 text-center w-12">Unit</th>
                  <th className="py-1 px-1.5 text-right w-20">Rate</th>
                  <th className="py-1 px-1.5 text-right w-16">Discount</th>
                  <th className="py-1 px-1.5 text-right w-14">Tax</th>
                  <th className="py-1 px-1.5 text-right w-20">Amount</th>
                  <th className="py-1 px-1.5 w-24">Store</th>
                  <th className="py-1 px-1.5 w-28">Batch</th>
                  <th className="py-1 px-1.5 w-24">Stock Status</th>
                  <th className="py-1 px-1.5 text-center w-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {tableLines.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      setSelectedRowId(row.id);
                      const matchedItem = items.find(
                        (i) => i.code === row.product || i.id === row.product || i.name === row.description
                      );
                      if (matchedItem) {
                        const isProd = matchedItem.itemType === 'PRODUCT';
                        const pItem = matchedItem as ProductItem;
                        const stock = isProd ? (pItem.currentStock ?? 0) : 999;
                        const unit = row.unit || (isProd ? pItem.unit : 'Pcs');
                        setSelectedProductCode(matchedItem.code);
                        setQuickSalePrice(formatNumber(row.rate));
                        setQuickUnit(unit);
                        setQuickStore(row.store || (isProd ? pItem.storeLocation : storeLocation));
                        setQuickStock(`${stock} ${unit}`);
                        setStockAvailable(`${stock} ${unit}`);
                        setStockRequired(`${row.qty} ${unit}`);
                        setBatchAvailable(`${Math.min(stock, 30)} ${unit}`);
                      }
                    }}
                    className={`cursor-pointer transition-colors ${
                      selectedRowId === row.id ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-0.5 px-1.5 text-center text-slate-500 font-mono text-[10px]">
                      {idx + 1}
                    </td>
                    <td className="py-0.5 px-1.5 font-medium text-slate-800">
                      {row.product}
                    </td>
                    <td className="py-0.5 px-1.5 font-medium text-slate-900">
                      {row.description}
                    </td>
                    <td className="py-0.5 px-1.5 text-right">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => handleUpdateRow(idx, 'qty', Number(e.target.value) || 1)}
                        className="w-10 text-right bg-white border border-[#c4dcfa] rounded px-1 py-0.2 font-bold text-slate-800"
                      />
                    </td>
                    <td className="py-0.5 px-1.5 text-center text-slate-600 text-[10px]">
                      {row.unit}
                    </td>
                    <td className="py-0.5 px-1.5 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={row.rate}
                        onChange={(e) => handleUpdateRow(idx, 'rate', Number(e.target.value) || 0)}
                        className="w-16 text-right bg-white border border-[#c4dcfa] rounded px-1 py-0.2 font-mono text-slate-800"
                      />
                    </td>
                    <td className="py-0.5 px-1.5 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={row.discount}
                        onChange={(e) => handleUpdateRow(idx, 'discount', Number(e.target.value) || 0)}
                        className="w-14 text-right bg-white border border-[#c4dcfa] rounded px-1 py-0.2 font-mono text-slate-800"
                      />
                    </td>
                    <td className="py-0.5 px-1.5 text-right font-mono text-slate-600">
                      {formatNumber(row.tax)}
                    </td>
                    <td className="py-0.5 px-1.5 text-right font-mono font-bold text-[#1b5e94]">
                      {formatNumber(row.amount)}
                    </td>
                    <td className="py-0.5 px-1.5 text-slate-700">
                      {row.store}
                    </td>
                    <td className="py-0.5 px-1.5 text-slate-700 font-mono text-[10px]">
                      {row.batch}
                    </td>
                    <td className="py-0.5 px-1.5">
                      <span className="inline-flex items-center gap-1 text-[#27ae60] font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#27ae60]"></span>
                        <span>{row.status}</span>
                      </span>
                    </td>
                    <td className="py-0.5 px-1.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRow(row.id);
                        }}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Under-table action buttons: + Add Product and ✕ Delete Row */}
          <div className="bg-[#f4f8fc] px-2 py-1 border-t border-[#c5d7e8] flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAddProduct}
              className="px-2.5 py-0.5 bg-[#1d70b8] hover:bg-[#155b96] text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3 h-3" />
              <span>Add Product</span>
            </button>
            <button
              type="button"
              onClick={() => handleDeleteRow()}
              className="px-2.5 py-0.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <X className="w-3 h-3 text-slate-500" />
              <span>Delete Row</span>
            </button>
          </div>
        </section>

        {/* ========================================================
            ROW 8: THREE BOTTOM PANELS
            1. Notes (tabs: Terms & Conditions, Internal Note, Customer Balance Info)
            2. Invoice Summary (Subtotal, Discount, Tax, Freight, Invoice Total, Cash Received, Balance Due)
            3. Payment Status (Credit Sale, Within Limit, Total Outstanding)
        ======================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-1.5 shrink-0">
          
          {/* Panel 1: Notes (4 cols) */}
          <section className="md:col-span-4 bg-white rounded border border-[#bce1f5] flex flex-col overflow-hidden shadow-2xs">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px]">
              <FileText className="w-3.5 h-3.5 text-[#1b5e94]" />
              <span>Notes</span>
            </div>

            <div className="p-1.5 flex-1 flex flex-col">
              {/* Tab headers */}
              <div className="flex items-center gap-1 border-b border-slate-200 mb-1">
                <button
                  type="button"
                  onClick={() => setActiveNoteTab('terms')}
                  className={`px-2 py-0.5 text-[10px] font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeNoteTab === 'terms'
                      ? 'border-[#1b5e94] text-[#1b5e94] bg-[#eef5fc]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Terms & Conditions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNoteTab('internal')}
                  className={`px-2 py-0.5 text-[10px] font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeNoteTab === 'internal'
                      ? 'border-[#1b5e94] text-[#1b5e94] bg-[#eef5fc]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Internal Note
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNoteTab('customer')}
                  className={`px-2 py-0.5 text-[10px] font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeNoteTab === 'customer'
                      ? 'border-[#1b5e94] text-[#1b5e94] bg-[#eef5fc]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Customer Balance Info
                </button>
              </div>

              <textarea
                rows={3}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full bg-[#fcfdfe] border border-[#d2e4f5] rounded p-1.5 text-[10px] text-slate-700 resize-none focus:outline-hidden flex-1"
              />
            </div>
          </section>

          {/* Panel 2: Invoice Summary (5 cols) */}
          <section className="md:col-span-5 bg-white rounded border border-[#bce1f5] flex flex-col overflow-hidden shadow-2xs">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px]">
              <FileText className="w-3.5 h-3.5 text-[#1b5e94]" />
              <span>Invoice Summary</span>
            </div>

            <div className="p-1.5 grid grid-cols-2 gap-2 text-[10px] flex-1">
              {/* Left Sub-column: Subtotal, Discount, Tax, Freight, Invoice Total */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatNumber(calculatedSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Discount:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatNumber(calculatedDiscount)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tax:</span>
                  <span className="font-mono font-semibold text-slate-800">{formatNumber(calculatedTax)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Freight / Other Charges:</span>
                  <input
                    type="number"
                    step="0.01"
                    value={freightCharges}
                    onChange={(e) => setFreightCharges(Number(e.target.value) || 0)}
                    className="w-16 text-right bg-white border border-[#c4dcfa] rounded px-1 py-0.2 text-[10px] font-mono text-slate-800"
                  />
                </div>
                {/* Invoice Total Banner Strip */}
                <div className="bg-[#e5f0fa] border border-[#bce1f5] rounded px-2 py-1 flex items-center justify-between mt-1 text-[#1b5e94]">
                  <span className="font-bold text-[11px]">Invoice Total:</span>
                  <span className="font-black text-xs font-mono">PKR {formatNumber(calculatedCurrentInvoice)}</span>
                </div>
              </div>

              {/* Right Sub-column: Cash Received, Received Other, Balance Due */}
              <div className="space-y-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Cash Received at Sale:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceivedAtSale}
                      onChange={(e) => setCashReceivedAtSale(Number(e.target.value) || 0)}
                      className="w-20 text-right bg-white border border-[#c4dcfa] rounded px-1 py-0.2 text-[10px] font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Received (Other):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={receivedOther}
                      onChange={(e) => setReceivedOther(Number(e.target.value) || 0)}
                      className="w-20 text-right bg-white border border-[#c4dcfa] rounded px-1 py-0.2 text-[10px] font-mono text-slate-800"
                    />
                  </div>
                </div>

                {/* Balance Due Banner Strip */}
                <div className="bg-[#e8f4fc] border border-[#bce1f5] rounded px-2 py-1 flex items-center justify-between text-[#1b5e94]">
                  <span className="font-bold text-[11px]">Balance Due:</span>
                  <span className="font-black text-xs font-mono text-[#1f6ea9]">PKR {formatNumber(calculatedBalanceDue)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 3: Payment Status (3 cols) */}
          <section className="md:col-span-3 bg-white rounded border border-[#bce1f5] flex flex-col overflow-hidden shadow-2xs">
            <div className="bg-[#e8f2fc] px-2 py-1 border-b border-[#d0e5f7] flex items-center gap-1.5 text-[#1b5e94] font-bold text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-[#1b5e94]" />
              <span>Payment Status</span>
            </div>

            <div className="p-2 space-y-1.5 text-[11px] flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-1 text-[#27ae60] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#27ae60]" />
                <span>Credit Sale</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>Credit Limit Status:</span>
                <span className="bg-[#2ecc71] text-white text-[9px] font-bold px-2 py-0.2 rounded">
                  Within Limit
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5 border-t border-slate-100">
                <span>Total Outstanding:</span>
                <span className="font-bold font-mono text-slate-900 text-xs">
                  {formatNumber(calculatedNewBalance)}
                </span>
              </div>
            </div>
          </section>

        </section>

      </div>

      {/* ========================================================
          ROW 9: BOTTOM ACTION TOOLBAR
          Left: Save Draft, Save (primary blue), Preview, Save & Print, View Ledger, Print, Close
          Right: Status: [ Draft ⌄ ]
      ======================================================== */}
      <section className="bg-[#dbe6f1] px-3 py-1.5 border-t border-[#c5d7e8] flex items-center justify-between gap-2 shrink-0">
        
        {/* Left Action Buttons in exact order */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveDraft}
            className={`px-2.5 py-1 text-white rounded text-[11px] font-semibold shadow-2xs flex items-center gap-1 ${
              isSubmitting ? 'bg-slate-400 cursor-not-allowed opacity-70' : 'bg-[#2b72a9] hover:bg-[#205d8c] cursor-pointer'
            }`}
          >
            <Save className="w-3 h-3" />
            <span>{isSubmitting ? 'Saving...' : 'Save Draft'}</span>
          </button>
          
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePostInvoice}
            className={`px-3 py-1 text-white rounded text-[11px] font-bold shadow-xs flex items-center gap-1 ${
              isSubmitting ? 'bg-slate-400 cursor-not-allowed opacity-70' : 'bg-[#1d70b8] hover:bg-[#155b96] cursor-pointer'
            }`}
          >
            <Save className="w-3 h-3" />
            <span>{isSubmitting ? 'Posting...' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="px-2.5 py-1 bg-[#2b72a9] hover:bg-[#205d8c] text-white rounded text-[11px] font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveAndPrint}
            className={`px-2.5 py-1 text-white rounded text-[11px] font-semibold shadow-2xs flex items-center gap-1 ${
              isSubmitting ? 'bg-slate-400 cursor-not-allowed opacity-70' : 'bg-[#2b72a9] hover:bg-[#205d8c] cursor-pointer'
            }`}
          >
            <Printer className="w-3 h-3" />
            <span>Save & Print</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentView('rep_customer_ledger');
            }}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3 text-slate-500" />
            <span>View Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Printer className="w-3 h-3 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-[11px] font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <X className="w-3 h-3 text-slate-500" />
            <span>Close</span>
          </button>
        </div>

        {/* Right side Status dropdown pill */}
        <div className="flex items-center gap-1 text-[11px] text-slate-700">
          <span>Status:</span>
          <select
            value={invoiceStatus}
            onChange={(e) => setInvoiceStatus(e.target.value as any)}
            className="bg-white border border-[#c4dcfa] rounded px-2 py-0.5 text-[11px] font-bold text-slate-800"
          >
            <option value="Draft">Draft</option>
            <option value="Posted">Posted</option>
          </select>
        </div>

      </section>

      {/* Printable Invoice Modal */}
      {previewModalOpen && (
        <InvoicePreviewModal
          invoice={currentSalesInvoiceObject}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}

    </div>
  );
};
