// Correct ES module imports
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express, { Request, Response } from 'express';
import { buildSchema } from 'type-graphql';
import myDataSource from './database/databaseSetup'; // Ensure the extension is .js for ES module
import { UserResolver } from './resolvers/userResolvers'; // Ensure your resolver files are using ES module syntax
import { ShopResolver } from './resolvers/shopResolvers';
import { OrderResolver } from './resolvers/orderResolvers';
import { NotificationResolver } from './resolvers/notificationResolvers';
import { ItemResolver } from './resolvers/itemResolvers';
import { InventoryResolver } from './resolvers/inventoryResolvers';
import cors from "cors";
// Define the context type
interface Context {
    req: Request;
}

// Main function to start the server
const startServer = async (): Promise<void> => {
    try {
        await myDataSource.initialize();
        console.log("Database connection established.");

    const schema = await buildSchema({
      resolvers: [UserResolver, ShopResolver, OrderResolver, NotificationResolver, ItemResolver, InventoryResolver],
    });

        const server = new ApolloServer<Context>({ schema });

        await server.start();

        const app = express();
        app.use(
            cors({
                origin: "http://localhost:5173", // This should match the client URL
            })
        );
        app.use(express.json());
        // Add JSON parsing middleware before Apollo Server middleware
        app.use(
            "/graphql",
            expressMiddleware(server, {
                context: async ({ req }): Promise<Context> => ({ req }),
            })
        );

        app.listen({ port: 4000 }, () => {
            console.log("🚀 Server ready at http://localhost:4000/graphql");
        });
    } catch (error) {
        console.error("Error starting the server:", error);
    }
};

// Start the server
startServer();
