const {
  path
} = require('ramda');
const getOperatingState = require('./getOperatingState');

module.exports = async (context, queueItem) => {
  const tag = path(['tag'], JSON.parse(queueItem));
  
  const operating_state = getOperatingState(tag);

  if (!operating_state) context.log(`'${tag}' didn't match any operation state`);
  else {
    const { miner_number, cluster_number } = operating_state;
    context.log(`#${miner_number} miner is operating in cluster ${cluster_number}`);
  }
};