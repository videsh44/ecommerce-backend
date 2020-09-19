const express = require("express");
const router = express.Router();
//const checkAuth = require("../middleware/check-auth");

const OrdersController = require("../controllers/orders");

router.get("/all-orders", OrdersController.getAllOrders);

router.post("/create", OrdersController.createOneOrder);
router.get("/:orderId", OrdersController.getOneOrder);

router.get("/user/:userId", OrdersController.getOrderByUser);

router.patch("/:orderId", OrdersController.updateOneOrder);

router.delete("/:orderId", OrdersController.deleteOneOrder);

router.post("/capture/:paymentId", OrdersController.paymentCheckout);
router.get("/order", OrdersController.paymentOrders);

module.exports = router;
