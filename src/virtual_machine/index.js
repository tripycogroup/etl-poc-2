import {
  map,
  now,
  template,
  random
} from 'lodash/fp';
import push from './push'; 

const BURST_INTERVAL = 2000;
const OPERATION_TEMPLATES = [
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_BOLTER_LH_INNER_ROTATION',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_BOLTER_LH_OUTER_ROTATION',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_BOLTER_LH_RIB_ROTATION',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_BOLTER_RH_INNER_ROTATION',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_BOLTER_RH_OUTER_ROTATION',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_BOLTER_RH_RIB_ROTATION',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_CUTTER_ON',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_LEFT_LOADER_CURRENT',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_RIGHT_LOADER_CURRENT',
  'Cluster${ cluster_number }.Miner_ABM_${ miner_number }_TRAM_MODE'
];
const TOTAL_OPERATIONS = OPERATION_TEMPLATES.length;

export default () => setInterval(() => {
  const NUMBER_OF_MESSAGE = random(1, 5);

  // randomly generate mockup messages
  const mockup_messages = map(
    () => {
      const TAG_TEMPLATE = OPERATION_TEMPLATES[random(0, TOTAL_OPERATIONS - 1)];
      const EIGHT_HOURS = 28800000;
      
      const cluster_number = random(0, 5);
      const miner_number = random(0, 5);
      const timestamp = now() + random(-EIGHT_HOURS, EIGHT_HOURS); // +- 8hrs from now
      const value = random(0, 1);

      return {
        tag: template(TAG_TEMPLATE)({ cluster_number, miner_number }),
        timestamp,
        value
      };
    },
    Array(NUMBER_OF_MESSAGE).fill({})
  );
  
  // push messages
  const push_tasks = mockup_messages.map(async message => push(JSON.stringify(message)));
  Promise.all(push_tasks)
        .then((results) => console.info(`Finished pushing all tasks at ${now()}. Total ${results.length} messages pushed.`))
        .catch(error => console.error(error));
}, BURST_INTERVAL);

