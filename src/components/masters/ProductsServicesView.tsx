/**
 * ACCOUNTIX - Products & Services Catalog View
 * Distinguishes physical Products (stock tracked) from billable Services (zero stock).
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Wrench,
  PlusCircle,
  Search,
  CheckCircle,
  AlertTriangle,
  Building,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { ProductItem, ServiceItem } from '../../types/masters';

export const ProductsServicesView: React.FC = () => {
  const { items, openModal } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    if (filter !== 'ALL' && item.itemType !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatCurrency = (amt: number) => {
    return `$${amt.toLocaleString('en-US', {
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
              Products & Services Master Catalog
            </h1>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              Hybrid Inventory Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical merchandise (stock tracked with store locations) vs non-inventory billable services (zero stock).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('ADD_PRODUCT')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product (Physical)</span>
          </button>
          <button
            onClick={() => openModal('ADD_SERVICE')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* 2. Architecture Notice Box */}
      <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs text-slate-700 flex items-start gap-3">
        <Package className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-indigo-950">
            Catalog Invariant: Services Do Not Create Physical Inventory Stock
          </p>
          <p className="text-slate-600 leading-relaxed">
            In ACCOUNTIX, <strong>Products</strong> (e.g. Engine Oil, Oil Filters, Brake Pads) track Opening Stock, Current Stock,
            Reorder Levels, and Warehouse Bins in the balance sheet under <em>1200 Inventory Asset</em>.
            In contrast, <strong>Services</strong> (e.g. Oil Change, Engine Tuning, Brake Service) possess{' '}
            <strong>zero inventory stock</strong> and post directly to <em>4020 Service Revenue</em>.
            Both can seamlessly exist together on the same Sale Invoice.
          </p>
        </div>
      </div>

      {/* 3. Search and Segmented Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md w-full sm:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilter('PRODUCT')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'PRODUCT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Physical Products ({items.filter((i) => i.itemType === 'PRODUCT').length})
          </button>
          <button
            onClick={() => setFilter('SERVICE')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              filter === 'SERVICE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Services ({items.filter((i) => i.itemType === 'SERVICE').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item code, description, category..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-blue-50/30 border border-blue-100 rounded text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* 4. Catalog Data Grid */}
      <div className="bg-white border border-blue-100 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-50 text-[11px] uppercase tracking-wider text-blue-950 border-b border-blue-200 font-bold">
              <tr>
                <th className="px-4 py-2.5">Item Code</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Name & Description</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5 text-right">Purchase Rate</th>
                <th className="px-4 py-2.5 text-right">Sale Rate</th>
                <th className="px-4 py-2.5 text-right">Tax (%)</th>
                <th className="px-4 py-2.5 text-right">Current Stock</th>
                <th className="px-4 py-2.5">Store / Location</th>
                <th className="px-4 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isProduct = item.itemType === 'PRODUCT';
                const prod = isProduct ? (item as ProductItem) : null;
                const srv = !isProduct ? (item as ServiceItem) : null;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{item.code}</td>
                    <td className="px-4 py-3">
                      {isProduct ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Product
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Service
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.categoryName}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {isProduct && prod ? formatCurrency(prod.purchaseRate) : '— (N/A)'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {formatCurrency(item.saleRate)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                      {item.taxPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                      {isProduct && prod ? (
                        <span className={prod.currentStock <= prod.reorderLevel ? 'text-amber-700' : 'text-slate-900'}>
                          {prod.currentStock} {prod.unit}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal italic">No Stock (Service)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {isProduct && prod ? (
                        <span className="font-mono text-[11px]">{prod.storeLocation}</span>
                      ) : (
                        <span className="text-slate-400 italic">Billable Labour</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
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
