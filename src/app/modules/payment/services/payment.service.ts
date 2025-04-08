import { DocumentType } from '@typegoose/typegoose';
import axios from 'axios';
import { Connection } from 'mongoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { BadRequestError } from '../../../../shared/utils/error.util';
import { MongoObjectId, Paginate } from '../../../../types';
import { CreatePaymentDto, GetAllPaymentsQuery, PaymentProvider } from '../interfaces/payment.interface';
import { Invoice } from '../models/invoice.model';
import { Payment, PaymentModel } from '../models/payment.model';
import { CreatePaymentTransaction } from '../transactions/create-payment.transaction';

export class PaymentService {
  private readonly paymentRepo: Repository<Payment>;
  private readonly createPaymentTransaction: CreatePaymentTransaction;

  constructor(connection: Connection) {
    this.paymentRepo = new Repository(PaymentModel);
    this.createPaymentTransaction = new CreatePaymentTransaction(connection);
  }

  async createPayment(data: CreatePaymentDto): Promise<DocumentType<Payment>> {
    const payment = await this.createPaymentTransaction.run(data);
    return payment;
  }

  async getPayment(id: string, userId: MongoObjectId) {
    const payment = await this.paymentRepo.findOne({ id }, { options: { populate: { path: 'invoiceId', select: 'userId' } } });
    if ((payment?.invoiceId as unknown as Invoice).userId !== userId) {
      throw new BadRequestError('Payment not found');
    }
    return payment;
  }

  async deletePayment(id: string) {
    return await this.paymentRepo.delete({ id });
  }

  async getAllPayments(paginate: Paginate, query: GetAllPaymentsQuery, userId: MongoObjectId) {
    const { startAt, endAt } = query;
    const { limit, offset } = paginate;

    const projectPipeline = [{ $project: { createdAt: 0, updatedAt: 0, __v: 0 } }];

    const pipeline = await this.paymentRepo.aggregate([
      { $lookup: { from: 'invoices', localField: 'invoiceId', foreignField: '_id', as: 'invoice', pipeline: projectPipeline } },
      { $unwind: '$invoice' },
      {
        $match: {
          'invoice.userId': userId,
          ...(startAt || endAt
            ? { createdAt: { ...(startAt ? { $gte: new Date(startAt) } : {}), ...(endAt ? { $lte: new Date(endAt) } : {}) } }
            : {}),
        },
      },

      { $lookup: { from: 'users', localField: 'invoice.userId', foreignField: '_id', as: 'user', pipeline: projectPipeline } },
      { $unwind: '$user' },
      //replace _id with id
      { $addFields: { id: '$_id', 'invoice.id': '$invoice._id' } },
      { $project: { _id: 0, 'invoice._id': 0 } },

      { $addFields: { 'user.id': '$user._id' } },
      { $project: { _id: 0, 'user._id': 0 } },

      // sort by createdAt
      { $sort: { createdAt: -1 } },
      // Facet for pagination + count
      { $facet: { records: [{ $skip: offset }, { $limit: Number(limit) }], metadata: [{ $count: 'total' }] } },
      { $project: { records: 1, total: { $arrayElemAt: ['$metadata.total', 0] } } },
    ]);

    const result = await this.paymentRepo.aggregate(pipeline);

    const records = result[0]?.records || [];
    const count = result[0]?.total || 0;
    return { count, records };
  }

  getPaymentDetails = async (provider: PaymentProvider, reference?: string) => {
    let res;
    switch (provider) {
      case PaymentProvider.PAYPAL:
        res = await axios.get(`https://api-m.sandbox.paypal.com/v1/payments/payment/${reference}`);
        break;
      default:
        break;
    }
    return res?.data;
  };
}
