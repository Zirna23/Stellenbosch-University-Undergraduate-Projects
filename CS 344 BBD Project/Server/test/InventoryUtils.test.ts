const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };
  
  jest.mock('../src/database/databaseSetup', () => ({
    myDataSource: {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    },
  }));
  
  import { InventoryUtils } from '../src/utils/InventoryUtils';
  
  describe('InventoryUtils utility functions', () => {
    const itemId = 1;
    const shopId = 1;
    const quantity = 100;
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Tests for updateInventoryQuantity
    describe('updateInventoryQuantity', () => {
      it('should update the inventory quantity and return true', async () => {
        (mockQueryBuilder.execute as jest.Mock).mockResolvedValue({});
  
        const result = await InventoryUtils.updateInventoryQuantity(itemId, shopId, quantity);
  
        expect(mockQueryBuilder.update).toHaveBeenCalled();
        expect(mockQueryBuilder.set).toHaveBeenCalledWith({ quantity: expect.any(Function) });
        expect(mockQueryBuilder.where).toHaveBeenCalledWith('item_id = :itemId', { itemId });
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('shop_id = :shopId', { shopId });
        expect(result).toBe(true);
      });
  
      it('should return false if an error occurs during update', async () => {
        (mockQueryBuilder.execute as jest.Mock).mockRejectedValue(new Error('Update error'));
  
        const result = await InventoryUtils.updateInventoryQuantity(itemId, shopId, quantity);
  
        expect(result).toBe(false);
      });
    });
  
    // Tests for getStockOnHand
    describe('getStockOnHand', () => {
      it('should return the stock on hand for a shop', async () => {
        const mockStock = [{ itemName: 'Item 1', quantity: 50 }, { itemName: 'Item 2', quantity: 100 }];
        (mockQueryBuilder.getRawMany as jest.Mock).mockResolvedValue(mockStock);
  
        const result = await InventoryUtils.getStockOnHand(shopId);
  
        expect(mockQueryBuilder.select).toHaveBeenCalledWith('item.name', 'itemName');
        expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('inventory.quantity', 'quantity');
        expect(result).toEqual(mockStock);
      });
  
      it('should return an empty array if no stock is found', async () => {
        (mockQueryBuilder.getRawMany as jest.Mock).mockResolvedValue([]);
  
        const result = await InventoryUtils.getStockOnHand(shopId);
  
        expect(result).toEqual([]);
      });
  
      it('should return an empty array if an error occurs', async () => {
        (mockQueryBuilder.getRawMany as jest.Mock).mockRejectedValue(new Error('Fetch error'));
  
        const result = await InventoryUtils.getStockOnHand(shopId);
  
        expect(result).toEqual([]);
      });
    });
  });
  