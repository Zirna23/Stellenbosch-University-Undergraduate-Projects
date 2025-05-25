import { useNavigate } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container, Image } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react"; // Import Auth0 hook
import "../App.css";
import { useUser } from "../context/UserContext";

const NavBar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth0();
    const { setUser } = useUser();

    // Handle Auth0 logout and redirect to login page
    const handleLogout = () => {
        setUser(null);
        logout();
        navigate("/login");
    };

    return (
        <Navbar expand="lg" style={{ backgroundColor: "#ed871f" }}>
            <Container fluid>
                <Navbar.Brand style={{ fontSize: "1.7vw" }}>
                    <Image
                        src="/assets/react.svg"
                        alt="Logo"
                        width="40px"
                        height="40px"
                        className="d-inline-block align-top"
                    />{" "}
                    Spaza Shop
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarSupportedContent" />
                <Navbar.Collapse>
                    <Nav className="ms-auto mb-2 mb-lg-0">
                        <Nav.Link
                            onClick={() => navigate("/notifications")}
                            style={{ cursor: "pointer", fontSize: "1.5vw" }}
                        >
                            <Image
                                src="/assets/notification.png"
                                alt="Logo"
                                width="30px"
                                height="30px"
                                className="d-inline-block align-top"
                                style={{
                                    objectFit: "cover",
                                    cursor: "pointer",
                                }}
                            />
                        </Nav.Link>
                        <Nav.Link
                            onClick={() => navigate("/home")}
                            style={{ cursor: "pointer", fontSize: "1.5vw" }}
                        >
                            Home
                        </Nav.Link>
                        <Nav.Link
                            onClick={() => navigate("/cart")}
                            style={{ cursor: "pointer", fontSize: "1.5vw" }}
                        >
                            Cart
                        </Nav.Link>
                        <NavDropdown
                            title={
                                <Image
                                    src="/assets/profile.svg"
                                    alt="Profile"
                                    width="32px"
                                    height="32px"
                                    className="d-inline-block align-top"
                                    style={{
                                        objectFit: "cover",
                                        cursor: "pointer",
                                    }}
                                />
                            }
                            align="end"
                        >
                            <NavDropdown.Item
                                onClick={() => navigate("/dashboard")}
                                style={{ cursor: "pointer" }}
                            >
                                Dashboard
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item
                                onClick={handleLogout}
                                style={{ cursor: "pointer" }}
                            >
                                Sign out
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;
