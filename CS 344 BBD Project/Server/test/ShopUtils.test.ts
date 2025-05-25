const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };
  
  jest.mock('../src/database/databaseSetup', () => ({
    myDataSource: {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    },
  }));
  
  import { Item } from '../src/entity/items';
  import { Shop } from '../src/entity/shops';
  import { User } from '../src/entity/users';
  import { ShopUtils } from '../src/utils/ShopUtils';
  
  describe('ShopUtils utility functions', () => {
    const shopId = 1;
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Tests for getShopItems
    describe('getShopItems', () => {
      it('should return items when found', async () => {
        const mockItems = [{ item_id: 1, name: 'Item1' }, { item_id: 2, name: 'Item2' }] as Item[];
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockItems);
  
        const result = await ShopUtils.getShopItems(shopId);
  
        // expect(mockQueryBuilder.where).toHaveBeenCalledWith('shop_id = :shopId', { shopId });
        expect(result).toEqual(mockItems);
      });
  
      it('should return an empty array when no items are found', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);
  
        const result = await ShopUtils.getShopItems(shopId);
  
        expect(result).toEqual([]);
      });
  
      it('should handle errors and return an empty array', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await ShopUtils.getShopItems(shopId);
  
        expect(result).toEqual([]);
      });
    });
  
    // Tests for getShopById
    describe('getShopById', () => {
      it('should return the shop when found', async () => {
        const mockShop = { shop_id: shopId, name: 'Shop1', owner: { user_id: 1, name: 'Owner' } } as Shop;
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(mockShop);
  
        const result = await ShopUtils.getShopById(shopId);
  
        // expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('shop.owner', 'owner');
        expect(result).toEqual(mockShop);
      });
  
      it('should return null when no shop is found', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);
  
        const result = await ShopUtils.getShopById(shopId);
  
        expect(result).toBeNull();
      });
  
      it('should handle errors and return null', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await ShopUtils.getShopById(shopId);
  
        expect(result).toBeNull();
      });
    });
  
    // Tests for getShopUsers
    describe('getShopUsers', () => {
      it('should return users when found', async () => {
        const mockUsers = [{ user_id: 1, name: 'User1' }, { user_id: 2, name: 'User2' }] as User[];
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockUsers);
  
        const result = await ShopUtils.getShopUsers(shopId);
  
        // expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('user.accessible_shops', 'shop', 'shop.shop_id = :shopId', { shopId });
        expect(result).toEqual(mockUsers);
      });
  
      it('should return an empty array when no users are found', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);
  
        const result = await ShopUtils.getShopUsers(shopId);
  
        expect(result).toEqual([]);
      });
  
      it('should handle errors and return an empty array', async () => {
        (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await ShopUtils.getShopUsers(shopId);
  
        expect(result).toEqual([]);
      });
    });
  
    // Tests for getShopOpenStatus
    describe('getShopOpenStatus', () => {
      it('should return true when the shop is open', async () => {
        const mockShop = { open: true } as Shop;
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(mockShop);
  
        const result = await ShopUtils.getShopOpenStatus(shopId);
  
        // expect(mockQueryBuilder.select).toHaveBeenCalledWith('shop.open');
        expect(result).toBe(true);
      });
  
      it('should return null when no shop is found', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);
  
        const result = await ShopUtils.getShopOpenStatus(shopId);
  
        expect(result).toBeNull();
      });
  
      it('should handle errors and return null', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await ShopUtils.getShopOpenStatus(shopId);
  
        expect(result).toBeNull();
      });
    });
  
    // Tests for getShopContactNumber
    describe('getShopContactNumber', () => {
      it('should return the shop contact number when found', async () => {
        const mockShop = { contact_number: '123-456-7890' } as Shop;
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(mockShop);
  
        const result = await ShopUtils.getShopContactNumber(shopId);
  
        // expect(mockQueryBuilder.select).toHaveBeenCalledWith('shop.contact_number');
        expect(result).toBe('123-456-7890');
      });
  
      it('should return null when no contact number is found', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);
  
        const result = await ShopUtils.getShopContactNumber(shopId);
  
        expect(result).toBeNull();
      });
  
      it('should handle errors and return null', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const result = await ShopUtils.getShopContactNumber(shopId);
  
        expect(result).toBeNull();
      });
    });
  });
  