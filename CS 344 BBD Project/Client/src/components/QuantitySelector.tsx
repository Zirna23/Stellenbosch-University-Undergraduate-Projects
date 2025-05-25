import { Button, Col, Row } from "react-bootstrap";

interface Props {
    item_id: number;
    initialQuantity: number;
    onQuantityChange: (delta: number) => void;
}

const QuantitySelector = ({ initialQuantity, onQuantityChange }: Props) => {
    return (
        <Row className="d-flex">
            <p className="mb-0">Quantity</p>
            <Col xs="auto" className="d-flex align-items-center pb-2">
                <Button
                    size="sm"
                    className="me-1"
                    style={{
                        backgroundColor: "#ed871f",
                        borderColor: "#ed871f",
                        color: "black",
                    }}
                    onClick={() => onQuantityChange(initialQuantity - 1)}
                >
                    -
                </Button>
                <span className="mx-2">{initialQuantity}</span>
                <Button
                    size="sm"
                    className="ms-1"
                    style={{
                        backgroundColor: "#ed871f",
                        borderColor: "#ed871f",
                        color: "black",
                    }}
                    onClick={() => onQuantityChange(initialQuantity + 1)}
                >
                    +
                </Button>
            </Col>
        </Row>
    );
};
export default QuantitySelector;
