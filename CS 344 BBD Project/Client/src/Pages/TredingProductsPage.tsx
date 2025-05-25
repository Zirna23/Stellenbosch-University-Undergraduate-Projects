import NavAsideDash from "../components/NavAsideDash";
import NavBar from "../components/NavBar";
import "../styles/Dashboard.css";
import {
    Container,
    Row,
    Col,
    Table,
    Form,
    Dropdown,
    Button,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_SHOP_ITEMS } from "../graphql/shop";
import { useUser } from "../context/UserContext";
import { GET_USER_SHOPS } from "../graphql/user";
import jsPDF from "jspdf";
import "jspdf-autotable";

type Item = {
    item_id: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    item_image: string;
    sales: number;
};

const TrendingProductsPage = () => {
    const [sortedProducts, setSortedProducts] = useState<Item[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [filter, setFilter] = useState<string>("");
    const [shop_ids, setShops] = useState<number[]>([]);

    const [shopItems, setShopItems] = useState<Item[]>([]); // Shop items state

    const { user } = useUser();

    //get user shop
    const {
        loading: shop_loading,
        error: shop_error,
        data: shop_data,
    } = useQuery(GET_USER_SHOPS, {
        variables: user ? { userId: user.user_id } : undefined,
    });

    const { refetch: refetchShopItems } = useQuery(GET_SHOP_ITEMS, {
        variables: { shopId: shop_ids[0] },
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

    useEffect(() => {
        if (shopItems.length > 0) {
            const sortedProducts = [...shopItems].sort((a, b) => {
                return sortOrder === "asc"
                    ? a.sales - b.sales
                    : b.sales - a.sales;
            });
            setSortedProducts(sortedProducts);
        }
    }, [sortOrder, shopItems]);

    const filteredProducts = sortedProducts.filter((product) =>
        product.name.toLowerCase().includes(filter.toLowerCase())
    );

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Set document title
        doc.text("Best selling", 10, 10);

        // Prepare table headers and data
        const headers = [["Item ID", "Name", "Price", "Sales", "Revenue"]];
        const data = shopItems.map((item) => [
            item.item_id.toString(),
            item.name,
            "R " + item.sales.toFixed(2),
            item.sales.toString(),
            "R " + (item.sales * item.price).toFixed(2),
        ]);

        // Add table to PDF
        (doc as any).autoTable({
            head: headers,
            body: data,
            startY: 20, // Space after the title
        });

        // Save the PDF
        doc.save("BestSelling.pdf");
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
                        <Row className="d-flex align-items-center justify-content-between">
                            <Col>
                                <h1>Best Selling</h1>
                            </Col>
                            <Col md={4} className="text-end">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </Col>
                            <Col md={2} className="text-end">
                                <Dropdown
                                    onSelect={(e) =>
                                        setSortOrder(e as "asc" | "desc")
                                    }
                                >
                                    <Dropdown.Toggle variant="secondary">
                                        Sort by Sales
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item eventKey="asc">
                                            Ascending
                                        </Dropdown.Item>
                                        <Dropdown.Item eventKey="desc">
                                            Descending
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
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
                                        <th>Product ID</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Sales</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.item_id}>
                                            <td>{product.item_id}</td>
                                            <td>
                                                <img
                                                    src={product.item_image}
                                                    className="table-image"
                                                    alt={product.name}
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                    }} // Ensures consistent image size
                                                />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>R {product.price}</td>
                                            <td>{product.sales}</td>
                                            <td>
                                                R{" "}
                                                {product.sales * product.price}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <Button
                            style={{
                                backgroundColor: "#ed871f",
                                borderColor: "#ed871f",
                                color: "black",
                            }}
                            onClick={exportToPDF}
                        >
                            Export to pdf
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TrendingProductsPage;
