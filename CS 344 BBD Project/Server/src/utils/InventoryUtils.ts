import { Inventory } from '../entity/inventory';
import { myDataSource } from '../database/databaseSetup';

export class InventoryUtils {
  // Update inventory quantity
  static async updateInventoryQuantity(itemId: number, shopId: number, quantity: number): Promise<boolean> {
    try {
      await myDataSource
        .createQueryBuilder()
        .update(Inventory)
        .set({ quantity: () => `${quantity}` })
        .where('item_id = :itemId', { itemId })
        .andWhere('shop_id = :shopId', { shopId })
        .execute();

      return true;
    } catch (error) {
      // console.error('Error updating inventory quantity:', error);
      return false;
    }
  }

  // Get stock on hand for a shop
  static async getStockOnHand(shopId: number): Promise<{ itemName: string; quantity: number }[]> {
    try {
      const stockOnHand = await myDataSource
        .createQueryBuilder()
        .select('item.name', 'itemName')
        .addSelect('inventory.quantity', 'quantity')
        .from(Inventory, 'inventory')
        .innerJoin('inventory.item', 'item')
        .where('inventory.shop_id = :shopId', { shopId })
        .getRawMany();

      return stockOnHand;
    } catch (error) {
      // console.error('Error getting stock on hand:', error);
      return [];
    }
  }
}
