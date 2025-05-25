import { Field, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class Role {
  @Field()
  role_id: number;

  @Field()
  role_name: string;
}

@InputType()
export class CreateRoleInput {
  @Field()
  role_name: string;
}

@InputType()
export class UpdateRoleInput {
  @Field()
  role_id: number;

  @Field()
  role_name: string;
}
