const db = require('./db');

module.exports.getReviews = (productId, page = 1, count = 5, sort = 'relevant') => {
  return db
    .then((conn) =>
      conn.query(
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
        WHERE re.product_id = ? GROUP BY re.id`,
        [productId]
      )
    )
    .then((result) => result[0]);
};

/*
WITH characteristics_merged AS
        (SELECT
          cv.id,
          cv.review_id,
          cv.value,
          cn.characteristic
        FROM characteristic_values as cv
        LEFT JOIN characteristics AS c
          ON (cv.characteristic_id=c.id)
        LEFT JOIN characteristic_names AS cn
          ON (c.characteristic_name_id=cn.id))
*/
