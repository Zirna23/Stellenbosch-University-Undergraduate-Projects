const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };
  
  jest.mock('../src/database/databaseSetup', () => ({
    myDataSource: {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    },
  }));
  
  import { Order } from '../src/entity/orders';
  import { OrderItem } from '../src/entity/order_items';
  import { OrderUtils } from '../src/utils/OrderUtils';
  
  describe('OrderUtils utility functions', () => {
    const userId = 1;
    const shopId = 1;
    const orderId = 1;
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Tests for getUserOrderHistory
    describe('getUserOrderHistory', () => {
      it('should return a list of orders when found', async () => {
        const mockOrders = [{ order_id: 1 }, { order_id: 2 }] as Order[];
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockOrders);
  
        const result = await OrderUtils.getUserOrderHistory(userId);
  
        expect(mockQueryBuilder.where).toHaveBeenCalledWith('order.user_id = :userId', { userId });
        expect(result).toEqual(mockOrders);
      });
  
      it('should return an empty array when no orders are found', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);
  
        const result = await OrderUtils.getUserOrderHistory(userId);
  
        expect(result).toEqual([]);
      });
  
      it('should handle errors and return an empty array', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await OrderUtils.getUserOrderHistory(userId);
  
        expect(result).toEqual([]);
      });
    });
  
    // Tests for getShopOrderHistory
    describe('getShopOrderHistory', () => {
      it('should return a list of shop orders when found', async () => {
        const mockOrders = [{ order_id: 1 }, { order_id: 2 }] as Order[];
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockOrders);
  
        const result = await OrderUtils.getShopOrderHistory(shopId);
  
        expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('order.order_items', 'order_item');
        expect(mockQueryBuilder.where).toHaveBeenCalledWith('order_item.shop_id = :shopId', { shopId });
        expect(result).toEqual(mockOrders);
      });
  
      it('should return an empty array when no orders are found', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);
  
        const result = await OrderUtils.getShopOrderHistory(shopId);
  
        expect(result).toEqual([]);
      });
  
      it('should handle errors and return an empty array', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await OrderUtils.getShopOrderHistory(shopId);
  
        expect(result).toEqual([]);
      });
    });
  
    // Tests for getOrderById
    describe('getOrderById', () => {
      it('should return an order when found', async () => {
        const mockOrder = { order_id: orderId, order_items: [{ item_id: 1 }, { item_id: 2 }] } as Order;
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(mockOrder);
  
        const result = await OrderUtils.getOrderById(orderId);
  
        expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('order.order_items', 'order_item');
        expect(result).toEqual(mockOrder);
      });
  
      it('should return null when no order is found', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);
  
        const result = await OrderUtils.getOrderById(orderId);
  
        expect(result).toBeNull();
      });
  
      it('should handle errors and return null', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await OrderUtils.getOrderById(orderId);
  
        expect(result).toBeNull();
      });
    });
  
    // Tests for getOrderItems
    describe('getOrderItems', () => {
      it('should return a list of order items when found', async () => {
        const mockOrderItems = [{ item_id: 1 }, { item_id: 2 }] as OrderItem[];
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockOrderItems);
  
        const result = await OrderUtils.getOrderItems(orderId);
  
        expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('orderItem.item', 'item');
        expect(result).toEqual(mockOrderItems);
      });
  
      it('should return an empty array when no order items are found', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);
  
        const result = await OrderUtils.getOrderItems(orderId);
  
        expect(result).toEqual([]);
      });
  
      it('should handle errors and return an empty array', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await OrderUtils.getOrderItems(orderId);
  
        expect(result).toEqual([]);
      });
    });
  });
  