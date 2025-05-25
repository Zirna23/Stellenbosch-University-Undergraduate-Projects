import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import NavBar from "../components/NavBar";
import "../App.css";
import "../styles/Dashboard.css";
import NavAsideDash from "../components/NavAsideDash";
import { useQuery } from "@apollo/client";
import { GET_USER_NOTIFICATIONS } from "../graphql/notifications";
import { useUser } from "../context/UserContext";

type Notification = {
    notification_id: string;
    created_at: string;
    message: string;
};

const NotificationsPage = () => {
    const [notifications, setNotification] = useState<Notification[]>([]);
    const { user } = useUser();

    // Fetch notification
    const {
        loading: notificationLoading,
        error: notificationError,
        data: notificationData,
    } = useQuery(GET_USER_NOTIFICATIONS, {
        variables: user ? { userId: user.user_id } : undefined,
        skip: !user, // Skip the query until user data is available
        pollInterval: 5000,
    });

    // Update shop items state when shop items data is fetched
    useEffect(() => {
        if (notificationData && notificationData.getUserNotifications) {
            setNotification(notificationData.getUserNotifications);
        }
    }, [notificationData]);

    if (notificationLoading) return <p>Loading data...</p>;
    if (notificationError)
        return <p>Error loading notifications: {notificationError.message}</p>;

    // Reverse the order of notifications for most recent first
    const reversedNotifications = [...notifications].reverse();

    return (
        <div>
            <NavBar />
            <Container fluid>
                <Row className="h-100" style={{ minHeight: "100vh" }}>
                    <NavAsideDash />
                    <Col md={10} className="p-4">
                        <div className="mt-4">
                            <h1>Notifications</h1>
                            {reversedNotifications.map(
                                (notification, index) => (
                                    <Card key={index} className="mb-3">
                                        <Card.Body>
                                            <Card.Title>
                                                {notification.message}
                                            </Card.Title>
                                            <Card.Footer className="text-end">
                                                {notification.created_at}
                                            </Card.Footer>
                                        </Card.Body>
                                    </Card>
                                )
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default NotificationsPage;
