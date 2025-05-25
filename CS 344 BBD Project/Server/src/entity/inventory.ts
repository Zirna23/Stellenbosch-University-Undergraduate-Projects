import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    Unique,
    Relation,
    JoinColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Shop } from "./shops";
import { Item } from "./items";

@ObjectType()
@Entity({ name: "inventory" })
@Unique(["shop", "item"])
export class Inventory extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    inventory_id!: number;

    @ManyToOne(() => Shop, (shop) => shop.inventories)
    @JoinColumn({ name: "shop_id" })
    shop: Relation<Shop>;

    @ManyToOne(() => Item, (item) => item.inventories)
    @JoinColumn({ name: "item_id" })
    item: Relation<Item>;

    @Field()
    @Column()
    quantity!: number;
}
