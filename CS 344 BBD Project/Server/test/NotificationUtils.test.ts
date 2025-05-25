const mockQueryBuilder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };
  
  jest.mock('../src/database/databaseSetup', () => ({
    myDataSource: {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    },
  }));
  
  import { Notification } from '../src/entity/notifications';
  import { NotificationUtils } from '../src/utils/NotificationUtils';
  
  describe('NotificationUtils utility functions', () => {
    const userId = 1;
    const message = "Test notification message";
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Tests for createNotification
    describe('createNotification', () => {
      it('should create and return a new notification', async () => {
        const mockNotification = { notification_id: 1, message, user: { user_id: userId } } as Notification;
        (mockQueryBuilder.execute as jest.Mock).mockResolvedValue({ raw: [mockNotification] });
  
        const result = await NotificationUtils.createNotification(userId, message);
  
        expect(mockQueryBuilder.insert).toHaveBeenCalled();
        expect(mockQueryBuilder.into).toHaveBeenCalledWith(Notification);
        expect(mockQueryBuilder.values).toHaveBeenCalledWith([{ user: { user_id: userId }, message }]);
        expect(result).toEqual(mockNotification);
      });
  
      it('should return null if the notification cannot be created', async () => {
        (mockQueryBuilder.execute as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await NotificationUtils.createNotification(userId, message);
  
        expect(result).toBeNull();
      });
    });
  
    // Tests for getUserNotifications
    describe('getUserNotifications', () => {
      it('should return a list of notifications for a user', async () => {
        const mockNotifications = [
          { notification_id: 1, message: 'Notification 1', user: { user_id: userId } },
          { notification_id: 2, message: 'Notification 2', user: { user_id: userId } },
        ] as Notification[];
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockNotifications);
  
        const result = await NotificationUtils.getUserNotifications(userId);
  
        expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id = :userId', { userId });
        expect(result).toEqual(mockNotifications);
      });
  
      it('should return an empty array if no notifications are found', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);
  
        const result = await NotificationUtils.getUserNotifications(userId);
  
        expect(result).toEqual([]);
      });
  
      it('should handle errors and return an empty array', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await NotificationUtils.getUserNotifications(userId);
  
        expect(result).toEqual([]);
      });
    });
  });
  