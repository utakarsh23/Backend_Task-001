const express = require("express");
const {connectMongoDB} = require("./db/connection");
const {jsonParser} = require("./middlewares/index")
const PublicRouters = require("./routers/PublicRouters");
const UserRouters = require("./routers/UserRouters");
const AdminRouters = require("./routers/AdminRouters");
const cors = require("cors")
const redis = require("./utils/redis");
const dotenv = require("dotenv");
dotenv.config();


const app = express();
const PORT = process.env.PORT || 7878;

const mongoURI = process.env.MONGO_URI;

connectMongoDB(mongoURI)
    .then(() => console.log("MongoDB Connected!!"))
    .catch(err => console.log("Error, Can't connect to DB", err));

app.use(jsonParser());

app.use(cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use("/public/v1/", PublicRouters);
app.use("/user/v1/", UserRouters);
app.use("/admin/v1/", AdminRouters);

app.listen(PORT, () =>
    console.log(`Server Started on port ${PORT}`))