/**
 * ACCOUNTIX - Add Item Modal (Product or Service)
 * Distinguishes physical Products (inventory tracked) from Services (zero stock).
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Package, Wrench, Box, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Item, ProductItem, ServiceItem } from '../../types/masters';
import { mastersService } from '../../services/mastersService';

export const AddItemModal: React.FC<{ defaultType?: 'PRODUCT' | 'SERVICE' }> = ({
  defaultType = 'PRODUCT',
}) => {
  const { closeModal, refreshItems, showNotification } = useApp();

  const [itemType, setItemType] = useState<'PRODUCT' | 'SERVICE'>(defaultType);
  const [name, setName] = useState('');
  const [code, setCode] = useState(
    itemType === 'PRODUCT'
      ? `PRD-${Math.floor(Math.random() * 800 + 100)}`
      : `SRV-${Math.floor(Math.random() * 800 + 100)}`
  );
  const [saleRate, setSaleRate] = useState(50);
  const [purchaseRate, setPurchaseRate] = useState(30);
  const [taxPercent, setTaxPercent] = useState(18);
  const [unit, setUnit] = useState('PCS');
  const [openingStock, setOpeningStock] = useState(100);
  const [storeLocation, setStoreLocation] = useState('Warehouse A - Bay 1');
  const [categoryName, setCategoryName] = useState('General Maintenance');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let newItem: Item;

    if (itemType === 'PRODUCT') {
      newItem = {
        id: `item_prd_${Date.now()}`,
        code,
        name,
        itemType: 'PRODUCT',
        categoryId: 'cat_01',
        categoryName,
        unit,
        purchaseRate: Number(purchaseRate),
        saleRate: Number(saleRate),
        openingStock: Number(openingStock),
        currentStock: Number(openingStock),
        reorderLevel: 20,
        taxPercent: Number(taxPercent),
        storeLocation,
        inventoryAccountId: 'acc_1200',
        cogsAccountId: 'acc_5010',
        saleAccountId: 'acc_4010',
        isActive: true,
        description,
      };
    } else {
      // SERVICE: zero stock, no inventory tracking!
      newItem = {
        id: `item_srv_${Date.now()}`,
        code,
        name,
        itemType: 'SERVICE',
        categoryId: 'cat_05',
        categoryName,
        saleRate: Number(saleRate),
        taxPercent: Number(taxPercent),
        revenueAccountId: 'acc_4020',
        serviceDurationMinutes: 45,
        hsnSacCode: '998714',
        isActive: true,
        description,
      };
    }

    mastersService.addItem(newItem);
    refreshItems();
    showNotification(
      'success',
      'Catalog Master Saved',
      `${name} registered as ${itemType === 'PRODUCT' ? 'Physical Product (Stock Tracked)' : 'Service (Non-Inventory)'}.`
    );
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl border border-blue-100 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-3.5 bg-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-800 text-white flex items-center justify-center border border-blue-500">
              {itemType === 'PRODUCT' ? <Package className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Add {itemType === 'PRODUCT' ? 'Physical Product' : 'Billable Service'}
              </h2>
              <p className="text-[11px] text-blue-100">
                {itemType === 'PRODUCT'
                  ? 'Maintains stock quantities, valuations, and warehouse store locations.'
                  : 'Zero inventory; revenue earned through labour and billed services.'}
              </p>
            </div>
          </div>
          <button onClick={closeModal} className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-800 cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Item Type Switcher */}
          <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setItemType('PRODUCT');
                setCode(`PRD-${Math.floor(Math.random() * 800 + 100)}`);
              }}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                itemType === 'PRODUCT' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Physical Product (With Stock)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setItemType('SERVICE');
                setCode(`SRV-${Math.floor(Math.random() * 800 + 100)}`);
              }}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                itemType === 'SERVICE' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Service (Non-Inventory)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {itemType === 'PRODUCT' ? 'Product Code / SKU' : 'Service Code / SAC'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded focus:border-blue-500 font-medium text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tax Rate (VAT / GST %)</label>
              <select
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-blue-500"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Standard)</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {itemType === 'PRODUCT' ? 'Product Name' : 'Service Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={itemType === 'PRODUCT' ? 'e.g. Brake Caliper Spring' : 'e.g. Wheel Balancing & Alignment'}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-blue-500 text-slate-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-blue-500"
            />
          </div>

          {/* Pricing fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sale Rate ($)</label>
              <input
                type="number"
                step="0.01"
                value={saleRate}
                onChange={(e) => setSaleRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded focus:border-blue-500"
                required
              />
            </div>

            {itemType === 'PRODUCT' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Purchase Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded focus:border-blue-500"
                  required
                />
              </div>
            )}
          </div>

          {/* Product-Only Inventory Controls */}
          {itemType === 'PRODUCT' ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wide block">
                Physical Inventory Controls
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Unit of Measure</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded"
                  >
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="LTR">LTR (Litres)</option>
                    <option value="SET">SET (Sets)</option>
                    <option value="KGS">KGS (Kilograms)</option>
                    <option value="BOX">BOX (Boxes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={openingStock}
                    onChange={(e) => setOpeningStock(Number(e.target.value))}
                    className="w-full px-2 py-1 font-mono bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Store / Location</label>
                  <input
                    type="text"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg text-indigo-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Non-Inventory Architecture Enforced:</strong> Services do not create stock-in-hand records or
                deplete warehouse quantities. Invoices post directly to <em>4020 Service Income & Labour Charges</em>.
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical specs, warranty notes, or billing conditions..."
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:border-blue-500"
            />
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
              Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
