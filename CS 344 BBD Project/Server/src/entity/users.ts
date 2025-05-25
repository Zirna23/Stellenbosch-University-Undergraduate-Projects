import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    BaseEntity,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Role } from "./roles";
import { Shop } from "./shops";
import { Order } from "./orders";
import { Notification } from "./notifications";

@ObjectType()
@Entity({ name: "users" })
@Unique(["email"])
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    user_id!: number;

    @Field()
    @Column({ length: 100 })
    name!: string;

    @Field()
    @Column({ length: 255 })
    email!: string;

    @Field()
    @Column({ length: 255 })
    password_hash!: string;

    @Field({ nullable: true })
    @Column({ type: "text", nullable: true })
    user_address: string;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: "role_id" })
    role: Role;

    @OneToMany(() => Shop, (shop) => shop.owner, { onDelete: 'CASCADE' })
    owned_shops: Shop[];

    @ManyToMany(() => Shop, (shop) => shop.users)
    @JoinTable({
        name: "usersshops",
        joinColumn: { name: "user_id" },
        inverseJoinColumn: { name: "shop_id" },
    })
    accessible_shops: Shop[];

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];
}
