import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    Relation,
    JoinColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Order } from "./orders";
import { Item } from "./items";
import { Shop } from "./shops";

@ObjectType()
@Entity({ name: "orderitems" })
export class OrderItem extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    order_item_id!: number;

    @ManyToOne(() => Order, (order) => order.order_items)
    @JoinColumn({ name: "order_id" })
    order: Order;

    @ManyToOne(() => Item, (item) => item.order_items)
    @JoinColumn({ name: "item_id" })
    item: Relation<Item>;

    @Field()
    @Column()
    quantity!: number;

    @Field()
    @Column({ default: false })
    status!: boolean;

    @ManyToOne(() => Shop, (shop) => shop.inventories)
    @JoinColumn({ name: "shop_id" })
    shop: Relation<Shop>;

    @Field()
    get item_id(): number {
        return this.item.item_id;
    }
}
