'use client';

import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
export type InventoryTransaction = Database['public']['Tables']['inventory_transactions']['Row'];

export interface InventoryItemWithTransactions extends InventoryItem {
  transactions: InventoryTransaction[];
}

export const TransactionTypes = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment',
  USE: 'use',
  RETURN: 'return'
} as const;

export type TransactionType = typeof TransactionTypes[keyof typeof TransactionTypes];

export const ItemConditions = {
  NEW: 'new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  DAMAGED: 'damaged',
  MAINTENANCE_REQUIRED: 'maintenance_required'
} as const;

export type ItemCondition = typeof ItemConditions[keyof typeof ItemConditions];

export async function fetchInventoryItems() {
  const { data: items, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      created_by_user:created_by (
        firstName,
        lastName
      ),
      updated_by_user:updated_by (
        firstName,
        lastName
      )
    `)
    .order('name');

  if (error) {
    console.error('Error fetching inventory items:', error);
    throw new Error('Failed to fetch inventory items');
  }

  return items;
}

export async function fetchInventoryItemById(itemId: string) {
  const { data: item, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      created_by_user:created_by (
        firstName,
        lastName
      ),
      updated_by_user:updated_by (
        firstName,
        lastName
      ),
      transactions:inventory_transactions (
        *,
        created_by_user:created_by (
          firstName,
          lastName
        )
      )
    `)
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching inventory item:', error);
    throw new Error('Failed to fetch inventory item details');
  }

  return item as InventoryItemWithTransactions;
}

export async function createInventoryItem(
  item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
) {
  const { data: newItem, error } = await supabase
    .from('inventory_items')
    .insert({
      ...item,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating inventory item:', error);
    throw new Error('Failed to create inventory item');
  }

  return newItem;
}

export async function updateInventoryItem(
  itemId: string,
  updates: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'created_by'>>
) {
  const { data: updatedItem, error } = await supabase
    .from('inventory_items')
    .update({
      ...updates,
      updated_by: (await supabase.auth.getUser()).data.user?.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating inventory item:', error);
    throw new Error('Failed to update inventory item');
  }

  return updatedItem;
}

export async function createInventoryTransaction(
  transaction: Omit<InventoryTransaction, 'id' | 'created_at' | 'created_by'>
) {
  // Start a transaction to update both tables
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get current quantity
  const { data: currentItem } = await supabase
    .from('inventory_items')
    .select('quantity_in_stock')
    .eq('id', transaction.inventory_item_id)
    .single();

  if (!currentItem) {
    throw new Error('Inventory item not found');
  }

  // Calculate new quantity
  let quantityChange = transaction.quantity;
  if (transaction.transaction_type === 'sale' || 
      transaction.transaction_type === 'use' ||
      transaction.transaction_type === 'transfer') {
    quantityChange = -quantityChange;
  }

  const newQuantity = (currentItem.quantity_in_stock || 0) + quantityChange;

  // Create the transaction
  const { data: newTransaction, error: transactionError } = await supabase
    .from('inventory_transactions')
    .insert({
      ...transaction,
      created_by: user.id
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Error creating inventory transaction:', transactionError);
    throw new Error('Failed to create inventory transaction');
  }

  // Update the item quantity
  const { error: updateError } = await supabase
    .from('inventory_items')
    .update({
      quantity_in_stock: newQuantity,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', transaction.inventory_item_id);

  if (updateError) {
    console.error('Error updating inventory quantity:', updateError);
    throw new Error('Failed to update inventory quantity');
  }

  return newTransaction;
}

export async function fetchInventoryTransactions(itemId?: string) {
  let query = supabase
    .from('inventory_transactions')
    .select(`
      *,
      inventory_item:inventory_item_id (
        name,
        sku
      ),
      created_by_user:created_by (
        firstName,
        lastName
      )
    `)
    .order('created_at', { ascending: false });

  if (itemId) {
    query = query.eq('inventory_item_id', itemId);
  }

  const { data: transactions, error } = await query;

  if (error) {
    console.error('Error fetching inventory transactions:', error);
    throw new Error('Failed to fetch inventory transactions');
  }

  return transactions;
}

export function calculateInventoryValue(items: InventoryItem[]) {
  return items.reduce((total, item) => {
    return total + (item.quantity_in_stock || 0) * (item.cost_per_unit || 0);
  }, 0);
}

export function checkLowStock(item: InventoryItem): boolean {
  return item.quantity_in_stock <= (item.reorder_point || 0);
}

export function generateSKU(category: string, name: string) {
  const prefix = category.slice(0, 3).toUpperCase();
  const itemPart = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}${itemPart}${timestamp}`;
}
