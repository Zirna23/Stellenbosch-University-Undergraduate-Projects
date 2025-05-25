import { Order } from "../entity/orders";
import { Item } from "../entity/items";
import { OrderItem } from "../entity/order_items";
import { myDataSource } from "../database/databaseSetup";

export class OrderUtils {
    // Create a new order
    static async createOrder(
        userId: number,
        items: { itemId: number; quantity: number; shopId: number }[],
        total_price: number
    ): Promise<Order | null> {
        try {
            const newOrder = await myDataSource
                .createQueryBuilder()
                .insert()
                .into(Order)
                .values([
                    {
                        user: { user_id: userId },
                        total_price: total_price,
                        status: "pending",
                    },
                ])
                .returning("*")
                .execute();

            const order = newOrder.raw[0];

            for (const { itemId, quantity, shopId } of items) {
                await myDataSource
                    .createQueryBuilder()
                    .insert()
                    .into(OrderItem)
                    .values([
                        {
                            order: { order_id: order.order_id },
                            item: { item_id: itemId },
                            quantity,
                            shop: { shop_id: shopId },
                        },
                    ])
                    .execute();
            }

            return order;
        } catch (error) {
            // console.error("Error creating order:", error);
            return null;
        }
    }

    // Update order status
    static async updateOrderStatus(
        orderId: number,
        status: string
    ): Promise<boolean> {
        try {
            await myDataSource
                .createQueryBuilder()
                .update(Order)
                .set({ status })
                .where("order_id = :orderId", { orderId })
                .execute();

            return true;
        } catch (error) {
            // console.error("Error updating order status:", error);
            return false;
        }
    }

    // Get order history for a user
    static async getUserOrderHistory(userId: number): Promise<Order[]> {
        try {
            const orders = await myDataSource
                .createQueryBuilder(Order, "order")
                .where("order.user_id = :userId", { userId })
                .getMany();

            return orders;
        } catch (error) {
            // console.error("Error getting user order history:", error);
            return [];
        }
    }

    // Get order history for a shop
    static async getShopOrderHistory(shopId: number): Promise<Order[]> {
        try {
            const orders = await myDataSource
                .createQueryBuilder(Order, "order")
                .innerJoin("order.order_items", "order_item")
                .where("order_item.shop_id = :shopId", { shopId })
                .getMany();

            return orders;
        } catch (error) {
            // console.error("Error getting shop orders:", error);
            return [];
        }
    }

    // Get order by ID
    static async getOrderById(orderId: number): Promise<Order | null> {
        try {
            const order = await myDataSource
                .createQueryBuilder(Order, "order")
                .leftJoinAndSelect("order.order_items", "order_item")
                .leftJoinAndSelect("order_item.item", "item")
                .where("order.order_id = :orderId", { orderId })
                .getOne();

            return order;
        } catch (error) {
            // console.error("Error getting order by ID:", error);
            return null;
        }
    }

    // Get items for an order
    static async getOrderItems(orderId: number): Promise<OrderItem[]> {
        try {
            const orderItems = await myDataSource
                .createQueryBuilder(OrderItem, "orderItem")
                .leftJoinAndSelect("orderItem.item", "item")
                .where("orderItem.order_id = :orderId", { orderId })
                .getMany();

            return orderItems;
        } catch (error) {
            // console.error("Error getting order items:", error);
            return [];
        }
    }

    // Update item status in a specific order given the barcode_id of the item and the order_id
    static async updateItemStatus(barcodeId: string, orderId: number, status: boolean): Promise<boolean> {
        try {
            const orderItem = await myDataSource
                .createQueryBuilder(OrderItem, "orderItem")
                .innerJoinAndSelect(Item, "item", "item.item_id = orderItem.item_id")
                .where("item.barcode_id = :barcodeId", { barcodeId })
                .andWhere("orderItem.order_id = :orderId", { orderId })
                .getOne();

            if (!orderItem) {
                console.log("No order item found for the provided barcodeId and orderId");
                return false;
            }

            // Update the status of the found OrderItem record
            await myDataSource
                .createQueryBuilder()
                .update(OrderItem)
                .set({ status })
                .where("order_item_id = :orderItemId", { orderItemId: orderItem.order_item_id })
                .execute();

            return true;
        } catch (error) {
            console.error("Error updating item status:", error);
            return false;
        }
    }
}
