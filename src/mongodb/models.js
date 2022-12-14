const { ObjectId } = require('mongoose').Types;
const { Review, Characteristic, ReviewMetadata } = require('./db');

const updateMetadata = (productId) => {
  const productIdNum = parseInt(productId, 10);

  const ratingAggregation = Review.aggregate([
    { $match: { product_id: productIdNum } },
    { $group: { _id: '$rating', count: { $count: {} } } },
    { $project: { count: { $convert: { input: '$count', to: 'string' } } } },
  ]).then((result) => {
    const output = Object.fromEntries(result.map((row) => Object.values(row)));
    [1, 2, 3, 4, 5].forEach((e) => {
      if (!output[e]) {
        output[e] = '0';
      }
    });
    return output;
  });

  const recommendAggregation = Review.aggregate([
    { $match: { product_id: productIdNum } },
    { $group: { _id: '$recommend', count: { $count: {} } } },
    { $project: { count: { $convert: { input: '$count', to: 'string' } } } },
  ]).then((result) => {
    const output = Object.fromEntries(result.map((row) => Object.values(row)));
    ['true', 'false'].forEach((e) => {
      if (!output[e]) {
        output[e] = '0';
      }
    });
    return output;
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
      return ReviewMetadata.findOneAndUpdate(
        { product_id: productIdNum },
        { product_id: productIdNum, ratings, recommended, characteristics },
        { upsert: true, new: true, projection: { _id: 0, __v: 0 } }
      );
    }
  );
};

const SORT_OPTIONS = {
  relevant: { weightedHelpfulness: -1 },
  helpful: { helpfulness: -1 },
  newest: { date: -1 },
};

module.exports.getReviews = (productId, page = 1, count = 5, sort = 'relevant') => {
  return Review.aggregate([
    { $match: { product_id: parseInt(productId, 10) } },
    sort === 'relevant'
      ? {
          $addFields: {
            weightedHelpfulness: {
              $multiply: [
                '$helpfulness',
                {
                  $subtract: [
                    1,
                    {
                      $min: [
                        0.8,
                        {
                          $multiply: [
                            0.1,
                            {
                              $dateDiff: { startDate: '$date', endDate: new Date(), unit: 'month' },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        }
      : { $skip: 0 },
    { $sort: SORT_OPTIONS[sort] },
    { $skip: count * (page - 1) },
    { $limit: parseInt(count, 10) },
    { $addFields: { review_id: '$_id' } },
    {
      $project: {
        _id: 0,
        id: 0,
        reported: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
        weightedHelpfulness: 0,
      },
    },
  ]).then((docs) => {
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
  return ReviewMetadata.findOne({ product_id: productId }, { _id: 0, __v: 0 }).then((result) => {
    if (result) {
      return result;
    }
    return updateMetadata(productId);
  });
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
    }).then(() => {
      return updateMetadata(review.product_id);
    });
  });
};
