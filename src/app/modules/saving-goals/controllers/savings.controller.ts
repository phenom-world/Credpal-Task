import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { paginateResponse } from '../../../../shared/helpers/paginate-response.helper';
import { ApiResponse } from '../../../../shared/utils/helper.util';
import { CustomRequest } from '../../../../types';
import { asyncHandler } from '../../../middlewares/async-handler.middleware';
import { CreateSavingGoalsDto, UpdateSavingGoalsDto } from '../interfaces/savings.interface';
import { SavingsService } from '../services/savings-goal.service';
export class SavingsController {
  private savingsService: SavingsService;

  constructor() {
    this.savingsService = new SavingsService();
  }

  // create savings
  create = asyncHandler(async (req: CustomRequest<CreateSavingGoalsDto>, res: Response) => {
    const userId = req.user.id;
    const savings = await this.savingsService.create(userId, req.body);
    return ApiResponse(res, StatusCodes.CREATED, savings, 'Saving goal created successfully');
  });

  // update savings
  update = asyncHandler(async (req: CustomRequest<UpdateSavingGoalsDto>, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const savings = await this.savingsService.update(id, userId, req.body);
    return ApiResponse(res, StatusCodes.OK, savings, 'Saving goal updated successfully');
  });

  // get all savings
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { paginate } = res.locals;
    const userId = req.user.id;
    const savings = await this.savingsService.getAllSavings(paginate, req.query, userId);
    return ApiResponse(res, StatusCodes.OK, paginateResponse({ rows: savings.records, paginate, count: savings.count }));
  });

  // get one savings
  getOne = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const savings = await this.savingsService.getOneSavings(id, userId);
    return ApiResponse(res, StatusCodes.OK, savings);
  });

  // delete savings
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    await this.savingsService.delete(id, userId);
    return ApiResponse(res, StatusCodes.OK, null, 'Saving goal deleted successfully');
  });
}
