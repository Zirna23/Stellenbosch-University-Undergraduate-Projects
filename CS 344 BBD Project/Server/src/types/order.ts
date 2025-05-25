import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './user';
import { Item } from './item';


@ObjectType()
export class Order {
  @Field()
  order_id: number;

  @Field()
  user: User;

  @Field()
  total_price: number;

  @Field()
  order_date: Date;

  @Field()
  status: string;

  @Field(() => [OrderItem])
  order_items: OrderItem[];
}

@ObjectType()
export class OrderItem {
  @Field()
  order_item_id: number;

  @Field()
  order: Order;

  @Field()
  item: Item;

  @Field()
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field()
  userId: number;

  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}

@InputType()
export class OrderItemInput {
  @Field()
  itemId: number;

  @Field()
  quantity: number;
}

@InputType()
export class UpdateOrderStatusInput {
  @Field()
  orderId: number;

  @Field()
  status: string;
}
