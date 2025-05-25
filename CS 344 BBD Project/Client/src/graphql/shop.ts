import { gql } from "@apollo/client";

// Queries

// Fetch a shop by ID
export const GET_SHOP_BY_ID = gql`
    query GetShopById($shopId: Float!) {
        getShopById(shopId: $shopId) {
            shop {
                shop_id
                name
                address
                open
                contact_number
                weekday_opening_time
                weekday_closing_time
                weekend_opening_time
                weekend_closing_time
            }
            success
        }
    }
`;

// Get shop by item id
export const GET_SHOP_BY_ITEM_ID = gql`
    query GetShopByItemId($itemId: Float!) {
        getShopByItemId(itemId: $itemId) {
            shop_id
            name
            address
            open
            contact_number
            weekday_opening_time
            weekday_closing_time
            weekend_opening_time
            weekend_closing_time
        }
    }
`;

// Get all items in a shop
export const GET_SHOP_ITEMS = gql`
    query GetShopItems($shopId: Float!) {
        getShopItems(shopId: $shopId) {
            item_id
            name
            description
            price
            item_image
            quantity
            sales
            barcode_id
        }
    }
`;

// Get shop users
export const GET_SHOP_USERS = gql`
    query GetShopUsers($shopId: Float!) {
        getShopUsers(shopId: $shopId) {
            user_id
            name
            email
            password_hash
            user_address
        }
    }
`;

// Get shop open status
export const GET_SHOP_OPEN_STATUS = gql`
    query Query($shopId: Float!) {
        getShopOpenStatus(shopId: $shopId)
    }
`;

// Get shop contact number
export const GET_SHOP_CONTACT_NUMBER = gql`
    query Query($shopId: Float!) {
        getShopContactNumber(shopId: $shopId)
    }
`;

// Mutations

// Create a new shop
export const CREATE_SHOP = gql`
    mutation CreateShop(
        $ownerId: Float!
        $address: String!
        $name: String!
        $weekendClosingTime: String
        $weekendOpeningTime: String
        $weekdayClosingTime: String
        $weekdayOpeningTime: String
        $contactNumber: String
        $open: Boolean
    ) {
        createShop(
            ownerId: $ownerId
            address: $address
            name: $name
            weekendClosingTime: $weekendClosingTime
            weekendOpeningTime: $weekendOpeningTime
            weekdayClosingTime: $weekdayClosingTime
            weekdayOpeningTime: $weekdayOpeningTime
            contactNumber: $contactNumber
            open: $open
        ) {
            success
            shop {
                address
                contact_number
                name
                open
                shop_id
                weekday_closing_time
                weekday_opening_time
                weekend_closing_time
                weekend_opening_time
            }
        }
    }
`;

// Update a shop
export const UPDATE_SHOP = gql`
    mutation UpdateShop(
        $open: Boolean!
        $address: String!
        $name: String!
        $shopId: Float!
        $weekendClosingTime: String
        $weekendOpeningTime: String
        $weekdayClosingTime: String
        $weekdayOpeningTime: String
        $contactNumber: String
    ) {
        updateShop(
            open: $open
            address: $address
            name: $name
            shopId: $shopId
            weekendClosingTime: $weekendClosingTime
            weekendOpeningTime: $weekendOpeningTime
            weekdayClosingTime: $weekdayClosingTime
            weekdayOpeningTime: $weekdayOpeningTime
            contactNumber: $contactNumber
        )
    }
`;

// Delete a shop
export const DELETE_SHOP = gql`
    mutation DeleteShop($shopId: Float!) {
        deleteShop(shopId: $shopId)
    }
`;
