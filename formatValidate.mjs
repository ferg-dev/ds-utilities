import * as fs from 'fs';
import * as readline from 'readline';

const lookupStream = fs.createReadStream(
  'C:\\Users\\sean.ferguson\\Desktop\\pinpoint_validate.csv'
);
const outputStream = fs.createWriteStream('formatted_validate.csv');

const lookupInterface = readline.createInterface({
  input: lookupStream,
  output: process.stdout,
  terminal: false,
});

outputStream.write(
  `"CustomerEndpoint","CountryCodeIso2", "Timezone","ZipCode","Carrier","PhoneTypeCode","PhoneType"\n`
);

lookupInterface.on('line', (record) => {
  const r = record.split('","');
  // outputStream.write(r.splice(3, 1).splice(2, 1).join(','));
  outputStream.write(
    `${r[0].replace(/("|,)/g, '')},${r[2].replace(/("|,)/g, '')},${r[4].replace(
      /("|,)/g,
      ''
    )},${r[5].replace(/("|,)/g, '')},${r[6].replace(
      /("|,)/g,
      ''
    )},${r[7].replace(/("|,)/g, '')},${r[8].replace(/("|,)/g, '')}\n`
  );
});
