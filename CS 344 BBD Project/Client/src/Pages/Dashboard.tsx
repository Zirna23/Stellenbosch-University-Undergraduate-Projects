import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Table, Button, Card } from "react-bootstrap";
import NavBar from "../components/NavBar";
import "../styles/Dashboard.css";
import NavAsideDash from "../components/NavAsideDash";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_USER_NOTIFICATIONS } from "../graphql/notifications";
import { useUser } from "../context/UserContext";
import {
    GET_USER_ORDER_HISTORY,
    GET_SHOP_ORDER_HISTORY,
} from "../graphql/order";
import { GET_USER_SHOPS } from "../graphql/user";

type Order = {
    order_id: string;
    order_date: string;
    status: string;
    total_price: string;
    user_id: string;
};

type Notification = {
    notification_id: string;
    created_at: string;
    message: string;
};

const Dashboard = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const navigate = useNavigate();
    const [notifications, setNotification] = useState<Notification[]>([]);
    const [shop_id, setShops] = useState<number>();

    //Fetch user data
    const { user } = useUser();

    function addHoursToDate(dateString: string, hours: number): string {
        const date = new Date(dateString);
        date.setHours(date.getHours() + hours);
        return date.toISOString();
    }

    // Fetch notification
    const {
        loading: notificationLoading,
        error: notificationError,
        data: notificationData,
    } = useQuery(GET_USER_NOTIFICATIONS, {
        variables: user ? { userId: user.user_id } : undefined,
        pollInterval: 5000,
        skip: !user,
    });

    // Update shop items state when shop items data is fetched
    useEffect(() => {
        if (notificationData && notificationData.getUserNotifications) {
            setNotification(notificationData.getUserNotifications);
        }
    }, [notificationData]);

    //first check if normal user or part of a shop
    if (user?.role.role_id == 1) {
        const { data } = useQuery(GET_USER_ORDER_HISTORY, {
            variables: { userId: user.user_id },
            pollInterval: 5000,
        });

        useEffect(() => {
            if (data && data.getUserOrderHistory) {
                setOrders(data.getUserOrderHistory);
            }
        }, [data]);
    } else if (user?.role.role_id == 2) {
        //get user shop
        const {
            loading: shop_loading,
            error: shop_error,
            data: shop_data,
        } = useQuery(GET_USER_SHOPS, {
            variables: user ? { userId: user.user_id } : undefined,
            pollInterval: 5000,
        });

        useEffect(() => {
            if (shop_data && shop_data.getUserShops) {
                setShops(shop_data.getUserShops[0].shop_id);
            }
        }, [shop_data]);

        const { loading, error, data } = useQuery(GET_SHOP_ORDER_HISTORY, {
            variables: { shopId: shop_id },
            pollInterval: 5000,
        });

        useEffect(() => {
            if (data && data.getShopOrderHistory) {
                setOrders(data.getShopOrderHistory);
            }
        }, [data]);

        if (shop_loading) return <p>Loading...</p>;
        if (shop_error && shop_id) return <p>Error: {shop_error.message}</p>;
        if (loading) return <p>Loading...</p>;
        if (error && shop_id) return <p>Error: {error.message}</p>;
    } else {
        const {
            loading: shop_loading,
            error: shop_error,
            data: shop_data,
        } = useQuery(GET_USER_SHOPS, {
            variables: user ? { userId: user.user_id } : undefined,
        });

        const { refetch: refetchShopOrderHistory } = useQuery(
            GET_SHOP_ORDER_HISTORY,
            {
                variables: { shopId: shop_id }, // Placeholder for shop ID
                skip: true, // Initially skip until we fetch the actual shop IDs
            }
        );

        const shopIdsFetchedRef = useRef<Set<string>>(new Set());

        // Fetch orders for shops when the shop data changes
        useEffect(() => {
            const fetchOrdersForShops = async () => {
                if (shop_data && shop_data.getUserShops) {
                    const shopIds = shop_data.getUserShops.map(
                        (shop: any) => shop.shop_id
                    );

                    // Fetch orders for all shops that haven't been fetched yet
                    const allOrders = await Promise.all(
                        shopIds.map(async (shopId: string) => {
                            if (!shopIdsFetchedRef.current.has(shopId)) {
                                shopIdsFetchedRef.current.add(shopId);

                                try {
                                    const { data: shopOrdersData } =
                                        await refetchShopOrderHistory({
                                            shopId,
                                        });

                                    if (
                                        shopOrdersData &&
                                        shopOrdersData.getShopOrderHistory
                                    ) {
                                        return shopOrdersData.getShopOrderHistory;
                                    }
                                } catch (error) {
                                    console.error(
                                        "Error fetching shop orders for shopId:",
                                        shopId,
                                        error
                                    );
                                }
                            }
                            return []; // Return empty array if the shop orders weren't fetched
                        })
                    );
                    setOrders([]); // Clear previous orders before refetching

                    // Flatten the array of orders and append them to the state
                    setOrders((prevOrders) => [
                        ...prevOrders,
                        ...allOrders.flat(),
                    ]);
                }
            };

            // Fetch orders initially and set up interval for 2-second refetching
            fetchOrdersForShops();
            const intervalId = setInterval(() => {
                shopIdsFetchedRef.current.clear();
                fetchOrdersForShops();
            }, 5000);

            // Cleanup the interval when the component unmounts
            return () => clearInterval(intervalId);
        }, [shop_data, refetchShopOrderHistory]);

        if (shop_loading) return <p>Loading...</p>;
        if (shop_error) return <p>Error: {shop_error.message}</p>;
    }
    if (notificationLoading) return <p>Loading data...</p>;
    if (notificationError)
        return <p>Error loading notifications: {notificationError.message}</p>;

    // Reverse the order of notifications for most recent first
    const reversedNotifications = [...notifications].reverse();

    return (
        <div>
            <NavBar />
            <Container fluid>
                <Row>
                    <NavAsideDash />
                    <Col md={10} className="p-4">
                        <h1>Dashboard</h1>
                        <div className="mt-4">
                            <h2>Orders</h2>
                            <Table
                                striped
                                bordered
                                hover
                                responsive
                                className="rounded custom-table"
                            >
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.order_id}>
                                            <td>{order.order_id}</td>
                                            <td>
                                                {addHoursToDate(
                                                    order.order_date,
                                                    4
                                                )}
                                            </td>
                                            <td>{order.status}</td>
                                            <td>R {order.total_price}</td>
                                            <td>
                                                <Button
                                                    className="custom-button"
                                                    style={{
                                                        backgroundColor:
                                                            "#ed871f",
                                                        borderColor: "#ed871f",
                                                        color: "black",
                                                    }}
                                                    onClick={() =>
                                                        navigate(
                                                            "/specificOrder",
                                                            {
                                                                state: {
                                                                    orderinfo:
                                                                        order,
                                                                },
                                                            }
                                                        )
                                                    }
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="mt-4">
                            <h2>Notifications</h2>
                            {reversedNotifications.map(
                                (notification, index) => (
                                    <Card key={index} className="mb-3">
                                        <Card.Body>
                                            <Card.Title>
                                                {notification.message}
                                            </Card.Title>
                                            <Card.Footer className="text-end">
                                                {notification.created_at}
                                            </Card.Footer>
                                        </Card.Body>
                                    </Card>
                                )
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Dashboard;
