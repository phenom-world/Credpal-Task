import axios from 'axios';

import config from '../../../../config';
import { Repository } from '../../../../shared/utils/data-repo.util';
import { BadRequestError } from '../../../../shared/utils/error.util';
import { generateAlphaNumericString } from '../../../../shared/utils/string.util';
import { MongoObjectId, ObjectData } from '../../../../types';
import UserModel, { User } from '../../user/models/user.model';
import { PayPalHelper } from '../helpers/paypal.helper';
import { InitializePaymentResponse } from '../helpers/paystack.helper';
import { PaymentActionType, PaymentProvider, TransactionStatus } from '../interfaces/payment.interface';
import {
  PayPalCreateOrderPayload,
  PayPalCreateOrderResponse,
  PayPalCreatePaymentTokenPayload,
  PayPalCreatePaymentTokenResponse,
  PayPalGetOrderResponse,
  PayPalInitializePayload,
  PayPalInitializeResponse,
} from '../interfaces/paypal.interface';
import { PaymentMethod, PaymentMethodModel } from '../models/payment-method.model';
import { PaymentMethodService } from './payment-method.service';

export class PayPalService {
  private endpoint_url = config.services.get('paypal.environment') === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
  private client_id = config.services.get('paypal.clientId');
  private client_secret = config.services.get('paypal.clientSecret');
  private paymentMethodService: PaymentMethodService;
  private readonly paymentMethodRepo: Repository<PaymentMethod>;
  private readonly userRepo: Repository<User>;
  private readonly paypalHelper: PayPalHelper;

  constructor() {
    this.paymentMethodService = new PaymentMethodService();
    this.paymentMethodRepo = new Repository(PaymentMethodModel);
    this.paypalHelper = new PayPalHelper();
    this.userRepo = new Repository(UserModel);
  }

  async createSetupToken(data: PayPalInitializePayload & { userId: MongoObjectId }): Promise<InitializePaymentResponse> {
    const user = await this.userRepo.findOneOrThrow({ id: data.userId });
    const payload = await this.paypalHelper.getSetUpPayload({ ...data, user });
    const response = await this.makeRequest<PayPalInitializeResponse>('POST', '/v3/vault/setup-tokens', payload);
    return {
      authorization_url:
        response.links.find((link) => link.rel === 'approve')?.href ?? response.links.find((link) => link.rel === 'confirm')?.href ?? '',
      reference: response.id,
      status: TransactionStatus.PENDING,
      amount: 0,
    };
  }

  // Generate a payment token for the card
  async createPaymentToken(data: PayPalCreatePaymentTokenPayload) {
    const user = await this.userRepo.findOneOrThrow({ id: data.userId });
    let paymentMethod;
    const payload = await this.paypalHelper.getPaymentTokenPayload(data);
    const response = await this.makeRequest<PayPalCreatePaymentTokenResponse>('POST', '/v3/vault/payment-tokens', payload);

    if (data?.type === 'add_card' && !user.paypalCardCustomerId) {
      await this.updateUser(data?.userId, {
        paypalCardCustomerId: response.customer.id,
      });
    } else if (!user.paypalCustomerId) {
      await this.updateUser(data?.userId, {
        paypalCustomerId: response.customer.id,
      });
    }

    const account = response.payment_source.card as PayPalCreatePaymentTokenResponse['payment_source']['card'];
    const paymentMethods = await this.paymentMethodService.getPaymentMethods(user.id);
    await this.paymentMethodRepo.findOne({ authorizationCode: response.id }, { errorIfFound: true, errorMessage: 'Transaction already verified' });
    if (data?.type === 'add_card') {
      paymentMethod = await this.paymentMethodService.createPaymentMethod(
        {
          last4: account.last_digits,
          accountName: account.name,
          authorizationCode: response.id,
          signature: '',
          bank: '',
          bin: '',
          cardType: account.brand,
          expMonth: Number(account.expiry?.split('-')[1]),
          expYear: Number(account.expiry?.split('-')[0]),
          preferred: paymentMethods.length === 0,
          provider: PaymentProvider.PAYPAL,
          billingAddress: {
            addressLine1: account.billing_address.address_line_1,
            city: account.billing_address.admin_area_2,
            adminArea1: account.billing_address.admin_area_1,
            postalCode: account.billing_address.postal_code,
            countryCode: account.billing_address.country_code,
          },
        },
        user?.id!
      );
    } else {
      paymentMethod = await this.paymentMethodService.createPaymentMethod(
        {
          last4: '',
          accountName: '',
          authorizationCode: response.id,
          signature: '',
          bank: '',
          bin: '',
          cardType: 'paypal',
          expMonth: 0,
          expYear: 0,
          preferred: paymentMethods.length === 0,
          provider: PaymentProvider.PAYPAL,
        },
        user?.id!
      );
    }
    return paymentMethod;
  }

  async createOrder(data: PayPalCreateOrderPayload): Promise<PayPalCreateOrderResponse> {
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: data?.amount } }],
      payment_source: {
        ...(data?.type === PaymentActionType.ADD_CARD
          ? { card: { vault_id: data?.authorizationCode } }
          : { paypal: { vault_id: data?.authorizationCode } }),
      },
    };
    return await this.makeRequest<PayPalCreateOrderResponse>('POST', '/v2/checkout/orders', payload);
  }

  async getOrder(orderId: string): Promise<PayPalGetOrderResponse> {
    return await this.makeRequest<PayPalGetOrderResponse>('GET', `/v2/checkout/orders/${orderId}`, {});
  }

  async getClientToken(userId?: string): Promise<string> {
    const payload = userId ? { userId } : {};

    const response = await this.makeRequest<string>('POST', '/v1/identity/generate-token', payload);
    return response;
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64');
    const response = await axios.post(`${this.endpoint_url}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  }

  private async updateUser(userId: MongoObjectId, data: ObjectData) {
    return await this.userRepo.update({ id: userId }, { data });
  }

  private async getRequestHeaders(): Promise<Record<string, string>> {
    const access_token = await this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
      'PayPal-Request-Id': generateAlphaNumericString(10, '', Date.now()),
    };
  }

  private async makeRequest<T>(method: 'GET' | 'POST', endpoint: string, data: ObjectData): Promise<T> {
    const headers = await this.getRequestHeaders();
    try {
      const response = await axios({ method, url: `${this.endpoint_url}${endpoint}`, data, headers });
      return response.data;
    } catch (error) {
      throw new BadRequestError(error?.response?.data?.message || 'An error occurred while processing your request');
    }
  }
}

export default PayPalService;
