import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver, Int, Float } from 'type-graphql';
import { ItemUtils } from '../utils/ItemUtils';
import { Item } from '../entity/items';
import { Shop } from "../entity/shops";
import { MyContext } from '../types/context';

@ObjectType()
class ItemResponse {
  @Field(() => Item, { nullable: true })
  item?: Item | null;

  @Field(() => Boolean)
  success: boolean;
}

@Resolver()
export class ItemResolver {
  @Query(() => ItemResponse)
  async getItemById(@Arg('itemId') itemId: number): Promise<ItemResponse> {
    const item = await ItemUtils.getItemById(itemId);
    return { item, success: !!item };
  }

  @Query(() => [Item])
  async searchItems(@Arg('query') query: string): Promise<Item[]> {
    return await ItemUtils.searchItems(query);
  }

  @Mutation(() => ItemResponse)
  async createItem(
    @Arg('name') name: string,
    @Arg('description') description: string,
    @Arg('price') price: number,
    @Arg('categoryId') categoryId: number,
    @Arg('shopId') shopId: number,
    @Arg('quantity') quantity: number,
    @Arg('barcode_id', { nullable: true }) barcode_id: string,
    @Arg('item_image', { nullable: true }) item_image: string,
    @Ctx() { req, res }: MyContext
  ): Promise<ItemResponse> {
    const item = await ItemUtils.createItem(name, description, price, categoryId, shopId, quantity, barcode_id, item_image);
    return { item, success: !!item };
  }


  @Mutation(() => Boolean)
  async updateItem(
    @Arg('itemId') itemId: number,
    @Arg('name') name: string,
    @Arg('description') description: string,
    @Arg('price') price: number,
    @Arg('categoryId') categoryId: number,
    @Arg('quantity') quantity: number,
    @Arg('barcode_id', { nullable: true }) barcode_id: string,
    @Arg('item_image', { nullable: true }) item_image: string
  ): Promise<boolean> {
    return await ItemUtils.updateItem(itemId, name, description, price, categoryId, quantity, barcode_id, item_image);
  }

  @Mutation(() => Boolean)
  async deleteItem(@Arg('itemId') itemId: number): Promise<boolean> {
    return await ItemUtils.deleteItem(itemId);
  }

  @Query(() => [Item])
  async getItemsByCategory(@Arg('categoryId') categoryId: number): Promise<Item[]> {
    return await ItemUtils.getItemsByCategory(categoryId);
  }

  @Query(() => Shop, { nullable: true })
  async getShopByItemId(@Arg('itemId') itemId: number): Promise<Shop | null> {
    return await ItemUtils.getShopByItemId(itemId);
  }

  @Query(() => String, { nullable: true })
  async getItemImage(@Arg('itemId') itemId: number): Promise<string | null> {
    return await ItemUtils.getItemImage(itemId);
  }

  @Query(() => Int, { nullable: true })
  async getItemQuantity(@Arg('itemId') itemId: number): Promise<number | null> {
    return await ItemUtils.getItemQuantity(itemId);
  }

  @Query(() => [Item])
  async getShopStock(@Arg('shopId') shopId: number): Promise<Item[]> {
    return await ItemUtils.getShopStock(shopId);
  }

  @Mutation(() => Boolean)
  async updateItemSales(
    @Arg('itemId') itemId: number,
    @Arg('quantity') quantity: number
  ): Promise<boolean> {
      return await ItemUtils.updateItemSales(itemId, quantity);
  }

  @Query(() => ItemResponse)
  async getItemByBarcodeId(@Arg('barcodeId') barcodeId: string): Promise<ItemResponse> {
    const item = await ItemUtils.getItemByBarcodeId(barcodeId);
    return { item, success: !!item };
  }

  @Query(() => Int, { nullable: true })
  async getItemSales(@Arg('itemId') itemId: number): Promise<number | null> {
    return await ItemUtils.getItemSales(itemId);
  }

  @Query(() => [Float])
  async getItemRevenues(): Promise<number[]> {
    return await ItemUtils.getItemRevenues();
  }
}
