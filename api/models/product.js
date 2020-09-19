const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  productImage: { type: String, required: true },
  category: { type: String, required: true },
  is_discount: { type: Boolean },
  discount: { type: Number },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
