const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const http = require("http"); // Import http to create a server
const { Server } = require("socket.io"); // Import Socket.IO
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const authenticate = require("./middleware/authenticate");
const cors = require("cors"); // Import CORS middleware

require("dotenv").config();

const connectedUsers = {}; // Object to store connected users by note_id

async function startServer() {
  const app = express();

  app.use(
    cors({
      origin: "*", // Allow requests from this origin
      methods: ["GET", "POST"], // Allow these HTTP methods
    })
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const user = await authenticate(req);
      return { user };
    },
    formatError: (err) => {
      console.error("GraphQL Error:", err);
      return err;
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const httpServer = http.createServer(app); // Create an HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow requests from this origin
      methods: ["GET", "POST"], // Allow these HTTP methods
    },
  }); // Initialize Socket.IO with the HTTP server

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Listen for joinNote event when a user joins a note
    socket.on("joinNote", (data) => {
      const { note_id, username } = data;

      // Add user to the connectedUsers object
      if (!connectedUsers[note_id]) {
        connectedUsers[note_id] = [];
      }
      if (!connectedUsers[note_id].includes(username)) {
        connectedUsers[note_id].push(username);
      }

      // Join the socket room for this note
      socket.join(note_id);

      // Broadcast updated user list to all clients in the same note room
      io.to(note_id).emit("userListUpdate", connectedUsers[note_id]);
    });

    // Listen for leaveNote event when a user leaves the note
    socket.on("leaveNote", (data) => {
      const { note_id, username } = data;

      // Remove user from the connectedUsers object
      if (connectedUsers[note_id]) {
        connectedUsers[note_id] = connectedUsers[note_id].filter(
          (user) => user !== username
        );
      }

      // Broadcast updated user list to all clients in the same note room
      io.to(note_id).emit("userListUpdate", connectedUsers[note_id]);
    });

    // Listen for editNote event
    socket.on("editNote", (data) => {
      const { note_id, content } = data;

      // Broadcast the changes to all connected clients in the same note room
      io.to(note_id).emit("noteUpdated", { note_id, content });
    });

    // Handle socket disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected");
      // Optionally handle user disconnection if needed
    });
  });

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(
      `Server is running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
