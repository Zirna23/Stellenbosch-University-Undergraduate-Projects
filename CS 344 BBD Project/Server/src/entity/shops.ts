import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    OneToMany,
    ManyToMany,
    Relation,
    JoinTable,
    JoinColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./users";
import { Item } from "./items";
import { Inventory } from "./inventory";
import { Order } from "./orders";

@ObjectType()
@Entity({ name: "shops" })
export class Shop extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    shop_id!: number;

    @Field()
    @Column({ length: 255 })
    name!: string;

    @Field({ nullable: true })
    @Column({ type: "text", nullable: true })
    address: string;

    @Field()
    @Column({ default: true })
    open!: boolean;

    @Field({ nullable: true })
    @Column({ type: "varchar", length: 20, nullable: true })
    contact_number: string;

    @Field({ nullable: true })
    @Column({ type: "time" })
    weekday_opening_time: string;

    @Field({ nullable: true })
    @Column({ type: "time" })
    weekday_closing_time: string;

    @Field({ nullable: true })
    @Column({ type: "time" })
    weekend_opening_time: string;

    @Field({ nullable: true })
    @Column({ type: "time" })
    weekend_closing_time: string;

    @ManyToOne(() => User, (user) => user.owned_shops)
    @JoinColumn({ name: "owner_id" })
    owner: Relation<User>;

    @OneToMany(() => Item, (item) => item.shop, { onDelete: 'CASCADE' })
    items: Item[];

    @ManyToMany(() => User, (user) => user.accessible_shops)
    users: User[];

    @OneToMany(() => Inventory, (inventory) => inventory.shop)
    inventories: Inventory[];

    @ManyToMany(() => Order, (order) => order.shops)
    orders: Order[];
}
