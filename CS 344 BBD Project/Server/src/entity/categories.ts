import { Entity, PrimaryGeneratedColumn, Column, Unique, BaseEntity, OneToMany } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { Item } from './items';

@ObjectType()
@Entity({ name: 'categories' })
@Unique(['name'])
export class Category extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  category_id!: number;

  @Field()
  @Column({ length: 255 })
  name!: string;

  @OneToMany(() => Item, (item) => item.category)
  items: Item[];
}
