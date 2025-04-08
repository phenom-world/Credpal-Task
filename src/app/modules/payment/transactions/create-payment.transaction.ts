import { DocumentType } from '@typegoose/typegoose';
import { ClientSession, Connection } from 'mongoose';

import { TransactionBase } from '../../../../shared/helpers/transaction.base';
import { Repository } from '../../../../shared/utils/data-repo.util';
import { BadRequestError } from '../../../../shared/utils/error.util';
import { CreatePaymentDto, TransactionStatus } from '../interfaces/payment.interface';
import InvoiceModel, { Invoice } from '../models/invoice.model';
import { Payment, PaymentModel } from '../models/payment.model';

export class CreatePaymentTransaction extends TransactionBase<CreatePaymentDto, DocumentType<Payment>> {
  private readonly invoiceRepo: Repository<Invoice>;
  private readonly paymentRepo: Repository<Payment>;

  constructor(connection: Connection) {
    super(connection);
    this.invoiceRepo = new Repository(InvoiceModel);
    this.paymentRepo = new Repository(PaymentModel);
  }

  protected async execute(data: CreatePaymentDto, session: ClientSession): Promise<DocumentType<Payment>> {
    const invoice = await this.invoiceRepo.findOneOrThrow({ _id: data.invoiceId, isVoid: false }, { options: { session } });
    const remainingAmount = invoice.amount - invoice.totalPaid;

    if (data.amount > remainingAmount) {
      throw new BadRequestError('Payment amount exceeds remaining invoice amount');
    }

    const payment = await this.paymentRepo.sessionCreate({
      data: {
        invoiceId: invoice._id,
        status: TransactionStatus.PENDING,
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        provider: data.provider,
      },
      session,
    });

    await this.invoiceRepo.update(
      { _id: invoice._id },
      {
        data: { processingAmount: { $inc: data.amount } },
        options: { session },
      }
    );

    return payment as unknown as DocumentType<Payment>;
  }
}
