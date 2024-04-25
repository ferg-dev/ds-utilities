import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  PinpointClient,
  PhoneNumberValidateCommand,
} from '@aws-sdk/client-pinpoint';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient());
const pinpoint = new PinpointClient();

export const handler = async (event) => {
  const contactId = event.Details.ContactData.ContactId;
  const customerEndpoint = event.Details.ContactData.CustomerEndpoint.Address;

  // return if not valid NANP
  const rePhone = /^(\+1)\(?([2-9][0-9]{2})\)?([2-9](?!11)[0-9]{2})([0-9]{4})$/;
  if (!customerEndpoint.match(rePhone)) {
    console.warn(
      `[${contactId}] CustomerEndpoint is invalid NANP, skipping ${customerEndpoint}`
    );
    return;
  }

  // return if TFN
  const reTfn =
    /^(\+1)(8(00|33|44|55|66|77|88)([2-9](?!11)[0-9]{2})([0-9]{4}))$/;
  if (customerEndpoint.match(reTfn)) {
    console.warn(
      `[${contactId}] CustomerEndpoint is TFN, skipping ${customerEndpoint}`
    );
    return;
  }

  // check for cached value
  const cached = await dbGetItem({
    TableName: process.env.CACHE_TABLE,
    Key: {
      CustomerEndpoint: customerEndpoint,
    },
  });

  if (cached.Item) {
    console.info(
      `[${contactId}] Returning cached validation for ${customerEndpoint}: ${JSON.stringify(
        cached.Item
      )}`
    );
    return cached.Item;
  }

  // if not cached get live validation from pinpoint
  const validated = await ValidateNumber(customerEndpoint);
  if (!validated) {
    console.warn(
      `[${contactId}] Pinpoint validation failed for ${customerEndpoint}`
    );
    return;
  }

  // cache result asynchronously
  validated.CustomerEndpoint = customerEndpoint;
  dbPutItem({
    TableName: process.env.CACHE_TABLE,
    Item: validated,
  });

  // return result
  console.info(
    `[${contactId}] Returning live validation for ${customerEndpoint}: ${JSON.stringify(
      validated
    )}`
  );
  return validated;
};

// SDK wrappers
const dbGetItem = async (params) => {
  const command = new GetCommand(params);

  try {
    return await dynamo.send(command);
  } catch (err) {
    console.error(err);
  }
};

const dbPutItem = async (params) => {
  const command = new PutCommand(params);

  try {
    return await dynamo.send(command);
  } catch (err) {
    console.error(err);
  }
};

const ValidateNumber = async (phone) => {
  const command = new PhoneNumberValidateCommand({
    NumberValidateRequest: { PhoneNumber: phone },
  });

  try {
    const response = await pinpoint.send(command);
    return response.NumberValidateResponse;
  } catch (err) {
    console.error(`Phone: ${phone}`, err);
  }
};
