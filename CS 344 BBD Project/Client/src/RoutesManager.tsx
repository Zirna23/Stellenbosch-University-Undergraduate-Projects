import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import NotFoundPage from "./Pages/NotFoundPage";
import HomePage from "./Pages/HomePage";
import SearchPage from "./Pages/SearchPage";
import ItemPage from "./Pages/ItemPage";
import Dashboard from "./Pages/Dashboard";
import Cart from "./Pages/Cart";
import OrdersPage from "./Pages/OrdersPage";
import NotificationsPage from "./Pages/NotificationsPage";
import SpecificOrderPage from "./Pages/SpecificOrderPage";
import InventoryPage from "./Pages/InventoryPage";
import UserManagement from "./Pages/UserManagement";
import RegisterShop from "./Pages/RegisterShop";
import TrendingProductsPage from "./Pages/TredingProductsPage";
import ShopInfoPage from "./Pages/ShopInfoPage";

const RoutesManager = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/item" element={<ItemPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/specificOrder" element={<SpecificOrderPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/registershop" element={<RegisterShop />} />
                <Route
                    path="/trending-products"
                    element={<TrendingProductsPage />}
                />
                <Route path="/shop-info" element={<ShopInfoPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

export default RoutesManager;
