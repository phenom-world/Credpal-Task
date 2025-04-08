import { DocumentType } from '@typegoose/typegoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { MongoObjectId } from '../../../../types';
import { PaymentMethodDto } from '../interfaces/payment.interface';
import { PaymentMethod, PaymentMethodModel } from '../models/payment-method.model';

type PaymentMethodResponse = Partial<DocumentType<PaymentMethod>>;

export class PaymentMethodService {
  private repo: Repository<PaymentMethod>;

  constructor() {
    this.repo = new Repository(PaymentMethodModel);
  }

  async getPaymentMethod(paymentMethodId: string, userId: MongoObjectId): Promise<PaymentMethodResponse> {
    const paymentMethod = await this.repo.findOne({ id: paymentMethodId, userId });
    return this.formatPaymentMethodResponse(paymentMethod);
  }

  async getPaymentMethods(userId: MongoObjectId): Promise<PaymentMethodResponse[]> {
    const paymentMethods = await this.repo.findMany({ userId });
    return paymentMethods.map((paymentMethod) => this.formatPaymentMethodResponse(paymentMethod));
  }

  async createPaymentMethod(data: PaymentMethodDto, userId: MongoObjectId): Promise<PaymentMethodResponse> {
    const paymentMethod = await this.repo.create({ data: { ...data, userId } });
    return this.formatPaymentMethodResponse(paymentMethod);
  }

  async updatePaymentMethodPreference(paymentMethodId: string, userId: MongoObjectId) {
    const currentPreferredPaymentMethod = await this.repo.findOne({
      preferred: true,
      userId,
    });

    if (currentPreferredPaymentMethod) {
      await this.repo.update({ id: currentPreferredPaymentMethod.id, userId }, { data: { preferred: false } });
    }

    const paymentMethod = await this.repo.update({ id: paymentMethodId, userId }, { data: { preferred: true } });
    return this.formatPaymentMethodResponse(paymentMethod);
  }

  private formatPaymentMethodResponse(data: DocumentType<PaymentMethod> | null): PaymentMethodResponse {
    if (!data) return {};
    return {
      id: data.id,
      userId: data.userId,
      last4: data.last4,
      cardType: data.cardType,
      expMonth: data.expMonth,
      expYear: data.expYear,
      preferred: data.preferred,
      provider: data.provider,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt,
    };
  }
}
