const express = require("express");
const router = express.Router();
//const checkAuth = require("../middleware/check-auth");

const CartController = require("../controllers/cart");

router.get("/all-orders", CartController.getAllCartOrders);

router.post("/create", CartController.createOneCartOrder);
router.get("/:orderId", CartController.getOneCartOrder);

router.get("/user/:userId", CartController.getCartOrderByUser);

router.patch("/:orderId", CartController.updateOneCartOrder);

router.delete("/:orderId", CartController.deleteOneCartOrder);

module.exports = router;
