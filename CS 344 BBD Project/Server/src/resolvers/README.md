## InventoryResolver
The InventoryResolver class handles mutations related to inventory management.
Methods

updateInventoryQuantity(itemId: number, shopId: number, quantity: number): Promise<boolean>
    Updates the inventory quantity of a specific item in a shop.
    Parameters:
        itemId: The ID of the item.
        shopId: The ID of the shop.
        quantity: The new quantity of the item.
    Returns a boolean indicating the success of the update operation.

## ItemResolver
The ItemResolver class handles queries and mutations related to items.
Methods

getItemById(itemId: number): Promise<ItemResponse>
    Retrieves an item by its ID.
    Parameters:
        itemId: The ID of the item.
    Returns an ItemResponse object containing the item and a success flag.

searchItems(query: string): Promise<Item[]>
    Searches for items based on a query string.
    Parameters:
        query: The search query string.
    Returns an array of Item objects matching the search query.

createItem(name: string, description: string, price: number, categoryId: number, shopId: number, ctx: MyContext): Promise<ItemResponse>
    Creates a new item.
    Parameters:
        name: The name of the item.
        description: The description of the item.
        price: The price of the item.
        categoryId: The ID of the category the item belongs to.
        shopId: The ID of the shop the item is associated with.
        ctx: The context object containing the request and response.
    Returns an ItemResponse object containing the created item and a success flag.

updateItem(itemId: number, name: string, description: string, price: number, categoryId: number): Promise<boolean>
    Updates an existing item.
    Parameters:
        itemId: The ID of the item to update.
        name: The updated name of the item.
        description: The updated description of the item.
        price: The updated price of the item.
        categoryId: The updated category ID of the item.
    Returns a boolean indicating the success of the update operation.

deleteItem(itemId: number): Promise<boolean>
    Deletes an item.
    Parameters:
        itemId: The ID of the item to delete.
    Returns a boolean indicating the success of the delete operation.

## OrderResolver
The OrderResolver class handles queries and mutations related to orders.
Methods

getOrderById(orderId: number): Promise<OrderResponse>
    Retrieves an order by its ID.
    Parameters:
        orderId: The ID of the order.
    Returns an OrderResponse object containing the order and a success flag.

getUserOrderHistory(userId: number): Promise<Order[]>
    Retrieves the order history of a user.
    Parameters:
        userId: The ID of the user.
    Returns an array of Order objects representing the user's order history.

getShopOrderHistory(shopId: number): Promise<Order[]>
    Retrieves the order history of a shop.
    Parameters:
        shopId: The ID of the shop.
    Returns an array of Order objects representing the shop's order history.

createOrder(input: CreateOrderInput, ctx: MyContext): Promise<OrderResponse>
    Creates a new order.
    Parameters:
        input: The input object containing the user ID and order items.
        ctx: The context object containing the request and response.
    Returns an OrderResponse object containing the created order and a success flag.

updateOrderStatus(input: UpdateOrderStatusInput): Promise<boolean>
    Updates the status of an order.
    Parameters:
        input: The input object containing the order ID and new status.
    Returns a boolean indicating the success of the update operation.

## ShopResolver
The ShopResolver class handles queries and mutations related to shops.
Methods

getShopById(shopId: number): Promise<ShopResponse>
    Retrieves a shop by its ID.
    Parameters:
        shopId: The ID of the shop.
    Returns a ShopResponse object containing the shop and a success flag.

getShopItems(shopId: number): Promise<Item[]>
    Retrieves the items associated with a shop.
    Parameters:
        shopId: The ID of the shop.
    Returns an array of Item objects representing the items in the shop.

createShop(name: string, address: string, ownerId: number, ctx: MyContext): Promise<ShopResponse>
    Creates a new shop.
    Parameters:
        name: The name of the shop.
        address: The address of the shop.
        ownerId: The ID of the user who owns the shop.
        ctx: The context object containing the request and response.
    Returns a ShopResponse object containing the created shop and a success flag.

updateShop(shopId: number, name: string, address: string): Promise<boolean>
    Updates an existing shop.
    Parameters:
        shopId: The ID of the shop to update.
        name: The updated name of the shop.
        address: The updated address of the shop.
    Returns a boolean indicating the success of the update operation.

deleteShop(shopId: number): Promise<boolean>
    Deletes a shop.
    Parameters:
        shopId: The ID of the shop to delete.
    Returns a boolean indicating the success of the delete operation.

## UserResolver
The UserResolver class handles queries and mutations related to users.
Methods

getUserById(userId: number): Promise<UserResponse>
    Retrieves a user by their ID.
    Parameters:
        userId: The ID of the user.
    Returns a UserResponse object containing the user and a success flag.

searchUserByEmail(email: string): Promise<UserResponse>
    Searches for a user by their email.
    Parameters:
        email: The email of the user.
    Returns a UserResponse object containing the user and a success flag.

createUser(name: string, email: string, password: string, roleId: number, ctx: MyContext): Promise<UserResponse>
    Creates a new user.
    Parameters:
        name: The name of the user.
        email: The email of the user.
        password: The password of the user.
        roleId: The ID of the role assigned to the user.
        ctx: The context object containing the request and response.
    Returns a UserResponse object containing the created user and a success flag.

updateUser(userId: number, name: string, email: string, roleId: number): Promise<boolean>
    Updates an existing user.
    Parameters:
        userId: The ID of the user to update.
        name: The updated name of the user.
        email: The updated email of the user.
        roleId: The updated role ID of the user.
    Returns a boolean indicating the success of the update operation.

deleteUser(userId: number): Promise<boolean>
    Deletes a user.
    Parameters:
        userId: The ID of the user to delete.
    Returns a boolean indicating the success of the delete operation.

assignUserToShop(userId: number, shopId: number, roleId: number): Promise<boolean>
    Assigns a user to a shop with a specific role.
    Parameters:
        userId: The ID of the user to assign.
        shopId: The ID of the shop to assign the user to.
        roleId: The ID of the role to assign to the user in the shop.
    Returns a boolean indicating the success of the assignment operation.
