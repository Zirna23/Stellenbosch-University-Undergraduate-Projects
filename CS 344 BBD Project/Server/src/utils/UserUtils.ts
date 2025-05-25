import { User } from "../entity/users";
import { Role } from "../entity/roles";
import { Shop } from "../entity/shops";
import { Order } from "../entity/orders";
import { UserShop } from "../entity/users_shops";
import { myDataSource } from "../database/databaseSetup";

export class UserUtils {
    // Create a new user
    static async createUser(
        name: string,
        email: string,
        password: string,
        roleId: number,
        user_address: string, 
    ): Promise<User | null> {
        try {
            const role = await myDataSource
                .createQueryBuilder(Role, "role")
                .where("role.role_id = :roleId", { roleId })
                .getOne();
    
            if (!role) {
                throw new Error("Invalid role ID");
            }

            // console.log("Registering with: ", { name, email, password, roleId, user_address });

            const newUser = new User();
            newUser.name = name;
            newUser.email = email;
            newUser.password_hash = password;
            newUser.role = role;
            newUser.user_address = user_address;

            // Save the user to the database
            await myDataSource.manager.save(newUser);

            return newUser;
        } catch (error) {
            // console.error("Error creating user:", error);
            return null;
        }
    }

    // Delete a user
    static async deleteUser(userId: number): Promise<boolean> {
        try {
            await myDataSource.manager.transaction(async (transactionalEntityManager) => {
                 // Delete user from usersshops table
                 await transactionalEntityManager
                 .createQueryBuilder()
                 .delete()
                 .from(UserShop)
                 .where("user_id = :userId", { userId })
                 .execute();
                 
                // Delete associated shop
                await transactionalEntityManager
                    .createQueryBuilder()
                    .delete()
                    .from(Shop)
                    .where("owner_id = :userId", { userId })
                    .execute();

                // Delete associated orders
                await transactionalEntityManager
                    .createQueryBuilder()
                    .delete()
                    .from(Order)
                    .where("user_id = :userId", { userId })
                    .execute();

                // Delete the user
                await transactionalEntityManager
                    .createQueryBuilder()
                    .delete()
                    .from(User)
                    .where("user_id = :userId", { userId })
                    .execute();
            });

            return true;
        } catch (error) {
            console.error("Error deleting user:", error);
            return false;
        }
    }

    // Update a user
    static async updateUser(
        userId: number,
        name: string,
        email: string,
        roleId: number,
        user_address?: string
    ): Promise<boolean> {
        try {
            const role = await myDataSource
                .createQueryBuilder(Role, "role")
                .where("role.role_id = :roleId", { roleId })
                .getOne();
    
            if (!role) {
                throw new Error("Invalid role ID");
            }
    
            await myDataSource
                .createQueryBuilder()
                .update(User)
                .set({ name, email, role, user_address })
                .where("user_id = :userId", { userId })
                .execute();
    
            return true;
        } catch (error) {
            // console.error("Error updating user:", error);
            return false;
        }
    }

    // Search for a user by email
    static async searchUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await myDataSource
                .createQueryBuilder(User, "user")
                .leftJoinAndSelect("user.role", "role")
                .where("user.email = :email", { email })
                .getOne();

            return user || null;
        } catch (error) {
            console.error("Error searching user:", error);
            return null;
        }
    }

    // Assign a user to a shop
    static async assignUserToShop(
        userId: number,
        shopId: number,
        roleId: number
    ): Promise<boolean> {
        try {
            await myDataSource
                .createQueryBuilder()
                .insert()
                .into(UserShop)
                .values([{ user_id: userId, shop_id: shopId, role_id: roleId }])
                .execute();

            return true;
        } catch (error) {
            // console.error("Error assigning user to shop:", error);
            return false;
        }
    }

    static async getUserById(userId: number): Promise<User | null> {
        try {
            const user = await myDataSource
                .createQueryBuilder(User, "user")
                .leftJoinAndSelect("user.role", "role")
                .where("user.user_id = :userId", { userId })
                .getOne();

            return user || null;
        } catch (error) {
            // console.error("Error getting user by ID:", error);
            return null;
        }
    }

    // Get the role of a user
    static async getUserRole(userId: number): Promise<Role | null> {
        try {
            const user = await myDataSource
                .createQueryBuilder(User, "user")
                .leftJoinAndSelect("user.role", "role")
                .where("user.user_id = :userId", { userId })
                .getOne();

            return user?.role || null;
        } catch (error) {
            // console.error("Error getting user role:", error);
            return null;
        }
    }

    // Find the shop a user belongs/works at
    static async getUserShops(userId: number): Promise<Shop[]> {
        try {
            const shops = await myDataSource
                .createQueryBuilder(Shop, "shop")
                .innerJoin("shop.users", "user", "user.user_id = :userId", {
                    userId,
                })
                .getMany();

            return shops;
        } catch (error) {
            // console.error("Error getting user shops:", error);
            return [];
        }
    }

    // Get user shop ID by user ID
    static async getUserShopId(userId: number): Promise<number | null> {
        try {
            const userShop = await myDataSource
                .createQueryBuilder(UserShop, "userShop")
                .where("userShop.user_id = :userId", { userId })
                .getOne();

            return userShop?.shop_id || null;
        } catch (error) {
            // console.error("Error getting user shop ID:", error);
            return null;
        }
    }
    

    // Get the users address
    static async getUserAddress(userId: number): Promise<string | null> {
        try {
          const user = await myDataSource
            .createQueryBuilder(User, 'user')
            .select('user.user_address')
            .where('user.user_id = :userId', { userId })
            .getOne();
      
          return user ? user.user_address : null;
        } catch (error) {
        //   console.error('Error getting user address:', error);
          return null;
        }
      }
}
