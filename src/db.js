require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:${process.env.PORT}/ratingsReviews`);

const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true },
    summary: { type: String, maxLength: 60 },
    recommend: { type: Boolean, required: true },
    body: { type: String, required: true, maxLength: 1000 },
    reviewer_name: { type: String, required: true, maxLength: 60 },
    product_id: { type: Number, required: true },
    reviewer_email: { type: String, required: true, maxLength: 60 },
    helpfulness: { type: Number, required: true },
    reported: { type: Boolean, default: false },
    response: String,
    date: {
      type: Date,
      default: () => {
        return new Date().setUTCHours(0, 0, 0, 0).toIsoString();
      },
    },
    photos: { type: [String], required: true },
    characteristics: { type: Map, required: true },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
