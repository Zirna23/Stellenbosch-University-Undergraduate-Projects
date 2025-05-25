import { Entity, PrimaryGeneratedColumn, Column, Unique, BaseEntity, OneToMany } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { User } from './users';

@ObjectType()
@Entity({ name: 'roles' })
@Unique(['role_name'])
export class Role extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  role_id!: number;

  @Field()
  @Column({ length: 50 })
  role_name!: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
