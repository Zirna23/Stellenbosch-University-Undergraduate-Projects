import { Item } from "../entity/items";
import { Shop } from "../entity/shops";
import { Inventory } from "../entity/inventory";
import { Category } from "../entity/categories";
import { myDataSource } from "../database/databaseSetup";

export class ItemUtils {
    // Create a new item
    static async createItem(
        name: string,
        description: string,
        price: number,
        categoryId: number,
        shopId: number,
        quantity: number,
        barcode_id?: string,
        item_image?: string
    ): Promise<Item | null> {
        try {
            const newItem = await myDataSource.manager.transaction(async (transactionalEntityManager) => {
                const item = await transactionalEntityManager
                    .createQueryBuilder()
                    .insert()
                    .into(Item)
                    .values([
                        {
                            name,
                            description,
                            price,
                            category: { category_id: categoryId },
                            shop: { shop_id: shopId },
                            item_image,
                            quantity,
                            barcode_id,
                        },
                    ])
                    .returning('*')
                    .execute();
      
                return item.raw[0];
            });
      
            return newItem;
        } catch (error) {
            console.error('Error creating item:', error);
            return null;
        }
    }

    // Delete an item
    static async deleteItem(itemId: number): Promise<boolean> {
        try {
            await myDataSource
                .createQueryBuilder()
                .delete()
                .from(Item)
                .where("item_id = :itemId", { itemId })
                .execute();

            return true;
        } catch (error) {
            // console.error("Error deleting item:", error);
            return false;
        }
    }

    // Update an item
    static async updateItem(
        itemId: number,
        name: string,
        description: string,
        price: number,
        categoryId: number,
        quantity: number,
        barcode_id?: string,
        item_image?: string
    ): Promise<boolean> {
        try {
            await myDataSource
                .createQueryBuilder()
                .update(Item)
                .set({
                    name,
                    description,
                    price,
                    category: { category_id: categoryId },
                    item_image,
                    quantity,
                    barcode_id,
                })
                .where("item_id = :itemId", { itemId })
                .execute();
    
            return true;
        } catch (error) {
            console.error("Error updating item:", error);
            return false;
        }
    }

    // Search for items by name or category
    static async searchItems(query: string): Promise<Item[]> {
        try {
            const items = await myDataSource
                .createQueryBuilder(Item, "item")
                .where("item.name ILIKE :query", { query: `%${query}%` })
                .orWhere(
                    "category_id IN (SELECT category_id FROM categories WHERE name ILIKE :query)",
                    { query: `%${query}%` }
                )
                .getMany();

            return items;
        } catch (error) {
            // console.error("Error searching items:", error);
            return [];
        }
    }

    // Get an item by ID
    static async getItemById(itemId: number): Promise<Item | null> {
        try {
            const item = await myDataSource
                .createQueryBuilder(Item, "item")
                .leftJoinAndSelect("item.category", "category")
                .leftJoinAndSelect("item.shop", "shop")
                .where("item.item_id = :itemId", { itemId })
                .getOne();

            return item;
        } catch (error) {
            // console.error("Error getting item by ID:", error);
            return null;
        }
    }

    // Get items from a category
    static async getItemsByCategory(categoryId: number): Promise<Item[]> {
        try {
        const items = await myDataSource
            .createQueryBuilder(Item, 'item')
            .where('item.category.category_id = :categoryId', { categoryId })
            .getMany();
    
        return items;
        } catch (error) {
        // console.error('Error getting items by category:', error);
        return [];
        }
    }

    // Get shop info by item ID
    static async getShopByItemId(itemId: number): Promise<Shop | null> {
        try {
        const shop = await myDataSource
            .createQueryBuilder(Shop, 'shop')
            .innerJoin('shop.items', 'item', 'item.item_id = :itemId', { itemId })
            .getOne();
    
        return shop;
        } catch (error) {
        // console.error('Error getting shop by item ID:', error);
        return null;
        }
    }

    // Get the item image url
    static async getItemImage(itemId: number): Promise<string | null> {
        try {
          const item = await myDataSource
            .createQueryBuilder(Item, 'item')
            .select('item.item_image')
            .where('item.item_id = :itemId', { itemId })
            .getOne();
      
          return item ? item.item_image : null;
        } catch (error) {
        //   console.error('Error getting item image:', error);
          return null;
        }
    }

    // Get the quantity of an item
    static async getItemQuantity(itemId: number): Promise<number | null> {
        try {
            const item = await myDataSource
                .createQueryBuilder(Item, 'item')
                .select('item.quantity')
                .where('item.item_id = :itemId', { itemId })
                .getOne();

            return item ? item.quantity : null;
        } catch (error) {
            // console.error('Error getting item quantity:', error);
            return null;
        }
    }

    // Get stock on hand for a given shop
    static async getShopStock(shopId: number): Promise<Item[]> {
        try {
            const items = await myDataSource
                .createQueryBuilder(Item, 'item')
                .leftJoinAndSelect('item.category', 'category')
                .where('item.shop.shop_id = :shopId', { shopId })
                .getMany();

            return items;
        } catch (error) {
            // console.error('Error getting shop stock:', error);
            return [];
        }
    }

    /**
     * Updates the sales and quantity for an item when it's sold
     * Increases the 'sales' field by the sold quantity
     * Decreases the 'quantity' field by the sold quantity
     */
    static async updateItemSales(itemId: number, quantity: number): Promise<boolean> {
        try {
            await myDataSource.manager.transaction(async (transactionalEntityManager) => {
                await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Item)
                    .set({
                        quantity: () => `quantity - ${quantity}`,
                        sales: () => `sales + ${quantity}`
                    })
                    .where("item_id = :itemId", { itemId })
                    .execute();
            });

            return true;
        } catch (error) {
            console.error("Error updating item sales:", error);
            return false;
        }
    }

    // Get an item by barcode_id
    static async getItemByBarcodeId(barcodeId: string): Promise<Item | null> {
        try {
            const item = await myDataSource
                .createQueryBuilder(Item, "item")
                .leftJoinAndSelect("item.category", "category")
                .leftJoinAndSelect("item.shop", "shop")
                .where("item.barcode_id = :barcodeId", { barcodeId })
                .getOne();

            return item;
        } catch (error) {
            console.error("Error getting item by barcode ID:", error);
            return null;
        }
    }

    // Get item sales
    static async getItemSales(itemId: number): Promise<number | null> {
        try {
            const item = await myDataSource
                .createQueryBuilder(Item, "item")
                .select("item.sales")
                .where("item.item_id = :itemId", { itemId })
                .getOne();

            return item ? item.sales : null;
        } catch (error) {
            console.error("Error getting item sales:", error);
            return null;
        }
    }

    // Gets the revenue of each item (sales*price), the last entry in the array is the total revenue of all items sold with item_id = 0
    static async getItemRevenues(): Promise<number[]> {
        try {
            const itemRevenues = await myDataSource
                .createQueryBuilder(Item, "item")
                .select("item.item_id", "itemId")
                .addSelect("CAST(item.price * item.sales AS FLOAT)", "revenue")
                .getRawMany();
    
            const revenueArray = itemRevenues.flatMap(item => [
                parseFloat(item.itemId),
                parseFloat(item.revenue)
            ]);
    
            const totalRevenue = itemRevenues.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
    
            return [...revenueArray, 0, parseFloat(totalRevenue.toFixed(2))];
        } catch (error) {
            console.error("Error getting item revenues:", error);
            return [];
        }
    }
}
