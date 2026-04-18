import dotenv from "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./db/connect.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { setUserOnline, setUserOffline } from "./controllers/index.js";
import { seedAdmin } from "./db/adminSeeder.js";

const PORT = process.env.PORT || 8000;

const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST","DELETE"],
        credentials: true,
    },
});


connectDB()
    .then(async () => {
        // Seed initial data
        await seedAdmin();

        app.on("error", (error) => {
            console.log(`Error on express >> \n${error}`);
        });

        server.listen(PORT, () => {
            console.log(`server running on port : ${PORT} `);
        });
    })
    .catch((error) => {
        console.error("failed to run server! ERROR>", error);
    });

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const sockedId = socket.id
    if (userId) {
        setUserOnline(userId, socket.id);
        console.log(`${userId} connected, socketId: ${sockedId}`);
    }

    socket.on("disconnect", () => {
        setUserOffline(userId);
        console.log(`${userId} disconnected, socketId: ${sockedId}`);
    });
});

app.get("/", (_, res) => {
    res.json("This is nepwork server");
});
