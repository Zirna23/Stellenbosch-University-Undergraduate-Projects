import { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Table,
    Button,
    Modal,
    Form,
} from "react-bootstrap";
import NavBar from "../components/NavBar";
import NavAsideDash from "../components/NavAsideDash";
import "../styles/UserManagement.css";
import { useUser } from "../context/UserContext";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SHOP_USERS } from "../graphql/shop";
import { GET_USER_SHOPS } from "../graphql/user";
import {
    REGISTER_WITH_EMAIL_PASSWORD,
    DELETE_USER,
    ASSIGN_USER_TO_SHOP,
    UPDATE_USER,
} from "../graphql/user";

type User = {
    user_id: number;
    name: string;
    email: string;
    user_address: string;
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { user } = useUser();
    const [shopIds, setShopIds] = useState<number[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [assignUserToShop] = useMutation(ASSIGN_USER_TO_SHOP);
    const [updateUser] = useMutation(UPDATE_USER); // Add updateUser mutation
    const [isEmailInvalid, setIsEmailInvalid] = useState(false);
    const [emailMessage, setEmailMessage] = useState("");
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        roleId: 2, // Default role for a new user
        user_address: "",
    });

    // Fetch the user's shops to get the shop ID
    const {
        loading: shopLoading,
        error: shopError,
        data: shopData,
    } = useQuery(GET_USER_SHOPS, {
        variables: { userId: user?.user_id },
        skip: !user,
    });

    const { refetch: refetchShopUsers } = useQuery(GET_SHOP_USERS, {
        variables: { shopId: shopIds[0] }, // Placeholder for the shop ID
        skip: true, // Initially skip the query until we fetch the actual shop IDs
    });

    // Update shop IDs when shop data is available
    useEffect(() => {
        if (shopData && shopData.getUserShops) {
            const shopIdsArray = shopData.getUserShops.map(
                (shop: any) => shop.shop_id
            );
            setShopIds(shopIdsArray); // Set multiple shop IDs
        }
    }, [shopData]);
    const handleEmailValidation = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email === "") {
            setEmailMessage("Please enter your email.");
            setIsEmailInvalid(true); // Set as invalid
        } else if (!emailRegex.test(email)) {
            setEmailMessage("Please enter a valid email address.");
            setIsEmailInvalid(true); // Set as invalid if regex doesn't match
        } else {
            setEmailMessage("");
            setIsEmailInvalid(false); // Set as valid if regex matches
        }
    };
    // Define a reusable refetch function
    const refetchUsers = async () => {
        const allShopUsers: User[] = [];

        for (const shopId of shopIds) {
            try {
                const { data } = await refetchShopUsers({ shopId });

                if (data && data.getShopUsers) {
                    const filteredUsers = data.getShopUsers.filter(
                        (shopUser: User) => shopUser.user_id !== user?.user_id
                    );
                    allShopUsers.push(...filteredUsers);
                }
            } catch (error) {
                console.error(
                    `Error fetching users for shopId ${shopId}:`,
                    error
                );
            }
        }

        setUsers(allShopUsers);
    };

    useEffect(() => {
        if (shopIds.length > 0) {
            refetchUsers(); // Call refetchUsers only after shopIds have been set
        }
    }, [shopIds]);

    const [registerUser] = useMutation(REGISTER_WITH_EMAIL_PASSWORD, {
        refetchQueries: [
            { query: GET_SHOP_USERS, variables: { shopId: shopIds[0] } },
        ],
    });
    const [deleteUser] = useMutation(DELETE_USER, {
        refetchQueries: [
            { query: GET_SHOP_USERS, variables: { shopId: shopIds[0] } },
        ],
    });

    // Handle closing the modal
    const handleClose = () => {
        setShowModal(false);
        setSelectedUser(null);
        setNewUser({
            name: "",
            email: "",
            password: "",
            roleId: 2,
            user_address: "",
        }); // Reset form
    };

    // Handle showing the modal for adding/editing a user
    const handleShowModal = (user: User | null = null) => {
        if (user) {
            // If editing an existing user, pre-fill form fields
            setNewUser({
                name: user.name,
                email: user.email,
                password: "",
                roleId: 2,
                user_address: user.user_address,
            });
            setSelectedUser(user);
        } else {
            setNewUser({
                name: "",
                email: "",
                password: "",
                roleId: 2,
                user_address: "",
            });
        }
        setShowModal(true);
    };

    // Handle adding or updating a user
    const handleSaveUser = async () => {
        handleEmailValidation(newUser.email); // Validate email before saving
        if (isEmailInvalid) return;
        if (selectedUser) {
            // Edit an existing user
            try {
                await updateUser({
                    variables: {
                        userId: selectedUser.user_id,
                        name: newUser.name,
                        email: newUser.email,
                        roleId: newUser.roleId,
                        userAddress: newUser.user_address,
                    },
                });
                console.log("User updated successfully.");
                // Refetch users after updating
            } catch (error) {
                console.error("Error updating user:", error);
            } finally {
                refetchUsers();
            }
        } else {
            // Add a new user
            handleAddUser();
        }

        handleClose(); // Close modal after saving
    };

    // Handle adding a new user
    const handleAddUser = async () => {
        try {
            const { data } = await registerUser({
                variables: {
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password,
                    roleId: newUser.roleId,
                    userAddress: newUser.user_address,
                },
            });

            // Check if the user was successfully created
            if (data.registerWithEmailPassword.success) {
                // Extract user ID
                const userId = data.registerWithEmailPassword.user.user_id;

                // Assign the new user to the shop
                await assignUserToShop({
                    variables: {
                        userId, // Use the returned user ID
                        shopId: shopIds[0],
                        roleId: newUser.roleId,
                    },
                });

                console.log("User assigned to shop successfully.");
                // Refetch the users after adding and assigning a new user
                refetchUsers();
                handleClose();
            }
        } catch (error) {
            console.error("Error creating or assigning user:", error);
        }
        // Close the modal after adding
    };

    // Handle removing a user
    const handleRemoveUser = async () => {
        if (selectedUser) {
            try {
                await deleteUser({
                    variables: {
                        userId: selectedUser.user_id,
                    },
                });

                console.log("User removed successfully.");
                await refetchUsers();
            } catch (error) {
                console.error("Error removing user:", error);
            }

            handleClose();
        }
    };

    if (shopLoading) return <p>Loading...</p>;
    if (shopError) return <p>Error fetching shop: {shopError.message}</p>;

    return (
        <div>
            <NavBar />
            <Container fluid>
                <Row>
                    <NavAsideDash />
                    <Col md={10} className="p-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <h1>User Management</h1>
                            <Button
                                className="custom-button"
                                style={{
                                    backgroundColor: "#ed871f",
                                    borderColor: "#ed871f",
                                    color: "black",
                                }}
                                onClick={() => handleShowModal()}
                            >
                                Add User
                            </Button>
                        </div>
                        <Table
                            striped
                            bordered
                            hover
                            responsive
                            className="rounded custom-table mt-4"
                        >
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.user_id}>
                                        <td>{user.user_id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.user_address}</td>
                                        <td>
                                            <Button
                                                className="custom-button"
                                                style={{
                                                    backgroundColor: "#ed871f",
                                                    borderColor: "#ed871f",
                                                    color: "black",
                                                }}
                                                onClick={() =>
                                                    handleShowModal(user)
                                                }
                                            >
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <Modal show={showModal} onHide={handleClose} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    {selectedUser ? "Edit User" : "Add User"}
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group controlId="formUsername">
                                        <Form.Label>Username</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter username"
                                            value={newUser.name}
                                            onChange={(e) =>
                                                setNewUser({
                                                    ...newUser,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group
                                        controlId="formEmail"
                                        className="mt-3"
                                    >
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={newUser.email}
                                            onChange={(e) => {
                                                setNewUser({
                                                    ...newUser,
                                                    email: e.target.value,
                                                });
                                                handleEmailValidation(
                                                    e.target.value
                                                );
                                            }}
                                            isInvalid={isEmailInvalid}
                                        />
                                        {isEmailInvalid && (
                                            <p>{emailMessage}</p>
                                        )}
                                    </Form.Group>
                                    {!selectedUser && (
                                        <Form.Group
                                            controlId="formPassword"
                                            className="mt-3"
                                        >
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter password"
                                                value={newUser.password}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        password:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </Form.Group>
                                    )}
                                    <Form.Group
                                        controlId="formAddress"
                                        className="mt-3"
                                    >
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter user address"
                                            value={newUser.user_address}
                                            onChange={(e) =>
                                                setNewUser({
                                                    ...newUser,
                                                    user_address:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>
                                {selectedUser && (
                                    <Button
                                        className="custom-button"
                                        style={{
                                            backgroundColor: "#dc3545", // Red color for delete
                                            borderColor: "#dc3545",
                                            color: "white",
                                        }}
                                        onClick={handleRemoveUser}
                                    >
                                        Remove User
                                    </Button>
                                )}
                                <Button
                                    className="custom-button"
                                    style={{
                                        backgroundColor: "#ed871f",
                                        borderColor: "#ed871f",
                                        color: "black",
                                    }}
                                    onClick={handleSaveUser}
                                >
                                    {selectedUser ? "Save changes" : "Add User"}
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UserManagement;
