import { IsArray, IsString } from 'class-validator';
import { ResolvedKey } from 'services/preconfs/validator-keys-resolver.interfaces';

export class GetValidatorsBatchRequest {
  @IsArray()
  pubKeys!: string[];
}

export class GetValidatorBatchResponse {
  status!: 'ok' | 'error';
  error?: string;
  data?: ResolvedKey[];
}
