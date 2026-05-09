const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();


const connectDb = require("./utils/db")

const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const doubtRoutes = require("./routes/doubtRoutes");

const port = process.env.PORT;

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URLS
            ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
            : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/doubts", doubtRoutes);

app.listen(process.env.PORT, async() => {
    await connectDb();
    console.log(`Server is running on port ${port}`);
});
