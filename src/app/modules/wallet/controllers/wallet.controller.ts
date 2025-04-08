import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { paginateResponse } from '../../../../shared/helpers/paginate-response.helper';
import { ApiResponse } from '../../../../shared/utils/helper.util';
import { asyncHandler } from '../../../middlewares/async-handler.middleware';
import { WalletService } from '../services/wallet.service';

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  // Get wallet balance
  getBalance = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const balance = await this.walletService.getBalance(userId);
    return ApiResponse(res, StatusCodes.OK, balance);
  });

  // Get all transactions
  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const { paginate } = res.locals;
    const userId = req.user.id;
    const transactions = await this.walletService.getTransactions(paginate, req.query, userId);
    return ApiResponse(res, StatusCodes.OK, paginateResponse({ rows: transactions.records, paginate, count: transactions.count }));
  });

  // Get single transaction
  getTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const transaction = await this.walletService.getTransaction(id, userId);
    return ApiResponse(res, StatusCodes.OK, transaction);
  });
}
