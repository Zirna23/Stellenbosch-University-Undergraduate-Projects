import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useAuth0 } from "@auth0/auth0-react"; // Auth0 integration
import { Container, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // For redirecting
import Header from "../components/Header";
import "../styles/registerpage.css";
import { REGISTER_WITH_EMAIL_PASSWORD } from "../graphql/user"; // Import the correct mutation
import { useUser } from "../context/UserContext";

const RegisterPage = () => {
    const { loginWithRedirect } = useAuth0(); // Auth0 hooks for authentication
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user_address, setAddress] = useState("");
    const [email_message, setEmailMessage] = useState("");
    const [isEmailInvalid, setIsEmailInvalid] = useState(true);
    const [isPasswordInvalid, setIsPasswordInvalid] = useState(true);
    const [passwordMessage, setPasswordMessage] = useState(
        "Please enter your password."
    );
    const { setUser } = useUser();

    const navigate = useNavigate();

    // Apollo mutation hook for registering user with email/password
    const [registerWithEmailPassword, { error }] = useMutation(
        REGISTER_WITH_EMAIL_PASSWORD
    );

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

    // Register the user with Apollo and Auth0 using email/password
    const handleRegisterWithEmailPassword = () => {
        if (!name || !email || !password) {
            alert("Please enter your name, email, and password.");
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

        // Trigger the mutation for email/password registration
        registerWithEmailPassword({
            variables: {
                name,
                email,
                password,
                roleId: 1, // Default role ID
                userAddress: user_address,
            },
        })
            .then((response) => {
                if (response.data?.registerWithEmailPassword?.success) {
                    console.log("User registered successfully.");
                    setUser(response.data.registerWithEmailPassword.user);
                    navigate("/home"); // Redirect to home after registration
                } else {
                    alert(
                        "Registration failed: " +
                            JSON.stringify(
                                response.data?.registerWithEmailPassword
                            )
                    );
                    console.error("Registration failed.");
                }
            })
            .catch((error) => {
                alert(
                    `Error during registration: ${
                        error.message || "Unknown error occurred"
                    }`
                );
                console.error("Error during registration:", error);
            });
    };

    // Google Sign-Up using Auth0
    const handleGoogleSignup = () => {
        loginWithRedirect({
            authorizationParams: {
                connection: "google-oauth2", // Google OAuth2 connection
            },
        });
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
                        maxWidth: "50%",
                        width: "100%",
                        borderRadius: "30px",
                        marginTop: "20px",
                    }}
                >
                    <h1 className="text-center">Welcome to Spaza Shop</h1>
                    <p className="text-center">
                        Please register with username, email, password, and
                        address.
                    </p>

                    <div className="w-100 mb-3 d-flex justify-content-center">
                        <Form>
                            <Form.Group
                                className="mb-3"
                                controlId="login-username"
                            >
                                <Form.Label>Enter your Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Username"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    isValid={name !== ""}
                                />
                            </Form.Group>
                        </Form>
                    </div>

                    <div className="w-100 mb-3 d-flex justify-content-center">
                        <Form>
                            <Form.Group
                                className="mb-3"
                                controlId="login-email"
                            >
                                <Form.Label>Enter your Email</Form.Label>
                                <Form.Control
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
                        </Form>
                    </div>

                    <div className="w-100 mb-3 d-flex justify-content-center">
                        <Form style={{ maxWidth: "33%" }}>
                            <Form.Group
                                className="mb-3"
                                controlId="login-password"
                            >
                                <Form.Label>Enter your Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        handlePasswordValidation(
                                            e.target.value
                                        );
                                    }}
                                    isInvalid={
                                        isPasswordInvalid && password !== ""
                                    }
                                    isValid={
                                        !isPasswordInvalid && password !== ""
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {passwordMessage}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </div>

                    <div className="w-100 mb-3 d-flex justify-content-center">
                        <Form>
                            <Form.Group
                                className="mb-3"
                                controlId="login-address"
                            >
                                <Form.Label>Enter your Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Address"
                                    value={user_address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    isValid={user_address !== ""}
                                />
                            </Form.Group>
                        </Form>
                    </div>

                    {/* Register Button for Email/Password */}
                    <Button
                        onClick={handleRegisterWithEmailPassword}
                        className="mt-3 w-50 custom-button"
                        style={{
                            backgroundColor: "#ff720d",
                            borderColor: "#b5b1ae",
                            color: "black",
                            borderRadius: "12px",
                            fontWeight: "bold",
                        }}
                    >
                        Register
                    </Button>

                    {error && (
                        <p style={{ color: "red" }}>Error: {error.message}</p>
                    )}

                    <p className="text-center">or</p>

                    {/* Google Sign-Up via Auth0 */}
                    <Button
                        onClick={handleGoogleSignup}
                        className="mt-3 w-50 custom-button"
                        style={{
                            backgroundColor: "#b5b1ae",
                            borderColor: "#b5b1ae",
                            color: "black",
                            borderRadius: "12px",
                            fontWeight: "bold",
                        }}
                    >
                        Continue with Google
                    </Button>
                </Container>
            </div>
        </div>
    );
};

export default RegisterPage;
