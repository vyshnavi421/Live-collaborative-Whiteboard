const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {

    console.log("✅ User Connected:", socket.id);

    socket.on("drawing", (data) => {

        socket.broadcast.emit("drawing", data);

    });

    socket.on("clear", () => {

        socket.broadcast.emit("clear");

    });

    socket.on("disconnect", () => {

        console.log("❌ User Disconnected:", socket.id);

    });

});

server.listen(5000, () => {

    console.log("🚀 Server running on port 5000");

});