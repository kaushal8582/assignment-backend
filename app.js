const express = require("express");
const cors = require("cors");
const cron = require("cron");
const { CronJob } = require("cron");



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


app.get("/api/v1/health", (req, res) => {   
    res.status(200).json({
        status: "success",
        message: "Server is running"
    });
});


app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/doubts", doubtRoutes);




const job = new CronJob("*/10 * * * * *", () => {
    
    const che = async()=>{
        try {
            const res = await fetch("https://assignment-backend-ik8y.onrender.com/api/v1/health")
            if(res.status === 200){
                console.log("Server is running");
            }else{
                console.log("Server is not running");
            }
        } catch (error) {
         console.log(error);
        }
    }

    che()
   
 });
 
 job.start();

app.listen(process.env.PORT, async() => {
    await connectDb();
    console.log(`Server is running on port ${port}`);
});
