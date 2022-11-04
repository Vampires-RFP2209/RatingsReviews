const LineByLineReader = require('line-by-line');
const path = require('path');
const { Review } = require('./db');

const importFileToDB = (filename, insertionFunc) => {
  return new Promise((resolve) => {
    const lineReader = new LineByLineReader(
      path.join(__dirname, `../../datafiles/cleanedFiles/${filename}`)
    );

    let currentLine = 1;

    lineReader.on('error', (err) => {
      console.log(err);
    });

    lineReader.on('line', (line) => {
      lineReader.pause();
      console.log(`Processing line: ${currentLine}`);
      insertionFunc(line).then(() => {
        lineReader.resume();
        currentLine += 1;
      });
    });

    lineReader.on('end', () => {
      console.log('Finshed importing files');
      resolve();
    });
  });
};

const reviewInserter = (line) => {
  return Review.create(JSON.parse(line));
};

importFileToDB('reviewsMerged.csv', reviewInserter);
