import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button, Form } from "react-bootstrap";
import { useLazyQuery, useMutation } from "@apollo/client";
import { LOGIN_WITH_EMAIL_PASSWORD } from "../graphql/user"; // Your Auth0 email/password login mutation
import { SEARCH_USER_BY_EMAIL } from "../graphql/user"; // Apollo Query
import { useAuth0 } from "@auth0/auth0-react"; // Auth0 integration for Google login
import Header from "../components/Header";
import { useUser } from "../context/UserContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const { loginWithRedirect, isAuthenticated, user } = useAuth0(); // For Google OAuth login
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password_message, setPasswordMessage] = useState("");
    const [isPasswordInvalid, setIsPasswordInvalid] = useState(true);
    const [email_message, setEmailMessage] = useState("");
    const [isEmailInvalid, setIsEmailInvalid] = useState(true);

    // Function to validate the password
    const handlePasswordValidation = (password: string) => {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

        if (password === "") {
            setPasswordMessage("Please enter your password.");
            setIsPasswordInvalid(true); // Mark the password as invalid
            return false;
        } else if (!regex.test(password)) {
            setPasswordMessage(
                "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one digit."
            );
            setIsPasswordInvalid(true); // Mark the password as invalid
            return false;
        } else {
            setPasswordMessage("");
            setIsPasswordInvalid(false); // Mark the password as valid
            return true;
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

    // Apollo query to search for user by email in your database
    const [searchUserByEmail, { loading: searchLoading }] = useLazyQuery(
        SEARCH_USER_BY_EMAIL,
        {
            onCompleted: (data) => {
                if (data?.searchUserByEmail?.user) {
                    console.log("Apollo: User found. Redirecting to homepage.");
                    navigate("/home"); // Redirect to home on successful login
                } else {
                    alert("User not found in the Apollo database.");
                }
            },
            onError: (error) => {
                console.error("Error fetching user from Apollo:", error);
                alert(`An error occurred: ${error.message}`);
            },
        }
    );

    // Mutation for Auth0 email/password login
    const [
        loginWithEmailPassword,
        { loading: mutationLoading, error: mutationError },
    ] = useMutation(
        LOGIN_WITH_EMAIL_PASSWORD, // Your mutation to Auth0 for login
        {
            onCompleted: (data) => {
                if (data?.loginWithEmailPassword?.token) {
                    console.log("Auth0: Login successful, token received.");
                    // After successful login, search the user in Apollo DB using the email
                    searchUserByEmail({
                        variables: {
                            email: data.loginWithEmailPassword.user.email, // Email from the token
                        },
                    });
                    console.log(data.loginWithEmailPassword.user);
                    setUser(data.loginWithEmailPassword.user);
                } else {
                    alert("Invalid login credentials.");
                }
            },
            onError: (error) => {
                console.error("Error logging in with email/password:", error);
                alert(`Login failed: ${error.message}`);
            },
        }
    );

    // Handler for Email/Password login via Auth0
    const handleEmailPasswordLogin = () => {
        if (!email || !password) {
            alert("Please enter both your email and password.");
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

        // Trigger the mutation for email/password login
        loginWithEmailPassword({
            variables: {
                email,
                password,
            },
        });
    };

    // Handle Google login after Auth0 redirect
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log(
                "Google Login: Authenticated. Searching for user in Apollo DB..."
            );
            searchUserByEmail({
                variables: {
                    email: user.email, // Use the email from Auth0 user data
                },
            });
        }
    }, [isAuthenticated, user, searchUserByEmail]);

    return (
        <div
            className="min-vh-100 d-flex flex-column"
            style={{
                backgroundImage: 'url("/assets/background.jpeg")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        >
            {/* Full-width Header */}
            <div className="w-100">
                <Header buttonText="Sign up" />
            </div>

            {/* Main Content */}
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
                        Shop owners and buyers, please sign in using your
                        preferred method.
                    </p>

                    <div className="w-100 mb-3 d-flex justify-content-center">
                        <Form style={{ maxWidth: "45%" }}>
                            <Form.Group
                                className="mb-3"
                                controlId="login-email"
                            >
                                <Form.Label>Enter your Email</Form.Label>
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
                                    required
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
                                    {password_message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </div>

                    {mutationError && (
                        <p className="text-danger">
                            Login failed. Please try again.
                        </p>
                    )}

                    {/* Login Button for Auth0 Email/Password Login */}
                    <div className="w-100 mb-3 d-flex justify-content-center">
                        <Button
                            className="w-50"
                            style={{
                                backgroundColor: "#ff720d",
                                borderColor: "#ff720d",
                                color: "black",
                                borderRadius: "12px",
                                fontWeight: "bold",
                            }}
                            onClick={handleEmailPasswordLogin}
                            disabled={mutationLoading || searchLoading}
                        >
                            {mutationLoading || searchLoading
                                ? "Logging in..."
                                : "Log in with Email"}
                        </Button>
                    </div>

                    <p className="text-center">or</p>

                    {/* Google OAuth Login via Auth0 */}
                    <div className="w-100 mb-3 d-flex justify-content-center">
                        <Button
                            className="w-50"
                            style={{
                                backgroundColor: "#b5b1ae",
                                borderColor: "#b5b1ae",
                                color: "black",
                                borderRadius: "12px",
                                fontWeight: "bold",
                            }}
                            onClick={() =>
                                loginWithRedirect({
                                    authorizationParams: {
                                        connection: "google-oauth2", // Use Google OAuth connection
                                    },
                                })
                            }
                        >
                            Continue with Google
                        </Button>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default LoginPage;
