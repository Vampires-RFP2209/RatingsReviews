const { ObjectId } = require('mongoose').Types;
const { Review, Characteristic } = require('./db');

// TODO: Create relevant sort option
const SORT_OPTIONS = {
  relevant: null,
  helpful: { helpfulness: -1 },
  newest: { date: -1 },
};

module.exports.getReviews = (productId, page = 1, count = 5, sort = 'relevant') => {
  return Review.find({ product_id: productId, reported: false }, null, {
    sort: SORT_OPTIONS[sort],
    skip: count * (page - 1),
    limit: count,
  }).then((docs) => {
    return {
      product: productId,
      page,
      count,
      results: docs,
    };
  });
};

// TODO: Should be possible with only one aggregation. Rewrite using one aggregation.
module.exports.getMetadata = (productId) => {
  const productIdNum = parseInt(productId, 10);

  const ratingAggregation = Review.aggregate([
    { $match: { product_id: productIdNum } },
    { $group: { _id: '$rating', count: { $count: {} } } },
  ]).then((result) => {
    return Object.fromEntries(result.map((row) => Object.values(row)));
  });

  const recommendAggregation = Review.aggregate([
    { $match: { product_id: productIdNum } },
    { $group: { _id: '$recommend', count: { $count: {} } } },
  ]).then((result) => {
    return Object.fromEntries(result.map((row) => Object.values(row)));
  });

  const characteristicAggregation = Review.aggregate([
    { $match: { product_id: productIdNum } },
    { $unwind: { path: '$characteristics' } },
    {
      $group: {
        _id: '$characteristics.name',
        value: { $avg: '$characteristics.value' },
        id: { $first: '$characteristics.characteristic_id' },
      },
    },
  ]).then((results) => {
    return results.reduce((prev, cur) => {
      const output = { ...prev };
      output[cur._id] = { id: cur.id, value: cur.value.toFixed(4) };
      return output;
    }, {});
  });

  return Promise.all([ratingAggregation, recommendAggregation, characteristicAggregation]).then(
    ([ratings, recommended, characteristics]) => {
      return {
        product_id: productId,
        ratings,
        recommended,
        characteristics,
      };
    }
  );
};

module.exports.incrementHelpfulness = (reviewId) => {
  return Review.findOneAndUpdate({ _id: new ObjectId(reviewId) }, { $inc: { helpfulness: 1 } });
};

module.exports.updateReview = (reviewId, updatedData) => {
  return Review.findOneAndUpdate({ _id: new ObjectId(reviewId) }, updatedData);
};

module.exports.addReview = (review) => {
  return Review.findOne({ product_id: review.product_id }).then((result) => {
    const characteristics = [];
    Object.keys(review.characteristics).forEach((characteristicId) => {
      characteristics.push(
        new Characteristic({
          characteristic_id: characteristicId,
          value: review.characteristics[characteristicId],
          name: result.characteristics.find(
            (e) => e.characteristic_id === parseInt(characteristicId, 10)
          ).name,
        })
      );
    });

    return Review.create({
      rating: review.rating,
      summary: review.summary,
      recommend: review.recommend,
      body: review.body,
      reviewer_name: review.name,
      reviewer_email: review.email,
      product_id: review.product_id,
      photos: review.photos,
      characteristics,
    });
  });
};
