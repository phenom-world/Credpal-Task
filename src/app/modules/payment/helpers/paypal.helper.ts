import config from '../../../../config';
import { ObjectData } from '../../../../types';
import { PayPalCreatePaymentTokenPayload, PayPalInitializePayload } from '../interfaces/paypal.interface';

export class PayPalHelper {
  constructor() {}

  async getSetUpPayload(data: PayPalInitializePayload): Promise<ObjectData> {
    const returnUrl = `${config.services.get('paypal.returnUrl')}`;
    const cancelUrl = `${config.services.get('paypal.cancelUrl')}`;
    let customerId;
    if (data.type === 'add_card') {
      customerId = data.user?.paypalCardCustomerId;
    } else {
      customerId = data.user?.paypalCustomerId;
    }
    const billingAddress = {
      address_line_1: data.billingAddress?.addressLine1,
      address_line_2: data.billingAddress?.addressLine2,
      admin_area_1: data.billingAddress?.adminArea1,
      admin_area_2: data.billingAddress?.city,
      postal_code: data.billingAddress?.postalCode,
      country_code: data.billingAddress?.countryCode,
    };
    let payment_source;
    switch (data?.type) {
      case 'add_card':
        payment_source = {
          card: {
            number: data.cardNumber,
            expiry: data.expiry,
            name: data.name,
            security_code: data.cvv,
            billing_address: billingAddress,
            verification_method: 'SCA_WHEN_REQUIRED',
            experience_context: { brand_name: 'Durar Academy', locale: 'en-US', return_url: returnUrl, cancel_url: cancelUrl },
          },
          email_address: data?.email,
        };
        break;
      case 'add_paypal':
        payment_source = {
          paypal: {
            description: 'Durar Academy Payment',
            shipping: { name: { full_name: data.name }, address: billingAddress },
            permit_multiple_payment_tokens: false,
            usage_pattern: 'IMMEDIATE',
            usage_type: 'MERCHANT',
            customer_type: 'CONSUMER',
            experience_context: {
              shipping_preference: 'SET_PROVIDED_ADDRESS',
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'Durar Academy',
              locale: 'en-US',
              return_url: returnUrl,
              cancel_url: cancelUrl,
            },
          },
        };
        break;
      default:
        payment_source = {};
        break;
    }
    const payload = { ...(customerId ? { customer: { id: customerId } } : {}), payment_source };
    return payload;
  }

  async getPaymentTokenPayload(data: PayPalCreatePaymentTokenPayload): Promise<ObjectData> {
    const payload = { payment_source: { token: { id: data.token, type: 'SETUP_TOKEN' } } };
    return payload;
  }
}
