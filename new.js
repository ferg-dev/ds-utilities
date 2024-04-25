import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event) => {
  const contactId = event.Details.ContactData.ContactId;
  const phone = event.Details.ContactData.CustomerEndpoint.Address.slice(-10);

  console.info(`[${contactId}] Checking block list for: ${phone}`);
  const response = await GetRecord(phone);
  if (!response.Item) {
    const item = { Success: 'false' };
    console.info(
      `[${contactId}] Response for ${phone}: ${JSON.stringify(item)}`
    );
    return { Success: 'false' };
  }
  const item = response.Item;
  item.Success = 'true';
  console.info(`[${contactId}] Response for ${phone}: ${JSON.stringify(item)}`);
  return item;
};

async function GetRecord(phone) {
  const params = {
    TableName: 'ContactFlow_Blocked_Numbers',
    Key: {
      ANI: phone,
    },
  };

  const command = new GetCommand(params);

  try {
    return await docClient.send(command);
  } catch (err) {
    console.error(err, err.stack);
  }
}
