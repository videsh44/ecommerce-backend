const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const request = require("request");
const Razorpay = require("razorpay");

const resozar_id = process.env.RESOZAR_ID;
const resozar_key = process.env.RESOZAR_KEY;

const instance = new Razorpay({
  key_id: resozar_id,
  key_secret: resozar_key,
});

exports.getAllOrders = (req, res, next) => {
  Order.find()
    .select("_id product quantity user")
    .populate("product", "_id name price productImage discount is_discount")
    .exec()
    .then((orders) => {
      res.status(200).json({
        count: orders.length,
        orders: orders,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.createOneOrder = (req, res, next) => {
  //  console.log("req.body.productId", req.body.productId);
  Product.findById(req.body.productId)
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product Not Found!",
        });
      }
      //  console.log("product", product);
      return createOrder(req);
    })
    .then((order) => {
      return order.save();
    })
    .then((order) => {
      return User.findById(req.body.userId);
    })
    /*
    .then((user) => {
      console.log("user", user);

      user.orders.push(order);
      console.log("user2", user);

      return user.save();
    })*/
    .then((result) => {
      // console.log("result", result);
      return res.status(201).json({
        message: "Order was created",
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getOneOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  console.log("orderId", orderId);
  Order.findById(orderId)
    .select("_id product quantity user")
    .populate("product", "_id name price productImage discount is_discount")
    .exec()
    .then((order) => {
      if (!order) {
        console.log("no product found");
      }
      res.status(201).json(order);
    })
    .catch((error) => {
      next(error);
    });
};

exports.getOrderByUser = (req, res, next) => {
  console.log("req.params.userId", req.params.userId);
  const userId = req.params.userId;
  Order.find({ user: mongoose.Types.ObjectId(userId) })
    .select("_id product quantity user")
    .populate("product", "_id name price productImage discount is_discount")
    .exec()
    .then((order) => {
      if (!order) {
        console.log("no product found");
      }
      return res.status(201).json(order);
    })
    .catch((error) => {
      next(error);
    });
};

exports.updateOneOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.update({ _id: orderId }, { $set: req.body })
    .exec()
    .then((result) => {
      return res.status(200).json({
        message: "Updated Order Successfully!",
        result: result,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.deleteOneOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.remove({ _id: orderId })
    .exec()
    .then((result) => {
      return res.status(200).json({
        message: "Deleted order!",
        result: result,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.paymentOrders = (req, res, next) => {
  try {
    const options = {
      amount: 10 * 100, // amount == Rs 10
      currency: "INR",
      receipt: "receipt#1",
      payment_capture: 0,
      // 1 for automatic capture // 0 for manual capture
    };
    instance.orders.create(options, async function (err, order) {
      if (err) {
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }
      console.log("instance", instance);
      return res.status(200).json(order);
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};

exports.paymentCheckout = (req, res, next) => {
  //  console.log("req", req);
  try {
    return request(
      {
        method: "POST",
        url: `https://${resozar_id}:${resozar_key}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
        form: {
          amount: req.body.temp_amount, // amount == Rs 10 // Same As Order amount
          currency: "INR",
        },
      },
      async function (err, response, body) {
        if (err) {
          console.log("err", err);
          return res.status(500).json({
            message: "Something Went Wrong",
          });
        }

        console.log("Status:", response.statusCode);
        console.log("Headers:", JSON.stringify(response.headers));
        console.log("Response:", body);
        return res.status(200).json(body);
      }
    );
  } catch (err) {
    console.log("err", err);
    return res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};

function createOrder(req) {
  return new Order({
    _id: mongoose.Types.ObjectId(),
    product: req.body.productId,
    user: req.body.userId,
    quantity: req.body.quantity,
  });
}
