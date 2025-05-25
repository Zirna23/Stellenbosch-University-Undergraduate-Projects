import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    OneToMany,
    Relation,
    JoinColumn,
    JoinTable,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Category } from "./categories";
import { Shop } from "./shops";
import { OrderItem } from "./order_items";
import { Inventory } from "./inventory";

@ObjectType()
@Entity({ name: "items" })
export class Item extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    item_id!: number;

    @Field()
    @Column({ length: 255 })
    name!: string;

    @Field({ nullable: true })
    @Column({ type: "text", nullable: true })
    description: string;

    @Field()
    @Column({ type: "decimal", precision: 10, scale: 2 })
    price!: number;

    @Field({ nullable: true })
    @Column({ type: "text", nullable: true })
    item_image: string;

    @Field()
    @Column({ type: "integer", default: 0 })
    quantity!: number;

    @Field()
    @Column({ type: "integer", default: 0 })
    sales!: number;

    @Field({ nullable: true })
    @Column({ type: "varchar", length: 255, nullable: true, unique: true })
    barcode_id: string;

    @ManyToOne(() => Category, (category) => category.items)
    @JoinColumn({ name: "category_id" })
    category: Category;

    @ManyToOne(() => Shop, (shop) => shop.items)
    @JoinColumn({ name: "shop_id" })
    shop: Relation<Shop>;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.item)
    order_items: OrderItem[];

    @OneToMany(() => Inventory, (inventory) => inventory.item)
    inventories: Inventory[];
}
