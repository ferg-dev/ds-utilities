const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const eventObject = event;
  console.log(event);
  const incomingNumber =
    eventObject.Details.ContactData.CustomerEndpoint.Address.slice(-10);
  // const redoneNumber = incomingNumber.slice(-10);
  console.log('CusomterEndpoint', event.Details.ContactData.CustomerEndpoint);
  console.log('Attributes', event.Details.ContactData.Attributes);
  console.log('MediaStreams', event.Details.ContactData.MediaStreams);
  console.log('SystemEndpoint', event.Details.ContactData.SystemEndpoint);

  console.log('PHONE NUMBER HERE: ' + incomingNumber);
  // console.log("REFACTORED NUMBER: " + redoneNumber)

  async function isNumberBlocked() {
    const params = {
      TableName: 'ContactFlow_Blocked_Numbers',
      Key: {
        ANI: incomingNumber,
      },
    };

    try {
      const numberInQuestion = await documentClient.get(params).promise();
      let isnum = /^\d+$/.test(incomingNumber);
      //{ Item: { ContactNumber: '+441234567892' } }
      console.log('numberInQuestion: ', numberInQuestion);
      console.log('isnum', typeof isnum);
      if (isnum) {
        if (Object.keys(numberInQuestion).length === 0) {
          return { Success: 'false' };
        } else {
          const item = numberInQuestion.Item;
          item.Success = 'true';
          console.log(
            'numberInQuestion.Item.ContactNumber: ',
            item.ContactNumber
          );
          console.log('numberInQuestion.Item ', item);
          return item;
        }
      } else {
        console.log("Didn't work");
      }
    } catch (err) {
      return err;
    }
  }

  try {
    const numberIsBlocked = await isNumberBlocked();
    // console.log('checkNumber', await checkNumber())
    console.log('numberIsBlocked ---- ', numberIsBlocked);

    //  return queueData.Item
    // if(numberIsBlocked) {
    //     console.log('Made it to queueData.item')
    //     return {'Success': 'true'}
    // } else {
    //     console.log('Made it to numberIsBlocked')
    //     return {'Success':'false'}
    // }
    return numberIsBlocked;
  } catch (err) {
    console.log(err);
    return err;
  }
};
