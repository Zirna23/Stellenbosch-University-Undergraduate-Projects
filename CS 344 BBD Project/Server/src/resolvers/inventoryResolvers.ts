import { Arg, Mutation, Resolver } from 'type-graphql';
import { InventoryUtils } from '../utils/InventoryUtils';

@Resolver()
export class InventoryResolver {
  @Mutation(() => Boolean)
  async updateInventoryQuantity(
    @Arg('itemId') itemId: number,
    @Arg('shopId') shopId: number,
    @Arg('quantity') quantity: number
  ): Promise<boolean> {
    return await InventoryUtils.updateInventoryQuantity(itemId, shopId, quantity);
  }
}
