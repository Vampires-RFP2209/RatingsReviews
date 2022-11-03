const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { Transform } = require('stream');
const LineByLineReader = require('line-by-line');
const NReadlines = require('n-readlines');

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

const mergeCharacteristics = () => {
  return new Promise((resolve) => {
    const characteristicReviewsReader = new LineByLineReader(
      path.join(__dirname, '../../datafiles/cleanedFiles/characteristic_reviews.csv')
    );
    const characteristicsReader = new NReadlines(
      path.join(__dirname, '../../datafiles/cleanedFiles/characteristics.csv')
    );
    const writeStream = fs.createWriteStream(
      path.join(__dirname, '../../datafiles/cleanedFiles/characteristicsMerged.csv')
    );

    let characteristicsBuffer = null;
    let currentCharacteristicId = 0;
    let currentLine = 1;

    characteristicReviewsReader.on('line', (line) => {
      const characteristicReviewsLine = JSON.parse(line);
      console.log(`Processing line: ${currentLine}`);
      currentLine += 1;
      const maxCharacteristicId = parseInt(
        characteristicReviewsLine.contents[characteristicReviewsLine.contents.length - 1]
          .characteristic_id,
        10
      );

      if (maxCharacteristicId > currentCharacteristicId) {
        characteristicsBuffer = {};
        for (let i = currentCharacteristicId; i < maxCharacteristicId; i += 1) {
          const characteristicsLine = JSON.parse(characteristicsReader.next().toString('ascii'));
          characteristicsBuffer[characteristicsLine.id] = characteristicsLine.name;
        }
        currentCharacteristicId = maxCharacteristicId;
      }

      characteristicReviewsLine.contents = characteristicReviewsLine.contents.map((item) => {
        return {
          characteristic_id: item.characteristic_id,
          value: item.value,
          name: characteristicsBuffer[item.characteristic_id],
        };
      });

      writeStream.write(`${JSON.stringify(characteristicReviewsLine)}\n`);
    });

    characteristicReviewsReader.on('end', () => {
      writeStream.end();
      resolve();
    });
  });
};

const mergeReviews = () => {
  const reviewsReader = new LineByLineReader(
    path.join(__dirname, '../../datafiles/cleanedFiles/reviews.csv')
  );
  const characteristicsMergedReader = new NReadlines(
    path.join(__dirname, '../../datafiles/cleanedFiles/characteristicsMerged.csv')
  );
  const photosReader = new NReadlines(
    path.join(__dirname, '../../datafiles/cleanedFiles/reviews_photos.csv')
  );
  const writeStream = fs.createWriteStream(
    path.join(__dirname, '../../datafiles/cleanedFiles/reviewsMerged.csv')
  );

  let photosBuffer = null;
  let currentLine = 1;

  reviewsReader.on('line', (line) => {
    console.log(`Processing line ${currentLine}`);
    currentLine += 1;
    const reviewsLine = JSON.parse(line);
    const characteristicsMergedLine = JSON.parse(
      characteristicsMergedReader.next().toString('ascii')
    );
    if (photosBuffer === null) {
      photosBuffer = JSON.parse(photosReader.next().toString('ascii'));
    }

    reviewsLine.characteristics = characteristicsMergedLine.contents;
    if (photosBuffer.review_id === reviewsLine.id) {
      reviewsLine.photos = photosBuffer.contents;
      photosBuffer = null;
    }

    writeStream.write(`${JSON.stringify(reviewsLine)}\n`);
  });

  reviewsReader.on('end', () => {
    writeStream.end();
  });
};

cleanAndJSONifyFiles('reviews.csv', reviewTransformer)
  .then(() => cleanAndJSONifyFiles('reviews_photos.csv', photoTransformer))
  .then(() => cleanAndJSONifyFiles('characteristic_reviews.csv', characteristicsReviewsTransformer))
  .then(() => cleanAndJSONifyFiles('characteristics.csv', characteristicsTransformer))
  .then(() => mergeCharacteristics())
  .then(() => mergeReviews());
