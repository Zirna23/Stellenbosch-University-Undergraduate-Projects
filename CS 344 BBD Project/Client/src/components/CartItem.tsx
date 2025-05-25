import React from "react";
import { Row, Col, Button, Image } from "react-bootstrap";
import "../styles/CartItem.css"; // Custom styles for CartItem
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../context/CartContext";

interface CartItemProps {
    item_id: number;
    imgSrc: string;
    name: string;
    price: string;
    quantity: number;
    shopName: string;
}

const CartItem: React.FC<CartItemProps> = ({
    item_id,
    imgSrc,
    name,
    price,
    quantity,
    shopName,
}) => {
    const navigate = useNavigate();
    const { addToCart, removeFromCart, removeOneFromCart } = useCart();

    return (
        <Row className="mb-3 p-3 border rounded d-flex align-items-center custom-cart-item">
            <Col xs={2}>
                <Image
                    src={imgSrc}
                    className="table-image"
                    alt={name}
                    fluid
                    rounded
                    onClick={() =>
                        navigate("/item", {
                            state: {
                                itemID: item_id,
                            },
                        })
                    }
                    style={{ cursor: "pointer" }}
                />
            </Col>
            <Col xs={4}>
                <p
                    className="mb-1 fw-bold"
                    onClick={() =>
                        navigate("/item", {
                            state: {
                                itemID: item_id,
                            },
                        })
                    }
                    style={{ cursor: "pointer" }}
                >
                    {name}
                </p>
                <p className="mb-1 text-muted">{shopName}</p>
                <p className="mb-1">R {price}</p>
            </Col>
            <Col xs={3} className="d-flex align-items-center">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2 custom-button"
                    onClick={() => removeOneFromCart(item_id, 1)}
                >
                    -
                </Button>
                <span>{quantity}</span>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    className="ms-2 custom-button"
                    onClick={() => addToCart(item_id, 1)}
                >
                    +
                </Button>
            </Col>
            <Col xs={3} className="d-flex align-items-center">
                <button onClick={() => removeFromCart(item_id)}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </Col>
        </Row>
    );
};

export default CartItem;
