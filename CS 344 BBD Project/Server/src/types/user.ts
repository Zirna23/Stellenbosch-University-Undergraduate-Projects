import { Field, InputType, ObjectType } from 'type-graphql';
import { Role } from './role';

@ObjectType()
export class User {
  @Field()
  user_id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password_hash: string;

  @Field()
  role: Role;
}

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  roleId: number;
}

@InputType()
export class UpdateUserInput {
  @Field()
  userId: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  roleId: number;
}
