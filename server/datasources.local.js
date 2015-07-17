var MONGODB_URL = process.env.MONGODB_URL || null;

if (MONGODB_URL) {
  module.exports = {
    db: {
      name: 'db',
      connector: 'loopback-connector-mongodb',
      url: MONGODB_URL
    }
  };
}

var STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'filesystem';

if(STORAGE_PROVIDER === 'filesystem') {

  var STORAGE_PATH = process.env.STORAGE_PATH || './storage';

  module.exports = {
    storage: {
      name: 'storage',
      connector: 'loopback-component-storage',
      provider: STORAGE_PROVIDER ,
      root: STORAGE_PATH
    }
  };
}

if(STORAGE_PROVIDER === 'amazon') {

  var S3_KEY = process.env.S3_KEY || null;
  var S3_KEY_ID = process.env.S3_KEY_ID || null;

  module.exports = {
    storage: {
      name: 'storage',
      connector: 'loopback-component-storage',
      provider: STORAGE_PROVIDER,
      key: S3_KEY,
      keyId: S3_KEY_ID
    }
  };
}
