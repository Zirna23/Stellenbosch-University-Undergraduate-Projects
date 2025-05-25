import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from "type-graphql";
import { OrderUtils } from "../utils/OrderUtils";
import { Order } from "../entity/orders";
import { OrderItem } from "../entity/order_items";
import { MyContext } from "../types/context";

@ObjectType()
class OrderResponse {
    @Field(() => Order, { nullable: true })
    order?: Order | null;

    @Field(() => Boolean)
    success: boolean;
}

@InputType()
class CreateOrderInput {
    @Field()
    userId: number;

    @Field(() => [OrderItemInput])
    items: OrderItemInput[];

    @Field()
    total_price: number;
}

@InputType()
class OrderItemInput {
    @Field()
    itemId: number;

    @Field()
    quantity: number;

    @Field()
    shopId: number;
}

@InputType()
class UpdateOrderStatusInput {
    @Field()
    orderId: number;

    @Field()
    status: string;
}

@Resolver()
export class OrderResolver {
    @Query(() => OrderResponse)
    async getOrderById(
        @Arg("orderId") orderId: number,
        @Ctx() { req, res }: MyContext
    ): Promise<OrderResponse> {
        const order = await OrderUtils.getOrderById(orderId);
        return { order, success: !!order };
    }

    @Query(() => [Order])
    async getUserOrderHistory(@Arg("userId") userId: number): Promise<Order[]> {
        return await OrderUtils.getUserOrderHistory(userId);
    }

    @Query(() => [Order])
    async getShopOrderHistory(@Arg("shopId") shopId: number): Promise<Order[]> {
        return await OrderUtils.getShopOrderHistory(shopId);
    }

    @Mutation(() => OrderResponse)
    async createOrder(
        @Arg("input") input: CreateOrderInput
    ): Promise<OrderResponse> {
        const order = await OrderUtils.createOrder(
            input.userId,
            input.items,
            input.total_price,
        );
        return { order, success: !!order };
    }

    @Mutation(() => Boolean)
    async updateOrderStatus(
        @Arg("input") input: UpdateOrderStatusInput
    ): Promise<boolean> {
        return await OrderUtils.updateOrderStatus(input.orderId, input.status);
    }

    @Query(() => [OrderItem])
    async getOrderItems(@Arg('orderId') orderId: number): Promise<OrderItem[]> {
        return await OrderUtils.getOrderItems(orderId);
    }

    @Mutation(() => Boolean)
    async updateItemStatus(
        @Arg("barcodeId") barcodeId: string,
        @Arg("orderId") orderId: number,
        @Arg("status") status: boolean
    ): Promise<boolean> {
        return await OrderUtils.updateItemStatus(barcodeId, orderId, status);
    }
}
