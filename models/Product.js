const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: Number,
  category: { type: String, required: true },
  brand: String,
  stock: { type: Number, required: true, default: 0 },
  images: [String],
  isFeatured: { type: Boolean, default: false },
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);