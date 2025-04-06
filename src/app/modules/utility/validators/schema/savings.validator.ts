import { z } from 'zod';

type SavingsEventPayload = {
  savingGoalId: string;
  amount: number;
  previousAmount: number;
};

const savingsEventPayloadSchema = z.object({
  savingGoalId: z.string(),
  amount: z.number().positive(),
});

const validateSavingsPayload = (content: Omit<SavingsEventPayload, 'previousAmount'>): Omit<SavingsEventPayload, 'previousAmount'> => {
  return savingsEventPayloadSchema.parse(content);
};

const validateSavingsUpdatedPayload = (content: SavingsEventPayload): SavingsEventPayload => {
  return savingsEventPayloadSchema
    .extend({
      previousAmount: z.number().positive(),
    })
    .parse(content);
};

export { validateSavingsPayload, validateSavingsUpdatedPayload };
