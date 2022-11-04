const { ObjectId } = require('mongoose').Types;
const { Review, Characteristic } = require('./db');

// TODO: Create relevant sort option
const SORT_OPTIONS = {
  relevant: null,
  helpful: { helpfulness: -1 },
  newest: { date: -1 },
};

module.exports.getReviews = (productId, page = 1, count = 5, sort = 'relevant') => {
  return Review.find({ product_id: productId }, null, {
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
