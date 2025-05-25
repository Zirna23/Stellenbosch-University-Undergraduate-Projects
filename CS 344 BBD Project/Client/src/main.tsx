import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

// Create an Apollo Client instance
const client = new ApolloClient({
    uri: "http://localhost:4000/graphql", // Replace with your GraphQL server URL
    cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </React.StrictMode>
);
