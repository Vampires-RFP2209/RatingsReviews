require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:${process.env.MONGODB_PORT}/ratingsReviews`);

const characteristicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  characteristic_id: { type: Number, required: true },
  value: { type: Number, required: true },
});

const reviewSchema = new mongoose.Schema(
  {
    id: Number,
    rating: { type: Number, required: true },
    summary: String,
    recommend: { type: Boolean, required: true },
    body: { type: String, required: true, maxLength: 1000 },
    reviewer_name: { type: String, required: true, maxLength: 60 },
    product_id: { type: Number, required: true },
    reviewer_email: { type: String, required: true, maxLength: 60 },
    helpfulness: { type: Number, default: 0 },
    reported: { type: Boolean, default: false },
    response: { type: String, default: null },
    date: {
      type: Date,
      default: () => {
        return new Date().setUTCHours(0, 0, 0, 0);
      },
    },
    photos: { type: [String], required: true },
    characteristics: { type: [characteristicSchema], required: true },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);
const Characteristic = mongoose.model('Characteristic', characteristicSchema);

module.exports = { Review, Characteristic };
