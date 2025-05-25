import { useEffect, useState } from "react";
import {
    Container,
    Button,
    Row,
    Col,
    Form,
    Table,
    Modal,
} from "react-bootstrap";
import NavAsideDash from "../components/NavAsideDash";
import NavBar from "../components/NavBar";
import "../styles/ShopInfo.css";

import { useMutation, useQuery } from "@apollo/client";
import { useUser } from "../context/UserContext";
import { GET_USER_SHOPS } from "../graphql/user";
import { UPDATE_SHOP, CREATE_SHOP } from "../graphql/shop";
import { ASSIGN_USER_TO_SHOP } from "../graphql/user";

type Shop = {
    shop_id: number;
    name: string;
    address: string;
    open: Boolean;
    contact_number: string;
    weekday_opening_time: string;
    weekday_closing_time: string;
    weekend_opening_time: string;
    weekend_closing_time: string;
};

const ShopInfo = () => {
    const { user } = useUser();

    // State to hold shops and modals
    const [shops, setShops] = useState<Shop[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [name, setName] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [contactNumber, setContactNumber] = useState<string>("");
    const [shopStatus, setShopStatus] = useState<Boolean>(true);
    const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);
    const [phoneMessage, setPhoneMessage] = useState("");
    const [weekdayHours, setWeekdayHours] = useState({
        openHour: "",
        openMinute: "",
        closeHour: "",
        closeMinute: "",
    });
    const [weekendHours, setWeekendHours] = useState({
        openHour: "",
        openMinute: "",
        closeHour: "",
        closeMinute: "",
    });
    const [hoursMessage, setHoursMessage] = useState("");
    const [isHoursInvalid, setIsHoursInvalid] = useState(false);

    // Fetch all shops for the user (admin)
    const {
        loading: shop_loading,
        error: shop_error,
        data: shop_data,
        refetch,
    } = useQuery(GET_USER_SHOPS, {
        variables: user ? { userId: user.user_id } : undefined,
    });

    // Update shops list when the shop data changes
    useEffect(() => {
        if (shop_data && shop_data.getUserShops) {
            // Helper function to format time
            const formatTime = (time: string | null) => {
                if (!time) return "--:--";
                const [hour, minute] = time.split(":");

                if (hour === "00" && minute === "00") {
                    return "--:--";
                }
                return `${hour}:${minute}`;
            };

            // Process each shop to format its times
            const formattedShops = shop_data.getUserShops.map((shop: Shop) => ({
                ...shop,
                weekday_opening_time: formatTime(shop.weekday_opening_time),
                weekday_closing_time: formatTime(shop.weekday_closing_time),
                weekend_opening_time: formatTime(shop.weekend_opening_time),
                weekend_closing_time: formatTime(shop.weekend_closing_time),
            }));

            // Set all shops associated with the user, with formatted times
            setShops(formattedShops);
        }
    }, [shop_data]);

    const [createShop] = useMutation(CREATE_SHOP);
    const [assignUserToShop] = useMutation(ASSIGN_USER_TO_SHOP);
    const [updateShopMutation] = useMutation(UPDATE_SHOP);

    // Handle Edit button click
    const handleButtonClick = (shop: Shop) => {
        setSelectedShop({ ...shop });
        setName(shop.name);
        setAddress(shop.address);
        setContactNumber(shop.contact_number);
        setShopStatus(shop.open);

        const formatTime = (hour: string, minute: string) => {
            // If both hour and minute are '00', return '--'
            if (hour === "00" && minute === "00") {
                return { hour: "--", minute: "--" };
            }
            return { hour, minute };
        };
        // Weekday hours
        const weekdayOpen = formatTime(
            shop?.weekday_opening_time?.split(":")[0] || "",
            shop?.weekday_opening_time?.split(":")[1] || ""
        );
        const weekdayClose = formatTime(
            shop?.weekday_closing_time?.split(":")[0] || "",
            shop?.weekday_closing_time?.split(":")[1] || ""
        );

        // Weekend hours
        const weekendOpen = formatTime(
            shop?.weekend_opening_time?.split(":")[0] || "",
            shop?.weekend_opening_time?.split(":")[1] || ""
        );
        const weekendClose = formatTime(
            shop?.weekend_closing_time?.split(":")[0] || "",
            shop?.weekend_closing_time?.split(":")[1] || ""
        );

        setWeekdayHours({
            openHour: weekdayOpen.hour,
            openMinute: weekdayOpen.minute,
            closeHour: weekdayClose.hour,
            closeMinute: weekdayClose.minute,
        });

        setWeekendHours({
            openHour: weekendOpen.hour,
            openMinute: weekendOpen.minute,
            closeHour: weekendClose.hour,
            closeMinute: weekendClose.minute,
        });
        setShowModal(true);
    };

    // Close Modals
    const handleClose = () => {
        setShowModal(false);
        setShowCreateModal(false);
        setSelectedShop(null);
    };

    const handleNumberValidation = (phone: string) => {
        const regex = /^\d{3}\s?\d{3}\s?\d{4}$/;

        if (phone === "") {
            setPhoneMessage("Please enter your phone number.");
            setIsPhoneInvalid(true); // Set as invalid
        } else if (!regex.test(phone)) {
            setIsPhoneInvalid(true);
            setPhoneMessage("Please enter a 10 digit phone number.");
        } else {
            setPhoneMessage("");
            setIsPhoneInvalid(false); // Set as valid if regex matches
        }
    };

    const handleSaveChanges = async () => {
        if (isPhoneInvalid) {
            return;
        }
        const formatTime = (hour: string, minute: string) => {
            // If either hour or minute is '--', return '--:--'
            if (hour === "--" || minute === "--") {
                hour = "00";
                minute = "00";
            }

            // Ensure 2-digit format for hour and minute
            const formattedHour = hour.padStart(2, "0");
            const formattedMinute = minute.padStart(2, "0");

            // Return formatted time wrapped in quotes
            return `"${formattedHour}:${formattedMinute}"`;
        };

        const weekdayOpeningTime = String(
            formatTime(weekdayHours.openHour, weekdayHours.openMinute)
        );
        const weekdayClosingTime = String(
            formatTime(weekdayHours.closeHour, weekdayHours.closeMinute)
        );
        const weekendOpeningTime = String(
            formatTime(weekendHours.openHour, weekendHours.openMinute)
        );
        const weekendClosingTime = String(
            formatTime(weekendHours.closeHour, weekendHours.closeMinute)
        );

        console.log(weekdayHours);
        if (selectedShop) {
            try {
                await updateShopMutation({
                    variables: {
                        shopId: selectedShop.shop_id,
                        name,
                        address,
                        open: shopStatus,
                        contactNumber,
                        weekdayOpeningTime,
                        weekdayClosingTime,
                        weekendOpeningTime,
                        weekendClosingTime,
                    },
                });
                setShowModal(false);
                setSelectedShop(null);
                // Refetch all shops after update
                refetch();
            } catch (error) {
                console.error("Error updating shop info:", error);
            }
        }
    };

    const handleCreateShop = async () => {
        handleNumberValidation(contactNumber);
        handleHoursValidation(weekdayHours);
        handleHoursValidation(weekendHours);

        if (isPhoneInvalid || isHoursInvalid) {
            return;
        }

        if (user == null) {
            alert("Please login first");
            return;
        }

        try {
            console.log("Creating shop...");

            // Generate time strings in 'HH:mm' format
            const formatTime = (hour: string, minute: string) => {
                // If either hour or minute is '--', return '--:--'
                if (hour === "--" || minute === "--") {
                    hour = "00";
                    minute = "00";
                }

                // Ensure 2-digit format for hour and minute
                const formattedHour = hour.padStart(2, "0");
                const formattedMinute = minute.padStart(2, "0");

                // Return formatted time wrapped in quotes
                return `"${formattedHour}:${formattedMinute}"`;
            };

            const weekdayOpeningTime = String(
                formatTime(weekdayHours.openHour, weekdayHours.openMinute)
            );
            const weekdayClosingTime = String(
                formatTime(weekdayHours.closeHour, weekdayHours.closeMinute)
            );
            const weekendOpeningTime = String(
                formatTime(weekendHours.openHour, weekendHours.openMinute)
            );
            const weekendClosingTime = String(
                formatTime(weekendHours.closeHour, weekendHours.closeMinute)
            );

            // Call mutation with the times
            const shopResponse = await createShop({
                variables: {
                    ownerId: user.user_id,
                    address,
                    name,
                    weekdayOpeningTime,
                    weekdayClosingTime,
                    weekendOpeningTime,
                    weekendClosingTime,
                    contactNumber,
                    open: true,
                },
            });

            const shopId = shopResponse?.data?.createShop?.shop?.shop_id;

            if (!shopId) {
                throw new Error("Shop ID not found in the createShop response");
            }

            // Assign user to the newly created shop
            await assignUserToShop({
                variables: {
                    userId: user.user_id,
                    shopId,
                    roleId: 3.0, // Assuming 3.0 is the shop owner role ID
                },
            });

            // Refetch the list of shops for the user
            await refetch(); // Refetch the `GET_USER_SHOPS` query to update the shop list

            setShowCreateModal(false);
            console.log("Shop created successfully");
        } catch (error) {
            console.error("Error creating shop and assigning user:", error);
        }
    };

    const handleHoursValidation = (hours: {
        openHour: string;
        openMinute: string;
        closeHour: string;
        closeMinute: string;
    }) => {
        const hourRegex = /^(--|([01]?[0-9]|2[0-3]))$/;
        const minuteRegex = /^(--|[0-5][0-9])$/;

        if (
            !hourRegex.test(hours.openHour) ||
            !minuteRegex.test(hours.openMinute) ||
            !hourRegex.test(hours.closeHour) ||
            !minuteRegex.test(hours.closeMinute)
        ) {
            setHoursMessage("Please enter valid hours and minutes.");
            setIsHoursInvalid(true);
        } else {
            setHoursMessage("");
            setIsHoursInvalid(false);
        }
    };

    if (shop_loading) return <p>Loading...</p>;
    if (shop_error) return <p>Error: {shop_error.message}</p>;

    return (
        <div>
            <NavBar />
            <Container fluid>
                <Row>
                    <NavAsideDash />
                    <Col md={10} className="p-4">
                        <h1>Shop Information</h1>

                        {/* Shop Info Table */}
                        <Table
                            striped
                            bordered
                            hover
                            responsive
                            className="rounded custom-table mt-4"
                        >
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Address</th>
                                    <th>Contact Number</th>
                                    <th style={{ width: "21vw" }}>
                                        Shop Hours
                                    </th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shops.map((shop) => (
                                    <tr key={shop.shop_id}>
                                        <td>{shop.name}</td>
                                        <td>{shop.address}</td>
                                        <td>{shop.contact_number}</td>
                                        <td className="d-flex flex-wrap">
                                            {/* Weekday Hours Input */}
                                            <div className="mb-3 rounded">
                                                <Form.Group controlId="weekdayHours">
                                                    <Form.Label>
                                                        Weekday Hours
                                                    </Form.Label>
                                                    <div className="d-flex">
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            placeholder="HH"
                                                            value={
                                                                shop?.weekday_opening_time?.split(
                                                                    ":"
                                                                )[0] || ""
                                                            }
                                                            onChange={(e) => {
                                                                const updatedValue =
                                                                    e.target.value.slice(
                                                                        0,
                                                                        2
                                                                    );
                                                                setWeekdayHours(
                                                                    {
                                                                        ...weekdayHours,
                                                                        openHour:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                                handleHoursValidation(
                                                                    {
                                                                        ...weekdayHours,
                                                                        openHour:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                            }}
                                                            style={{
                                                                minWidth:
                                                                    "40px",
                                                                color: "black",
                                                            }}
                                                            maxLength={2}
                                                        />
                                                        <span>:</span>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            placeholder="MM"
                                                            value={
                                                                shop?.weekday_opening_time?.split(
                                                                    ":"
                                                                )[1] || ""
                                                            }
                                                            onChange={(e) => {
                                                                const updatedValue =
                                                                    e.target.value.slice(
                                                                        0,
                                                                        2
                                                                    );
                                                                setWeekdayHours(
                                                                    {
                                                                        ...weekdayHours,
                                                                        openMinute:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                                handleHoursValidation(
                                                                    {
                                                                        ...weekdayHours,
                                                                        openMinute:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                            }}
                                                            style={{
                                                                minWidth:
                                                                    "40px",
                                                                color: "black",
                                                            }}
                                                            maxLength={2}
                                                        />
                                                        <span>-</span>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            placeholder="HH"
                                                            value={
                                                                shop?.weekday_closing_time?.split(
                                                                    ":"
                                                                )[0] || ""
                                                            }
                                                            onChange={(e) => {
                                                                const updatedValue =
                                                                    e.target.value.slice(
                                                                        0,
                                                                        2
                                                                    );
                                                                setWeekdayHours(
                                                                    {
                                                                        ...weekdayHours,
                                                                        closeHour:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                                handleHoursValidation(
                                                                    {
                                                                        ...weekdayHours,
                                                                        closeHour:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                            }}
                                                            style={{
                                                                minWidth:
                                                                    "40px",
                                                                color: "black",
                                                            }}
                                                            maxLength={2}
                                                        />
                                                        <span>:</span>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            placeholder="MM"
                                                            value={
                                                                shop?.weekday_closing_time?.split(
                                                                    ":"
                                                                )[1] || ""
                                                            }
                                                            onChange={(e) => {
                                                                const updatedValue =
                                                                    e.target.value.slice(
                                                                        0,
                                                                        2
                                                                    );
                                                                setWeekdayHours(
                                                                    {
                                                                        ...weekdayHours,
                                                                        closeMinute:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                                handleHoursValidation(
                                                                    {
                                                                        ...weekdayHours,
                                                                        closeMinute:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                            }}
                                                            style={{
                                                                minWidth:
                                                                    "40px",
                                                                color: "black",
                                                            }}
                                                            maxLength={2}
                                                        />
                                                    </div>
                                                    {isHoursInvalid && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                            }}
                                                        >
                                                            {hoursMessage}
                                                        </div>
                                                    )}
                                                </Form.Group>
                                            </div>

                                            {/* Weekend Hours Input */}
                                            <div className="mb-3 rounded d-flex flex-wrap">
                                                <Form.Group controlId="weekendHours">
                                                    <Form.Label>
                                                        Weekend Hours
                                                    </Form.Label>
                                                    <div className="d-flex">
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            placeholder="HH"
                                                            value={
                                                                shop?.weekend_opening_time?.split(
                                                                    ":"
                                                                )[0] || ""
                                                            }
                                                            onChange={(e) => {
                                                                const updatedValue =
                                                                    e.target.value.slice(
                                                                        0,
                                                                        2
                                                                    );
                                                                setWeekendHours(
                                                                    {
                                                                        ...weekendHours,
                                                                        openHour:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                                handleHoursValidation(
                                                                    {
                                                                        ...weekendHours,
                                                                        openHour:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                            }}
                                                            style={{
                                                                minWidth:
                                                                    "40px",
                                                                color: "black",
                                                            }}
                                                            maxLength={2}
                                                        />
                                                        <span>:</span>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            placeholder="MM"
                                                            value={
                                                                shop?.weekend_opening_time?.split(
                                                                    ":"
                                                                )[1] || ""
                                                            }
                                                            onChange={(e) => {
                                                                const updatedValue =
                                                                    e.target.value.slice(
                                                                        0,
                                                                        2
                                                                    );
                                                                setWeekendHours(
                                                                    {
                                                                        ...weekendHours,
                                                                        openMinute:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                                handleHoursValidation(
                                                                    {
                                                                        ...weekendHours,
                                                                        openMinute:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                            }}
                                                            style={{
                                                                minWidth:
                                                                    "40px",
                                                                color: "black",
                                                            }}
                                                            maxLength={2}
                                                        />
                                                        <span>-</span>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            placeholder="HH"
                                                            value={
                                                                shop?.weekend_closing_time?.split(
                                                                    ":"
                                                                )[0] || ""
                                                            }
                                                            onChange={(e) => {
                                                                const updatedValue =
                                                                    e.target.value.slice(
                                                                        0,
                                                                        2
                                                                    );
                                                                setWeekendHours(
                                                                    {
                                                                        ...weekendHours,
                                                                        closeHour:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                                handleHoursValidation(
                                                                    {
                                                                        ...weekendHours,
                                                                        closeHour:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                            }}
                                                            style={{
                                                                minWidth:
                                                                    "40px",
                                                                color: "black",
                                                            }}
                                                            maxLength={2}
                                                        />
                                                        <span>:</span>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            placeholder="MM"
                                                            value={
                                                                shop?.weekend_closing_time?.split(
                                                                    ":"
                                                                )[1] || ""
                                                            }
                                                            onChange={(e) => {
                                                                const updatedValue =
                                                                    e.target.value.slice(
                                                                        0,
                                                                        2
                                                                    );
                                                                setWeekendHours(
                                                                    {
                                                                        ...weekendHours,
                                                                        closeMinute:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                                handleHoursValidation(
                                                                    {
                                                                        ...weekendHours,
                                                                        closeMinute:
                                                                            updatedValue,
                                                                    }
                                                                );
                                                            }}
                                                            style={{
                                                                minWidth:
                                                                    "40px",
                                                                color: "black",
                                                            }}
                                                            maxLength={2}
                                                        />
                                                    </div>
                                                    {isHoursInvalid && (
                                                        <div
                                                            style={{
                                                                color: "red",
                                                            }}
                                                        >
                                                            {hoursMessage}
                                                        </div>
                                                    )}
                                                </Form.Group>
                                            </div>
                                        </td>

                                        <td>
                                            <Button
                                                className="custom-button"
                                                style={{
                                                    backgroundColor: "#ed871f",
                                                    color: "black",
                                                    border: "none", // Remove border completely
                                                }}
                                                onClick={() =>
                                                    handleButtonClick(shop)
                                                }
                                            >
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Add Shop Button Below Table */}
                        <div className="d-flex justify-content-start mt-4">
                            <Button
                                className="custom-button"
                                style={{
                                    backgroundColor: "#ed871f",
                                    color: "black",
                                    border: "none", // Remove border completely
                                }}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Add Shop
                            </Button>
                        </div>

                        {/* Edit Shop Modal */}
                        <Modal
                            show={showModal}
                            onHide={handleClose}
                            centered
                            size="lg"
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Shop</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {selectedShop && (
                                    <Form>
                                        <Form.Group controlId="formShopName">
                                            <Form.Label>Shop Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                defaultValue={selectedShop.name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                            />
                                        </Form.Group>
                                        <Form.Group
                                            controlId="formAddress"
                                            className="mt-3"
                                        >
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                defaultValue={
                                                    selectedShop.address
                                                }
                                                onChange={(e) =>
                                                    setAddress(e.target.value)
                                                }
                                            />
                                        </Form.Group>
                                        <Form.Group
                                            controlId="formContactNumber"
                                            className="mt-3"
                                        >
                                            <Form.Label>
                                                Contact Number
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                defaultValue={
                                                    selectedShop.contact_number
                                                }
                                                onChange={(e) => {
                                                    setContactNumber(
                                                        e.target.value
                                                    );
                                                    handleNumberValidation(
                                                        e.target.value
                                                    );
                                                }}
                                                isInvalid={isPhoneInvalid}
                                            />
                                            <Form.Text className="text-danger">
                                                {phoneMessage}
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group
                                            controlId="formWeekdayHours"
                                            className="mt-3"
                                        >
                                            <Form.Label>
                                                Weekday Operating Hours
                                            </Form.Label>
                                            <div className="d-flex">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="HH"
                                                    value={
                                                        weekdayHours.openHour
                                                    }
                                                    onChange={(e) => {
                                                        setWeekdayHours({
                                                            ...weekdayHours,
                                                            openHour:
                                                                e.target.value,
                                                        });
                                                        handleHoursValidation({
                                                            ...weekdayHours,
                                                            openHour:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    className="mx-1"
                                                    maxLength={2}
                                                />
                                                <span>:</span>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="MM"
                                                    value={
                                                        weekdayHours.openMinute
                                                    }
                                                    onChange={(e) => {
                                                        setWeekdayHours({
                                                            ...weekdayHours,
                                                            openMinute:
                                                                e.target.value,
                                                        });
                                                        handleHoursValidation({
                                                            ...weekdayHours,
                                                            openMinute:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    className="mx-1"
                                                    maxLength={2}
                                                />
                                                <span> - </span>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="HH"
                                                    value={
                                                        weekdayHours.closeHour
                                                    }
                                                    onChange={(e) => {
                                                        setWeekdayHours({
                                                            ...weekdayHours,
                                                            closeHour:
                                                                e.target.value,
                                                        });
                                                        handleHoursValidation({
                                                            ...weekdayHours,
                                                            closeHour:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    className="mx-1"
                                                    maxLength={2}
                                                />
                                                <span>:</span>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="MM"
                                                    value={
                                                        weekdayHours.closeMinute
                                                    }
                                                    onChange={(e) => {
                                                        setWeekdayHours({
                                                            ...weekdayHours,
                                                            closeMinute:
                                                                e.target.value,
                                                        });
                                                        handleHoursValidation({
                                                            ...weekdayHours,
                                                            closeMinute:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    className="mx-1"
                                                    maxLength={2}
                                                />
                                            </div>
                                            <Form.Text className="text-danger">
                                                {hoursMessage}
                                            </Form.Text>
                                        </Form.Group>
                                        {/* Weekend Operating Hours */}
                                        <Form.Group
                                            controlId="formWeekendHours"
                                            className="mt-3"
                                        >
                                            <Form.Label>
                                                Weekend Operating Hours
                                            </Form.Label>
                                            <div className="d-flex">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="HH"
                                                    value={
                                                        weekendHours.openHour
                                                    }
                                                    onChange={(e) => {
                                                        setWeekendHours({
                                                            ...weekendHours,
                                                            openHour:
                                                                e.target.value,
                                                        });
                                                        handleHoursValidation({
                                                            ...weekendHours,
                                                            openHour:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    className="mx-1"
                                                    maxLength={2}
                                                />
                                                <span>:</span>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="MM"
                                                    value={
                                                        weekendHours.openMinute
                                                    }
                                                    onChange={(e) => {
                                                        setWeekendHours({
                                                            ...weekendHours,
                                                            openMinute:
                                                                e.target.value,
                                                        });
                                                        handleHoursValidation({
                                                            ...weekendHours,
                                                            openMinute:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    className="mx-1"
                                                    maxLength={2}
                                                />
                                                <span> - </span>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="HH"
                                                    value={
                                                        weekendHours.closeHour
                                                    }
                                                    onChange={(e) => {
                                                        setWeekendHours({
                                                            ...weekendHours,
                                                            closeHour:
                                                                e.target.value,
                                                        });
                                                        handleHoursValidation({
                                                            ...weekendHours,
                                                            closeHour:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    className="mx-1"
                                                    maxLength={2}
                                                />
                                                <span>:</span>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="MM"
                                                    value={
                                                        weekendHours.closeMinute
                                                    }
                                                    onChange={(e) => {
                                                        setWeekendHours({
                                                            ...weekendHours,
                                                            closeMinute:
                                                                e.target.value,
                                                        });
                                                        handleHoursValidation({
                                                            ...weekendHours,
                                                            closeMinute:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    className="mx-1"
                                                    maxLength={2}
                                                />
                                            </div>
                                            <Form.Text className="text-danger">
                                                {hoursMessage}
                                            </Form.Text>
                                        </Form.Group>
                                    </Form>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        handleClose();
                                        setHoursMessage("");
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSaveChanges}
                                >
                                    Save changes
                                </Button>
                            </Modal.Footer>
                        </Modal>

                        {/* Create Shop Modal */}
                        <Modal
                            show={showCreateModal}
                            onHide={handleClose}
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Create New Shop</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group controlId="formNewShopName">
                                        <Form.Label>Shop Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter shop name"
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group
                                        controlId="formNewAddress"
                                        className="mt-3"
                                    >
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter shop address"
                                            onChange={(e) =>
                                                setAddress(e.target.value)
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group
                                        controlId="formNewContactNumber"
                                        className="mt-3"
                                    >
                                        <Form.Label>Contact Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter contact number"
                                            onChange={(e) => {
                                                setContactNumber(
                                                    e.target.value
                                                );
                                                handleNumberValidation(
                                                    e.target.value
                                                );
                                            }}
                                            isInvalid={isPhoneInvalid}
                                        />
                                        <Form.Text className="text-danger">
                                            {phoneMessage}
                                        </Form.Text>
                                    </Form.Group>
                                    {/* Weekday Operating Hours */}
                                    <Form.Group
                                        controlId="formWeekdayHours"
                                        className="mt-3"
                                    >
                                        <Form.Label>
                                            Weekday Operating Hours
                                        </Form.Label>
                                        <div className="d-flex">
                                            <Form.Control
                                                type="text"
                                                placeholder="HH"
                                                value={weekdayHours.openHour}
                                                onChange={(e) => {
                                                    setWeekdayHours({
                                                        ...weekdayHours,
                                                        openHour:
                                                            e.target.value,
                                                    });
                                                    handleHoursValidation({
                                                        ...weekdayHours,
                                                        openHour:
                                                            e.target.value,
                                                    });
                                                }}
                                                className="mx-1"
                                                maxLength={2}
                                            />
                                            <span>:</span>
                                            <Form.Control
                                                type="text"
                                                placeholder="MM"
                                                value={weekdayHours.openMinute}
                                                onChange={(e) => {
                                                    setWeekdayHours({
                                                        ...weekdayHours,
                                                        openMinute:
                                                            e.target.value,
                                                    });
                                                    handleHoursValidation({
                                                        ...weekdayHours,
                                                        openMinute:
                                                            e.target.value,
                                                    });
                                                }}
                                                className="mx-1"
                                                maxLength={2}
                                            />
                                            <span> - </span>
                                            <Form.Control
                                                type="text"
                                                placeholder="HH"
                                                value={weekdayHours.closeHour}
                                                onChange={(e) => {
                                                    setWeekdayHours({
                                                        ...weekdayHours,
                                                        closeHour:
                                                            e.target.value,
                                                    });
                                                    handleHoursValidation({
                                                        ...weekdayHours,
                                                        closeHour:
                                                            e.target.value,
                                                    });
                                                }}
                                                className="mx-1"
                                                maxLength={2}
                                            />
                                            <span>:</span>
                                            <Form.Control
                                                type="text"
                                                placeholder="MM"
                                                value={weekdayHours.closeMinute}
                                                onChange={(e) => {
                                                    setWeekdayHours({
                                                        ...weekdayHours,
                                                        closeMinute:
                                                            e.target.value,
                                                    });
                                                    handleHoursValidation({
                                                        ...weekdayHours,
                                                        closeMinute:
                                                            e.target.value,
                                                    });
                                                }}
                                                className="mx-1"
                                                maxLength={2}
                                            />
                                        </div>
                                        <Form.Text className="text-danger">
                                            {hoursMessage}
                                        </Form.Text>
                                    </Form.Group>
                                    {/* Weekend Operating Hours */}
                                    <Form.Group
                                        controlId="formWeekendHours"
                                        className="mt-3"
                                    >
                                        <Form.Label>
                                            Weekend Operating Hours
                                        </Form.Label>
                                        <div className="d-flex">
                                            <Form.Control
                                                type="text"
                                                placeholder="HH"
                                                value={weekendHours.openHour}
                                                onChange={(e) => {
                                                    setWeekendHours({
                                                        ...weekendHours,
                                                        openHour:
                                                            e.target.value,
                                                    });
                                                    handleHoursValidation({
                                                        ...weekendHours,
                                                        openHour:
                                                            e.target.value,
                                                    });
                                                }}
                                                className="mx-1"
                                                maxLength={2}
                                            />
                                            <span>:</span>
                                            <Form.Control
                                                type="text"
                                                placeholder="MM"
                                                value={weekendHours.openMinute}
                                                onChange={(e) => {
                                                    setWeekendHours({
                                                        ...weekendHours,
                                                        openMinute:
                                                            e.target.value,
                                                    });
                                                    handleHoursValidation({
                                                        ...weekendHours,
                                                        openMinute:
                                                            e.target.value,
                                                    });
                                                }}
                                                className="mx-1"
                                                maxLength={2}
                                            />
                                            <span> - </span>
                                            <Form.Control
                                                type="text"
                                                placeholder="HH"
                                                value={weekendHours.closeHour}
                                                onChange={(e) => {
                                                    setWeekendHours({
                                                        ...weekendHours,
                                                        closeHour:
                                                            e.target.value,
                                                    });
                                                    handleHoursValidation({
                                                        ...weekendHours,
                                                        closeHour:
                                                            e.target.value,
                                                    });
                                                }}
                                                className="mx-1"
                                                maxLength={2}
                                            />
                                            <span>:</span>
                                            <Form.Control
                                                type="text"
                                                placeholder="MM"
                                                value={weekendHours.closeMinute}
                                                onChange={(e) => {
                                                    setWeekendHours({
                                                        ...weekendHours,
                                                        closeMinute:
                                                            e.target.value,
                                                    });
                                                    handleHoursValidation({
                                                        ...weekendHours,
                                                        closeMinute:
                                                            e.target.value,
                                                    });
                                                }}
                                                className="mx-1"
                                                maxLength={2}
                                            />
                                        </div>
                                        <Form.Text className="text-danger">
                                            {hoursMessage}
                                        </Form.Text>
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        handleClose();
                                        setHoursMessage("");
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleCreateShop}
                                >
                                    Create Shop
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ShopInfo;
