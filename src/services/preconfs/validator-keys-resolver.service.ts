import {
  HttpException,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { KapiService } from '../../clients/kapi/kapi.service';
import * as E from 'fp-ts/Either';
import { ResolvedKey } from './validator-keys-resolver.interfaces';
import { ZodError } from 'zod';
import {
  CREDIBLE_COMMITMENT_CURATION_PROVIDER_TOKEN,
  CredibleCommitmentCurationProvider,
} from '../../contracts';
import { OperatorsResponse } from '../../clients/kapi/entity/operator.response';

@Injectable()
export class ValidatorKeysResolver {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    @Inject(CREDIBLE_COMMITMENT_CURATION_PROVIDER_TOKEN)
    private contract: CredibleCommitmentCurationProvider,
    private readonly kapiService: KapiService,
  ) {}

  public async resolve(
    pubkeys: string[],
  ): Promise<E.Either<HttpException | ZodError | Error, ResolvedKey[]>> {
    const [keysResponse, operatorsResponse] = await Promise.all([
      this.kapiService.getKeys(pubkeys),
      this.kapiService.getOperators(),
    ]);

    if (E.isLeft(keysResponse)) {
      const error = keysResponse.left;
      this.logger.error('Error while fetching keys from KAPI', { error });
      return keysResponse;
    }

    if (E.isLeft(operatorsResponse)) {
      const error = operatorsResponse.left;
      this.logger.error('Error while fetching operators from KAPI', { error });
      return operatorsResponse;
    }

    const keys = keysResponse.right.data;
    const operatorByModuleAndIndex = this.indexModulesAndOperators(
      operatorsResponse.right,
    );

    try {
      const data = await Promise.all(
        keys.map(async (key) => {
          const operatorInfo = operatorByModuleAndIndex.find(
            key.moduleAddress,
            key.operatorIndex,
          );
          if (!operatorInfo) {
            return;
          }
          const contractResponse = await this.getOperator(
            operatorInfo.moduleId,
            operatorInfo.operatorId,
          );
          if (!contractResponse) {
            return;
          }
          if (!contractResponse.isEnabled) {
            return;
          }
          const { indexStart, indexEnd } =
            contractResponse.state.keysRangeState;

          if (indexStart.lte(key.index) && indexEnd.gte(key.index)) {
            return {
              pubKey: key.key,
              rpcUrl: contractResponse.state.extraData.rpcURL,
            };
          }
        }),
      );
      const filtered = data.filter((x) => x);
      return E.right(filtered as ResolvedKey[]);
    } catch (error) {
      return E.left(error as Error);
    }
  }

  private async getOperator(moduleId: number, operatorId: number) {
    try {
      return await this.contract['getOperator(uint24,uint64)'](
        moduleId,
        operatorId,
      );
    } catch (error) {
      const anyError = error as any;
      const expectedErrorNames = [
        'OperatorNotActive',
        'OperatorNotRegistered',
        'ModuleDisabled',
      ];
      if (
        anyError.code !== 'CALL_EXCEPTION' &&
        !expectedErrorNames.includes(anyError.errorName)
      ) {
        this.logger.error('Unexpected error while calling CCCP contract', {
          error,
        });
      }
      return null;
    }
  }

  private indexModulesAndOperators(response: OperatorsResponse) {
    const key = (moduleAddress: string, operatorId: number) =>
      `${moduleAddress}|${operatorId}`;

    const operatorByModuleAndIndex = new Map<
      string,
      { moduleId: number; operatorId: number }
    >();
    for (const x of response.data) {
      for (const operator of x.operators) {
        const operatorKey = key(x.module.stakingModuleAddress, operator.index);
        operatorByModuleAndIndex.set(operatorKey, {
          moduleId: x.module.id,
          operatorId: operator.index,
        });
      }
    }

    return {
      find: (moduleAddress: string, operatorId: number) => {
        return operatorByModuleAndIndex.get(key(moduleAddress, operatorId));
      },
    };
  }
}
