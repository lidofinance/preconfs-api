import { z } from 'zod';

import { ElMetaSchema, OperatorSchema, SRModuleSchema } from './common';

const OperatorListAndModuleSchema = z.object({
  operators: z.array(OperatorSchema),
  module: SRModuleSchema,
});

/// === Responses ======
export const OperatorsResponseSchema = z.object({
  data: z.array(OperatorListAndModuleSchema),
  meta: ElMetaSchema,
});
export type OperatorsResponse = z.infer<typeof OperatorsResponseSchema>;
