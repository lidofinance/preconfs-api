import { z } from 'zod';

import { ElMetaSchema, KeySchema } from './common';

export const KeyFindResponseSchema = z.object({
  data: z.array(KeySchema),
  meta: ElMetaSchema,
});

export type KeyFindResponse = z.infer<typeof KeyFindResponseSchema>;
