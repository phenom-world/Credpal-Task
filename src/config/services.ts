import convict from 'convict';

const config = convict({
  redis: {
    url: {
      default: '',
      doc: 'Redis database url',
      env: 'REDIS_URL',
      format: String,
      nullable: true,
    },
  },
  smtp: {
    host: {
      default: '',
      doc: 'SMTP host',
      env: 'SMTP_HOST',
      nullable: true,
      format: String,
    },
    port: {
      default: '',
      doc: 'SMTP port',
      env: 'SMTP_PORT',
      nullable: true,
      format: String,
    },
    service: {
      default: '',
      doc: 'SMTP service',
      env: 'SMTP_SERVICE',
      nullable: true,
      format: String,
    },
    mail: {
      user: {
        default: '',
        doc: 'SMTP mail user',
        env: 'SMTP_MAIL_USER',
        nullable: true,
        format: String,
      },
      password: {
        default: '',
        doc: 'SMTP mail password',
        env: 'SMTP_MAIL_PASSWORD',
        nullable: true,
        format: String,
      },
    },
  },
  paypal: {
    clientId: {
      default: '',
      doc: 'PayPal client id',
      env: 'PAYPAL_CLIENT_ID',
      nullable: true,
      format: String,
    },
    clientSecret: {
      default: '',
      doc: 'PayPal client secret',
      env: 'PAYPAL_CLIENT_SECRET',
      nullable: true,
      format: String,
    },
    environment: {
      default: 'sandbox',
      doc: 'PayPal environment',
      env: 'PAYPAL_ENVIRONMENT',
      nullable: true,
      format: String,
    },
    returnUrl: {
      default: '',
      doc: 'PayPal Return URL',
      env: 'FRONTEND_CLIENT_PAYMENT_RETURN_URL',
      nullable: true,
      format: String,
    },
    cancelUrl: {
      default: '',
      doc: 'PayPal Cancel URL',
      env: 'FRONTEND_CLIENT_PAYMENT_CANCEL_URL',
      nullable: true,
      format: String,
    },
  },
  paystack: {
    secretKey: {
      default: '',
      doc: 'Paystack secret key',
      env: 'PAYSTACK_SECRET_KEY',
      nullable: true,
      format: String,
    },
    redirectUrl: {
      default: '',
      doc: 'Paystack Redirect URL',
      env: 'FRONTEND_CLIENT_PAYMENT_RETURN_URL',
      nullable: true,
      format: String,
    },
  },
});

config.validate({ allowed: 'strict' });

export default config;
