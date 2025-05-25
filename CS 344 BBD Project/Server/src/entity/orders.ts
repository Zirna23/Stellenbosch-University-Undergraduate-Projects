import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    Relation,
    JoinColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./users";
import { OrderItem } from "./order_items";
import { Shop } from "./shops";

@ObjectType()
@Entity({ name: "orders" })
export class Order extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    order_id!: number;

    @Field()
    @Column()
    user_id!: number;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: "user_id" })
    user: Relation<User>;

    @Field()
    @Column({ type: "decimal", precision: 10, scale: 2 })
    total_price!: number;

    @Field()
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    order_date!: Date;

    @Field()
    @Column({ length: 50, default: "pending" })
    status!: string;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    order_items: OrderItem[];

    @ManyToMany(() => Shop, (shop) => shop.orders)
    @JoinTable({
        name: "order_shops",
        joinColumn: { name: "order_id" },
        inverseJoinColumn: { name: "shop_id" },
    })
    shops: Shop[];
}
