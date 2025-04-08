import { z } from 'zod';

export const dateSchema = z
  .string()
  .date('Invalid date')
  .transform((val) => new Date(val).toISOString());
