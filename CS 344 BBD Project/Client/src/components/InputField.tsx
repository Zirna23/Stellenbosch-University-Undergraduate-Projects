import { Container, Row, Col, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface Props {
    heading: string;
    inputText: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string; // Optional prop to handle different input types like "password"
}

const InputField = ({ heading, inputText, value, onChange, type = "text" }: Props) => {
    return (
        <Container className="pt-2 pb-2">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="form-label">
                            {heading}
                        </Form.Label>
                        <Form.Control
                            type={type}
                            placeholder={inputText}
                            value={value}
                            onChange={onChange}
                            style={{
                                backgroundColor: "#f0f0f0",
                                borderRadius: "10px",
                            }}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Container>
    );
};

export default InputField;
