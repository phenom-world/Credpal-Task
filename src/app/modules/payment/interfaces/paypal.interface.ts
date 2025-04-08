import { MongoObjectId } from '../../../../types';
import { UserResponse } from '../../user/interfaces/auth.interface';
import { PaymentActionType } from './payment.interface';

export interface PayPalInitializePayload {
  type?: PaymentActionType;
  cardNumber?: string;
  expiry?: string;
  name?: string;
  billingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    adminArea1?: string;
    city?: string;
    postalCode?: string;
    countryCode?: string;
  };
  user?: UserResponse;
  cvv?: string;
  email?: string;
}

export interface PayPalInitializeResponse {
  id: string;
  customer: {
    id: string;
  };
  status: string;
  payment_source: {
    card: {
      brand: string;
      last_digits: string;
      verification_status: string;
      verification: {
        network_transaction_id: string;
        time: string;
        amount: {
          value: string;
          currency_code: string;
        };
        processor_response: {
          avs_code: string;
          cvv_code: string;
        };
      };
    };
  };
  links: [
    {
      href: string;
      rel: string;
      method: string;
      encType: string;
    },
    {
      href: string;
      rel: string;
      method: string;
      encType: string;
    },
  ];
}

export interface PayPalCreatePaymentTokenPayload {
  token: string;
  userId: MongoObjectId;
  type: PaymentActionType;
}

export interface PayPalCreatePaymentTokenResponse {
  id: string;
  customer: {
    id: string;
  };
  payment_source: {
    card: {
      last_digits: string;
      name: string;
      expiry: string;
      brand: string;
      billing_address: {
        address_line_1: string;
        address_line_2: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
  };
  links: [
    {
      href: string;
      rel: string;
      method: string;
      encType: string;
    },
    {
      href: string;
      rel: string;
      method: string;
      encType: string;
    },
  ];
}

export interface PayPalCreateOrderPayload {
  amount: string;
  authorizationCode: string;
  type: PaymentActionType;
}

export interface PayPalCreateOrderResponse {
  id: string;
  status: string;
  payment_source: {
    card: {
      brand: string;
      last_digits: string;
    };
  };
  purchase_units: [
    {
      reference_id: string;
      payments: {
        captures: [
          {
            id: string;
            status: string;
            amount: {
              currency_code: string;
              value: string;
            };
            seller_protection: {
              status: string;
            };
            final_capture: true;
            seller_receivable_breakdown: {
              gross_amount: {
                currency_code: string;
                value: string;
              };
              paypal_fee: {
                currency_code: string;
                value: string;
              };
              net_amount: {
                currency_code: string;
                value: string;
              };
            };
            create_time: string;
            update_time: string;
            links: [
              {
                href: string;
                rel: string;
                method: string;
              },
              {
                href: string;
                rel: string;
                method: string;
              },
              {
                href: string;
                rel: string;
                method: string;
              },
            ];
          },
        ];
      };
    },
  ];
  links: [
    {
      href: string;
      rel: string;
      method: string;
    },
  ];
}

export interface PayPalGetOrderResponse {
  id: string;
  status: string;
}
