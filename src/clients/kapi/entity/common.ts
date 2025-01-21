import { z } from 'zod';

export const ElBlockSnapshotSchema = z.object({
  blockNumber: z.number(),
  blockHash: z.string(),
  timestamp: z.number(),
  lastChangedBlockHash: z.string(),
});

export const ElMetaSchema = z.object({
  elBlockSnapshot: ElBlockSnapshotSchema,
});
export const KeySchema = z.object({
  index: z.number(),
  key: z.string(),
  depositSignature: z.string(),
  operatorIndex: z.number(),
  used: z.boolean(),
  moduleAddress: z.string(),
});

export const SRModuleSchema = z.object({
  nonce: z.number(),
  type: z.string(),
  id: z.number(),
  stakingModuleAddress: z.string(),
  moduleFee: z.number(),
  treasuryFee: z.number(),
  targetShare: z.number(),
  status: z.number(),
  name: z.string(),
  lastDepositAt: z.number(),
  lastDepositBlock: z.number(),
  exitedValidatorsCount: z.number(),
  active: z.boolean(),
  lastChangedBlockHash: z.string(),
});

export const OperatorSchema = z.object({
  index: z.number(),
  active: z.boolean(),
  name: z.string(),
  rewardAddress: z.string(),
  stakingLimit: z.number(),
  stoppedValidators: z.number(),
  totalSigningKeys: z.number(),
  usedSigningKeys: z.number(),
  moduleAddress: z.string(),
});
export type Operator = z.infer<typeof OperatorSchema>;
