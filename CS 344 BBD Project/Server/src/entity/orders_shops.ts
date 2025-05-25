import { Entity, BaseEntity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Order } from './orders';
import { Shop } from './shops';

@Entity({ name: 'order_shops' })
export class OrderShop extends BaseEntity {
  @PrimaryColumn()
  order_id!: number;

  @PrimaryColumn()
  shop_id!: number;

  @ManyToOne(() => Order, (order) => order.shops)
  order: Order;

  @ManyToOne(() => Shop, (shop) => shop.orders)
  shop: Shop;
}
