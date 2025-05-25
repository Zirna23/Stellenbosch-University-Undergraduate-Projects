const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
};

jest.mock('../src/database/databaseSetup', () => ({
    myDataSource: {
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
    },
}));

import { User } from '../src/entity/users';
import { Role } from '../src/entity/roles';
import { Shop } from '../src/entity/shops';
import { UserShop } from '../src/entity/users_shops';
import { myDataSource } from '../src/database/databaseSetup';
import { UserUtils } from '../src/utils/UserUtils';

describe('UserUtils utility functions', () => {
    const userId = 1;

    afterEach(() => {
        jest.clearAllMocks(); // Ensure mocks are cleared between tests
    });

    // Tests for getUserById
    describe('getUserById', () => {
        it('should return a user when found', async () => {
            const mockUser = { user_id: userId, name: 'John Doe', role: { role_name: 'Admin' } } as User;

            // Mock getOne to return a user
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(mockUser);

            const result = await UserUtils.getUserById(userId);
            expect(result).toEqual(mockUser);
        });

        it('should return null when no user is found', async () => {
            // Mock getOne to return null
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(null);

            const result = await UserUtils.getUserById(userId);
            expect(result).toBeNull();
        });

        it('should handle errors and return null', async () => {
            // Mock getOne to throw an error
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await UserUtils.getUserById(userId);
            expect(result).toBeNull();
        });
    });

    // Tests for getUserRole
    describe('getUserRole', () => {
        it('should return a user role when found', async () => {
            const mockRole = { role_name: 'Admin' } as Role;
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockResolvedValue({ role: mockRole });

            const result = await UserUtils.getUserRole(userId);

            expect(myDataSource.createQueryBuilder).toHaveBeenCalled();
            expect(result).toEqual(mockRole);
        });

        it('should return null when no role is found', async () => {
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(null);

            const result = await UserUtils.getUserRole(userId);

            expect(result).toBeNull();
        });

        it('should handle errors and return null', async () => {
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await UserUtils.getUserRole(userId);

            expect(result).toBeNull();
        });
    });

    // Tests for getUserShops
    describe('getUserShops', () => {
        it('should return a list of shops when found', async () => {
            const mockShops = [{ shop_id: 1, name: 'Shop1' }, { shop_id: 2, name: 'Shop2' }] as Shop[];
            (myDataSource.createQueryBuilder().getMany as jest.Mock).mockResolvedValue(mockShops);

            const result = await UserUtils.getUserShops(userId);

            expect(myDataSource.createQueryBuilder).toHaveBeenCalled();
            expect(result).toEqual(mockShops);
        });

        it('should return an empty array when no shops are found', async () => {
            (myDataSource.createQueryBuilder().getMany as jest.Mock).mockResolvedValue([]);

            const result = await UserUtils.getUserShops(userId);

            expect(result).toEqual([]);
        });

        it('should handle errors and return an empty array', async () => {
            (myDataSource.createQueryBuilder().getMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await UserUtils.getUserShops(userId);

            expect(result).toEqual([]);
        });
    });

    // Tests for getUserShopId
    describe('getUserShopId', () => {
        it('should return the shop ID when found', async () => {
            const mockUserShop = { shop_id: 123 } as UserShop;
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(mockUserShop);

            const result = await UserUtils.getUserShopId(userId);

            expect(myDataSource.createQueryBuilder).toHaveBeenCalled();
            expect(result).toEqual(123);
        });

        it('should return null when no shop ID is found', async () => {
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(null);

            const result = await UserUtils.getUserShopId(userId);

            expect(result).toBeNull();
        });

        it('should handle errors and return null', async () => {
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await UserUtils.getUserShopId(userId);

            expect(result).toBeNull();
        });
    });

    // Tests for getUserAddress
    describe('getUserAddress', () => {
        it('should return the user address when found', async () => {
            const mockUser = { user_address: '123 Main St' } as User;
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(mockUser);

            const result = await UserUtils.getUserAddress(userId);

            expect(myDataSource.createQueryBuilder).toHaveBeenCalled();
            expect(result).toEqual('123 Main St');
        });

        it('should return null when no address is found', async () => {
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(null);

            const result = await UserUtils.getUserAddress(userId);

            expect(result).toBeNull();
        });

        it('should handle errors and return null', async () => {
            (myDataSource.createQueryBuilder().getOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await UserUtils.getUserAddress(userId);

            expect(result).toBeNull();
        });
    });
});
