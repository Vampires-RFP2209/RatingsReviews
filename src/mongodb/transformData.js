const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { Transform } = require('stream');

const cleanAndJSONifyFiles = (filename, transformer) => {
  return new Promise((resolve) => {
    console.log(`Now processing ${filename}`);
    const readStream = fs.createReadStream(path.join(__dirname, `../../datafiles/${filename}`));
    const writeStream = fs.createWriteStream(
      path.join(__dirname, `../../datafiles/cleanedFiles/${filename}`)
    );

    readStream
      .pipe(csv())
      .pipe(transformer)
      .pipe(writeStream)
      .on('finish', () => {
        console.log('successfully cleaned and imported file');
        resolve();
      });
  });
};

const reviewTransformer = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    console.log(`Processing review record ${chunk.id}`);
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

class BufferedTransform extends Transform {
  constructor(options) {
    super(options);
    this.buffer = [];
    this.currentIndex = null;
  }
}

const makeBufferedTransform = (dataName, mapFunc) => {
  return new BufferedTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      console.log(`Processing ${dataName} line ${chunk.id}`);
      if (this.buffer.length === 0) {
        this.currentIndex = chunk.review_id;
        this.buffer.push(mapFunc(chunk));
        callback(null, '');
      } else if (this.currentIndex === chunk.review_id) {
        this.buffer.push(mapFunc(chunk));
        callback(null, '');
      } else {
        const output = { review_id: this.currentIndex, contents: this.buffer };
        this.currentIndex = chunk.review_id;
        this.buffer = [mapFunc(chunk)];
        callback(null, `${JSON.stringify(output)}\n`);
      }
    },
  });
};

const photoTransformer = makeBufferedTransform('photo', (chunk) => chunk.url);

const characteristicsReviewsTransformer = makeBufferedTransform(
  'characteristics_reviews',
  (chunk) => {
    return {
      characteristic_id: chunk.characteristic_id,
      value: chunk.value,
    };
  }
);

const characteristicsTransformer = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    console.log(`Processing characteristics line: ${chunk.id}`);
    callback(null, `${JSON.stringify({ id: chunk.id, name: chunk.name })}\n`);
  },
});

cleanAndJSONifyFiles('reviews.csv', reviewTransformer)
  .then(() => cleanAndJSONifyFiles('reviews_photos.csv', photoTransformer))
  .then(() => cleanAndJSONifyFiles('characteristic_reviews.csv', characteristicsReviewsTransformer))
  .then(() => cleanAndJSONifyFiles('characteristics.csv', characteristicsTransformer));
