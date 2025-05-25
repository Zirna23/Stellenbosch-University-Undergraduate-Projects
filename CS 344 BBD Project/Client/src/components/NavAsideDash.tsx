import { Col, Nav } from "react-bootstrap";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const NavAsideDash = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    return (
        <Col md={2} className="bg-light p-3 custom-sidebar d-flex flex-column">
            <Nav defaultActiveKey="/dashboard" className="flex-column">
                <Nav.Link
                    className="custom-nav-link"
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </Nav.Link>
                <Nav.Link
                    className="custom-nav-link"
                    onClick={() => navigate("/orders")}
                >
                    Orders
                </Nav.Link>
                <Nav.Link
                    className="custom-nav-link"
                    onClick={() => navigate("/notifications")}
                >
                    Notifications
                </Nav.Link>
                {user?.role.role_id == 2 || user?.role.role_id == 3 ? (
                    <div>
                        <Nav.Link
                            className="custom-nav-link"
                            onClick={() => navigate("/inventory")}
                        >
                            Inventory
                        </Nav.Link>
                        {user?.role.role_id == 3 ? (
                            <div>
                                <Nav.Link
                                    href="/shop-info"
                                    className="custom-nav-link"
                                    onClick={() => navigate("/shop-info")}
                                >
                                    Shop Information
                                </Nav.Link>
                                <Nav.Link
                                    href="/user-management"
                                    className="custom-nav-link"
                                    onClick={() => navigate("/user-management")}
                                >
                                    User Management
                                </Nav.Link>
                                <Nav.Link
                                    className="custom-nav-link"
                                    onClick={() =>
                                        navigate("/trending-products")
                                    }
                                >
                                    Best Selling
                                </Nav.Link>
                            </div>
                        ) : (
                            <div></div>
                        )}
                    </div>
                ) : (
                    <div></div>
                )}
            </Nav>
        </Col>
    );
};

export default NavAsideDash;
