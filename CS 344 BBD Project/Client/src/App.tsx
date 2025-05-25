import { Auth0Provider } from "@auth0/auth0-react";
import RoutesManager from "./RoutesManager";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";

const App = () => {
    return (
        <UserProvider>
            <CartProvider>
                <Auth0Provider
                    domain="dev-ikdu50mq3oufymwm.eu.auth0.com"
                    clientId="g8bZZsV43dHDoB0B0yRHRbX9CHnQxDLb"
                    cacheLocation="localstorage"
                    authorizationParams={{
                        redirect_uri: window.location.origin,
                    }}
                >
                    <RoutesManager />
                </Auth0Provider>
            </CartProvider>
        </UserProvider>
    );
};

export default App;
