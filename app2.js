const fs = require('fs');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

const stream = fs.createReadStream('source.json');
const outputStream = fs.createWriteStream('flattened.csv');

stream
  .pipe(parser())
  .pipe(streamArray())
  .on('data', (d) => processData(d.value));

function processData(response) {
  // outputStream.write(
  //   `"${data.customerphonenumber}","${data.CleansedPhoneNumberE164}","${data.CountryCodeIso2}","${data.OriginalPhoneNumber}","${data.Timezone}","${data.ZipCode}","${data.Carrier}","${data.PhoneTypeCode}","${data.PhoneType}"\n`
  // );
  // data.messages.forEach((m) => {
  //   outputStream.write(`"${m.message_id}","${m.result.code}"\n`);
  // });

  outputStream.write(
    `"${response.customerphonenumber}","${response.CleansedPhoneNumberE164}","${response.CountryCodeIso2}","${response.OriginalPhoneNumber}","${response.Timezone}","${response.ZipCode}","${response.Carrier}","${response.PhoneTypeCode}","${response.PhoneType}"\n`
  );
}
