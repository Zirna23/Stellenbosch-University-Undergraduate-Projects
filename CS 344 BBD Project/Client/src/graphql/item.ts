// item.ts
import { gql } from "@apollo/client";

// Queries

// Get an item by ID
export const GET_ITEM_BY_ID = gql`
    query GetItemById($itemId: Float!) {
        getItemById(itemId: $itemId) {
            item {
                barcode_id
                description
                item_id
                item_image
                name
                price
                quantity
                sales
            }
            success
        }
    }
`;

// Search for items by name or category
export const SEARCH_ITEMS = gql`
    query SearchItems($query: String!) {
        searchItems(query: $query) {
            barcode_id
            description
            item_id
            item_image
            name
            price
            quantity
            sales
        }
    }
`;

// Mutations

// Create a new item
export const CREATE_ITEM = gql`
    mutation CreateItem(
        $quantity: Float!
        $shopId: Float!
        $categoryId: Float!
        $price: Float!
        $description: String!
        $name: String!
        $barcodeId: String
        $itemImage: String
    ) {
        createItem(
            quantity: $quantity
            shopId: $shopId
            categoryId: $categoryId
            price: $price
            description: $description
            name: $name
            barcode_id: $barcodeId
            item_image: $itemImage
        ) {
            success
            item {
                barcode_id
                description
                item_id
                item_image
                name
                price
                quantity
                sales
            }
        }
    }
`;

// Update an item
export const UPDATE_ITEM = gql`
    mutation UpdateItem(
        $quantity: Float!
        $categoryId: Float!
        $price: Float!
        $description: String!
        $name: String!
        $itemId: Float!
        $barcodeId: String
        $itemImage: String
    ) {
        updateItem(
            quantity: $quantity
            categoryId: $categoryId
            price: $price
            description: $description
            name: $name
            itemId: $itemId
            barcode_id: $barcodeId
            item_image: $itemImage
        )
    }
`;

// Delete an item
export const DELETE_ITEM = gql`
    mutation DeleteItem($itemId: Float!) {
        deleteItem(itemId: $itemId)
    }
`;

// Get item by category
export const GET_ITEM_BY_CATEGORY = gql`
    query GetItemsByCategory($categoryId: Float!) {
        getItemsByCategory(categoryId: $categoryId) {
            item_id
            name
            description
            price
            item_image
            quantity
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

export const GET_ITEM_IMAGE = gql`
    query Query($itemId: Float!) {
        getItemImage(itemId: $itemId)
    }
`;

export const UPDATE_ITEM_SALES = gql`
    mutation UpdateItemSales($quantity: Float!, $itemId: Float!) {
        updateItemSales(quantity: $quantity, itemId: $itemId)
    }
`;

export const UPDATE_ITEM_STATUS = gql`
    mutation UpdateItemStatus(
        $status: Boolean!
        $orderId: Float!
        $barcodeId: String!
    ) {
        updateItemStatus(
            status: $status
            orderId: $orderId
            barcodeId: $barcodeId
        )
    }
`;

export const GET_ITEM_BY_BARCODE = gql`
    query GetItemByBarcodeId($barcodeId: String!) {
        getItemByBarcodeId(barcodeId: $barcodeId) {
            item {
                item_id
                name
                description
                price
                item_image
                quantity
                sales
                barcode_id
            }
            success
        }
    }
`;

export const GET_ITEM_SALES = gql`
    query Query($itemId: Float!) {
        getItemSales(itemId: $itemId)
    }
`;
