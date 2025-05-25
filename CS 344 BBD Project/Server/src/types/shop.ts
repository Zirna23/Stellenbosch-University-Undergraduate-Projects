import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './user';

@ObjectType()
export class Shop {
  @Field()
  shop_id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  owner: User;
}

@InputType()
export class CreateShopInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  ownerId: number;
}

@InputType()
export class UpdateShopInput {
  @Field()
  shopId: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  address?: string;
}
