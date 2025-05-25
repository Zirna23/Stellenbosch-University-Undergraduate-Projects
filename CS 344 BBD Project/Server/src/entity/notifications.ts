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
import { User } from "./users";

@ObjectType()
@Entity({ name: "notifications" })
export class Notification extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    notification_id!: number;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name : "user_id"})
    user: Relation<User>;

    @Field()
    @Column({ type: "text" })
    message!: string;

    @Field()
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;
}
