import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { ShopUtils } from '../utils/ShopUtils';
import { Shop } from '../entity/shops';
import { Item } from '../entity/items';
import { User } from '../entity/users';
import { MyContext } from '../types/context';

@ObjectType()
class ShopResponse {
  @Field(() => Shop, { nullable: true })
  shop?: Shop | null;

  @Field(() => Boolean)
  success: boolean;
}

@Resolver()
export class ShopResolver {
  @Query(() => ShopResponse)
  async getShopById(@Arg('shopId') shopId: number): Promise<ShopResponse> {
    const shop = await ShopUtils.getShopById(shopId);
    return { shop, success: !!shop };
  }

  @Query(() => [Item])
  async getShopItems(@Arg('shopId') shopId: number): Promise<Item[]> {
    return await ShopUtils.getShopItems(shopId);
  }

  @Mutation(() => ShopResponse)
  async createShop(
    @Arg('name') name: string,
    @Arg('address') address: string,
    @Arg('ownerId') ownerId: number,
    @Arg('open', { nullable: true }) open: boolean = true,
    @Arg('contactNumber', { nullable: true }) contactNumber: string,
    @Arg('weekdayOpeningTime', { nullable: true }) weekdayOpeningTime: string,
    @Arg('weekdayClosingTime', { nullable: true }) weekdayClosingTime: string,
    @Arg('weekendOpeningTime', { nullable: true }) weekendOpeningTime: string,
    @Arg('weekendClosingTime', { nullable: true }) weekendClosingTime: string,
    @Ctx() { req, res }: MyContext
  ): Promise<ShopResponse> {
    const shop = await ShopUtils.createShop(
      name,
      address,
      ownerId,
      open,
      contactNumber,
      weekdayOpeningTime,
      weekdayClosingTime,
      weekendOpeningTime,
      weekendClosingTime
    );
    return { shop, success: !!shop };
  }

  @Mutation(() => Boolean)
  async updateShop(
    @Arg('shopId') shopId: number,
    @Arg('name') name: string,
    @Arg('address') address: string,
    @Arg('open') open: boolean,
    @Arg('contactNumber', { nullable: true }) contactNumber: string,
    @Arg('weekdayOpeningTime', { nullable: true }) weekdayOpeningTime: string,
    @Arg('weekdayClosingTime', { nullable: true }) weekdayClosingTime: string,
    @Arg('weekendOpeningTime', { nullable: true }) weekendOpeningTime: string,
    @Arg('weekendClosingTime', { nullable: true }) weekendClosingTime: string
  ): Promise<boolean> {
    return await ShopUtils.updateShop(
      shopId,
      name,
      address,
      open,
      contactNumber,
      weekdayOpeningTime,
      weekdayClosingTime,
      weekendOpeningTime,
      weekendClosingTime
    );
  }

  @Mutation(() => Boolean)
  async deleteShop(@Arg('shopId') shopId: number): Promise<boolean> {
    return await ShopUtils.deleteShop(shopId);
  }

  @Query(() => [User])
  async getShopUsers(@Arg('shopId') shopId: number): Promise<User[]> {
    return await ShopUtils.getShopUsers(shopId);
  }

  @Query(() => Boolean, { nullable: true })
  async getShopOpenStatus(@Arg('shopId') shopId: number): Promise<boolean | null> {
    return await ShopUtils.getShopOpenStatus(shopId);
  }

  @Query(() => String, { nullable: true })
  async getShopContactNumber(@Arg('shopId') shopId: number): Promise<string | null> {
    return await ShopUtils.getShopContactNumber(shopId);
  }
}
