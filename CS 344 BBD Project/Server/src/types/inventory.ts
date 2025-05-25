import { Field, ObjectType } from 'type-graphql';
import { Shop } from './shop';
import { Item } from './item';


@ObjectType()
export class Inventory {
  @Field()
  inventory_id: number;

  @Field()
  shop: Shop;

  @Field()
  item: Item;

  @Field()
  quantity: number;
}
