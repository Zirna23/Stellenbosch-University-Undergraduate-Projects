import React from "react";
import { Col, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/Categories.css";

interface CategoryItem {
    label: string;
    path: string;
    category_id: number;
}

interface CategoriesProps {
    categories: CategoryItem[]; // Accept an array of categories
}

const Categories: React.FC<CategoriesProps> = ({ categories }) => {
    const navigate = useNavigate();

    return (
        <Col md={2} className="bg-light p-3 custom-sidebar d-flex flex-column">
            <h3 className="categories-heading">Categories</h3>{" "}
            {/* Heading added */}
            <Nav defaultActiveKey="/dashboard" className="flex-column">
                {categories.map((category, index) => (
                    <Nav.Link
                        key={index}
                        className="custom-nav-link"
                        onClick={() =>
                            navigate(category.path, {
                                state: { category_id: category.category_id },
                            })
                        }
                    >
                        {category.label}
                    </Nav.Link>
                ))}
            </Nav>
        </Col>
    );
};

export default Categories;
