import { useNavigate } from "react-router-dom";
import { Navbar, Container, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface Props {
    buttonText: string;
}

const Header = ({ buttonText }: Props) => {
    const navigate = useNavigate();
    let navPage: string;
    if (buttonText === "Sign up") {
        navPage = "/register";
    } else {
        navPage = "/login";
    }

    return (
        <Navbar
            expand="lg"
            style={{ backgroundColor: "#d9d6d4", height: "4rem" }}
        >
            <Container fluid>
                <Navbar.Brand>
                    <img
                        src="/assets/react.svg"
                        alt="Logo"
                        width="30"
                        height="24"
                        className="d-inline-block align-text-top"
                    />
                    Spaza Shop
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarSupportedContent" />
                <Navbar.Collapse id="navbarSupportedContent">
                    <div className="navbar-nav me-auto mb-2 mb-lg-0"></div>
                    <Button
                        className="btn mx-4"
                        type="button"
                        style={{
                            backgroundColor: "#ff720d",
                            borderColor: "#ff720d",
                            color: "black",
                            borderRadius: "12px",
                            fontWeight: "bold",
                        }}
                        onClick={() => navigate("/registershop")}
                    >
                        Register a Shop
                    </Button>
                    <Button
                        className="btn mx-2"
                        type="button"
                        style={{
                            backgroundColor: "#ff720d",
                            borderColor: "#ff720d",
                            color: "black",
                            borderRadius: "12px",
                            fontWeight: "bold",
                        }}
                        onClick={() => navigate(navPage)}
                    >
                        {buttonText}
                    </Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
