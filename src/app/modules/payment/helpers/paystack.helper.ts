import { MongoObjectId } from '../../../../types';
import { Currency } from '../../utility/interfaces/payment.interface';
import { DebitType } from '../interfaces/invoice.interface';
import { InitializePaymentDto, PaymentActionType, PaymentProvider, TransactionStatus } from '../interfaces/payment.interface';
import { InvoiceService } from '../services/invoice.service';
import { PaymentService } from '../services/payment.service';
import PaystackService from '../services/paystack.service';

export interface InitializePaymentResponse {
  authorization_url: string;
  reference: string;
  status: TransactionStatus;
  amount: number;
  paymentId?: string;
}

export type InitializePaystack = {
  amount?: number;
  userId: MongoObjectId;
  email: string;
  type?: PaymentActionType;
  memo?: string;
  provider: PaymentProvider;
};

export class PaymentHelper {
  private readonly paystackService: PaystackService;
  private readonly invoiceService: InvoiceService;

  constructor(private readonly paymentService: PaymentService) {
    this.paymentService = paymentService;
    this.paystackService = new PaystackService();
    this.invoiceService = new InvoiceService();
  }

  async handleInitializePaystackPayment({ amount = 100, ...rest }: InitializePaystack): Promise<InitializePaymentResponse> {
    const { userId, email, type, memo, provider } = rest;
    const [createInvoice, response] = await Promise.all([
      this.invoiceService.createInvoice({
        userId,
        amount,
        debitType: DebitType.DEBIT,
        dueAt: new Date().toISOString(),
        memo: memo ?? type ?? 'Payment transaction',
      }),

      this.paystackService.initializePayment({
        type: type,
        userId,
        email,
        amount: amount * 100,
        memo: memo ?? type ?? 'Payment transaction',
      }),
    ]);

    const payment = await this.paymentService.createPayment({
      invoiceId: createInvoice.id,
      amount,
      currency: Currency.NGN,
      reference: response.reference,
      provider,
    });

    const { authorization_url, reference } = response;
    const { status, id: paymentId } = payment;

    return {
      authorization_url,
      reference,
      status,
      amount,
      paymentId,
    };
  }

  async formatInitializeResponse(resp: InitializePaymentResponse, body: InitializePaymentDto, userId: MongoObjectId) {
    return {
      type: body.type ?? body.memo,
      provider: body.provider,
      userId,
      status: resp.status,
      amount: resp.amount,
      reference: resp.reference,
      payment_link: resp.authorization_url,
      paymentId: resp.paymentId,
    };
  }
}
