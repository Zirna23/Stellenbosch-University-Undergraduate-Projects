import { useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Collapse,
    Button,
    ButtonGroup,
    ToggleButton,
    Spinner,
} from "react-bootstrap";
import NavBar from "../components/NavBar";
import Categories from "../components/Categories";
import { useEffect, useState } from "react";
import "../styles/homepage.css";
import { SEARCH_ITEMS, GET_SHOP_BY_ITEM_ID } from "../graphql/item";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useCart } from "../context/CartContext";
// import { useUser } from "../context/UserContext";

type ItemType = {
    item_id: number;
    name: string;
    description: string;
    price: string;
    shopName: string;
    item_image: string;
    distance?: number;
};

type ShopDistanceType = {
    shop_id: string;
    distance: number;
};

const loadHereMaps = (callback: () => void) => {
    const existingScript = document.getElementById("here-maps");

    if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://js.api.here.com/v3/3.1/mapsjs-core.js";
        script.id = "here-maps";
        document.body.appendChild(script);

        script.onload = () => {
            const serviceScript = document.createElement("script");
            serviceScript.src =
                "https://js.api.here.com/v3/3.1/mapsjs-service.js";
            document.body.appendChild(serviceScript);

            const uiScript = document.createElement("script");
            uiScript.src = "https://js.api.here.com/v3/3.1/mapsjs-ui.js";
            document.body.appendChild(uiScript);

            const eventsScript = document.createElement("script");
            eventsScript.src =
                "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js";
            document.body.appendChild(eventsScript);

            eventsScript.onload = () => {
                callback();
            };
        };
    } else {
        callback();
    }
};

const HomePage = () => {
    const navigate = useNavigate();
    const [allItems, setAllItems] = useState<ItemType[]>([]);
    const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
    const [open, setOpen] = useState(false);
    const [radius, setRadius] = useState(2);
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchQuery, setSearchQuery] = useState("");
    const [shopDistances, setShopDistances] = useState<ShopDistanceType[]>([]);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [loadingIcon, setLoadingIcon] = useState(false);
    // const { user } = useUser();
    // State to track the items that have been added to the cart
    const { cartItems, addToCart } = useCart();

    // Fetch all items with an empty string query
    const { loading, error, data } = useQuery(SEARCH_ITEMS, {
        variables: { query: "" },
        pollInterval: 10000,
    });

    // Update the state when the data is fetched
    useEffect(() => {
        if (data && data.searchItems) {
            setAllItems(data.searchItems);
            setFilteredItems(data.searchItems);
        }
    }, [data]);

    const handleAddToCart = (item_id: number, quantity: number) => {
        addToCart(item_id, quantity);
    };

    const categories = [
        {
            label: "Food and Beverages",
            path: "/search",
            category_id: 1,
        },
        {
            label: "Household Essentials",
            path: "/search",
            category_id: 2,
        },
        {
            label: "Pet Supplies",
            path: "/search",
            category_id: 3,
        },
        {
            label: "Electronics and Office Supplies",
            path: "/search",
            category_id: 4,
        },
        {
            label: "Clothing and Seasonal Items",
            path: "/search",
            category_id: 5,
        },
    ];

    useEffect(() => {
        if (!userLocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error("Error getting user location:", error);
                }
            );
        }
    }, []);

    const [getShopById] = useLazyQuery(GET_SHOP_BY_ITEM_ID);

    const handleFilterSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the default form submission behavior that causes a page reload
        event.preventDefault();

        // Call the function to calculate the shop distances
        shopDistance();
        setOpen(false);
    };

    const shopDistance = async () => {
        try {
            if (!userLocation) {
                console.error("User location not found");
                return;
            }
            setLoadingIcon(true);

            loadHereMaps(async () => {
                const updatedShopDistances: (ItemType & {
                    distance: number;
                })[] = [];

                let localShopDistances = [...shopDistances];

                // Process each item sequentially
                for (const item of allItems) {
                    // Fetch shop info
                    const { data: shopData } = await getShopById({
                        variables: { itemId: item.item_id },
                    });

                    if (shopData && shopData.getShopByItemId) {
                        const shopAddress = shopData.getShopByItemId.address;
                        const shopId = shopData.getShopByItemId.shop_id;

                        // Now check if shop_id is already in shopDistances
                        const existingDistance = localShopDistances.find(
                            (distanceObj: ShopDistanceType) =>
                                distanceObj.shop_id == shopId
                        );

                        if (existingDistance) {
                            // If distance exists, use the cached value
                            updatedShopDistances.push({
                                ...item,
                                distance: existingDistance.distance,
                            });
                        } else {
                            // If no cached distance, fetch the geocode and route information

                            const geocodeUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
                                shopAddress
                            )}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`;

                            const geocodeResponse = await fetch(geocodeUrl);
                            const geocodeData = await geocodeResponse.json();

                            if (
                                geocodeData.items &&
                                geocodeData.items.length > 0
                            ) {
                                const shopLocation =
                                    geocodeData.items[0].position;

                                const routeUrl = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${
                                    userLocation.lat
                                },${userLocation.lng}&destination=${
                                    shopLocation.lat
                                },${shopLocation.lng}&return=summary&apiKey=${
                                    import.meta.env.VITE_HERE_API_KEY
                                }`;

                                const routeResponse = await fetch(routeUrl);
                                const routeData = await routeResponse.json();

                                if (
                                    routeData.routes &&
                                    routeData.routes[0].sections[0].summary
                                        .length
                                ) {
                                    const distanceInKm =
                                        routeData.routes[0].sections[0].summary
                                            .length / 1000;

                                    localShopDistances.push({
                                        shop_id: shopId,
                                        distance: distanceInKm,
                                    });

                                    // Cache the newly fetched distance
                                    setShopDistances((prevDistances) => [
                                        ...prevDistances,
                                        {
                                            shop_id: shopId,
                                            distance: distanceInKm,
                                        },
                                    ]);

                                    updatedShopDistances.push({
                                        ...item,
                                        distance: distanceInKm,
                                    });
                                }
                            }
                        }
                    } else {
                        // If unable to fetch distance, return item with Infinity distance
                        updatedShopDistances.push({
                            ...item,
                            distance: Infinity,
                        });
                    }
                }

                // Filter items within the radius
                let filteredItems = updatedShopDistances.filter(
                    (item) => item.distance <= radius
                );

                // Sort the filtered items based on sortOrder
                if (sortOrder === "asc") {
                    filteredItems = filteredItems.sort(
                        (a, b) => a.distance - b.distance
                    );
                } else if (sortOrder === "desc") {
                    filteredItems = filteredItems.sort(
                        (a, b) => b.distance - a.distance
                    );
                }

                // Set filtered items
                setFilteredItems(filteredItems);
                setLoadingIcon(false);
            });
        } catch (error) {
            console.error("Error fetching shop distances:", error);
            setLoadingIcon(false);
        }
    };

    // Component to fetch and display the shop name for each item
    const ShopNameDisplay = ({ itemId }: { itemId: number }) => {
        const { loading, error, data } = useQuery(GET_SHOP_BY_ITEM_ID, {
            variables: { itemId },
        });

        if (loading) return <span>Loading shop...</span>;
        if (error) return <span>Error loading shop: {error.message}</span>;

        return <span>Shop: {data.getShopByItemId.name}</span>;
    };

    return (
        <div className="home-page-container">
            <NavBar />

            <Container fluid className="h-100">
                {loadingIcon && (
                    <div
                        className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                        style={{ zIndex: 1050 }}
                    >
                        <Spinner
                            animation="border"
                            role="status"
                            variant="light"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                )}
                <Row>
                    <Categories categories={categories} />{" "}
                    {/* Sidebar with Categories */}
                    <Col md={10}>
                        <div className="indent-wrapper-homepage d-flex flex-column justify-content-end align-items-center pb-3">
                            <h1 className="text-center mb-4">
                                Welcome to Spaza Shop
                            </h1>
                            <Row className="g-0 align-items-center justify-content-center w-50 pb-3">
                                <Col md={8}>
                                    <Form.Group controlId="formGroupSearch">
                                        <Form.Control
                                            required
                                            type="text"
                                            placeholder="What can we help you find?"
                                            style={{
                                                backgroundColor: "#f0f0f0",
                                                borderRadius: "10px",
                                                width: "100%",
                                            }}
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                        ></Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="g-0 align-items-center justify-content-center w-100 pb-3">
                                <Col md="auto" className="mx-3">
                                    <Button
                                        style={{
                                            backgroundColor: "#d9d6d4",
                                            borderColor: "#d9d6d4",
                                            color: "black",
                                            borderRadius: "12px",
                                            fontWeight: "bold",
                                            width: "15vw",
                                        }}
                                        onClick={() =>
                                            navigate("/search", {
                                                state: {
                                                    query: searchQuery,
                                                    cart_items: cartItems,
                                                },
                                            })
                                        }
                                    >
                                        Search
                                    </Button>
                                </Col>
                                <Col md="auto" className="mx-3">
                                    <Button
                                        style={{
                                            backgroundColor: "#d9d6d4",
                                            borderColor: "#d9d6d4",
                                            color: "black",
                                            borderRadius: "12px",
                                            fontWeight: "bold",
                                            width: "9vw",
                                        }}
                                        onClick={() => setOpen(!open)}
                                    >
                                        Filter
                                    </Button>
                                </Col>
                            </Row>
                            <div
                                style={{ position: "relative", width: "100%" }}
                            >
                                <Collapse in={open}>
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            width: "30%",
                                            backgroundColor: "#f0f0f0",
                                            borderRadius: "10px",
                                            boxShadow:
                                                "0 4px 8px rgba(0, 0, 0, 0.1)",
                                            zIndex: 1000,
                                        }}
                                    >
                                        <Card body className="mx-auto">
                                            <Form>
                                                <Form.Group controlId="formFilterRadius">
                                                    <Form.Label>
                                                        Shop Radius (km)
                                                    </Form.Label>
                                                    <Form.Range
                                                        min={1}
                                                        max={5}
                                                        value={radius}
                                                        onChange={(e) =>
                                                            setRadius(
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    />
                                                    <Form.Text>
                                                        {radius} km
                                                    </Form.Text>
                                                </Form.Group>
                                                <Form.Group className="mt-3">
                                                    <Form.Label>
                                                        Sort by Radius
                                                    </Form.Label>
                                                    <ButtonGroup className="d-flex">
                                                        <ToggleButton
                                                            id="asc button"
                                                            type="radio"
                                                            variant="outline-primary"
                                                            name="sortOrder"
                                                            value="asc"
                                                            checked={
                                                                sortOrder ===
                                                                "asc"
                                                            }
                                                            onChange={() =>
                                                                setSortOrder(
                                                                    "asc"
                                                                )
                                                            }
                                                        >
                                                            Ascending
                                                        </ToggleButton>
                                                        <ToggleButton
                                                            id="desc button"
                                                            type="radio"
                                                            variant="outline-primary"
                                                            name="sortOrder"
                                                            value="desc"
                                                            checked={
                                                                sortOrder ===
                                                                "desc"
                                                            }
                                                            onChange={() =>
                                                                setSortOrder(
                                                                    "desc"
                                                                )
                                                            }
                                                        >
                                                            Descending
                                                        </ToggleButton>
                                                    </ButtonGroup>
                                                </Form.Group>
                                                <Button
                                                    variant="primary"
                                                    type="submit"
                                                    style={{
                                                        marginTop: "10px",
                                                    }}
                                                    onClick={(
                                                        e: React.MouseEvent<HTMLButtonElement>
                                                    ) => handleFilterSubmit(e)}
                                                >
                                                    Apply Filters
                                                </Button>
                                            </Form>
                                        </Card>
                                    </div>
                                </Collapse>
                            </div>
                        </div>
                        <h1 className="text-left pt-2">Explore Items</h1>
                        <div className="explore-items">
                            {loading ? (
                                <p>Loading items...</p>
                            ) : error ? (
                                <p>Error: {error.message}</p>
                            ) : (
                                <Row className="d-flex justify-content-center align-items-center">
                                    {filteredItems.length === 0 ? (
                                        <p>
                                            No items found within the selected
                                            radius.
                                        </p>
                                    ) : (
                                        filteredItems.map((item, index) => (
                                            <Col key={index}>
                                                <Card
                                                    style={{
                                                        width: "18rem",
                                                        cursor: "pointer",
                                                        margin: "0.8rem",
                                                    }}
                                                >
                                                    <Card.Img
                                                        variant="top"
                                                        src={item.item_image}
                                                        className="table-image"
                                                        onClick={() =>
                                                            navigate("/item", {
                                                                state: {
                                                                    itemID: item.item_id,
                                                                },
                                                            })
                                                        }
                                                    />
                                                    <Card.Body>
                                                        <Card.Title
                                                            onClick={() =>
                                                                navigate(
                                                                    "/item",
                                                                    {
                                                                        state: {
                                                                            itemID: item.item_id,
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            {item.name}
                                                        </Card.Title>
                                                        <Card.Text
                                                            onClick={() =>
                                                                navigate(
                                                                    "/item",
                                                                    {
                                                                        state: {
                                                                            itemID: item.item_id,
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            R {item.price}
                                                        </Card.Text>
                                                        <Card.Text
                                                            onClick={() =>
                                                                navigate(
                                                                    "/item",
                                                                    {
                                                                        state: {
                                                                            itemID: item.item_id,
                                                                        },
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            <ShopNameDisplay
                                                                itemId={
                                                                    item.item_id
                                                                }
                                                            />
                                                        </Card.Text>
                                                        <Button
                                                            style={{
                                                                backgroundColor:
                                                                    cartItems.some(
                                                                        (
                                                                            items
                                                                        ) =>
                                                                            item.item_id ===
                                                                            items.item_id
                                                                    )
                                                                        ? "grey"
                                                                        : "#ed871f",
                                                                borderColor:
                                                                    cartItems.some(
                                                                        (
                                                                            items
                                                                        ) =>
                                                                            item.item_id ===
                                                                            items.item_id
                                                                    )
                                                                        ? "grey"
                                                                        : "#ed871f",

                                                                color: cartItems.some(
                                                                    (items) =>
                                                                        item.item_id ===
                                                                        items.item_id
                                                                )
                                                                    ? "white"
                                                                    : "black",
                                                            }}
                                                            onClick={() =>
                                                                handleAddToCart(
                                                                    item.item_id,
                                                                    1
                                                                )
                                                            }
                                                        >
                                                            {cartItems.some(
                                                                (items) =>
                                                                    item.item_id ===
                                                                    items.item_id
                                                            )
                                                                ? "Added to cart"
                                                                : "Add to cart"}
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))
                                    )}
                                </Row>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HomePage;
