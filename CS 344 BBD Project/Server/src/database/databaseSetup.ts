import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "../entity/users";
import { Category } from "../entity/categories";
import { Notification } from "../entity/notifications";
import { Order } from "../entity/orders";
import { UserShop } from "../entity/users_shops";
import { Inventory } from "../entity/inventory";
import { OrderItem } from "../entity/order_items";
import { Role } from "../entity/roles";
import { Item } from "../entity/items";
import { OrderShop } from "../entity/orders_shops";
import { Shop } from "../entity/shops";

dotenv.config();

export const myDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOSTNAME,
    port: 5432,
    url: "postgresql://db_espaza_user:QpIy5eqs79sa4tr8WHOAGK6t6tBznRg6@dpg-crgm9nrqf0us73dnpl40-a.oregon-postgres.render.com/postgresql_espaza",
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [
        User,
        Category,
        Notification,
        Order,
        UserShop,
        Inventory,
        OrderItem,
        Role,
        Item,
        OrderShop,
        Shop,
    ],
    ssl: true,
    logging: true,
    // synchronize: true //Do not uncomment if we put in production
});

// Optionally initialises connection right away
// async function initializeDatabase() {
//     try {
//         await myDataSource.initialize();
//         console.log('Database connection established.');
//     } catch (error) {
//         console.error('Database connection error:', error);
//     }
// }

export default myDataSource;
