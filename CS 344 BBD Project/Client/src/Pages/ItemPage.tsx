import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Button as BootstrapButton,
} from "react-bootstrap";
import "../App.css";
import NavBar from "../components/NavBar";
import { useLocation, useNavigate } from "react-router-dom";
import QuantitySelector from "../components/QuantitySelector";
import { useEffect, useState } from "react";
import { GET_ITEM_BY_ID, GET_SHOP_BY_ITEM_ID } from "../graphql/item";
import { useQuery } from "@apollo/client";
import { useCart } from "../context/CartContext";

type ItemType = {
    item_id: number;
    name: string;
    description: string;
    price: string;
    shopName: string;
    item_image: string;
    quantity: number;
};

type ShopInfo = {
    name: string;
    address: string;
    open: Boolean;
    contact_number: string;
    weekday_opening_time: string;
    weekday_closing_time: string;
    weekend_closing_time: string;
    weekend_opening_time: string;
};

const ItemPage = () => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState<number>(1);
    const [shop, setShop] = useState<ShopInfo | null>(null);
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    // State to track the items that have been added to the cart
    const { cartItems, addToCart } = useCart();

    let item_id = location.state?.itemID || null;
    item_id = item_id ? parseFloat(item_id) : null;
    const [itemDetails, setItemDetails] = useState<ItemType | null>(null);

    // Use Apollo's useQuery to fetch item details by item_id
    const { loading, error, data } = useQuery(GET_ITEM_BY_ID, {
        variables: { itemId: item_id },
    });

    const {
        loading: loading_shop,
        error: error_shop,
        data: data_shop,
    } = useQuery(GET_SHOP_BY_ITEM_ID, {
        variables: { itemId: item_id },
    });

    useEffect(() => {
        if (data && data.getItemById) {
            setItemDetails(data.getItemById.item);
        }
    }, [data]);

    useEffect(() => {
        if (data_shop && data_shop.getShopByItemId) {
            console.log(data_shop.getShopByItemId);
            const formatTime = (time: string | null) => {
                if (!time) return "--:--";
                const [hour, minute] = time.split(":");

                if (hour === "00" && minute === "00") {
                    return "--:--";
                }
                return `${hour}:${minute}`;
            };

            const formattedShop = {
                ...data_shop.getShopByItemId,
                weekday_opening_time: formatTime(
                    data_shop.getShopByItemId.weekday_opening_time
                ),
                weekday_closing_time: formatTime(
                    data_shop.getShopByItemId.weekday_closing_time
                ),
                weekend_opening_time: formatTime(
                    data_shop.getShopByItemId.weekend_opening_time
                ),
                weekend_closing_time: formatTime(
                    data_shop.getShopByItemId.weekend_closing_time
                ),
            };

            // Set the single formatted shop
            setShop(formattedShop);
        }
    }, [data_shop]);

    const handleUpdateQuantity = (newQuantity: number) => {
        if (itemDetails?.quantity) {
            setQuantity(
                Math.min(Math.max(newQuantity, 1), itemDetails?.quantity)
            );
        } else {
            setQuantity(Math.min(Math.max(newQuantity, 1), 1));
        }
    };

    const handleAddToCart = (item_id: number, quantity: number) => {
        addToCart(item_id, quantity);
    };

    if (loading_shop) return <p>Loading shop...</p>;
    if (error_shop) return <p>Error loading shop: {error_shop.message}</p>;

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    // Ensure item is not null before trying to render it
    if (!itemDetails) return <p>No item found.</p>;
    return (
        <div className="app-page-container ">
            <NavBar />
            <Container fluid className="h-full p-0">
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{
                        backgroundColor: "#9c9998",
                        height: "10vh",
                        width: "100%",
                    }}
                >
                    <Row className="g-0 align-items-center w-50">
                        <Col md={7}>
                            <Form.Group controlId="formGroupSearch">
                                <Form.Control
                                    type="text"
                                    placeholder="Search for a product"
                                    style={{
                                        backgroundColor: "#f0f0f0",
                                        borderRadius: "10px",
                                        width: "100%",
                                    }}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex justify-content-center">
                            <BootstrapButton
                                onClick={() =>
                                    navigate("/search", {
                                        state: {
                                            query: searchQuery,
                                        },
                                    })
                                }
                                style={{
                                    backgroundColor: "#ff720d",
                                    borderColor: "#ff720d",
                                    color: "black",
                                    borderRadius: "12px",
                                    fontWeight: "bold",
                                }}
                            >
                                Search
                            </BootstrapButton>
                        </Col>
                    </Row>
                </div>
                <Row className="d-flex justify-content-center align-items-start ">
                    <Col className="pt-4">
                        <Card>
                            <Card.Img src={itemDetails.item_image} />
                        </Card>
                    </Col>
                    <Col className="pt-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{itemDetails.name}</Card.Title>
                                <Card.Text>{itemDetails.description}</Card.Text>
                                <Card.Text>R {itemDetails.price}</Card.Text>
                                <QuantitySelector
                                    item_id={itemDetails.item_id}
                                    initialQuantity={quantity}
                                    onQuantityChange={handleUpdateQuantity}
                                />
                                <Button
                                    style={{
                                        backgroundColor: cartItems.some(
                                            (items) =>
                                                itemDetails.item_id ===
                                                items.item_id
                                        )
                                            ? "grey"
                                            : "#ed871f",
                                        borderColor: cartItems.some(
                                            (items) =>
                                                itemDetails.item_id ===
                                                items.item_id
                                        )
                                            ? "grey"
                                            : "#ed871f",

                                        color: cartItems.some(
                                            (items) =>
                                                itemDetails.item_id ===
                                                items.item_id
                                        )
                                            ? "white"
                                            : "black",
                                    }}
                                    onClick={() =>
                                        handleAddToCart(
                                            itemDetails.item_id,
                                            quantity
                                        )
                                    }
                                >
                                    {cartItems
                                        ? "Added to cart"
                                        : "Add to cart"}
                                </Button>
                                <div className="mt-4 pt-3 border-top">
                                    <Card.Text>
                                        <strong>Shop Name:</strong> {shop?.name}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Hours:</strong>
                                        <br />
                                        <span>
                                            {"Weekday: " +
                                                shop?.weekday_opening_time +
                                                " - " +
                                                shop?.weekday_closing_time}
                                        </span>
                                        <br />
                                        <span>
                                            {"Weekend: " +
                                                shop?.weekend_opening_time +
                                                " - " +
                                                shop?.weekend_closing_time}
                                        </span>
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Address:</strong>{" "}
                                        {shop?.address}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Contact number:</strong>{" "}
                                        {shop?.contact_number}
                                    </Card.Text>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ItemPage;
