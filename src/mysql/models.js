const db = require('./db');

// TODO create real relevant sort
const SORT_OPTIONS = {
  newest: 're.date DESC',
  helpful: 're.helpfulness DESC',
  relevant: 're.id',
};

module.exports.getReviews = (productId, page = 1, count = 5, sort = 'relevant') => {
  return db
    .then((conn) => {
      return conn.query(
        `SELECT
          re.id as review_id,
          re.rating,
          re.summary,
          re.recommend,
          re.body,
          re.reviewer_name,
          re.product_id,
          re.helpfulness,
          re.reported,
          re.response,
          re.date,
          IF(COUNT(p.url) = 0,
            JSON_ARRAY(),
            JSON_ARRAYAGG(JSON_OBJECT("id", p.id, "url", p.url)))
            AS photos
        FROM reviews AS re
        LEFT JOIN photos AS p ON (p.review_id=re.id)
        WHERE re.product_id = ?
        GROUP BY re.id
        ORDER BY ${SORT_OPTIONS[sort]}
        LIMIT ?, ?`,
        [productId, (page - 1) * count, parseInt(count, 10)]
      );
    })
    .then((result) => {
      return { product: productId, page, count, results: result[0] };
    });
};
