const {
  compose,
  invoker,
  isEmpty,
  find,
  map,
  pathOr,
  reject,
  split,
} = require('ramda');
const SortedMap = require('collections/sorted-map');

const OPERATION_REGEXS = [
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_LH_INNER_ROTATION$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_LH_OUTER_ROTATION$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_LH_RIB_ROTATION$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_RH_INNER_ROTATION$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_RH_OUTER_ROTATION$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_BOLTER_RH_RIB_ROTATION$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_CUTTER_ON$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_LEFT_LOADER_CURRENT$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_RIGHT_LOADER_CURRENT$/,
  /^Cluster[0-9]*.Miner_ABM_[0-9]*_TRAM_MODE$/
];

const LEAST_OPERATE_DURATION = 30000; // 30s

// a map table of miner's operation timestamp
// if map table is fulfilled it will remove oldest one
class WorktimeMap {
  constructor(MAX_SIZE = 100) {
    this.__wmap = new SortedMap();
    this.__MAX_SIZE = MAX_SIZE;
  }

  __pop() {
    const store = pathOr({}, ['store'], this.__wmap);
    invoker(0, 'shift')(store);
  }
  
  __prepareMap() {
    let length = this.__wmap.length;

    while (length >= this.__MAX_SIZE) {
      this.__pop();
      length--;
    }
  }

  set(key, value) {
    this.__prepareMap();
    return this.__wmap.set(key, value);
  }

  get(key) {
    return this.__wmap.get(key);
  }

  delete(key) {
    return this.__wmap.delete(key);
  }
}

const wmap = new WorktimeMap();

module.exports = (tag, value, timestamp) => {
  let miner_state = 'waiting';

  // match tag with all pre-defined regexs
  const matched_regex = find(
    regex => invoker(1, 'test')(tag, regex),
    OPERATION_REGEXS
  );

  // get miner_number & cluster number from tag
  const TAG_SPLIT_REGEX = /[^0-9]+/g;
  const [cluster_number, miner_number] = compose(
    map(Number.parseInt),  // parse string to number
    reject(isEmpty),       // remove falsy
    split(TAG_SPLIT_REGEX) // get tokens
  )(tag);
  
  // get last operation from map table
  const signature = `${cluster_number}.${miner_number}`;
  const pre_timestamp = wmap.get(signature);
  const operate_duration = timestamp - pre_timestamp;
  
  // update value in map table
  const is_valid_operation = matched_regex && value === 1;
  if (is_valid_operation) {
    wmap.set(signature, timestamp);
  } else {
    wmap.delete(signature);
  }

  if (is_valid_operation && operate_duration >= LEAST_OPERATE_DURATION) {
    miner_state = 'operating';
  }

  return {
    miner_number,
    cluster_number,
    miner_state
  }
};