import logger from '../../../../../shared/helpers/logger.helper';
import { Repository } from '../../../../../shared/utils/data-repo.util';
import SavingGoalModel, { SavingGoal } from '../../../saving-goals/models/saving-goals.model';
import { validateSavingsPayload } from '../../validators/schema/savings.validator';

class SavingsDeletedEventHandler {
  private readonly savingGoalRepo: Repository<SavingGoal>;
  constructor() {
    this.savingGoalRepo = new Repository(SavingGoalModel);
  }

  async handle(data: string): Promise<void> {
    try {
      const payload = validateSavingsPayload(JSON.parse(data));
      logger.info('[savings.deleted.event] => handling savings deleted event', { payload });

      const savingGoal = await this.savingGoalRepo.findOneOrThrow({ _id: payload.savingGoalId });
      const newAmount = Math.max(0, savingGoal.amountSaved - payload.amount);

      const updateData = {
        amountSaved: newAmount,
        ...(newAmount >= savingGoal.targetAmount ? { status: 'completed' } : {}),
      };

      await this.savingGoalRepo.update({ _id: payload.savingGoalId }, { data: updateData });

      logger.info('[savings.deleted.event] => savings goal updated successfully', {
        savingGoalId: payload.savingGoalId,
        newAmount,
        status: updateData.status,
      });
    } catch (err) {
      logger.error('[savings.deleted.event] => error handling savings deleted event', { error: err });
    }
  }
}

export default new SavingsDeletedEventHandler();
