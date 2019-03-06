const {
  path,
  pathOr
} = require('ramda');
const getOperatingState = require('./getOperatingState');

module.exports = async (context, queueItem) => {
  const parsed_item = JSON.parse(queueItem);
  const tag = path(['tag'], parsed_item);
  const value = path(['value'], parsed_item);
  const timestamp = pathOr(0, ['timestamp'], parsed_item);
  
  const operating_state = getOperatingState(tag, value, timestamp);

  if (!operating_state) context.log(`'${tag}' didn't match any operation state`);
  else {
    const { miner_number, cluster_number, miner_state } = operating_state;
    context.log(`#${miner_number} miner is ${miner_state} in cluster ${cluster_number}`);
  }
};