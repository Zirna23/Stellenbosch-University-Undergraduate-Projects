import { gql } from "@apollo/client";

// Queries

// Fetch an order by ID
export const GET_ORDER_BY_ID = gql`
    query GetOrderById($orderId: Float!) {
        getOrderById(orderId: $orderId) {
            order {
                order_id
                total_price
                order_date
                status
                user_id
            }
            success
        }
    }
`;

// Get order history for a user
export const GET_USER_ORDER_HISTORY = gql`
    query GetUserOrderHistory($userId: Float!) {
        getUserOrderHistory(userId: $userId) {
            order_id
            total_price
            order_date
            status
            user_id
        }
    }
`;

// Get order history for a shop
export const GET_SHOP_ORDER_HISTORY = gql`
    query GetShopOrderHistory($shopId: Float!) {
        getShopOrderHistory(shopId: $shopId) {
            order_id
            total_price
            order_date
            status
            user_id
        }
    }
`;

// Mutations

// Create a new order
export const CREATE_ORDER = gql`
    mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
            success
            order {
                total_price
                status
                order_id
                order_date
                user_id
            }
        }
    }
`;

// Update order status
export const UPDATE_ORDER_STATUS = gql`
    mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
        updateOrderStatus(input: $input)
    }
`;

// Get order items
export const GET_ORDER_ITEMS = gql`
    query GetOrderItems($orderId: Float!) {
        getOrderItems(orderId: $orderId) {
            order_item_id
            quantity
            item_id
            status
        }
    }
`;
