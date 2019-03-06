const {
  compose,
  invoker,
  isEmpty,
  find,
  map,
  path,
  reject,
  split,
} = require('ramda');

const OPERATION_REGEXS = [
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_LH_INNER_ROTATION$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_LH_OUTER_ROTATION$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_LH_RIB_ROTATION$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_RH_INNER_ROTATION$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_RH_OUTER_ROTATION$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_RH_RIB_ROTATION$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_CUTTER_ON$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_LEFT_LOADER_CURRENT$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_RIGHT_LOADER_CURRENT$/g,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_TRAM_MODE$/g
];

module.exports = async (context, queueItem) => {
  const tag = path(['tag'], JSON.parse(queueItem));

  // match tag with all pre-defined regexs
  const matched_regex = find(
    regex => invoker(1, 'test')(tag, regex),
    OPERATION_REGEXS
  );

  if (!matched_regex) return context.log(`'${tag}' didn't match any operation state`);

  const TAG_SPLIT_REGEX = /[^0-9]+/g;
  const [cluster_number, miner_number] = compose(
    map(Number.parseInt),  // parse string to number
    reject(isEmpty),       // remove falsy
    split(TAG_SPLIT_REGEX) // get tokens
  )(tag);

  context.log(`#${miner_number} miner is operating in cluster ${cluster_number}`);
};