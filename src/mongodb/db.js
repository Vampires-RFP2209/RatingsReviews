const reviews = new Schema(
  {
    rating: { type: Number, required: true },
    summary: { type: String, maxLength: 60 },
    recommend: { type: Boolean, required: true },
    body: { type: String, required: true, maxLength: 1000 },
    reviewer_name: { type: String, required: true, maxLength: 60 },
    products_id: { type: Number, required: true },
    email: { type: String, required: true, maxLength: 60 },
    helpfulness: { type: Number, required: true },
    is_reported: { type: Boolean, default: false },
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
