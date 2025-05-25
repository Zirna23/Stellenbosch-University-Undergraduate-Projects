const mockQueryBuilder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };
  
jest.mock('../src/database/databaseSetup', () => ({
    myDataSource: {
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
        manager: {
        transaction: jest.fn(),
        },
    },
}));
  
import { myDataSource } from '../src/database/databaseSetup';
import { Item } from '../src/entity/items';
import { Shop } from '../src/entity/shops';
import { ItemUtils } from '../src/utils/ItemUtils';

describe('ItemUtils utility functions', () => {
const itemId = 1;
const shopId = 1;
const categoryId = 1;
const mockItem = { item_id: itemId, name: 'Test Item', quantity: 10 } as Item;

afterEach(() => {
    jest.clearAllMocks();
});





// Tests for updateItem
describe('updateItem', () => {
    it('should update the item and return true', async () => {
    (mockQueryBuilder.execute as jest.Mock).mockResolvedValue({});

    const result = await ItemUtils.updateItem(itemId, 'Updated Item', 'Updated Description', 150, categoryId, 5);

    expect(mockQueryBuilder.update).toHaveBeenCalledWith(Item);
    expect(result).toBe(true);
    });

    it('should return false if an error occurs', async () => {
    (mockQueryBuilder.execute as jest.Mock).mockRejectedValue(new Error('Update error'));

    const result = await ItemUtils.updateItem(itemId, 'Updated Item', 'Updated Description', 150, categoryId, 5);

    expect(result).toBe(false);
    });
});

// Tests for searchItems
describe('searchItems', () => {
    it('should return a list of items matching the query', async () => {
    const mockItems = [{ item_id: 1, name: 'Test Item' }] as Item[];
    (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockItems);

    const result = await ItemUtils.searchItems('Test');

    expect(mockQueryBuilder.where).toHaveBeenCalledWith('item.name ILIKE :query', { query: '%Test%' });
    expect(result).toEqual(mockItems);
    });

    it('should return an empty array if no items are found', async () => {
    (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);

    const result = await ItemUtils.searchItems('Test');

    expect(result).toEqual([]);
    });

    it('should return an empty array if an error occurs', async () => {
    (mockQueryBuilder.getMany as jest.Mock).mockRejectedValue(new Error('Search error'));

    const result = await ItemUtils.searchItems('Test');

    expect(result).toEqual([]);
    });
});

// Tests for getItemsByCategory
describe('getItemsByCategory', () => {
    it('should return a list of items in a category', async () => {
    const mockItems = [{ item_id: 1, name: 'Test Item' }] as Item[];
    (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockItems);

    const result = await ItemUtils.getItemsByCategory(categoryId);

    expect(result).toEqual(mockItems);
    });

    it('should return an empty array if no items are found', async () => {
    (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);

    const result = await ItemUtils.getItemsByCategory(categoryId);

    expect(result).toEqual([]);
    });
});

});
  