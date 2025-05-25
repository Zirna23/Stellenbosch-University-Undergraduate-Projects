import { Entity, BaseEntity, ManyToOne, PrimaryColumn, JoinColumn, Column } from "typeorm";
import { User } from "./users";
import { Shop } from "./shops";
import { Role } from "./roles";

@Entity({ name: "usersshops" })
export class UserShop extends BaseEntity {
    @PrimaryColumn()
    user_id!: number;

    @PrimaryColumn()
    shop_id!: number;

    @Column()
    role_id!: number;

    @ManyToOne(() => User, (user) => user.accessible_shops)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Shop, (shop) => shop.users)
    @JoinColumn({ name: "shop_id" })
    shop: Shop;

    @ManyToOne(() => Role)
    @JoinColumn({ name: "role_id" })
    role: Role;
}
