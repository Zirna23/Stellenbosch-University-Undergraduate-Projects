import { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import {
    Alert,
    Button,
    Card,
    Col,
    Container,
    Form,
    Modal,
    Row,
    Table,
} from "react-bootstrap";
import "../App.css";
import "../styles/Dashboard.css";
// import { FaMapMarkerAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { GET_ORDER_ITEMS, UPDATE_ORDER_STATUS } from "../graphql/order";
import {
    GET_ITEM_BY_ID,
    GET_SHOP_BY_ITEM_ID,
    UPDATE_ITEM_STATUS,
} from "../graphql/item";
import { useUser } from "../context/UserContext";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { CREATE_NOTIFICATION } from "../graphql/notifications";

import { BrowserMultiFormatReader } from "@zxing/library"; // Barcode scanner library

type Items = {
    item_id: string;
    name: string;
    quantity: number;
    price: number;
    shop: string;
    status?: boolean;
    barcode_id: string;
};

type Item_id = {
    order_item_id: number;
    quantity: number;
    item_id: number;
    status: Boolean;
};

type ShopInfo = {
    shop_id: number;
    name: string;
    address: string;
    open: Boolean;
    contact_number: string;
    weekday_opening_time: string;
    weekday_closing_time: string;
    weekend_closing_time: string;
    weekend_opening_time: string;
};

type Order = {
    order_id: string;
    order_date: string;
    status: string;
    total_price: string;
    user_id: string;
};

declare global {
    interface Window {
        H: any;
    }
}
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

const SpecificOrderPage = () => {
    const { user } = useUser();
    const [items, setItems] = useState<Items[]>([]);
    // const [inputValue, setInputValue] = useState<string>("");
    const [showModal, setShowModal] = useState(false);
    const [shop, setShop] = useState<ShopInfo[]>([]);
    const location = useLocation();
    const orderinfo = location.state?.orderinfo || undefined;
    const [order, setOrder] = useState(orderinfo);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const isMapInitialized = useRef(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [addresses, setAddresses] = useState<string[]>();
    const [addressesFetched, setAddressesFetched] = useState(false);
    const [showError, setShowError] = useState(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBarcode(e.target.value);
    };
    const [barcode, setBarcode] = useState<string>("");
    const [showScanner, setShowScanner] = useState<boolean>(false); // Scanner modal state
    const [videoStarted, setVideoStarted] = useState<boolean>(false); // Track video status
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null); // Active camera stream
    const videoRef = useRef<HTMLVideoElement | null>(null); // Ref for the video element

    const [codeReader, setCodeReader] =
        useState<BrowserMultiFormatReader | null>(null);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        setCodeReader(reader);

        // Cleanup on component unmount
        return () => {
            stopScanner();
        };
    }, []);

    function addHoursToDate(dateString: string, hours: number): string {
        const date = new Date(dateString);
        date.setHours(date.getHours() + hours);
        return date.toISOString();
    }

    const startScanner = async () => {
        if (videoStarted || !codeReader) {
            console.log("Video already playing or scanner not initialized.");
            return; // Prevent restarting the video if it's already playing
        }

        setShowScanner(true); // Show scanner modal

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream; // Set the stream to the video element via ref
                setActiveStream(stream); // Keep track of the active stream
                setVideoStarted(true); // Mark the video as started

                const result = await codeReader.decodeOnceFromStream(
                    stream,
                    videoRef.current
                );
                setBarcode(result.getText());
                console.log("Barcode detected:", result.getText());
                stopScanner(); // Stop scanner after successful scan
            }
        } catch (err) {
            console.error(err);
            stopScanner(); // Ensure scanner is stopped in case of error
        }
    };

    const stopScanner = () => {
        if (activeStream) {
            activeStream.getTracks().forEach((track) => track.stop()); // Stop all active media tracks
            setActiveStream(null); // Clear the active stream
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null; // Clear the video source
        }

        setVideoStarted(false); // Mark video as stopped
        setShowScanner(false); // Hide scanner modal
    };

    //Get items_ids from order
    const {
        loading: itemLoading,
        error: itemError,
        data: itemData,
    } = useQuery(GET_ORDER_ITEMS, {
        variables: order ? { orderId: order.order_id } : undefined,
    });

    const [getItemById] = useLazyQuery(GET_ITEM_BY_ID);
    const [getShopById] = useLazyQuery(GET_SHOP_BY_ITEM_ID);

    useEffect(() => {
        const fetchItems = async () => {
            if (itemData && itemData.getOrderItems) {
                const itemIds = itemData.getOrderItems;
                const uniqueShops = new Set();
                const UniqueshopInfoList: ShopInfo[] = [];
                const shopAddresses: string[] = [];
                // Fetch each item by its ID and attach the corresponding quantity
                const itemPromises = itemIds.map(async (itemInfo: Item_id) => {
                    const { data: data2 } = await getShopById({
                        variables: {
                            itemId: itemInfo.item_id,
                        },
                    });

                    if (data2 && data2.getShopByItemId) {
                        const fetchedShop = data2.getShopByItemId;

                        // Return the fetched shop info
                        if (!uniqueShops.has(fetchedShop.shop_id)) {
                            uniqueShops.add(fetchedShop.shop_id);
                            UniqueshopInfoList.push({
                                shop_id: fetchedShop.shop_id,
                                name: fetchedShop.name,
                                address: fetchedShop.address,
                                open: fetchedShop.open,
                                contact_number: fetchedShop.contact_number,
                                weekday_opening_time:
                                    fetchedShop.weekday_opening_time,
                                weekday_closing_time:
                                    fetchedShop.weekday_closing_time,
                                weekend_closing_time:
                                    fetchedShop.weekend_closing_time,
                                weekend_opening_time:
                                    fetchedShop.weekend_opening_time,
                            });
                            shopAddresses.push(fetchedShop.address);
                        }

                        const { data } = await getItemById({
                            variables: {
                                itemId: itemInfo.item_id,
                            },
                        });

                        if (data && data.getItemById) {
                            const fetchedItem = data.getItemById.item;

                            // Return the fetched item with its quantity
                            return {
                                item_id: fetchedItem.item_id,
                                name: fetchedItem.name,
                                price: fetchedItem.price,
                                quantity: itemInfo.quantity,
                                shop: fetchedShop.name,
                                barcode_id: fetchedItem.barcode_id,
                                status: itemInfo.status,
                            };
                        }
                    }
                });

                // Wait for all item queries to resolve
                const fetchedItems = await Promise.all(itemPromises);

                // Filter out any undefined results and update the state with the fetched items
                setItems(fetchedItems.filter((item) => item !== undefined));

                const formatTime = (time: string | null) => {
                    if (!time) return "--:--";
                    const [hour, minute] = time.split(":");

                    if (hour === "00" && minute === "00") {
                        return "--:--";
                    }
                    return `${hour}:${minute}`;
                };

                // Process each shop to format its times
                const formattedShops = UniqueshopInfoList.map(
                    (shop: ShopInfo) => ({
                        ...shop,
                        weekday_opening_time: formatTime(
                            shop.weekday_opening_time
                        ),
                        weekday_closing_time: formatTime(
                            shop.weekday_closing_time
                        ),
                        weekend_opening_time: formatTime(
                            shop.weekend_opening_time
                        ),
                        weekend_closing_time: formatTime(
                            shop.weekend_closing_time
                        ),
                    })
                );

                // Update the state with shop information
                setShop(formattedShops);

                setAddresses((prevAddresses = []) => [
                    ...(prevAddresses || []),
                    ...(shopAddresses || []),
                ]);
                setAddressesFetched(true);
            }
        };

        fetchItems();
    }, [itemData, getItemById, getShopById]);

    const handleEdit = () => {
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setBarcode("");
    };
    const [updateItemStatus] = useMutation(UPDATE_ITEM_STATUS);
    const handleSaveChanges = () => {
        // Check if the barcode exists in the items
        const found = items.some((item) => item.barcode_id == barcode);

        if (found) {
            // If the barcode is found, update the status to true
            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.barcode_id == barcode
                        ? { ...item, status: true }
                        : item
                )
            );
            // If the barcode is found, update the status to true
            updateItemStatus({
                variables: {
                    status: true,
                    barcodeId: barcode,
                    orderId: order.order_id,
                },
            })
                .then(() => {
                    // Clear the barcode input and close the modal
                    setBarcode("");
                    setShowError(false);
                    handleClose();
                })
                .catch((error) => {
                    // Handle the error if the mutation fails
                    console.error("Error updating item status:", error);
                });
            setBarcode("");
            setShowError(false);
            handleClose();
        } else {
            setBarcode("");
            setShowError(true);
        }
    };

    const [createNotificationMutation, {}] = useMutation(CREATE_NOTIFICATION);
    const [updateOrderStatusMutation] = useMutation(UPDATE_ORDER_STATUS, {
        onCompleted: () => {
            // After the mutation completes, update the local state with the new order status
            setOrder((prevOrder: Order) => ({
                ...prevOrder,
                status: "completed",
            }));
        },
        onError: (error) => {
            console.error("Error updating order status:", error);
        },
    });

    useEffect(() => {
        //all items have been added
        if (items.length > 0 && items.every((item) => item.status === true)) {
            const {} = createNotificationMutation({
                variables: {
                    userId: order?.user_id,
                    message: `Order ${order?.order_id} is ready for pickup.`,
                },
            });

            const {} = updateOrderStatusMutation({
                variables: {
                    input: {
                        orderId: order?.order_id,
                        status: "completed",
                    },
                },
            });
        }
    }, [items, createNotificationMutation, updateOrderStatusMutation]);

    useEffect(() => {
        // Get the user's location and load the map
        if (!mapLoaded && addressesFetched) {
            getUserLocationAndRoute();
            setMapLoaded(true);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.dispose();
            }
        };
    }, [mapLoaded, addressesFetched]);

    const initializeMap = (lat: number, lng: number) => {
        loadHereMaps(async () => {
            if (window.H && mapRef.current && !isMapInitialized.current) {
                const platform = new window.H.service.Platform({
                    apikey: import.meta.env.VITE_HERE_API_KEY,
                });

                const defaultLayers = platform.createDefaultLayers();

                // Create a new map instance
                mapInstanceRef.current = new window.H.Map(
                    mapRef.current,
                    defaultLayers.vector.normal.map,
                    {
                        center: { lat, lng },
                        zoom: 14,
                    }
                );

                // to ensure you can move around in map and zoom in and out
                new window.H.mapevents.Behavior(
                    new window.H.mapevents.MapEvents(mapInstanceRef.current),
                    {
                        passive: true,
                    }
                );

                // Enable map interaction
                window.H.ui.UI.createDefault(
                    mapInstanceRef.current,
                    defaultLayers
                );

                const userCircle = new window.H.map.Circle(
                    { lat: lat, lng: lng },
                    15,
                    {
                        style: {
                            strokeColor: "red",
                            lineWidth: 2,
                            fillColor: "rgba(255, 0, 0, 1)",
                        },
                    }
                );
                mapInstanceRef.current.addObject(userCircle);

                // Mark map as initialized
                isMapInitialized.current = true;

                // Now add shop markers
                await addShopMarkers(lat, lng);
            }
        });
    };

    // Function to geocode addresses and add markers
    const addShopMarkers = async (userLat: number, userLng: number) => {
        if (mapInstanceRef.current) {
            const geocodeAddress = async (address: string) => {
                const apiKey = import.meta.env.VITE_HERE_API_KEY;
                const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
                    address
                )}&apiKey=${apiKey}`;

                return fetch(url)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.items && result.items.length > 0) {
                            const location = result.items[0].position;
                            return {
                                lat: location.lat,
                                lng: location.lng,
                            };
                        } else {
                            throw new Error("Location not found");
                        }
                    })
                    .catch((error) => {
                        console.error("Geocoding error:", error);
                    });
            };
            if (addresses) {
                const addressCoordinates = await Promise.all(
                    addresses.map((address) => geocodeAddress(address))
                );

                addressCoordinates.forEach(async (coords: any) => {
                    if (coords) {
                        const marker = new window.H.map.Marker({
                            lat: coords.lat,
                            lng: coords.lng,
                        });
                        mapInstanceRef.current.addObject(marker);

                        // Calculate and display the route from user's location to the shop
                        await calculateAndDisplayRoute(
                            userLat,
                            userLng,
                            coords.lat,
                            coords.lng
                        );
                    }
                });
            }
        }
    };

    const calculateAndDisplayRoute = async (
        userLat: number,
        userLng: number,
        shopLat: number,
        shopLng: number
    ) => {
        const routeParams = {
            transportMode: "car",
            origin: `${userLat},${userLng}`,
            destination: `${shopLat},${shopLng}`,
            return: "polyline,summary",
        };

        // Updated to use the new URL structure with the V8 API and the proxied /hereapi path
        const url = `/hereapi/v8/routes?transportMode=car&origin=${
            routeParams.origin
        }&destination=${
            routeParams.destination
        }&return=polyline,summary&apiKey=${import.meta.env.VITE_HERE_API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            //handle result
            onRouteSuccess(result);
        } catch (error) {
            onRouteError(error);
        }
    };

    // Callback function for successful route calculation
    const onRouteSuccess = (result: any) => {
        if (result.routes && result.routes.length > 0) {
            // Access the first route
            const route = result.routes[0];

            if (route.sections && route.sections.length > 0) {
                // Get the first section of the route
                const section = route.sections[0];

                // Decode the polyline
                const polyline = section.polyline;
                const decodedPolyline =
                    window.H.geo.LineString.fromFlexiblePolyline(polyline);

                // Create the polyline to display on the map
                const routeLine = new window.H.map.Polyline(decodedPolyline, {
                    style: { strokeColor: "blue", lineWidth: 5 },
                });

                // Add the polyline to the map
                mapInstanceRef.current.addObject(routeLine);

                // Optionally zoom to the route
                mapInstanceRef.current.getViewModel().setLookAtData({
                    bounds: routeLine.getBoundingBox(),
                });
            } else {
                console.error("No sections found in the route.");
            }
        } else {
            console.error("No routes found in the response.");
        }
    };

    // Callback function for route calculation errors
    const onRouteError = (error: any) => {
        console.error("Error calculating the route:", error);
    };

    // Get user's location and update map with route
    const getUserLocationAndRoute = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Initialize map with user's location
                initializeMap(latitude, longitude);
            },
            (error) => {
                console.error("Error getting the user's location", error);
                initializeMap(40.7128, -74.006);
            }
        );
    };

    if (itemLoading) return <p>Loading...</p>;
    if (itemError) return <p>Error: {itemError.message}</p>;
    return (
        <div>
            <NavBar />
            <Container fluid>
                <Col className="p-4">
                    <Row className="d-flex align-items-center justify-content-between">
                        <div key={order.order_id}>
                            <h1>Order ID: {order.order_id}</h1>
                            <hr
                                style={{
                                    borderTop: "2px solid #ccc",
                                    width: "100%",
                                }}
                            />
                            <h4 className="pt-2 d-flex align-items-center">
                                Order date:{" "}
                                {addHoursToDate(order.order_date, 4)}
                                <span
                                    style={{
                                        borderLeft: "2px solid #ccc",
                                        height: "20px",
                                        marginLeft: "10px",
                                        marginRight: "10px",
                                    }}
                                ></span>
                                <span>Order Status: {order.status}</span>
                            </h4>
                        </div>
                    </Row>
                    <h2 className="pt-3">Items</h2>
                    <div className="mt-4">
                        <Table
                            striped
                            bordered
                            hover
                            responsive
                            className="rounded custom-table"
                        >
                            <thead>
                                <tr>
                                    <th>Item ID</th>
                                    <th>Name</th>
                                    <th>Shop Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    {user?.role.role_id == 2 ||
                                    user?.role.role_id == 3 ? (
                                        <th>Action</th>
                                    ) : (
                                        <></>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.item_id}>
                                        <td>{item.item_id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.shop}</td>
                                        <td>{item.quantity}</td>
                                        <td>R{item.price.toFixed(2)}</td>

                                        {user?.role.role_id == 2 ||
                                        user?.role.role_id == 3 ? (
                                            <td>
                                                <Button
                                                    className="custom-button"
                                                    onClick={() => handleEdit()}
                                                    style={{
                                                        backgroundColor:
                                                            item.status ===
                                                                true ||
                                                            order.status ==
                                                                "completed"
                                                                ? "#ccc"
                                                                : "#ed871f",
                                                        borderColor:
                                                            item.status ===
                                                                true ||
                                                            order.status ==
                                                                "completed"
                                                                ? "#ccc"
                                                                : "#ed871f",
                                                        color:
                                                            item.status ===
                                                                true ||
                                                            order.status ==
                                                                "completed"
                                                                ? "grey"
                                                                : "black",
                                                    }}
                                                    disabled={
                                                        item.status === true ||
                                                        order.status ==
                                                            "completed"
                                                    }
                                                >
                                                    {item.status === true ||
                                                    order.status == "completed"
                                                        ? "Item Added"
                                                        : "Add item"}
                                                </Button>
                                            </td>
                                        ) : (
                                            <></>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    <hr
                        style={{
                            borderTop: "2px solid #ccc",
                            width: "100%",
                        }}
                    />
                    <Card className="p-3">
                        <Card.Body>
                            <Card.Title className="pb-2">
                                Shop Information
                            </Card.Title>
                            <Row>
                                {shop.map((shop, index) => (
                                    <Col
                                        key={index}
                                        md={6}
                                        sm={12}
                                        className="mb-3"
                                    >
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>
                                                    {shop.name}
                                                </Card.Title>
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
                                                    {shop.address}
                                                </Card.Text>
                                                <Card.Text>
                                                    <strong>
                                                        Contact number:
                                                    </strong>{" "}
                                                    {shop.contact_number}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                    <hr
                        style={{
                            borderTop: "2px solid #ccc",
                            width: "100%",
                        }}
                    />
                    <Card className="p-3">
                        <Card.Body key={order.order_id}>
                            <Card.Title className="pb-2">
                                Order Summary
                            </Card.Title>
                            <Card.Text>
                                Subtotal
                                <span className="float-end">
                                    R {order.total_price - 5}
                                </span>
                            </Card.Text>
                            <Card.Text>
                                Service fee
                                <span className="float-end">R 5</span>
                            </Card.Text>
                            <Card.Text className="fw-bold">
                                Total
                                <span className="float-end">
                                    R {parseFloat(order.total_price)}
                                </span>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    <hr
                        style={{
                            borderTop: "2px solid #ccc",
                            width: "100%",
                        }}
                    />
                    <h2 className="pt-3">Suggested Route</h2>
                    <div className="pt-3">
                        <div
                            ref={mapRef}
                            id="here-map"
                            style={{
                                width: "100%",
                                height: "500px",
                                border: "2px dashed #ccc",
                            }}
                        ></div>
                    </div>
                </Col>
            </Container>
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formBarcode">
                            <Form.Label>Scanned Barcode</Form.Label>
                            <Form.Control
                                type="text"
                                value={barcode}
                                onChange={handleInputChange}
                                placeholder="Enter or Scan Barcode"
                            />
                        </Form.Group>

                        <div>
                            {/* Button to open scanner modal */}
                            <Button
                                style={{
                                    backgroundColor: "#ed871f",
                                    borderColor: "#ed871f",
                                    color: "black",
                                }}
                                onClick={startScanner}
                                variant="primary"
                                className="mt-3"
                            >
                                Start Barcode Scan
                            </Button>

                            {showError && (
                                <Alert
                                    variant="danger"
                                    onClose={() => setShowError(false)}
                                    dismissible
                                    className="mt-3 alert-compatct"
                                >
                                    <p className="mb-0">Incorrect Barcode!</p>
                                </Alert>
                            )}

                            {/* Modal for camera feed */}
                            <Modal
                                show={showScanner}
                                onHide={stopScanner}
                                centered
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title>Scan Barcode</Modal.Title>
                                </Modal.Header>
                                <Modal.Body style={{ position: "relative" }}>
                                    {/* Video element for scanner */}
                                    <video
                                        ref={videoRef}
                                        id="scanner"
                                        style={{
                                            width: "100%",
                                            height: "300px",
                                        }}
                                        autoPlay
                                        muted
                                    />

                                    {/* Overlay a horizontal line in the center */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: 0,
                                            right: 0,
                                            height: "2px",
                                            backgroundColor: "red",
                                            transform: "translateY(-50%)",
                                            pointerEvents: "none", // Ensure this doesn't block video clicks
                                        }}
                                    />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        variant="secondary"
                                        onClick={stopScanner}
                                    >
                                        Cancel
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSaveChanges}>
                        Save changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SpecificOrderPage;
