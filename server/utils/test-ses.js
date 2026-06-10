import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
const client = new SESClient({ region: 'us-east-2', credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY} });
const cmd = new SendEmailCommand({
  Source: 'kathirr007@gmail.com',
  Destination: { ToAddresses: ['kathirr007@gmail.com'] },
  Message: { Subject: { Data: 'Test' }, Body: { Text: { Data: 'hello' } } }
});
client.send(cmd).then(console.log).catch(console.error);