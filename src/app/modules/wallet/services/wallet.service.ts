import { FilterQuery } from 'mongoose';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { sanitize } from '../../../../shared/utils/helper.util';
import { MongoObjectId, Paginate } from '../../../../types';
import { Currency } from '../../utility/interfaces/payment.interface';
import { GetTransactionsQuery, WalletBalance } from '../interfaces/wallet.interface';
import { Wallet, WalletModel, WalletTransaction, WalletTransactionModel } from '../models/wallet.model';

export class WalletService {
  private readonly walletRepo: Repository<Wallet>;
  private readonly transactionRepo: Repository<WalletTransaction>;
  constructor() {
    this.walletRepo = new Repository(WalletModel);
    this.transactionRepo = new Repository(WalletTransactionModel);
  }
  async getWallet(userId: MongoObjectId): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ userId });
    if (!wallet) {
      wallet = await this.walletRepo.create({ data: { userId, balance: 0, currency: Currency.NGN, isActive: true } });
    }
    return wallet;
  }
  async getBalance(userId: MongoObjectId): Promise<WalletBalance> {
    const wallet = await this.getWallet(userId);
    return { available: wallet.balance, currency: wallet.currency };
  }

  async getTransactions(
    paginate: Paginate,
    query: GetTransactionsQuery,
    userId: MongoObjectId
  ): Promise<{ count: number; records: WalletTransaction[] }> {
    const { limit, offset } = paginate;
    const { startDate, endDate, type, category, status } = query;

    const filter: FilterQuery<WalletTransaction> = sanitize({ userId, type, category, status });

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return await this.transactionRepo.findAndCountAll(filter, {
      skip: offset,
      limit,
      sort: { createdAt: -1 },
    });
  }

  async getTransaction(id: string, userId: MongoObjectId): Promise<WalletTransaction> {
    return await this.transactionRepo.findOneOrThrow({ _id: id, userId });
  }
}
