const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { Transform } = require('stream');

const cleanAndLoadReviews = () => {
  const readStream = fs.createReadStream(path.join(__dirname, '../../datafiles/reviews.csv'));
  const writeStream = fs.createWriteStream(
    path.join(__dirname, '../../datafiles/cleanedFiles/reviews.csv')
  );

  const reviewTransformer = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      console.log(`Processing record ${chunk.id}`);
      const reviewDoc = {
        id: chunk.id,
        rating: chunk.rating,
        summary: chunk.summary,
        recommend: chunk.recommend,
        body: chunk.body,
        reviewer_name: chunk.reviewer_name,
        product_id: chunk.product_id,
        reviewer_email: chunk.reviewer_email,
        helpfulness: chunk.helpfulness,
        reported: chunk.reported,
        response: chunk.response,
        date: chunk.date,
        photos: [],
        characteristics: [],
      };
      callback(null, `${JSON.stringify(reviewDoc)} \n`);
    },
  });

  readStream
    .pipe(csv())
    .pipe(reviewTransformer)
    .pipe(writeStream)
    .on('end', () => {
      console.log('successfully cleaned and imported reviews');
    });
};

cleanAndLoadReviews();
