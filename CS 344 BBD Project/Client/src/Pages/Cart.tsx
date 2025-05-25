import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import NavBar from "../components/NavBar";
import CartItem from "../components/CartItem";
import "../styles/Cart.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
    GET_ITEM_BY_ID,
    GET_SHOP_BY_ITEM_ID,
    UPDATE_ITEM_SALES,
} from "../graphql/item";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_ORDER } from "../graphql/order";
import { useUser } from "../context/UserContext";
import { CREATE_NOTIFICATION } from "../graphql/notifications";

type ItemType = {
    item_id: number;
    name: string;
    description: string;
    price: string;
    shopName: string;
    shop_id: number;
    item_image: string;
};

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const [itemDetails, setItemDetails] = useState<ItemType[]>([]);
    const [getItemById] = useLazyQuery(GET_ITEM_BY_ID);
    const [subtotal, setSubtotal] = useState(0);
    const { user } = useUser();
    const [getShopByItemId] = useLazyQuery(GET_SHOP_BY_ITEM_ID);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const [createOrderMutation, { loading: orderLoading, error: orderError }] =
        useMutation(CREATE_ORDER);
    const [
        createNotificationMutation,
        { loading: notificationLoading, error: notificationError },
    ] = useMutation(CREATE_NOTIFICATION);

    const [
        updateItemSalesMutation,
        { loading: updateSalesLoading, error: updateSalesError },
    ] = useMutation(UPDATE_ITEM_SALES);

    useEffect(() => {
        const fetchItems = async () => {
            const fetchedItems: ItemType[] = await Promise.all(
                cartItems.map(async (cartItem) => {
                    // Fetch the item details
                    const { data: itemData } = await getItemById({
                        variables: { itemId: cartItem.item_id },
                    });

                    const item = itemData?.getItemById?.item;

                    if (item) {
                        // Fetch the shop details for this item
                        const { data: shopData } = await getShopByItemId({
                            variables: { itemId: cartItem.item_id },
                        });

                        const shopId = shopData?.getShopByItemId?.shop_id;
                        const shopName =
                            shopData?.getShopByItemId?.name || "Unknown Shop";

                        // Return the item details combined with the shop name
                        return {
                            ...item,
                            shop_id: shopId,
                            shopName,
                        };
                    }
                    return null;
                })
            );
            // Filter out any null items (in case some items couldn't be fetched)
            setItemDetails(fetchedItems.filter((item) => item !== null));
        };

        if (cartItems.length > 0) {
            fetchItems();
        }
    }, [cartItems, getItemById, getShopByItemId]);

    // Function to calculate subtotal based on item price * quantity
    useEffect(() => {
        const calculateSubtotal = () => {
            const total = cartItems.reduce((acc, cartItem) => {
                const item = itemDetails.find(
                    (item) => item.item_id === cartItem.item_id
                );
                if (item) {
                    return acc + parseFloat(item.price) * cartItem.quantity;
                }
                return acc;
            }, 0);
            setSubtotal(total);
        };

        if (itemDetails.length > 0) {
            calculateSubtotal();
        }
    }, [cartItems, itemDetails]);

    const createOrder = async () => {
        setIsPlacingOrder(true);
        try {
            const { data } = await createOrderMutation({
                variables: {
                    input: {
                        userId: user?.user_id,
                        items: cartItems.map((cartItem) => ({
                            itemId: cartItem.item_id,
                            quantity: cartItem.quantity,
                            shopId: cartItem.shop_id,
                        })),
                        total_price: subtotal + 5,
                    },
                },
            });

            const order = data?.createOrder?.order;

            if (orderLoading) return <p>Loading...</p>;
            if (orderError) return <p>Error: {orderError.message}</p>;

            if (order) {
                const {} = await createNotificationMutation({
                    variables: {
                        userId: user?.user_id,
                        message: `Order ${order?.order_id} is being packed.`,
                    },
                });

                if (notificationLoading) return <p>Loading...</p>;
                if (notificationError)
                    return <p>Error: {notificationError.message}</p>;

                // Update sales for each item in the cart
                for (const cartItem of cartItems) {
                    try {
                        await updateItemSalesMutation({
                            variables: {
                                itemId: cartItem.item_id,
                                quantity: cartItem.quantity,
                            },
                        });
                    } catch (updateSalesError) {
                        console.error(
                            `Error updating sales for item ${cartItem.item_id}:`,
                            updateSalesError
                        );
                    }
                }
                if (updateSalesLoading) return <p>Loading...</p>;
                if (updateSalesError)
                    return <p>Error: {updateSalesError.message}</p>;

                clearCart();
                // Navigate to the order page with the orderId as state
                navigate("/specificOrder", { state: { orderinfo: order } });
            }
        } catch (error) {
            console.error("Error creating order:", error);
        } finally {
            // Set loading state back to false when the process is finished (success or error)
            setIsPlacingOrder(false);
        }
    };

    return (
        <div>
            <NavBar />
            <Container fluid>
                <Container className="mt-4">
                    <h1 className="text-end">Your Cart</h1>
                    <Row>
                        <Col md={8}>
                            {cartItems.length > 0 ? (
                                itemDetails.map((item, index) => (
                                    <CartItem
                                        item_id={item.item_id}
                                        key={index}
                                        imgSrc={item.item_image}
                                        name={item.name}
                                        price={item.price}
                                        quantity={
                                            cartItems.find(
                                                (items) =>
                                                    item.item_id ===
                                                    items.item_id
                                            )?.quantity || 0
                                        }
                                        shopName={item.shopName}
                                    />
                                ))
                            ) : (
                                <div className="text-center">
                                    <h2>Your cart is empty</h2>
                                    <p>
                                        Add items to your cart to view them
                                        here.
                                    </p>
                                </div>
                            )}
                        </Col>
                        <Col md={4}>
                            <Card className="p-3">
                                <Card.Body>
                                    <Card.Title>Order Summary</Card.Title>
                                    <Card.Text>
                                        Subtotal{" "}
                                        <span className="float-end">
                                            R {subtotal.toFixed(2)}
                                        </span>
                                    </Card.Text>
                                    <Card.Text>
                                        Service fee{" "}
                                        <span className="float-end">R 5</span>
                                    </Card.Text>
                                    <Card.Text className="fw-bold">
                                        Total{" "}
                                        <span className="float-end">
                                            R {(subtotal + 5).toFixed(2)}
                                        </span>
                                    </Card.Text>
                                    <Button
                                        variant="primary"
                                        className="w-100 mb-2 custom-button"
                                        style={{
                                            backgroundColor: "#ed871f",
                                            borderColor: "#ed871f",
                                            color: "black",
                                        }}
                                        onClick={createOrder}
                                        disabled={isPlacingOrder}
                                    >
                                        {isPlacingOrder ? (
                                            <>
                                                <Spinner
                                                    animation="border"
                                                    size="sm"
                                                />
                                                Placing Order...
                                            </>
                                        ) : (
                                            "Place Order"
                                        )}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-100"
                                        onClick={() => navigate("/home")}
                                    >
                                        Continue shopping
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Container>
        </div>
    );
};

export default Cart;
