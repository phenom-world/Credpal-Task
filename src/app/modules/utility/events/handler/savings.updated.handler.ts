import logger from '../../../../../shared/helpers/logger.helper';
import { Repository } from '../../../../../shared/utils/data-repo.util';
import SavingGoalModel, { SavingGoal } from '../../../saving-goals/models/saving-goals.model';
import { validateSavingsUpdatedPayload } from '../../validators/schema/savings.validator';

class SavingsUpdatedEventHandler {
  private readonly savingGoalRepo: Repository<SavingGoal>;
  constructor() {
    this.savingGoalRepo = new Repository(SavingGoalModel);
  }

  async handle(data: string): Promise<void> {
    try {
      const payload = validateSavingsUpdatedPayload(JSON.parse(data));
      logger.info('[savings.updated.event] => handling savings updated event', { payload });

      const savingGoal = await this.savingGoalRepo.findOneOrThrow({ _id: payload.savingGoalId });
      const amountDiff = payload.amount - payload.previousAmount;
      const newAmount = savingGoal.amountSaved + amountDiff;

      const updateData = {
        amountSaved: newAmount,
        ...(newAmount >= savingGoal.targetAmount ? { status: 'completed' } : {}),
      };

      await this.savingGoalRepo.update({ _id: payload.savingGoalId }, { data: updateData });

      logger.info('[savings.updated.event] => savings goal updated successfully', {
        savingGoalId: payload.savingGoalId,
        newAmount,
        status: updateData.status,
      });
    } catch (err) {
      logger.error('[savings.updated.event] => error handling savings updated event', { error: err });
    }
  }
}

export default new SavingsUpdatedEventHandler();
