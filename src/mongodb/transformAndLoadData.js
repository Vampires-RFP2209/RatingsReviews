const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { Review } = require('./db');

const cleanAndLoadReviews = () => {
  const readStream = fs.createReadStream(path.join(__dirname, '../../datafiles/reviews.csv'));
  const writeStream = fs.createWriteStream(
    path.join(__dirname, '../../datafiles/cleanedFiles/reviews.csv')
  );
  const logWriteStream = fs.createWriteStream(
    path.join(__dirname, `../../datafiles/logs/review_etl.txt`)
  );

  readStream
    .pipe(csv())
    .on('data', (data) => {
      console.log(`Processing record ${data.id}`);
      writeStream.write(
        `${JSON.stringify({
          id: data.id,
          rating: data.rating,
          summary: data.summary,
          recommend: data.recommend,
          body: data.body,
          reviewer_name: data.reviewer_name,
          product_id: data.product_id,
          reviewer_email: data.reviewer_email,
          helpfulness: data.helpfulness,
          reported: data.reported,
          response: data.response,
          date: data.date,
          photos: [],
          characteristics: [],
        })}\n`
      );
    })
    .on('end', () => {
      console.log('successfully cleaned and imported reviews');
    });
};

cleanAndLoadReviews();
