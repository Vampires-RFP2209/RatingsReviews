const path = require('path');
const db = require('./db');

const loadReviews = (conn) => {
  console.log('loading reviews');
  return conn.query(
    'LOAD DATA INFILE ? INTO TABLE reviews FIELDS TERMINATED BY "," ENCLOSED BY \'"\' LINES TERMINATED BY "\n" IGNORE 1 ROWS (id,product_id,rating,@date,@summary,body,@recommend,@reported,reviewer_name,reviewer_email,@response,helpfulness) SET recommend = (@recommend = "true"), date = FROM_UNIXTIME(@date / 1000, "%Y-%m-%d"), reported = (@reported = "true"), summary = IF(@summary = "null", NULL, @summary), response = IF(@response = "null", NULL, @response)',
    [path.join(__dirname, '../../datafiles/reviews.csv')]
  );
};

const loadPhotos = (conn) => {
  console.log('loading photos');
  return conn.query(
    'LOAD DATA INFILE ? INTO TABLE photos FIELDS TERMINATED BY "," ENCLOSED BY \'"\' LINES TERMINATED BY "\n" IGNORE 1 ROWS (id, review_id, url)',
    [path.join(__dirname, '../../datafiles/reviews_photos.csv')]
  );
};

const loadCharacteristicValues = (conn) => {
  console.log('loading characteristic_values');
  return conn.query(
    'LOAD DATA INFILE ? INTO TABLE characteristic_values FIELDS TERMINATED BY "," ENCLOSED BY \'"\' LINES TERMINATED BY "\n" IGNORE 1 ROWS (id, characteristic_id, review_id, value)',
    [path.join(__dirname, '../../datafiles/characteristic_reviews.csv')]
  );
};

const loadCharacteristicNames = (conn) => {
  console.log('loading characteristic_names');
  return conn.query(
    'LOAD DATA INFILE ? INTO TABLE characteristic_names FIELDS TERMINATED BY "," ENCLOSED BY \'"\' LINES TERMINATED BY "\n" IGNORE 1 ROWS',
    [path.join(__dirname, '../../datafiles/cleanedRelationalFiles/characteristic_names.csv')]
  );
};

const loadCharacteristics = (conn) => {
  console.log('loading characteristics');
  return conn.query(
    'LOAD DATA INFILE ? INTO TABLE characteristics FIELDS TERMINATED BY "," ENCLOSED BY \'"\' LINES TERMINATED BY "\n" IGNORE 1 ROWS (id, product_id, characteristic_name_id)',
    [path.join(__dirname, '../../datafiles/cleanedRelationalFiles/characteristics.csv')]
  );
};

module.exports = () =>
  db.then((conn) => {
    loadReviews(conn)
      .then(() => loadPhotos(conn))
      .then(() => loadCharacteristicNames(conn))
      .then(() => loadCharacteristics(conn))
      .then(() => loadCharacteristicValues(conn))
      .then(() => conn.end());
  });
