/**
 * ACCOUNTIX - Masters Data Service
 * Supports Dual-Role Parties and Hybrid Product/Service Catalog
 */

import { Party, Item, ProductItem, ItemCategory, UnitOfMeasurement } from '../types/masters';
import { Account } from '../types/accounting';
import {
  INITIAL_PARTIES,
  INITIAL_ITEMS,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_CHART_OF_ACCOUNTS,
} from './mockInitialData';

export class MastersService {
  private parties: Party[] = [...INITIAL_PARTIES];
  private items: Item[] = [...INITIAL_ITEMS];
  private categories: ItemCategory[] = [...INITIAL_CATEGORIES];
  private units: UnitOfMeasurement[] = [...INITIAL_UNITS];
  private accounts: Account[] = [...INITIAL_CHART_OF_ACCOUNTS];

  // --- PARTIES (CUSTOMERS & SUPPLIERS & DUAL-ROLE) ---
  public getParties(roleFilter?: 'ALL' | 'CUSTOMERS' | 'SUPPLIERS' | 'DUAL_ROLE'): Party[] {
    if (!roleFilter || roleFilter === 'ALL') {
      return [...this.parties];
    }
    if (roleFilter === 'CUSTOMERS') {
      return this.parties.filter((p) => p.roles.isCustomer);
    }
    if (roleFilter === 'SUPPLIERS') {
      return this.parties.filter((p) => p.roles.isSupplier);
    }
    if (roleFilter === 'DUAL_ROLE') {
      return this.parties.filter((p) => p.roles.isCustomer && p.roles.isSupplier);
    }
    return [...this.parties];
  }

  public getPartyById(id: string): Party | undefined {
    return this.parties.find((p) => p.id === id);
  }

  public addParty(party: Party): Party {
    this.parties.unshift(party);
    return party;
  }

  // --- ITEMS (PHYSICAL PRODUCTS & NON-INVENTORY SERVICES) ---
  public getItems(typeFilter?: 'ALL' | 'PRODUCT' | 'SERVICE'): Item[] {
    if (!typeFilter || typeFilter === 'ALL') {
      return [...this.items];
    }
    return this.items.filter((i) => i.itemType === typeFilter);
  }

  public addItem(item: Item): Item {
    this.items.unshift(item);
    return item;
  }

  public updatePartyBalance(partyId: string, receivableDelta: number): void {
    const party = this.parties.find((p) => p.id === partyId);
    if (party) {
      party.receivableBalance = Math.max(0, (party.receivableBalance || 0) + receivableDelta);
      party.netBalance = party.receivableBalance - (party.payableBalance || 0);
    }
  }

  public adjustItemStock(itemId: string, qtyDelta: number): void {
    const item = this.items.find((i) => i.id === itemId);
    if (item && item.itemType === 'PRODUCT') {
      (item as ProductItem).currentStock = Math.max(0, ((item as ProductItem).currentStock || 0) + qtyDelta);
    }
  }

  // --- CATEGORIES & UNITS ---
  public getCategories(): ItemCategory[] {
    return [...this.categories];
  }

  public getUnits(): UnitOfMeasurement[] {
    return [...this.units];
  }

  // --- CHART OF ACCOUNTS ---
  public getAccounts(category?: string): Account[] {
    if (!category || category === 'ALL') {
      return [...this.accounts];
    }
    return this.accounts.filter((a) => a.category === category);
  }
}

export const mastersService = new MastersService();
