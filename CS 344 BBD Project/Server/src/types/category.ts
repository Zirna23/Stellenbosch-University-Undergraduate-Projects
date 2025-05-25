import { Field, ObjectType, InputType } from 'type-graphql';

@ObjectType()
export class Category {
  @Field()
  category_id: number;

  @Field()
  name: string;
}

@InputType()
export class CreateCategoryInput {
  @Field()
  name: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field()
  category_id: number;

  @Field()
  name: string;
}
