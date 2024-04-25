import * as fs from 'fs';
import * as readline from 'readline';

const lookupStream = fs.createReadStream(
  'D:\\Users\\Sean\\Desktop\\Work Stuff\\pinpoint_validate.csv'
);
const sampleStream = fs.createReadStream(
  'D:\\Users\\Sean\\Desktop\\Work Stuff\\300k_sample_records.csv'
);
const outputStream = fs.createWriteStream('enriched.csv');

const lookupInterface = readline.createInterface({
  input: lookupStream,
  output: process.stdout,
  terminal: false,
});

const lookupDict = {};

lookupInterface.on('line', (record) => {
  const r = record.split(',');
  lookupDict[r.splice(0, 1)] = r;
});

lookupInterface.on('close', ProcessSamples);

const sampleInterface = readline.createInterface({
  input: sampleStream,
  output: process.stdout,
  terminal: false,
});

sampleInterface.on('line', ProcessSamples);

async function ProcessSamples(sample) {
  // let loopCount = 0;
  // let invalidCount = 0;
  // let processCount = 0;
  // for await (const sample of sampleInterface) {
  // loopCount++;
  // if (!sample || sample === '') {
  // invalidCount++;
  //   continue;
  // }

  if (sample === null || sample === undefined) {
    console.log(`Invalid Sample: ${sample}`);
    return;
  }
  const s = sample.split(',');
  const l = await LookupValidation(s[1]);

  const mergedCsv = `${s[1]},${s[4]},${s[5]},${s[6]},${s[8]},${s[10]},${s[11]},${l[1]},${l[3]},${l[4]},${l[5]},${l[6]},${l[7]}\n`;
  // processCount++;
  outputStream.write(mergedCsv);
  // }

  // console.log(loopCount, invalidCount, processCount);
}

async function LookupValidation(phone) {
  const lookup = lookupDict[phone];
  if (!lookup) return ['', '', '', '', '', '', '', ''];
  return lookup;
}

// sample array
// 0 log_timestamp as "ContactTimestamp"
// 1 ,cast(customerendpoint as varchar) as "CustomerEndpoint"
// 2 ,systemendpoint as "SystemEndpoint"
// 3 ,contactid as "ContactId"
// 4 ,riskscore as "RiskScore"
// 5 ,if(cast(riskscore as int) < 70, 'LEGIT', 'FRAUD') as "Label"
// 6 ,replace(json_extract_scalar(sipheaders, '$.From'), '"', '') as "From"
// 7 ,json_extract_scalar(sipheaders, '$.To') as "To"
// 8 ,json_extract_scalar(sipheaders, '$["X-INFO-DIG"]') as "ISUP-OLI"
// 9 ,json_extract_scalar(sipheaders, '$["X-JIP"]') as "JIP"
// 10 ,json_extract_scalar(sipheaders, '$["P-Asserted-Identity"]') as "P-Asserted-Identity"
// 11 ,json_extract_scalar(sipheaders, '$["P-Charge-Info"]') as "P-Charge-Info"
// 12 ,json_extract_scalar(sipheaders, '$["X-CALL-FWD-I"]') as "Call-Forwarding-Indicator"
// 13 ,json_extract_scalar(sipheaders, '$["X-HOP-CNT"]') as "Hop-Counter"
// 14 ,json_extract_scalar(sipheaders, '$["X-ORIG-CDPN"]') as "Called-Party-Address"
// 15 ,json_extract_scalar(sipheaders, '$["X-ORIG-CGPN"]') as "Calling-Party-Address"
// 16 ,json_extract_scalar(sipheaders, '$["X-ORIG-SW"]') as "Originating-Switch"
// 17 ,json_extract_scalar(sipheaders, '$["X-ORIG-TRK"]') as "Originating-Trunk"

// lookup array
// 0 "${response.CleansedPhoneNumberE164}",
// 1 "${response.CleansedPhoneNumberE164}",
// 2 "${response.CountryCodeIso2}",
// 3 "${response.OriginalPhoneNumber}",
// 4 "${response.Timezone}",
// 5 "${response.ZipCode}",
// 6 "${response.Carrier}",
// 7 "${response.PhoneTypeCode}",
// 8 "${response.PhoneType}"
