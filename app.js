const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var cors = require("cors");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const dotenv = require("dotenv");
const aws = require("aws-sdk");

dotenv.config();

const port = process.env.PORT || 5000;

//const mongoUrl = process.env.MONGO_URL_DEV;

/**
let s3 = new aws.S3({
  mongoUrl: process.env.MONGO_URL_DEV,
});

const mongoUrl = s3.config.mongoUrl;
 */

//console.log(s3.config.mongoUrl);

mongoose
  .connect(process.env.MONGO_URL_DEV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

const app = express();
// Log request data
app.use(morgan("dev"));

// Setup static files path
app.use("/uploads", express.static("uploads"));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(cors());

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const cartRoutes = require("./api/routes/cart");
const userRoutes = require("./api/routes/user");

// Setup CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

app.use("/user", userRoutes);

// Handle Error Requests
app.use((req, res, next) => {
  const error = new Error();
  error.message = "Not Found";
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: error,
  });
});

app.listen(port, () => {
  console.log("Server is listening on port 8080");
});
