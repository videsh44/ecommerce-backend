const mongoose = require("mongoose");
const Product = require("../models/product");

exports.getAllProducts = (req, res, next) => {
  const limit = +req.query.limit;
  const offset = +req.query.offset;
  let totalProducts;

  Product.find()
    .countDocuments()
    .then((totalCount) => {
      totalProducts = totalCount;
      return Product.find().sort({ date: "desc" }).skip(offset).limit(limit);
    })
    .then((products) => {
      const response = {
        count: totalProducts,
        products: products.map((product) => {
          return {
            _id: product._id,
            name: product.name,
            price: product.price,
            productImage: `https://ecommerce-videsh.herokuapp.com/${product.productImage}`,
            category: product.category,
            is_discount: product.is_discount,
            discount: product.discount,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((error) => {
      next(error);
    });
};

exports.getProductsByCategory = (req, res, next) => {
  const category = req.params.category;

  const limit = +req.query.limit;
  const offset = +req.query.offset;
  let totalProducts;

  Product.find({ category: category })
    .countDocuments()
    .then((totalCount) => {
      totalProducts = totalCount;
      return Product.find({ category: category })
        .sort({ date: "desc" })
        .skip(offset)
        .limit(limit);
    })
    .then((products) => {
      if (!products) {
        const error = new Error(
          "No products Found with this category" + category
        );
        error.statusCode = 404;
        throw error;
      }

      const response = {
        count: totalProducts,
        products: products.map((product) => {
          return {
            _id: product._id,
            name: product.name,
            price: product.price,
            productImage: `https://ecommerce-videsh.herokuapp.com/${product.productImage}`,
            category: product.category,
            is_discount: product.is_discount,
            discount: product.discount,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((error) => {
      next(error);
    });

  // console.log("category", category);
  /**

  Product.find({ category: category })
    // .select('_id name price')
    .exec()
    .then((products) => {
      if (!products) {
        const error = new Error(
          "No products Found with this category" + category
        );
        error.statusCode = 404;
        throw error;
      }

      //  console.log("products", products);

      const response = {
        count: products.length,
        products: products.map((product) => {
          return {
            _id: product._id,
            name: product.name,
            price: product.price,
            productImage: `http://localhost:8080/${product.productImage}`,
            category: product.category,
            is_discount: product.is_discount,
            discount: product.discount,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((error) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(error);
    });
     */
};

exports.createOneProduct = (req, res, next) => {
  const product = createProduct(req);

  product
    .save()
    .then((product) => {
      res.status(200).json({
        message: "Product Created Successfully!",
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          productImage: product.productImage,
          category: product.category,
          is_discount: product.is_discount,
          discount: product.discount,
        },
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getOneProduct = (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    // .select("_id name price productImage category is_discount discount")
    .exec()
    .then((product) => {
      // console.log(product);
      if (product) {
        const response = {
          _id: product._id,
          name: product.name,
          price: product.price,
          productImage: `https://ecommerce-videsh.herokuapp.com/${product.productImage}`,
          category: product.category,
          is_discount: product.is_discount,
          discount: product.discount,
        };

        res.status(200).json(response);
      } else {
        res.status(404).json({
          message: "Product Not Found!",
        });
      }
    })
    .catch((error) => {
      next(error);
    });
};

exports.updateOneProduct = (req, res, next) => {
  //console.log(req);
  const productId = req.params.productId;
  // const updateOps = {};
  // for (const prop of req.body) {
  // 	updateOps[prop.propName] = prop.propValue;
  // }

  Product.update({ _id: productId }, { $set: req.body })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Updated Product Successfully!",
        result: result,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.updateProductNew = (req, res) => {
  console.log(req);
  const productId = req.params.productId;
  // Validate Request
  if (!req.body.name) {
    return res.status(400).send({
      message: "name can not be empty",
    });
  }

  if (!req.body.price) {
    return res.status(400).send({
      message: "price can not be empty",
    });
  }

  if (!req.body.category) {
    return res.status(400).send({
      message: "category can not be empty",
    });
  }
  if (!req.body.is_discount) {
    return res.status(400).send({
      message: "is_discount can not be empty",
    });
  }
  if (!req.body.discount) {
    return res.status(400).send({
      message: "discount can not be empty",
    });
  }

  if (req.file) {
    image_url = req.file.path;
  }

  let values = {
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    is_discount: req.body.is_discount,
    discount: req.body.discount,
  };

  if (req.file) {
    values.productImage = image_url;
  }

  // Find note and update it with the request body

  Product.findByIdAndUpdate(productId, values, { new: true })
    .then((product) => {
      if (!product) {
        return res.status(404).send({
          message: "Product not found with id " + productId,
        });
      }
      res.send(product);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Product not found with id " + productId,
        });
      }
      return res.status(500).send({
        message: "Error updating Product with id " + productId,
      });
    });
};

exports.deleteOneProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.remove({ _id: productId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Deleted Product Successfully!",
        result: result,
      });
    })
    .catch((error) => {
      next(error);
    });
};

function createProduct(req) {
  return new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
    category: req.body.category,
    is_discount: req.body.is_discount,
    discount: req.body.discount,
  });
}
