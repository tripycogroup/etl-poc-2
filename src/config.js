import path from 'path';
import dotenv from 'dotenv';

const root_dir = process.cwd();
const pkg = require(path.join(root_dir, 'package.json'));

const env_cfg = (() => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return {
        path: path.join(root_dir, '.env.development')
      };

    default:
      return {
        path: path.join(root_dir, '.env.development')
      };
  }
})();

dotenv.load(env_cfg);

export default {
  pkg,
  azure_storage_account: process.env.AZURE_STORAGE_ACCOUNT,
  azure_storage_access_key: process.env.AZURE_STORAGE_ACCESS_KEY
};