const express = require('express');
const router = express.Router();
const multer = require('multer');

//const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.imagetype === 'image/png') {
//         cb(null, true);
//     }
//     else {
//         cb(null, false);
//     }
// };

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  // fileFilter: fileFilter
});

const ProductsController = require('../controllers/products');

router.get('/', ProductsController.getAllProducts);

router.post(
  '/',

  upload.array('productImage', 6),
  ProductsController.createOneProduct
);

router.get('/:productId', ProductsController.getOneProduct);

router.get('/category/:category', ProductsController.getProductsByCategory);

router.patch(
  '/:productId',
  upload.array('productImage', 6),
  ProductsController.updateProductNew
);

router.delete('/:productId', ProductsController.deleteOneProduct);

module.exports = router;
