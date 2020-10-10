const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/user");

exports.getAllCartOrders = (req, res, next) => {
  Cart.find()
    .select("_id product quantity user")
    .populate("product", "_id name price productImage discount is_discount")
    .exec()
    .then((cart) => {
      res.status(200).json({
        count: cart.length,
        cart: cart,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.createOneCartOrder = (req, res, next) => {
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
      return createCartOrder(req);
    })
    .then((cart) => {
      return cart.save();
    })
    .then((cart) => {
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
        message: "product added in the cart",
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getOneCartOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  // console.log("orderId", orderId);
  Cart.findById(orderId)
    .select("_id product quantity user")
    .populate("product", "_id name price productImage discount is_discount")
    .exec()
    .then((cart) => {
      if (!cart) {
        //  console.log("no product found");
        return res.status(404).json({
          message: "Product Not Found!",
        });
      }
      res.status(201).json(cart);
    })
    .catch((error) => {
      next(error);
    });
};

exports.getCartOrderByUser = (req, res, next) => {
  //  console.log("req.params.userId", req.params.userId);
  const userId = req.params.userId;
  Cart.find({ user: mongoose.Types.ObjectId(userId) })
    .select("_id product quantity user")
    .populate("product", "_id name price productImage discount is_discount")
    .exec()
    .then((cart) => {
      if (!cart) {
        // console.log("no product found");
        return res.status(404).json({
          message: "Product Not Found!",
        });
      }
      const response = {
        cart: cart.map((item) => {
          return {
            product: {
              _id: item.product._id,
              discount: item.product.discount,
              is_discount: item.product.is_discount,
              name: item.product.name,
              price: item.product.price,
              productImage: `https://ecommerce-videsh.herokuapp.com/${item.product.productImage}`,
            },
            quantity: item.quantity,
            user: item.user,
            _id: item._id,
          };
        }),
      };
      return res.status(200).json(response);
    })
    .catch((error) => {
      next(error);
    });
};

exports.updateOneCartOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Cart.update({ _id: orderId }, { $set: req.body })
    .exec()
    .then((result) => {
      return res.status(200).json({
        message: "Updated Cart Successfully!",
        result: result,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.deleteOneCartOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Cart.remove({ _id: orderId })
    .exec()
    .then((result) => {
      return res.status(200).json({
        message: "Deleted Cart order!",
        result: result,
      });
    })
    .catch((error) => {
      next(error);
    });
};

function createCartOrder(req) {
  return new Cart({
    _id: mongoose.Types.ObjectId(),
    product: req.body.productId,
    user: req.body.userId,
    quantity: req.body.quantity,
  });
}
