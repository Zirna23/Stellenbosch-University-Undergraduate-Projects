import { Shop } from '../entity/shops';
import { Item } from '../entity/items';
import { User } from '../entity/users';
import { myDataSource } from '../database/databaseSetup';

export class ShopUtils {
  // Create a new shop
  static async createShop(
    name: string,
    address: string,
    ownerId: number,
    open: boolean = true,
    contact_number?: string,
    weekdayOpeningTime?: string,
    weekdayClosingTime?: string,
    weekendOpeningTime?: string,
    weekendClosingTime?: string
  ): Promise<Shop | null> {
    try {
        const newShop = await myDataSource
            .createQueryBuilder()
            .insert()
            .into(Shop)
            .values([{
                name,
                address,
                owner: { user_id: ownerId },
                open: open,
                contact_number,
                weekday_opening_time: weekdayOpeningTime,
                weekday_closing_time: weekdayClosingTime,
                weekend_opening_time: weekendOpeningTime,
                weekend_closing_time: weekendClosingTime
            }])
            .returning('*')
            .execute();

        return newShop.raw[0];
    } catch (error) {
        console.error('Error creating shop:', error);
        return null;
    }
  }

  // Delete a shop
  // TODO: does not work, foreighn key with usershops
  static async deleteShop(shopId: number): Promise<boolean> {
    try {
      await myDataSource
        .createQueryBuilder()
        .delete()
        .from(Shop)
        .where('shop_id = :shopId', { shopId })
        .execute();

      return true;
    } catch (error) {
      console.error('Error deleting shop:', error);
      return false;
    }
  }

  // Update a shop
  static async updateShop(
    shopId: number,
    name: string,
    address: string,
    open: boolean,
    contact_number?: string,
    weekdayOpeningTime?: string,
    weekdayClosingTime?: string,
    weekendOpeningTime?: string,
    weekendClosingTime?: string
  ): Promise<boolean> {
    try {
        await myDataSource
            .createQueryBuilder()
            .update(Shop)
            .set({
                name,
                address,
                open: open,
                contact_number,
                weekday_opening_time: weekdayOpeningTime,
                weekday_closing_time: weekdayClosingTime,
                weekend_opening_time: weekendOpeningTime,
                weekend_closing_time: weekendClosingTime
            })
            .where('shop_id = :shopId', { shopId })
            .execute();

        return true;
    } catch (error) {
        console.error('Error updating shop:', error);
        return false;
    }
  }
  

  // Get all items in a shop
  static async getShopItems(shopId: number): Promise<Item[]> {
    try {
      const items = await myDataSource
        .createQueryBuilder( Item , 'Item')
        .where('shop_id = :shopId', { shopId })
        .getMany();

      return items;
    } catch (error) {
      // console.error('Error getting shop items:', error);
      return [];
    }
  }

  // Get a shop by ID
  static async getShopById(shopId: number): Promise<Shop | null> {
    try {
      const shop = await myDataSource
        .createQueryBuilder(Shop, 'shop')
        .leftJoinAndSelect('shop.owner', 'owner')
        .where('shop.shop_id = :shopId', { shopId })
        .getOne();

      return shop;
    } catch (error) {
      // console.error('Error getting shop by ID:', error)
      return null;
    }
  }

  // Get users associated with a shop
  static async getShopUsers(shopId: number): Promise<User[]> { // returns Users array
    try {
      const users = await myDataSource
        .createQueryBuilder(User, 'user')
        .innerJoin('user.accessible_shops', 'shop', 'shop.shop_id = :shopId', { shopId })
        .getMany();

      return users;
    } catch (error) {
      // console.error('Error getting shop users:', error);
      return [];
    }
  }

  // Get the open status of a shop
  static async getShopOpenStatus(shopId: number): Promise<boolean | null> {
    try {
      const shop = await myDataSource
        .createQueryBuilder(Shop, 'shop')
        .select('shop.open')
        .where('shop.shop_id = :shopId', { shopId })
        .getOne();

      return shop ? shop.open : null;
    } catch (error) {
      // console.error('Error getting shop open status:', error);
      return null;
    }
  }

  // Get the shops contact number
  static async getShopContactNumber(shopId: number): Promise<string | null> {
    try {
      const shop = await myDataSource
        .createQueryBuilder(Shop, 'shop')
        .select('shop.contact_number')
        .where('shop.shop_id = :shopId', { shopId })
        .getOne();
  
      return shop ? shop.contact_number : null;
    } catch (error) {
      // console.error('Error getting shop contact number:', error);
      return null;
    }
  }

}
