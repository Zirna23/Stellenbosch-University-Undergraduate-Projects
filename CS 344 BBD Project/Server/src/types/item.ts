import { Field, InputType, ObjectType } from 'type-graphql';
import { Category } from './category';
import { Shop } from './shop';


@ObjectType()
export class Item {
  @Field()
  item_id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  price: number;

  @Field()
  category: Category;

  @Field()
  shop: Shop;
}

@InputType()
export class CreateItemInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  price: number;

  @Field()
  categoryId: number;

  @Field()
  shopId: number;
}

@InputType()
export class UpdateItemInput {
  @Field()
  itemId: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  price: number;

  @Field()
  categoryId: number;
}
