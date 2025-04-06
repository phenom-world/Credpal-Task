import { NextFunction, Response } from 'express';

import { Repository } from '../../../../shared/utils/data-repo.util';
import { BadRequestError } from '../../../../shared/utils/error.util';
import { CustomRequest } from '../../../../types';
import { asyncHandler } from '../../../middlewares';
import SavingsGoalModel from '../../saving-goals/models/saving-goals.model';
import SavingsModel from '../models/savings.model';

const ErrorMessages = {
  SAVING_NOT_FOUND: 'Saving not found',
  SAVING_GOAL_NOT_FOUND: 'Saving goal not found',
  INACTIVE_SAVING_GOAL: 'Cannot add savings to an inactive saving goal',
};

const savingRepo = new Repository(SavingsModel);
const savingsGoalRepo = new Repository(SavingsGoalModel);

export const validateSaving = asyncHandler(async (req: CustomRequest<{ savingId: string }>, _res: Response, next: NextFunction) => {
  const { savingId } = req.body;
  const { id } = req.params;

  if (!savingId && !id) {
    throw new BadRequestError('Saving ID is required');
  }

  const saving = await savingRepo.findOneOrThrow({ _id: savingId ?? id }, { customError: ErrorMessages.SAVING_NOT_FOUND });
  await savingsGoalRepo.findOneOrThrow({ _id: saving.savingGoalId, userId: req.user.id }, { customError: ErrorMessages.SAVING_GOAL_NOT_FOUND });
  next();
});

export const validateUserSavingGoal = asyncHandler(async (req: CustomRequest<{ savingGoalId: string }>, _res: Response, next: NextFunction) => {
  const { savingGoalId } = req.body;
  const savingGoal = await savingsGoalRepo.findOneOrThrow(
    { _id: savingGoalId, userId: req.user.id },
    { customError: ErrorMessages.SAVING_GOAL_NOT_FOUND }
  );

  if (savingGoal.status !== 'active') {
    throw new BadRequestError(ErrorMessages.INACTIVE_SAVING_GOAL);
  }
  next();
});
