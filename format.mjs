import * as fs from 'fs';
import * as readline from 'readline';

const inputStream = fs.createReadStream(
  'C:\\Users\\sean.ferguson\\Desktop\\enriched.csv'
);
const outputStream = fs.createWriteStream(
  'C:\\Users\\sean.ferguson\\Desktop\\formatted_enriched.csv'
);

const inputInterface = readline.createInterface({
  input: inputStream,
  output: process.stdout,
  terminal: false,
});

inputInterface.on('line', (record) => {
  const r = record.split('","');
  outputStream.write(
    `${r[0]?.replace(/("|,)/g, '')},${r[3]?.replace(
      /("|,)/g,
      ''
    )},${r[4]?.replace(/("|,)/g, '')},${r[5]?.replace(
      /("|,)/g,
      ''
    )},${r[6]?.replace(/("|,)/g, '')},${r[7]?.replace(
      /("|,)/g,
      ''
    )},${r[8]?.replace(/("|,)/g, '')},${r[9]?.replace(
      /("|,)/g,
      ''
    )},${r[10]?.replace(/("|,)/g, '')},${r[11]?.replace(
      /("|,)/g,
      ''
    )},${r[2]?.replace(/("|,)/g, '')}\n`
  );
});
