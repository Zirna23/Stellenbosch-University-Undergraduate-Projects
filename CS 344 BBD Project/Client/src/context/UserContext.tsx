import {
    createContext,
    useState,
    useContext,
    ReactNode,
    useEffect,
} from "react";
import { GET_USER_ROLE } from "../graphql/user";
import { useQuery } from "@apollo/client";

type Role = {
    role_id: number;
    role_name: string;
};

// Define the type for the user
type User = {
    user_id: number;
    name: string;
    email: string;
    role: Role;
};

// Define the shape of the context
type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
};

// Create the UserContext
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the UserContext
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

// The UserProvider wraps the application and provides user functionality
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        // Load user from localStorage if available
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Use the query to get the user role when a user is set
    const { data: roleData } = useQuery(GET_USER_ROLE, {
        variables: user ? { userId: user.user_id } : undefined,
        skip: !user,
    });

    // UseEffect to update user role once role data is fetched
    useEffect(() => {
        if (roleData && roleData.getUserRole && user) {
            // Only update the user if the role has changed
            if (user.role?.role_id !== roleData.getUserRole.role_id) {
                const updatedUser = { ...user, role: roleData.getUserRole };
                setUser(updatedUser);
            }
        }
    }, [roleData, user]);

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
