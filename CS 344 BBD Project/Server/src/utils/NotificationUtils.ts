import { Notification } from '../entity/notifications';
import { myDataSource } from '../database/databaseSetup';

export class NotificationUtils {
  // Create a new notification
  static async createNotification(userId: number, message: string): Promise<Notification | null> {
    try {
      const newNotification = await myDataSource
        .createQueryBuilder()
        .insert()
        .into(Notification)
        .values([{ user: { user_id: userId }, message }])
        .returning('*')
        .execute();

      return newNotification.raw[0];
    } catch (error) {
      // console.error('Error creating notification:', error);
      return null;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId: number): Promise<Notification[]> {
    try {
      const notifications = await myDataSource
        .createQueryBuilder( Notification, "notifaication")
        .where('user_id = :userId', { userId })
        .getMany();

      return notifications;
    } catch (error) {
      // console.error('Error getting user notifications:', error);
      return [];
    }
  }
}
