import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Container, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
    REGISTER_WITH_EMAIL_PASSWORD,
    ASSIGN_USER_TO_SHOP,
} from "../graphql/user";
import { CREATE_SHOP } from "../graphql/shop";
import { useUser } from "../context/UserContext";

const RegisterShop = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user_address, setAddress] = useState("");
    const [shopName, setShopName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [email_message, setEmailMessage] = useState("");
    const [isEmailInvalid, setIsEmailInvalid] = useState(true);
    const [isPasswordInvalid, setIsPasswordInvalid] = useState(true);
    const [passwordMessage, setPasswordMessage] = useState(
        "Please enter your password."
    );
    const [isPhoneInvalid, setIsPhoneInvalid] = useState(true);
    const [phoneMessage, setPhoneMessage] = useState(
        "Please enter your phone number."
    );
    const navigate = useNavigate();
    const { setUser } = useUser();
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

    // Mutations for registering user, creating shop, and assigning user to shop
    const [
        registerWithEmailPassword,
        { loading: registerLoading, error: registerError },
    ] = useMutation(REGISTER_WITH_EMAIL_PASSWORD);
    const [createShop, { loading: shopLoading, error: shopError }] =
        useMutation(CREATE_SHOP);
    const [assignUserToShop, { loading: assignLoading, error: assignError }] =
        useMutation(ASSIGN_USER_TO_SHOP);

    const handlePasswordValidation = (password: string) => {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

        if (password === "") {
            setPasswordMessage("Please enter your password.");
            setIsPasswordInvalid(true); // Set as invalid
        } else if (!regex.test(password)) {
            setPasswordMessage(
                "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one digit."
            );
            setIsPasswordInvalid(true); // Set as invalid if regex doesn't match
        } else {
            setPasswordMessage("");
            setIsPasswordInvalid(false); // Set as valid if regex matches
        }
    };

    // Function to validate the email
    const handleEmailValidation = (email: string) => {
        const regex =
            /^[\w.%+-]+@[\da-zA-Z.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;

        if (email === "") {
            setEmailMessage("Please enter your email.");
            setIsEmailInvalid(true); // Mark the email as invalid
            return false;
        } else if (!regex.test(email)) {
            setEmailMessage("Please include a valid email address.");
            setIsEmailInvalid(true); // Mark the email as invalid
            return false;
        } else {
            setEmailMessage("");
            setIsEmailInvalid(false); // Mark the email as valid
            return true;
        }
    };

    const handleNumberValidation = (phone: string) => {
        const regex = /^\d{3}\s?\d{3}\s?\d{4}$/;

        if (phone === "") {
            setPhoneMessage("Please enter your phone number.");
            setIsPhoneInvalid(true); // Set as invalid
        } else if (!regex.test(phone)) {
            setPhoneMessage("Please enter a 10 digit phone number.");
            setIsPhoneInvalid(true); // Set as invalid if regex doesn't match
        } else {
            setPhoneMessage("");
            setIsPhoneInvalid(false); // Set as valid if regex matches
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

    // Register the user with Apollo and Auth0 using email/password
    const handleRegisterWithEmailPassword = async () => {
        if (
            !name ||
            !email ||
            !password ||
            !shopName ||
            !user_address ||
            !contactNumber
        ) {
            alert("Please fill in all the required fields.");
            return;
        }

        if (isPasswordInvalid) {
            alert("Please enter a valid password.");
            return;
        }

        if (isEmailInvalid) {
            alert("Please enter a valid email");
            return;
        }

        if (isPhoneInvalid) {
            alert("Please enter a valid contact number.");
            return;
        }

        // Validate operating hours
        handleHoursValidation(weekdayHours);
        handleHoursValidation(weekendHours);

        if (isHoursInvalid) {
            alert("Please provide valid shop operating hours.");
            return;
        }

        try {
            // Register the user
            console.log("Registering user...");
            const userResponse = await registerWithEmailPassword({
                variables: {
                    name,
                    email,
                    password,
                    roleId: 3, // Default role ID
                    userAddress: user_address,
                },
            });

            const userId =
                userResponse.data?.registerWithEmailPassword?.user?.user_id;

            if (userId) {
                console.log("User registered successfully:", userResponse);

                // Format the times to 'HH:mm'
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

                console.log(weekdayOpeningTime);

                // Create the shop after user registration
                console.log("Creating shop...");
                const shopResponse = await createShop({
                    variables: {
                        ownerId: userId,
                        address: user_address,
                        name: shopName,
                        weekdayOpeningTime,
                        weekdayClosingTime,
                        weekendOpeningTime,
                        weekendClosingTime,
                        contactNumber: contactNumber,
                        open: true,
                    },
                });

                const shopId = shopResponse.data?.createShop?.shop?.shop_id;

                if (shopId) {
                    console.log("Shop created successfully:", shopResponse);

                    // Step 4: Assign user to the shop
                    console.log("Assigning user to shop...");
                    const assignResponse = await assignUserToShop({
                        variables: {
                            userId,
                            shopId,
                            roleId: 3.0,
                        },
                    });

                    if (assignResponse.data?.assignUserToShop) {
                        console.log("User assigned to shop successfully.");
                        setUser(
                            userResponse.data.registerWithEmailPassword.user
                        );
                        navigate("/home");
                    } else {
                        console.error(
                            "Failed to assign user to shop:",
                            assignResponse.errors || "Unknown error"
                        );
                    }
                } else {
                    console.error(
                        "Shop creation failed:",
                        shopResponse.errors || "Unknown error"
                    );
                }
            } else {
                console.error(
                    "User registration failed:",
                    userResponse.errors || "Unknown error"
                );
            }
        } catch (error) {
            console.error(
                "Error during registration, shop creation, or assignment:",
                error
            );
        }
    };

    return (
        <div
            className="min-vh-100 d-flex flex-column"
            style={{
                backgroundImage: 'url("/assets/background.jpeg")',
                backgroundSize: "cover",
            }}
        >
            <div className="w-100">
                <Header buttonText="Log in" />
            </div>

            <div className="d-flex flex-grow-1 justify-content-center align-items-center">
                <Container
                    className="d-flex flex-column justify-content-center align-items-center p-4 rounded"
                    style={{
                        backgroundColor: "#d9d6d4",
                        maxWidth: "55%",
                        width: "100%",
                        borderRadius: "30px",
                        marginTop: "20px",
                    }}
                >
                    <h1 className="text-center">Register Your Shop</h1>
                    <p className="text-center">
                        Please fill in the details to register your shop.
                    </p>

                    <Form
                        noValidate
                        className="w-100 d-flex flex-column align-items-center"
                        style={{ maxWidth: "45%" }}
                    >
                        {/* Shop Name Input */}
                        <div className="mb-3 p-2 rounded">
                            <Form.Group controlId="shopName">
                                <Form.Label>Enter your Shop Name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Shop Name"
                                    value={shopName}
                                    onChange={(e) =>
                                        setShopName(e.target.value)
                                    }
                                    isValid={shopName !== ""}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a shop name.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        <div className="mb-3 p-2 rounded">
                            <Form.Group controlId="adminEmail">
                                <Form.Label>Enter Admin Email</Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        handleEmailValidation(e.target.value);
                                    }}
                                    isInvalid={isEmailInvalid && email !== ""}
                                    isValid={!isEmailInvalid && email !== ""}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {email_message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        {/* Username Input */}
                        <div className="mb-3 p-2 rounded">
                            <Form.Group controlId="adminUsername">
                                <Form.Label>Enter Admin Username</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Admin Username"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    //isInvalid={formData.adminUsername === ''}
                                    isValid={name !== ""}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide an admin username.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        {/* Password Input */}
                        <div
                            className="mb-3 p-2 rounded"
                            style={{ maxWidth: "310px" }}
                        >
                            <Form.Group controlId="adminPassword">
                                <Form.Label>Enter Admin Password</Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    placeholder="Admin Password"
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        handlePasswordValidation(
                                            e.target.value
                                        ); // Validate password on every change
                                    }}
                                    value={password}
                                    isInvalid={
                                        isPasswordInvalid && password !== ""
                                    } // Use real-time validation state
                                    isValid={
                                        !isPasswordInvalid && password !== ""
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {passwordMessage}{" "}
                                    {/* Display appropriate message */}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        {/* Shop Address Input */}
                        <div
                            className="mb-3 p-2 rounded"
                            style={{
                                backgroundColor: "#d9d6d4",
                                borderRadius: "30px",
                            }}
                        >
                            <Form.Group controlId="shopAddress">
                                <Form.Label>Enter Shop Address</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Shop Address"
                                    value={user_address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    isValid={user_address !== ""}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a shop address.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        {/* Contact Number Input */}
                        <div
                            className="mb-3 p-2 rounded"
                            style={{
                                backgroundColor: "#d9d6d4",
                                borderRadius: "30px",
                            }}
                        >
                            <Form.Group controlId="contactNumber">
                                <Form.Label>
                                    Enter Shop Contact Number
                                </Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Contact Number"
                                    value={contactNumber}
                                    onChange={(e) => {
                                        setContactNumber(e.target.value);
                                        handleNumberValidation(e.target.value); // Validate phone number on every change
                                    }}
                                    isInvalid={
                                        isPhoneInvalid && contactNumber !== ""
                                    } // Use real-time validation state
                                    isValid={
                                        !isPhoneInvalid && contactNumber !== ""
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {phoneMessage}{" "}
                                    {/* Display appropriate message */}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        {/* Weekday Hours Input */}
                        <div className="mb-3 p-2 rounded">
                            <Form.Group controlId="weekdayHours">
                                <Form.Label>
                                    Enter Weekday Opening and Closing Hours
                                </Form.Label>
                                <div className="d-flex">
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="HH"
                                        value={weekdayHours.openHour}
                                        onChange={(e) => {
                                            const updatedValue =
                                                e.target.value.slice(0, 2);
                                            setWeekdayHours({
                                                ...weekdayHours,
                                                openHour: updatedValue,
                                            });
                                            handleHoursValidation({
                                                ...weekdayHours,
                                                openHour: updatedValue,
                                            });
                                        }}
                                        className="mx-1"
                                        style={{
                                            minWidth: "60px",
                                            color: "black",
                                        }}
                                        maxLength={2}
                                    />
                                    <span>:</span>
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="MM"
                                        value={weekdayHours.openMinute}
                                        onChange={(e) => {
                                            const updatedValue =
                                                e.target.value.slice(0, 2);
                                            setWeekdayHours({
                                                ...weekdayHours,
                                                openMinute: updatedValue,
                                            });
                                            handleHoursValidation({
                                                ...weekdayHours,
                                                openMinute: updatedValue,
                                            });
                                        }}
                                        className="mx-1"
                                        style={{
                                            minWidth: "60px",
                                            color: "black",
                                        }}
                                        maxLength={2}
                                    />
                                    <span>-</span>
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="HH"
                                        value={weekdayHours.closeHour}
                                        onChange={(e) => {
                                            const updatedValue =
                                                e.target.value.slice(0, 2);
                                            setWeekdayHours({
                                                ...weekdayHours,
                                                closeHour: updatedValue,
                                            });
                                            handleHoursValidation({
                                                ...weekdayHours,
                                                closeHour: updatedValue,
                                            });
                                        }}
                                        className="mx-1"
                                        style={{
                                            minWidth: "60px",
                                            color: "black",
                                        }}
                                        maxLength={2}
                                    />
                                    <span>:</span>
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="MM"
                                        value={weekdayHours.closeMinute}
                                        onChange={(e) => {
                                            const updatedValue =
                                                e.target.value.slice(0, 2);
                                            setWeekdayHours({
                                                ...weekdayHours,
                                                closeMinute: updatedValue,
                                            });
                                            handleHoursValidation({
                                                ...weekdayHours,
                                                closeMinute: updatedValue,
                                            });
                                        }}
                                        className="mx-1"
                                        style={{
                                            minWidth: "60px",
                                            color: "black",
                                        }}
                                        maxLength={2}
                                    />
                                </div>
                                {/* Error Message Displayed Below the Inputs */}
                                {isHoursInvalid && (
                                    <div style={{ color: "red" }}>
                                        {hoursMessage}
                                    </div>
                                )}
                            </Form.Group>
                        </div>

                        {/* Weekend Hours Input */}
                        <div className="mb-3 p-2 rounded">
                            <Form.Group controlId="weekendHours">
                                <Form.Label>
                                    Enter Weekend Opening and Closing Hours
                                </Form.Label>
                                <div className="d-flex">
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="HH"
                                        value={weekendHours.openHour}
                                        onChange={(e) => {
                                            const updatedValue =
                                                e.target.value.slice(0, 2);
                                            setWeekendHours({
                                                ...weekendHours,
                                                openHour: updatedValue,
                                            });
                                            handleHoursValidation({
                                                ...weekendHours,
                                                openHour: updatedValue,
                                            });
                                        }}
                                        className="mx-1"
                                        style={{
                                            minWidth: "60px",
                                            color: "black",
                                        }}
                                        maxLength={2}
                                    />
                                    <span>:</span>
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="MM"
                                        value={weekendHours.openMinute}
                                        onChange={(e) => {
                                            const updatedValue =
                                                e.target.value.slice(0, 2);
                                            setWeekendHours({
                                                ...weekendHours,
                                                openMinute: updatedValue,
                                            });
                                            handleHoursValidation({
                                                ...weekendHours,
                                                openMinute: updatedValue,
                                            });
                                        }}
                                        className="mx-1"
                                        style={{
                                            minWidth: "60px",
                                            color: "black",
                                        }}
                                        maxLength={2}
                                    />
                                    <span>-</span>
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="HH"
                                        value={weekendHours.closeHour}
                                        onChange={(e) => {
                                            const updatedValue =
                                                e.target.value.slice(0, 2);
                                            setWeekendHours({
                                                ...weekendHours,
                                                closeHour: updatedValue,
                                            });
                                            handleHoursValidation({
                                                ...weekendHours,
                                                closeHour: updatedValue,
                                            });
                                        }}
                                        className="mx-1"
                                        style={{
                                            minWidth: "60px",
                                            color: "black",
                                        }}
                                        maxLength={2}
                                    />
                                    <span>:</span>
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="MM"
                                        value={weekendHours.closeMinute}
                                        onChange={(e) => {
                                            const updatedValue =
                                                e.target.value.slice(0, 2);
                                            setWeekendHours({
                                                ...weekendHours,
                                                closeMinute: updatedValue,
                                            });
                                            handleHoursValidation({
                                                ...weekendHours,
                                                closeMinute: updatedValue,
                                            });
                                        }}
                                        className="mx-1"
                                        style={{
                                            minWidth: "60px",
                                            color: "black",
                                        }}
                                        maxLength={2}
                                    />
                                </div>
                                {/* Error Message Displayed Below the Inputs */}
                                {isHoursInvalid && (
                                    <div style={{ color: "red" }}>
                                        {hoursMessage}
                                    </div>
                                )}
                            </Form.Group>
                        </div>

                        <div className="d-flex justify-content-center w-100 mb-3">
                            <Button
                                className="w-50"
                                style={{
                                    backgroundColor: "#ff720d",
                                    borderColor: "#ff720d",
                                    color: "black",
                                    borderRadius: "12px",
                                    fontWeight: "bold",
                                }}
                                onClick={handleRegisterWithEmailPassword}
                                disabled={
                                    registerLoading ||
                                    shopLoading ||
                                    assignLoading
                                }
                            >
                                {registerLoading || shopLoading || assignLoading
                                    ? "Registering..."
                                    : "Register Shop"}
                            </Button>
                        </div>
                        {registerError || shopError || assignError ? (
                            <p style={{ color: "red" }}>
                                Error:{" "}
                                {
                                    (registerError || shopError || assignError)
                                        ?.message
                                }
                            </p>
                        ) : null}
                    </Form>
                </Container>
            </div>
        </div>
    );
};

export default RegisterShop;
