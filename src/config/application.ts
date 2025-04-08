import convict from 'convict';

const config = convict({
  env: {
    default: 'development',
    env: 'NODE_ENV',
    doc: 'The application environment',
    format: ['production', 'development', 'test'],
  },
  name: {
    default: 'Credpal Task',
    doc: 'App name',
    env: 'APP_NAME',
    nullable: true,
    format: String,
  },
  port: {
    arg: 'port',
    default: '3000',
    doc: 'The port to bind',
    env: 'PORT',
    format: 'port',
  },
  database: {
    url: {
      default: 'mongodb://localhost:27017/pursepal',
      doc: 'MongoDB connection URL',
      env: 'DATABASE_URL',
      format: String,
    },
  },
  jwt: {
    accessTokenExpiry: {
      default: 3600,
      doc: 'JWT access token expiry in seconds',
      env: 'ACCESS_TOKEN_EXPIRE',
      nullable: true,
      format: Number,
    },
    accessTokenSecret: {
      default: '',
      doc: 'JWT access token secret',
      env: 'ACCESS_TOKEN_SECRET',
      nullable: false,
      format: String,
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
