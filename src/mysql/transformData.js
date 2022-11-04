const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { Transform } = require('stream');

const splitCharacteristics = () => {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(
      path.join(__dirname, '../../datafiles/characteristics.csv')
    );

    const writeStream = fs.createWriteStream(
      path.join(__dirname, '../../datafiles/cleanedRelationalFiles/characteristics.csv')
    );

    writeStream.write('id,product_id,characteristic_name_id\n');

    const characteristicNameIds = [];
    let currentLine = 1;

    const nameSplitter = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        console.log(`Processing line ${currentLine}`);
        currentLine += 1;

        if (!characteristicNameIds.includes(chunk.name)) {
          characteristicNameIds.push(chunk.name);
        }

        callback(
          null,
          `${chunk.id},${chunk.product_id},${characteristicNameIds.indexOf(chunk.name) + 1}\n`
        );
      },
    });

    readStream
      .pipe(csv())
      .pipe(nameSplitter)
      .pipe(writeStream)
      .on('finish', () => {
        const nameWriteStream = fs.createWriteStream(
          path.join(__dirname, '../../datafiles/cleanedRelationalFiles/characteristic_names.csv')
        );
        nameWriteStream.write('id,characteristic\n');
        characteristicNameIds.forEach((name, index) => {
          nameWriteStream.write(`${index + 1},"${name}"\n`);
        });
        nameWriteStream.end();
        resolve();
      });
  });
};

module.exports = splitCharacteristics;
