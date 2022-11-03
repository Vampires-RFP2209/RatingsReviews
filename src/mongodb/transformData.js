const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { Transform } = require('stream');

const cleanAndJSONifyFiles = (filename, transformer) => {
  console.log(`Now processing ${filename}`);
  const readStream = fs.createReadStream(path.join(__dirname, `../../datafiles/${filename}`));
  const writeStream = fs.createWriteStream(
    path.join(__dirname, `../../datafiles/cleanedFiles/${filename}`)
  );

  readStream
    .pipe(csv())
    .pipe(transformer)
    .pipe(writeStream)
    .on('end', () => {
      console.log('successfully cleaned and imported file');
    });
};

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

cleanAndJSONifyFiles('reviews.csv', reviewTransformer);

class BufferedTransform extends Transform {
  constructor(options) {
    super(options);
    this.buffer = [];
    this.currentIndex = null;
  }
}

const photoTransformer = new BufferedTransform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    console.log(`Processing line: ${chunk.id}`);
    if (this.buffer.length === 0) {
      this.currentIndex = chunk.review_id;
      this.buffer.push(chunk.url);
      callback(null, '');
    } else if (this.currentIndex === chunk.review_id) {
      this.buffer.push(chunk.url);
      callback(null, '');
    } else {
      const output = {};
      output[this.currentIndex] = this.buffer;
      this.currentIndex = chunk.review_id;
      this.buffer = [chunk.url];
      callback(null, `${JSON.stringify(output)}\n`);
    }
  },
});

cleanAndJSONifyFiles('reviews_photos.csv', photoTransformer);
