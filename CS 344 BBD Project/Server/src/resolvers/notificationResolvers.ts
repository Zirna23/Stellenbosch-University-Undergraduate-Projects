import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { NotificationUtils } from '../utils/NotificationUtils';
import { Notification } from '../entity/notifications';

@Resolver()
export class NotificationResolver {
  @Mutation(() => Notification)
  async createNotification(
    @Arg('userId') userId: number,
    @Arg('message') message: string
  ): Promise<Notification | null> {
    return await NotificationUtils.createNotification(userId, message);
  }

  @Query(() => [Notification])
  async getUserNotifications(@Arg('userId') userId: number): Promise<Notification[]> {
    return await NotificationUtils.getUserNotifications(userId);
  }
}
