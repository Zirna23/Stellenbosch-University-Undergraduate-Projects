import { Field, ObjectType } from 'type-graphql';
import { User } from './user';

@ObjectType()
export class Notification {
  @Field()
  notification_id: number;

  @Field()
  user: User;

  @Field()
  message: string;

  @Field()
  created_at: Date;
}
