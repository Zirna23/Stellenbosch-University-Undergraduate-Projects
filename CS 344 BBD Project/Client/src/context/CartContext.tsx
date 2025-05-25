import {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
} from "react";
import { useUser } from "./UserContext";
import { useLazyQuery } from "@apollo/client";
import { GET_SHOP_BY_ITEM_ID } from "../graphql/item";

// Define the type for cart items
type CartItem = {
    item_id: number;
    quantity: number;
    shop_id: number;
};

// Define the shape of the context
type CartContextType = {
    cartItems: CartItem[];
    addToCart: (item_id: number, quantity: number) => void;
    removeFromCart: (item_id: number) => void;
    removeOneFromCart: (item_id: number, quantity: number) => void;
    clearCart: () => void;
};

// Create the CartContext
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

// The CartProvider wraps the application and provides cart functionality
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();

    const getCartKey = (): string => {
        return user ? `cart_${user.user_id}` : "cart_guest";
    };

    const loadCartFromLocalStorage = (): CartItem[] => {
        const savedCart = localStorage.getItem(getCartKey());
        return savedCart ? JSON.parse(savedCart) : [];
    };

    const [cartItems, setCartItems] = useState<CartItem[]>(() =>
        loadCartFromLocalStorage()
    );

    const [getShopByItemId] = useLazyQuery(GET_SHOP_BY_ITEM_ID);
    // Function to add an item to the cart
    const addToCart = async (item_id: number, quantity: number) => {
        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }

        const { data: shopData } = await getShopByItemId({
            variables: { itemId: item_id },
        });
        const shop_id = shopData?.getShopByItemId?.shop_id;

        if (!shop_id) {
            console.error(
                "Failed to fetch shop information for item:",
                item_id
            );
            return;
        }

        setCartItems((prev) => {
            const itemInCart = prev.find((item) => item.item_id === item_id);
            let newCartItems;
            if (itemInCart) {
                newCartItems = prev.map((item) =>
                    item.item_id === item_id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newCartItems = [...prev, { item_id, quantity, shop_id }];
            }

            // Save the updated cart to localStorage
            localStorage.setItem(getCartKey(), JSON.stringify(newCartItems));
            return newCartItems;
        });
    };

    const removeOneFromCart = (item_id: number, quantity: number) => {
        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }
        setCartItems((prev) => {
            const itemInCart = prev.find((item) => item.item_id === item_id);
            let newCartItems;

            if (itemInCart) {
                newCartItems = prev.map((item) =>
                    item.item_id === item_id && item.quantity - quantity > 0
                        ? { ...item, quantity: item.quantity - quantity } // Reduce quantity only
                        : item
                );
            } else {
                // If the item isn't in the cart, return the cart unchanged
                newCartItems = [...prev];
            }

            // Save the updated cart to localStorage
            localStorage.setItem(getCartKey(), JSON.stringify(newCartItems));
            return newCartItems;
        });
    };

    const clearCart = () => {
        // Clear the cart items state
        setCartItems([]);
        // Remove cart data from localStorage
        localStorage.removeItem(getCartKey());
    };

    // Function to remove an item from the cart
    const removeFromCart = (item_id: number) => {
        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }
        setCartItems((prev) => {
            const newCartItems = prev.filter(
                (item) => item.item_id !== item_id
            );
            // Save the updated cart to localStorage
            localStorage.setItem(getCartKey(), JSON.stringify(newCartItems));
            return newCartItems;
        });
    };

    // Sync localStorage with the cart state when the component is mounted
    useEffect(() => {
        const savedCart = loadCartFromLocalStorage();
        setCartItems(savedCart);
    }, [user]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                removeOneFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
