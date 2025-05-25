## Types
This directory contains TypeScript definitions for the main entities in the e-Spaza application.

## Category
Represents a product category in the system.
Fields

    category_id: Unique identifier for the category
    name: Name of the category

Inputs

    CreateCategoryInput: Used to create a new category
        name: Name of the new category
    UpdateCategoryInput: Used to update an existing category
        category_id: ID of the category to update
        name: New name for the category

## Context
Defines the context object passed to resolvers, containing Express request and response objects along with optional user payload.
Properties

    req: Express request object
    res: Express response object
    payload: Optional object containing user information
        userId: User's unique identifier
        email: User's email
        role: User's role

## Inventory
Represents an inventory entry linking a shop and an item.
Fields

    inventory_id: Unique identifier for the inventory entry
    shop: Associated shop
    item: Associated item
    quantity: Quantity of the item in stock

## Item
Represents a product in the system.
Fields

    item_id: Unique identifier for the item
    name: Name of the item
    description: Optional description of the item
    price: Price of the item
    category: Associated category
    shop: Associated shop

Inputs

    CreateItemInput: Used to create a new item
        name: Name of the new item
        description: Optional description
        price: Price of the item
        categoryId: ID of the associated category
        shopId: ID of the associated shop
    UpdateItemInput: Used to update an existing item
        itemId: ID of the item to update
        name: Updated name of the item
        description: Updated description (optional)
        price: Updated price of the item
        categoryId: Updated category ID

## Notification
Represents a notification sent to a user.
Fields

    notification_id: Unique identifier for the notification
    user: Associated user
    message: Content of the notification
    created_at: Timestamp when the notification was created

## Order
Represents a purchase order in the system.
Fields

    order_id: Unique identifier for the order
    user: Associated user who placed the order
    total_price: Total cost of the order
    order_date: Date when the order was placed
    status: Current status of the order
    order_items: Array of order items

Inputs

    CreateOrderInput: Used to create a new order
        userId: ID of the user placing the order
        items: Array of order items
    OrderItemInput: Represents an item in an order
        itemId: ID of the item
        quantity: Quantity of the item ordered
    UpdateOrderStatusInput: Used to update the status of an order
        orderId: ID of the order to update
        status: New status for the order

## Role
Represents a role in the system.
Fields

    role_id: Unique identifier for the role
    role_name: Name of the role

Inputs

    CreateRoleInput: Used to create a new role
        role_name: Name of the new role
    UpdateRoleInput: Used to update an existing role
        role_id: ID of the role to update
        role_name: Updated name of the role

## Shop
Represents a physical store in the system.
Fields

    shop_id: Unique identifier for the shop
    name: Name of the shop
    address: Optional address of the shop
    owner: Owner of the shop

Inputs

    CreateShopInput: Used to create a new shop
        name: Name of the new shop
        address: Optional address
        ownerId: ID of the owner
    UpdateShopInput: Used to update an existing shop
        shopId: ID of the shop to update
        name: Updated name of the shop
        address: Updated address (optional)
        ownerId: Updated owner ID

## User
Represents a registered user in the system.
Fields

    user_id: Unique identifier for the user
    name: Name of the user
    email: Email address of the user
    password_hash: Hashed password of the user
    role: Associated role

Inputs

    CreateUserInput: Used to create a new user
        name: Name of the new user
        email: Email of the new user
        password: Password of the new user
        roleId: ID of the associated role
    UpdateUserInput: Used to update an existing user
        userId: ID of the user to update
        name: Updated name of the user
        email: Updated email of the user
        roleId: Updated role ID
