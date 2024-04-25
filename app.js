const fs = require('fs');
const es = require('event-stream');
const JSONStream = require('JSONStream');

const inputStream = fs.createReadStream('source.json');
const outputStream = fs.createWriteStream('flattened.csv');

function transformer(messages) {
  messages.forEach((m) =>
    // console.log(`${r.app_host},${r.app_port},${r.app_url},${r.message_id},${r.send_to},${r.subject},${r.body}`));
    // outputStream.write(
    //   `${m.app_host},${m.app_port},${m.app_url},${m.message_id},${m.send_to},${m.subject},${m.body}\n`
    // ))
    // outputStream.write(`${m.message_id},${m.status}\n`)
    outputStream.write(`${JSON.stringify(m)}`)
  );
}

function end() {
  outputStream.close();
}

inputStream.pipe(JSONStream.parse('..')).pipe(es.through(transformer, end));

// loglines = fs.

// loglines
//   .flat()
//   .forEach((r) =>
//     logger.write(
//       `${r.app_host},${r.app_port},${r.app_url},${r.message_id},${r.send_to},${r.subject},${r.body}\n`
//     )
//   );

// logger.end();
