import azure from 'azure-storage';
import cfg from '../config';

const {
  azure_storage_account,
  azure_storage_access_key
} = cfg;
const QUEUE_NAME = 'sample';

const azure_credential = azure_storage_account ? [azure_storage_account, azure_storage_access_key] : [azure.generateDevelopmentStorageCredentials()];

const queue_service = azure.createQueueService(...azure_credential);
// azure functions only accept base64 encode messages
queue_service.messageEncoder = new azure.QueueMessageEncoder.TextBase64QueueMessageEncoder();

export default message => new Promise((resolve, reject) => 
  queue_service.createQueueIfNotExists(QUEUE_NAME, (error) => {
    if (error) return reject(error);

    queue_service.createMessage(QUEUE_NAME, JSON.stringify(message), (error, results) => {
      if (error) return reject(error);

      resolve(results);
    });
  })
);