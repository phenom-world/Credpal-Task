import axios from 'axios';

import config from '../../../../config';
import { Repository } from '../../../../shared/utils/data-repo.util';
import { BadRequestError } from '../../../../shared/utils/error.util';
import { generateAlphaNumericString } from '../../../../shared/utils/string.util';
import { MongoObjectId, ObjectData } from '../../../../types';
import { PaymentActionType, PaymentProvider, TransactionStatus } from '../interfaces/payment.interface';
import { PaystackCardInitializeResponse, PaystackVerificationResponse } from '../interfaces/paystack.interface';
import { Invoice } from '../models/invoice.model';
import { Payment, PaymentModel } from '../models/payment.model';
import { PaymentMethodService } from './payment-method.service';

class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey = config.services.get('paystack.secretKey');
  private readonly paymentRepo: Repository<Payment>;
  private readonly paymentMethodService: PaymentMethodService;

  constructor() {
    this.paymentRepo = new Repository(PaymentModel);
    this.paymentMethodService = new PaymentMethodService();
  }

  async initializePayment(data: { type?: PaymentActionType; userId: MongoObjectId; email: string; amount: number; memo: string }) {
    const callbackUrl = `${config.services.get('paystack.redirectUrl')}`;
    const response = await this.makeRequest<PaystackCardInitializeResponse>('POST', '/transaction/initialize', {
      email: data.email,
      amount: data.amount,
      ...(data?.type === PaymentActionType.ADD_CARD ? { channels: ['card'] } : {}),
      callback_url: callbackUrl,
      reference: generateAlphaNumericString(10, 'DURAR-', Date.now()),
      metadata: {
        memo: data.memo,
        userId: data.userId,
      },
    });

    return {
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
    };
  }

  async verifyTransaction(reference: string, type?: PaymentActionType) {
    const response = await this.makeRequest<PaystackVerificationResponse>('GET', `/transaction/verify/${reference}`, {});
    if (!response.status || response.data.status !== 'success') {
      throw new BadRequestError('Card verification failed');
    }

    await this.paymentRepo.findOne(
      { reference, status: TransactionStatus.COMPLETED },
      { errorIfFound: true, errorMessage: 'Transaction already verified' }
    );

    const updatedPayment = await this.paymentRepo.update(
      { reference },
      {
        data: { status: TransactionStatus.COMPLETED },
        options: {
          populate: {
            path: 'invoiceId',
            select: 'userId',
          },
        },
      }
    );

    if (type === 'add_card') {
      const auth = response.data.authorization;
      const paymentMethods = await this.paymentMethodService.getPaymentMethods((updatedPayment?.invoiceId as unknown as Invoice).userId);
      const paymentMethod = await this.paymentMethodService.createPaymentMethod(
        {
          last4: auth.last4,
          accountName: auth.account_name,
          authorizationCode: auth.authorization_code,
          signature: auth.signature,
          bank: auth.bank,
          bin: auth.bin,
          cardType: auth.card_type,
          expMonth: Number(auth.exp_month),
          expYear: Number(auth.exp_year),
          preferred: paymentMethods.length === 0,
          provider: PaymentProvider.PAYSTACK,
        },
        (updatedPayment?.invoiceId as unknown as Invoice).userId
      );
      return paymentMethod;
    }
    return response.data;
  }

  async chargeAuthorization(authorizationCode: string, amount: number, email: string): Promise<PaystackVerificationResponse['data']> {
    const response = await this.makeRequest<PaystackVerificationResponse>('POST', '/transaction/charge_authorization', {
      authorization_code: authorizationCode,
      email,
      amount: amount * 100,
    });

    if (!response.status || response.data.status !== 'success') {
      throw new BadRequestError('Failed to charge card with authorization code');
    }
    return response.data;
  }

  async refundTransaction(transactionId: string) {
    const response = await this.makeRequest<PaystackVerificationResponse>('GET', `/refund?transaction=${transactionId}&currency=NGN`, {});
    return response.data;
  }

  async getTransactionDetails(transactionId: string) {
    const response = await this.makeRequest<PaystackVerificationResponse>('GET', `/transaction/${transactionId}`, {});
    return response.data;
  }

  private async makeRequest<T>(method: 'GET' | 'POST', endpoint: string, data: ObjectData): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.log(error?.response?.data?.message);
      throw new BadRequestError(error?.response?.data?.message || 'An error occurred while processing your request');
    }
  }
}

export default PaystackService;
