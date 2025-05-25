import NavAsideDash from "../components/NavAsideDash";
import NavBar from "../components/NavBar";
import "../styles/inventorypage.css";
import {
    Table,
    Container,
    Col,
    Row,
    Button,
    Modal,
    Form,
} from "react-bootstrap";
import "../styles/Dashboard.css";
import React, { ChangeEvent, useEffect, useState, useRef } from "react";
import { useQuery } from "@apollo/client";
import { GET_SHOP_ITEMS } from "../graphql/shop";
import { useUser } from "../context/UserContext";
import { CREATE_ITEM, DELETE_ITEM, UPDATE_ITEM } from "../graphql/item";
import { GET_USER_SHOPS } from "../graphql/user";
import { useMutation } from "@apollo/client";
import { BrowserMultiFormatReader } from "@zxing/library";
import jsPDF from "jspdf";

import "jspdf-autotable";

type Item = {
    item_id: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    category: number;
    item_image: string;
    barcode_id: string;
};

const InventoryPage = () => {
    const [shopItems, setShopItems] = useState<Item[]>([]);
    const [shop_ids, setShops] = useState<number[]>([]);
    const [itemDeleteId, setItemDeleteId] = useState("");
    const { user } = useUser();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const [categoryId, setCategoryId] = useState<number>(1);
    const [quantity_item, setQuantity] = useState<number>(0);
    const [isNameInvalid, setIsNameInvalid] = useState(false);
    const [isDescripInvalid, setIsDescripInvalid] = useState(false);
    const [isPriceInvalid, setIsPriceInvalid] = useState(false);
    const [isQuantityInvalid, setIsQuantityInvalid] = useState(false);
    const [barcode, setBarcode] = useState<string>("");
    const [showScanner, setShowScanner] = useState<boolean>(false); // Scanner modal state
    const [videoStarted, setVideoStarted] = useState<boolean>(false); // Track video status
    const [activeStream, setActiveStream] = useState<MediaStream | null>(null); // Active camera stream
    const videoRef = useRef<HTMLVideoElement | null>(null); // Ref for the video element

    const [codeReader, setCodeReader] =
        useState<BrowserMultiFormatReader | null>(null);

    useEffect(() => {
        const reader = new BrowserMultiFormatReader();
        setCodeReader(reader);

        // Cleanup on component unmount
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        if (videoStarted || !codeReader) {
            console.log("Video already playing or scanner not initialized.");
            return; // Prevent restarting the video if it's already playing
        }

        setShowScanner(true); // Show scanner modal

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream; // Set the stream to the video element via ref
                setActiveStream(stream); // Keep track of the active stream
                setVideoStarted(true); // Mark the video as started

                const result = await codeReader.decodeOnceFromStream(
                    stream,
                    videoRef.current
                );
                setBarcode(result.getText());
                console.log("Barcode detected:", result.getText());
                await fetchProductInfo(result.getText());
                stopScanner(); // Stop scanner after successful scan
            }
        } catch (err) {
            console.error(err);
            stopScanner(); // Ensure scanner is stopped in case of error
        }
    };

    const stopScanner = () => {
        if (activeStream) {
            activeStream.getTracks().forEach((track) => track.stop()); // Stop all active media tracks
            setActiveStream(null); // Clear the active stream
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null; // Clear the video source
        }

        setVideoStarted(false); // Mark video as stopped
        setShowScanner(false); // Hide scanner modal
    };
    // Function to fetch product info from OpenFoodFacts API

    const fetchProductInfo = async (barcode: string) => {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 1) {
                // Status 1 means product found
                const product = data.product;

                // Set the relevant fields with parsed data
                setBarcode(product.code);

                console.log("Product Info:", product);
            } else {
                console.log("Product not found");
                setName("Product not found");
                setDescription("");
                setPrice(0);
            }
        } catch (err) {
            console.error("Error fetching product info:", err);
            setName("Error fetching product");
            setDescription("");
            setPrice(0);
        }
    };
    // Function to fetch the image and convert it into a File object
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Set document title
        doc.text("Inventory List", 10, 10);

        // Prepare table headers and data
        const headers = [
            ["Item ID", "Name", "Description", "Quantity", "Price"],
        ];
        const data = shopItems.map((item) => [
            item.item_id.toString(),
            item.name,
            item.description,
            item.quantity.toString(),
            "R " + item.price.toFixed(2),
        ]);

        // Add table to PDF
        (doc as any).autoTable({
            head: headers,
            body: data,
            startY: 20, // Space after the title
        });

        // Save the PDF
        doc.save("inventory.pdf");
    };

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value == "") {
            alert("Please enter a name.");
            setIsNameInvalid(true);
            return;
        }
        setIsNameInvalid(false);
        setName(e.target.value);
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value == "") {
            alert("Please enter a description.");
            setIsDescripInvalid(true);
            return;
        }
        setIsDescripInvalid(false);
        setDescription(e.target.value);
    };

    const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "") {
            alert("Please enter a valid price.");
            setIsPriceInvalid(true);
            return;
        }

        setIsPriceInvalid(false);
        setPrice(Number(e.target.value));
    };

    const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.value == "") {
            alert("Please enter a valid quantity.");
            setIsQuantityInvalid(true);
            return;
        }

        setIsQuantityInvalid(false);
        setQuantity(Number(e.target.value));
    };

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setCategoryId(Number(e.target.value));
    };

    //get user shop
    const {
        loading: shop_loading,
        error: shop_error,
        data: shop_data,
    } = useQuery(GET_USER_SHOPS, {
        variables: user ? { userId: user.user_id } : undefined,
    });

    const { refetch: refetchShopItems } = useQuery(GET_SHOP_ITEMS, {
        variables: { shopId: shop_ids[0] }, // Placeholder for shop ID
        skip: true, // Initially skip until we fetch the actual shop IDs
    });

    // Update shop IDs when data is available
    useEffect(() => {
        if (shop_data && shop_data.getUserShops) {
            const shopIds = shop_data.getUserShops.map(
                (shop: any) => shop.shop_id
            );
            setShops(shopIds); // Set the shop IDs
        }
    }, [shop_data]);

    // Fetch items for all shops when shop IDs are updated
    useEffect(() => {
        const fetchAllShopItems = async () => {
            if (shop_ids.length > 0) {
                try {
                    const allItems = await Promise.all(
                        shop_ids.map(async (shopId) => {
                            const { data } = await refetchShopItems({
                                shopId,
                            });
                            return data?.getShopItems || [];
                        })
                    );
                    // Flatten the array of arrays into a single list of items
                    setShopItems(allItems.flat());
                } catch (error) {
                    console.error("Error fetching shop items:", error);
                }
            }
        };

        fetchAllShopItems();
        const intervalId = setInterval(() => {
            fetchAllShopItems();
        }, 5000);

        // Cleanup the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [shop_ids, refetchShopItems]);

    const categories = [
        { id: 1, name: "Food and Beverages" },
        { id: 2, name: "Household Essentials" },
        { id: 3, name: "Pet Supplies" },
        { id: 4, name: "Electronic and Office supplies" },
        { id: 5, name: "Clothing and Seasonal Items" },
    ];

    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedImage(event.target.files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setItemDeleteId(e.target.value);
    };

    const handleEdit = (item: Item) => {
        setBarcode(item.barcode_id);
        setSelectedItem(item);
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setQuantity(item.quantity);
        setShowEditModal(true);
    };

    const handleDeleteClose = () => {
        setShowDeleteModal(false);
        setSelectedItem(null);
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setSelectedItem(null);
        setBarcode("");
        setSelectedImage(null);
        setDescription("");
        setPrice(0);
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const handleAdd = () => {
        setShowAddModal(true);
        setDescription("");
        setPrice(0);
    };

    const handleAddClose = () => {
        setShowAddModal(false);
        setBarcode("");
        setSelectedImage(null);
    };

    const [createItemMutation] = useMutation(CREATE_ITEM);

    const handleFormSubmit = async () => {

        if (isNameInvalid || isDescripInvalid || isPriceInvalid || isQuantityInvalid) {
            alert("Please fill in all the fields!");
            return;
        }

        let imageUrl = "";

        if (selectedImage) {
            const formData = new FormData();
            formData.append("file", selectedImage);
            formData.append(
                "upload_preset",
                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET!
            );

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
                    }/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const data = await response.json();
                imageUrl = data.secure_url;
                if (shop_ids[0]) {
                    try {
                        await createItemMutation({
                            variables: {
                                shopId: shop_ids[0],
                                name: name,
                                description: description,
                                price: price,
                                quantity: quantity_item,
                                categoryId: categoryId,
                                itemImage: imageUrl,
                                barcodeId: barcode,
                            },
                        });
                        refetchShopItems();
                        setShowAddModal(false);
                    } catch (error) {
                        console.error("Error creating item:", error);
                    } finally {
                        setBarcode("");
                        setSelectedImage(null);
                    }
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                return;
            }
        }

        console.log(imageUrl);
    };

    const [deleteItemMutation] = useMutation(DELETE_ITEM);

    const deleteItem = async () => {
        if (itemDeleteId) {
            try {
                // Execute the mutation and pass the itemDeleteId as a variable
                await deleteItemMutation({
                    variables: { itemId: parseFloat(itemDeleteId) },
                });
                refetchShopItems();
                setShowDeleteModal(false);
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        }
    };

    const [updateItemMutation] = useMutation(UPDATE_ITEM);

    const updateItem = async () => {
        if (!selectedItem) {
            console.error("No selected item to update");
            return; // Exit the function if selectedItem is null
        }
        let imageUrl = selectedItem.item_image || " "; // Use current image as default

        // Check if a new image has been selected
        if (selectedImage) {
            const formData = new FormData();
            formData.append("file", selectedImage);
            formData.append(
                "upload_preset",
                import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET!
            );

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
                    }/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const data = await response.json();
                imageUrl = data.secure_url; // Update with new image URL
            } catch (error) {
                console.error("Error uploading image:", error);
                return;
            }
        }


        // Proceed with updating the item
        if (selectedItem) {
            try {
                await updateItemMutation({
                    variables: {
                        itemId: selectedItem.item_id,
                        name: name,
                        description: description,
                        price: price,
                        quantity: quantity_item,
                        categoryId: categoryId,
                        itemImage: imageUrl,
                        barcodeId: barcode,
                    },
                });

                refetchShopItems();
                setShowEditModal(false);
            } catch (error) {
                console.error("Error updating item:", error);
            } finally {
                setBarcode("");
                setSelectedImage(null);
            }
        }
    };

    if (shop_loading) return <p>Loading...</p>;
    if (shop_error) return <p>Error: {shop_error.message}</p>;
    return (
        <div>
            <NavBar />
            <Container fluid>
                <Row>
                    <NavAsideDash />
                    <Col md={10} className="p-4">
                        <Row className=" d-flex align-items-center justify-content-between">
                            <Col>
                                <h1>Items Available</h1>
                            </Col>
                            <Col className="text-end">
                                <Button
                                    style={{
                                        backgroundColor: "#ed871f",
                                        borderColor: "#ed871f",
                                        color: "black",
                                    }}
                                    onClick={exportToPDF}
                                >
                                    Export to PDF
                                </Button>
                            </Col>
                        </Row>
                        <div className="mt-4">
                            <Table
                                striped
                                bordered
                                hover
                                responsive
                                className="rounded custom-table"
                            >
                                <thead>
                                    <tr>
                                        <th>Item ID</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shopItems.map((item) => (
                                        <tr key={item.item_id}>
                                            <td>{item.item_id}</td>
                                            <td>
                                                <img
                                                    src={item.item_image}
                                                    className="table-image"
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        objectFit: "cover",
                                                    }}
                                                    alt={item.name}
                                                />
                                            </td>
                                            <td>{item.name}</td>
                                            <td>{item.description}</td>
                                            <td>{item.quantity}</td>
                                            <td>R {item.price.toFixed(2)}</td>
                                            <td>
                                                <Button
                                                    className="custom-button"
                                                    style={{
                                                        backgroundColor:
                                                            "#ed871f",
                                                        borderColor: "#ed871f",
                                                        color: "black",
                                                    }}
                                                    onClick={() => {
                                                        setIsNameInvalid(false)
                                                        setIsDescripInvalid(false)
                                                        setIsPriceInvalid(false)
                                                        setIsQuantityInvalid(false)
                                                        handleEdit(item)
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <Modal
                                show={showEditModal}
                                onHide={handleEditClose}

                                centered
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title>Edit Item</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    {selectedItem && (
                                        <Form>
                                            <Form.Group
                                                controlId="formImage"
                                                className="mt-3"
                                            >
                                                <Form.Label>
                                                    Upload Image
                                                </Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </Form.Group>
                                            {/* Display a preview of the downloaded image */}
                                            {selectedImage && (
                                                <div className="mt-3">
                                                    <Form.Label>
                                                        Downloaded Image Preview
                                                    </Form.Label>
                                                    <img
                                                        src={URL.createObjectURL(
                                                            selectedImage
                                                        )} // Convert the selected image (blob) into a URL to display it
                                                        alt="Downloaded product"
                                                        style={{
                                                            width: "150px",
                                                            height: "150px",
                                                            objectFit: "cover",
                                                        }} // Style as needed
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="mt-3">
                                                    {/* Button to open scanner modal */}
                                                    <Button
                                                        style={{
                                                            backgroundColor:
                                                                "#ed871f",
                                                            borderColor:
                                                                "#ed871f",
                                                            color: "black",
                                                        }}
                                                        onClick={startScanner}
                                                        variant="primary"
                                                    >
                                                        Start Barcode Scan
                                                    </Button>
                                                    <p className="mt-2">
                                                        Scanned Barcode:{" "}
                                                        {barcode}
                                                    </p>
                                                </div>

                                                {/* Modal for camera feed */}
                                                <Modal
                                                    show={showScanner}
                                                    onHide={stopScanner}
                                                    centered
                                                >
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>
                                                            Scan Barcode
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body
                                                        style={{
                                                            position:
                                                                "relative",
                                                        }}
                                                    >
                                                        {/* Video element for scanner */}
                                                        <video
                                                            ref={videoRef}
                                                            id="scanner"
                                                            style={{
                                                                width: "100%",
                                                                height: "300px",
                                                            }}
                                                            autoPlay
                                                            muted
                                                        />

                                                        {/* Overlay a horizontal line in the center */}
                                                        <div
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                top: "50%",
                                                                left: 0,
                                                                right: 0,
                                                                height: "2px",
                                                                backgroundColor:
                                                                    "red",
                                                                transform:
                                                                    "translateY(-50%)",
                                                                pointerEvents:
                                                                    "none", // Ensure this doesn't block video clicks
                                                            }}
                                                        />
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={
                                                                stopScanner
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </Modal.Footer>
                                                </Modal>
                                            </div>
                                            <Form.Group controlId="formItemname">
                                                <Form.Label>
                                                    Item Name
                                                </Form.Label>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    defaultValue={
                                                        selectedItem.name
                                                    }
                                                    value={name} // Bind the input value to the state
                                                    onChange={handleNameChange} // Keep the event handler for manual changes
                                                    isInvalid={isNameInvalid}

                                                />
                                            </Form.Group>

                                            <Form.Group
                                                controlId="formQuantity"
                                                className="mt-3"
                                            >
                                                <Form.Label>
                                                    Description
                                                </Form.Label>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    defaultValue={
                                                        selectedItem.description
                                                    }
                                                    onChange={
                                                        handleDescriptionChange
                                                    }
                                                    isInvalid={isDescripInvalid}
                                                //value={selectedItem.description}
                                                />
                                            </Form.Group>
                                            <Form.Group
                                                controlId="formQuantity"
                                                className="mt-3"
                                            >
                                                <Form.Label>
                                                    Quantity
                                                </Form.Label>
                                                <Form.Control
                                                    required
                                                    type="number"
                                                    defaultValue={
                                                        selectedItem.quantity
                                                    }
                                                    onChange={
                                                        handleQuantityChange
                                                    }
                                                    isInvalid={isQuantityInvalid}
                                                //value={selectedItem.quantity}
                                                />
                                            </Form.Group>
                                            <Form.Group
                                                controlId="formPrice"
                                                className="mt-3"
                                            >
                                                <Form.Label>Price</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="number"
                                                    defaultValue={
                                                        selectedItem.price
                                                    }
                                                    onChange={handlePriceChange}
                                                    isInvalid={isPriceInvalid}
                                                //value={selectedItem.price}
                                                />
                                            </Form.Group>
                                            <Form.Group
                                                controlId="formCategory"
                                                className="mt-3"
                                            >
                                                <Form.Label>
                                                    Select Category
                                                </Form.Label>
                                                <Form.Select
                                                    required
                                                    onChange={
                                                        handleCategoryChange
                                                    }
                                                    defaultValue={
                                                        selectedItem.category
                                                    }
                                                >
                                                    {categories.map(
                                                        (category) => (
                                                            <option
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.id
                                                                }
                                                            >
                                                                {category.name}
                                                            </option>
                                                        )
                                                    )}
                                                </Form.Select>
                                            </Form.Group>
                                        </Form>
                                    )}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        variant="secondary"
                                        onClick={handleEditClose}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={updateItem}
                                    >
                                        Save changes
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                        <Row className=" d-flex align-items-center justify-content-between">
                            <>
                                <Col className="add-button">
                                    <Button
                                        className="custom-button"
                                        style={{
                                            backgroundColor: "#ed871f",
                                            borderColor: "#ed871f",
                                            color: "black",
                                        }}
                                        onClick={() => {
                                            setIsNameInvalid(true)
                                            setIsDescripInvalid(true)
                                            setIsPriceInvalid(true)
                                            setIsQuantityInvalid(true)
                                            handleAdd()
                                        }}
                                    >
                                        Add New Item
                                    </Button>

                                    <Modal
                                        show={showAddModal}
                                        onHide={handleAddClose}
                                        centered
                                    >
                                        <Modal.Header closeButton>
                                            <Modal.Title>
                                                Add New Item
                                            </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            {
                                                <Form>
                                                    <Form.Group
                                                        controlId="formImage"
                                                        className="mt-3"
                                                    >
                                                        <Form.Label>
                                                            Upload Image
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={
                                                                handleImageChange
                                                            }
                                                        />
                                                    </Form.Group>
                                                    {/* Display a preview of the downloaded image */}
                                                    {selectedImage && (
                                                        <div className="mt-3">
                                                            <Form.Label>
                                                                Downloaded Image
                                                                Preview
                                                            </Form.Label>
                                                            <img
                                                                src={URL.createObjectURL(
                                                                    selectedImage
                                                                )} // Convert the selected image (blob) into a URL to display it
                                                                alt="Downloaded product"
                                                                style={{
                                                                    width: "150px",
                                                                    height: "150px",
                                                                    objectFit:
                                                                        "cover",
                                                                }} // Style as needed
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="mt-3">
                                                            {/* Button to open scanner modal */}
                                                            <Button
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ed871f",
                                                                    borderColor:
                                                                        "#ed871f",
                                                                    color: "black",
                                                                }}
                                                                onClick={
                                                                    startScanner
                                                                }
                                                                variant="primary"
                                                            >
                                                                Start Barcode
                                                                Scan
                                                            </Button>
                                                            <p className="mt-2">
                                                                Scanned Barcode:{" "}
                                                                {barcode}
                                                            </p>
                                                        </div>

                                                        {/* Modal for camera feed */}
                                                        <Modal
                                                            show={showScanner}
                                                            onHide={stopScanner}
                                                            centered
                                                        >
                                                            <Modal.Header
                                                                closeButton
                                                            >
                                                                <Modal.Title>
                                                                    Scan Barcode
                                                                </Modal.Title>
                                                            </Modal.Header>
                                                            <Modal.Body
                                                                style={{
                                                                    position:
                                                                        "relative",
                                                                }}
                                                            >
                                                                {/* Video element for scanner */}
                                                                <video
                                                                    ref={
                                                                        videoRef
                                                                    }
                                                                    id="scanner"
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "300px",
                                                                    }}
                                                                    autoPlay
                                                                    muted
                                                                />

                                                                {/* Overlay a horizontal line in the center */}
                                                                <div
                                                                    style={{
                                                                        position:
                                                                            "absolute",
                                                                        top: "50%",
                                                                        left: 0,
                                                                        right: 0,
                                                                        height: "2px",
                                                                        backgroundColor:
                                                                            "red",
                                                                        transform:
                                                                            "translateY(-50%)",
                                                                        pointerEvents:
                                                                            "none", // Ensure this doesn't block video clicks
                                                                    }}
                                                                />
                                                            </Modal.Body>
                                                            <Modal.Footer>
                                                                <Button
                                                                    variant="secondary"
                                                                    onClick={
                                                                        stopScanner
                                                                    }
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </Modal.Footer>
                                                        </Modal>
                                                    </div>
                                                    <Form.Group controlId="formItemname">
                                                        <Form.Label>
                                                            Item Name
                                                        </Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            onChange={
                                                                handleNameChange
                                                            }
                                                            isInvalid={isNameInvalid}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group controlId="formDescription">
                                                        <Form.Label>
                                                            Description
                                                        </Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            value={description} // Bind the input value to the state
                                                            onChange={
                                                                handleDescriptionChange
                                                            }
                                                            isInvalid={isDescripInvalid}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group
                                                        controlId="formCategory"
                                                        className="mt-3"
                                                    >
                                                        <Form.Label>
                                                            Select Category
                                                        </Form.Label>
                                                        <Form.Select
                                                            onChange={
                                                                handleCategoryChange
                                                            }
                                                        >
                                                            {categories.map(
                                                                (category) => (
                                                                    <option
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={
                                                                            category.id
                                                                        }
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Form.Group controlId="formPrice">
                                                        <Form.Label>
                                                            Price
                                                        </Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="number"
                                                            value={price} // Bind the input value to the state
                                                            onChange={
                                                                handlePriceChange
                                                            } // Event handler for manual changes
                                                            isInvalid={isPriceInvalid}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group
                                                        controlId="fromQuantity"
                                                        className="mt-3"
                                                    >
                                                        <Form.Label>
                                                            Quantity
                                                        </Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="number"
                                                            onChange={
                                                                handleQuantityChange
                                                            }
                                                            isInvalid={isQuantityInvalid}
                                                        />
                                                    </Form.Group>
                                                </Form>
                                            }
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button
                                                variant="secondary"
                                                onClick={handleAddClose}
                                            >
                                                Close
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={handleFormSubmit}
                                            >
                                                Save changes
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                </Col>
                            </>

                            <Col className="delete-button">
                                <Button
                                    className="custom-button"
                                    style={{
                                        backgroundColor: "#ed871f",
                                        borderColor: "#ed871f",
                                        color: "black",
                                        float: "right",
                                    }}
                                    onClick={() => handleDelete()}
                                >
                                    Delete Item
                                </Button>

                                <Modal
                                    show={showDeleteModal}
                                    onHide={handleDeleteClose}
                                    centered
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>Delete Item</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {
                                            <Form>
                                                <Form.Group
                                                    controlId="formID"
                                                    className="mt-3"
                                                >
                                                    <Form.Label>
                                                        Item ID
                                                    </Form.Label>
                                                    <Form.Control
                                                        required
                                                        type="text"
                                                        value={itemDeleteId}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    />
                                                </Form.Group>
                                            </Form>
                                        }
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button
                                            variant="secondary"
                                            onClick={handleDeleteClose}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={deleteItem}
                                        >
                                            Delete item
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default InventoryPage;
