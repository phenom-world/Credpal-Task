import logger from '../../../../../shared/helpers/logger.helper';
import { Repository } from '../../../../../shared/utils/data-repo.util';
import SavingGoalModel, { SavingGoal } from '../../../saving-goals/models/saving-goals.model';
import { validateSavingsPayload } from '../../validators/schema/savings.validator';

class SavingsCreatedEventHandler {
  private readonly savingGoal: Repository<SavingGoal>;
  constructor() {
    this.savingGoal = new Repository(SavingGoalModel);
  }

  async handle(data: string): Promise<void> {
    try {
      const payload = validateSavingsPayload(JSON.parse(data));
      const { savingGoalId, amount } = payload;

      logger.info('[savings.created.event] => handling savings created event', { payload });

      const savingGoal = await this.savingGoal.findOneOrThrow({ _id: savingGoalId });
      const newAmount = savingGoal.amountSaved + amount;

      const updateData = {
        amountSaved: newAmount,
        ...(newAmount >= savingGoal.targetAmount ? { status: 'completed' } : {}),
      };

      await this.savingGoal.update({ _id: payload.savingGoalId }, { data: updateData });

      logger.info('[savings.created.event] => savings goal updated successfully', {
        savingGoalId: payload.savingGoalId,
        newAmount,
        status: updateData.status,
      });
    } catch (err) {
      logger.error('[savings.created.event] => error handling savings created event', { error: err });
    }
  }
}

export default new SavingsCreatedEventHandler();
