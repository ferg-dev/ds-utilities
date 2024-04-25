import {
  PinpointClient,
  PhoneNumberValidateCommand,
} from '@aws-sdk/client-pinpoint';
import * as readline from 'readline';
import * as fs from 'fs';

const client = new PinpointClient();

const inputStream = fs.createReadStream('to_validate.csv');
const outputStream = fs.createWriteStream('validated.csv');

const file = readline.createInterface({
  input: inputStream,
  output: process.stdout,
  terminal: false,
});

let count = 0;
let batchStart = Date.now();

async function ValidateNumber(phone) {
  const command = new PhoneNumberValidateCommand({
    NumberValidateRequest: { PhoneNumber: phone },
  });

  try {
    const response = await client.send(command);
    return response.NumberValidateResponse;
  } catch (err) {
    console.error(`Phone: ${phone}`, err);
  }
}

async function ProcessRecord(phone) {
  count++;
  if (count % 1000 === 0) {
    const millis = Date.now() - batchStart;
    console.info(
      `Processed ${count} total records, current rate: ${Math.floor(
        1000 / (millis / 60000)
      )} rec/min ...`
    );
    batchStart = Date.now();
  }
  const response = await ValidateNumber(phone);
  if (!response) return;
  outputStream.write(
    `"${response.CleansedPhoneNumberE164}","${response.CleansedPhoneNumberE164}","${response.CountryCodeIso2}","${response.OriginalPhoneNumber}","${response.Timezone}","${response.ZipCode}","${response.Carrier}","${response.PhoneTypeCode}","${response.PhoneType}"\n`
  );
}

async function Start() {
  for await (const phone of file) {
    if (!phone || phone !== '') continue;
    await ProcessRecord(`+1${phone}`);
  }
}

Start();
